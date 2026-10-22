import type { WebGLRenderer } from "three";

export interface RoutePerformanceSample {
  name: string;
  durationMs: number;
  frames: number;
  averageFps: number;
  frameTimeMs: { p50: number; p95: number; max: number };
  jankFrames: { over33ms: number; over50ms: number };
  canvas: { cssWidth: number; cssHeight: number; bufferWidth: number; bufferHeight: number; dpr: number };
  renderer: {
    callsPerFrame: number;
    trianglesPerFrame: number;
    linesPerFrame: number;
    pointsPerFrame: number;
    geometries: number;
    textures: number;
  };
  webgl: { version: string; vendor: string; renderer: string; unmaskedVendor: string | null; unmaskedRenderer: string | null };
  jsHeap: { usedBytes: number; totalBytes: number; limitBytes: number } | null;
}

function sanitizeError(message: string) {
  return message
    .replace(/https?:\/\/\S+/gi, "[url]")
    .replace(/[A-Z]:\\(?:[^\s\\]+\\)*[^\s]*/gi, "[path]")
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[email]")
    .slice(0, 500);
}

export interface RouteRuntimeDiagnostics {
  eligibility: {
    checked: boolean;
    eligible: boolean;
    blockers: string[];
    deferred: boolean;
    deferReasons: string[];
    loadRequested: boolean;
    sceneRequested: boolean;
  };
  capability: { webgl1Api: boolean; webgl2Api: boolean; detection: "api-presence-only" };
  canvas: { mounted: boolean; rendererState: "not-mounted" | "pending" | "created" | "failed"; contextLost: boolean };
  webglRenderer: { version: string; vendor: string; renderer: string; unmaskedVendor: string | null; unmaskedRenderer: string | null } | null;
  readiness: {
    state: "not-started" | "compiling" | "uploading" | "waiting-gpu" | "ready" | "failed" | "timed-out";
    elapsedMs: number | null;
    timeoutMs: number;
    reason: string | null;
  };
  poster: { loaded: boolean; failed: boolean };
  display: "poster-fallback" | "3d";
  device: {
    browser: string;
    os: string;
    deviceClass: "mobile" | "desktop";
    viewport: { width: number; height: number; dpr: number; touch: boolean };
    reducedMotion: boolean;
    saveData: boolean | null;
    effectiveType: string | null;
    hardwareConcurrency: number | null;
    deviceMemoryGiB: number | null;
  } | null;
  fallbackReasons: string[];
  errors: { stage: string; message: string; elapsedMs: number }[];
}

export interface RoutePerformanceReport {
  environment: string;
  coarsePointer: boolean;
  initializationMs: number | null;
  activeScenario: string | null;
  completed: RoutePerformanceSample[];
  runtime: RouteRuntimeDiagnostics;
}

export interface RoutePerformanceDiagnostics {
  startScenario: (name: string) => void;
  endScenario: () => RoutePerformanceSample | null;
  markCanvasCreated: (renderer: WebGLRenderer) => void;
  markSceneReady: () => void;
  markCanvasMounted: (mounted: boolean) => void;
  markContextLost: () => void;
  setRendererState: (state: RouteRuntimeDiagnostics["canvas"]["rendererState"]) => void;
  setReadiness: (state: RouteRuntimeDiagnostics["readiness"]["state"], reason?: string | null) => void;
  updateRuntime: (runtime: Pick<RouteRuntimeDiagnostics, "eligibility" | "capability" | "poster" | "display" | "device">) => void;
  recordError: (stage: string, message: string) => void;
  subscribe: (listener: () => void) => () => void;
  report: () => RoutePerformanceReport;
  recordFrame: (deltaSeconds: number, renderer: WebGLRenderer) => void;
}

declare global {
  interface Window { __routePerformance?: RoutePerformanceDiagnostics }
}

const MAX_SAMPLES = 20_000;
export const SCENE_READINESS_DIAGNOSTIC_TIMEOUT_MS = 12_000;
const MAX_ERRORS = 20;
const heap = () => {
  const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
  return memory ? { usedBytes: memory.usedJSHeapSize, totalBytes: memory.totalJSHeapSize, limitBytes: memory.jsHeapSizeLimit } : null;
};

function initialRuntime(): RouteRuntimeDiagnostics {
  return {
    eligibility: {
      checked: false,
      eligible: false,
      blockers: [],
      deferred: false,
      deferReasons: [],
      loadRequested: false,
      sceneRequested: false,
    },
    capability: { webgl1Api: false, webgl2Api: false, detection: "api-presence-only" },
    canvas: { mounted: false, rendererState: "not-mounted", contextLost: false },
    webglRenderer: null,
    readiness: { state: "not-started", elapsedMs: null, timeoutMs: SCENE_READINESS_DIAGNOSTIC_TIMEOUT_MS, reason: null },
    poster: { loaded: false, failed: false },
    display: "poster-fallback",
    device: null,
    fallbackReasons: ["Eligibility has not been evaluated yet."],
    errors: [],
  };
}

function fallbackReasons(runtime: RouteRuntimeDiagnostics): string[] {
  const reasons = [...runtime.eligibility.blockers];
  if (runtime.eligibility.deferred && !runtime.eligibility.loadRequested) {
    reasons.push(...runtime.eligibility.deferReasons);
  }
  if (runtime.poster.failed) reasons.push("The fallback poster failed to load.");
  if (runtime.canvas.contextLost) reasons.push("The WebGL context was lost.");
  if (runtime.readiness.state === "timed-out") reasons.push(runtime.readiness.reason ?? "Scene readiness exceeded the diagnostic timeout.");
  if (runtime.readiness.state === "failed" && runtime.readiness.reason) reasons.push(runtime.readiness.reason);
  if (runtime.canvas.rendererState === "failed") reasons.push("WebGL renderer creation failed before the scene became ready.");
  if (runtime.display === "poster-fallback" && runtime.eligibility.sceneRequested) {
    reasons.push(...runtime.errors.map(error => `${error.stage}: ${error.message}`));
  }
  if (runtime.eligibility.sceneRequested && runtime.display === "poster-fallback") {
    if (runtime.canvas.rendererState === "pending") reasons.push("The Canvas is mounted, but renderer creation has not completed.");
    if (runtime.canvas.rendererState !== "failed") {
      if (runtime.readiness.state === "compiling") reasons.push("Scene shader compilation is still pending.");
      else if (runtime.readiness.state === "uploading") reasons.push("Initial scene upload/render is still pending.");
      else if (runtime.readiness.state === "waiting-gpu") reasons.push("The GPU completion fence has not signaled.");
      else if (runtime.readiness.state === "ready" && !runtime.poster.loaded) reasons.push("The scene is ready but the fallback poster has not decoded.");
      else if (!runtime.canvas.mounted) reasons.push("The scene is eligible but its Canvas has not mounted.");
    }
  }
  if (runtime.display === "poster-fallback" && runtime.eligibility.sceneRequested && runtime.readiness.state === "not-started" &&
    runtime.canvas.rendererState === "created") {
    reasons.push("Scene readiness has not started.");
  }
  return [...new Set(reasons)];
}

export function routeDiagnosticDeviceInfo() {
  const ua = navigator.userAgent;
  const browserMatch = /Edg\/(\d+)/.exec(ua) ?? /(?:CriOS|Chrome)\/(\d+)/.exec(ua) ??
    /(?:FxiOS|Firefox)\/(\d+)/.exec(ua) ?? /Version\/(\d+).*Safari\//.exec(ua);
  const browser = /Edg\//.test(ua) ? "Edge" : /CriOS|Chrome\//.test(ua) ? "Chrome" :
    /FxiOS|Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Other";
  const osMatch = /(?:iPhone|iPad|iPod).*?OS (\d+)[_.]/.exec(ua) ?? /Android (\d+)/.exec(ua) ??
    /Windows NT (\d+)/.exec(ua) ?? /Mac OS X (\d+)[_.]/.exec(ua);
  const os = /iPhone|iPad|iPod/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" :
    /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Other";
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  return {
    browser: browserMatch ? `${browser} ${browserMatch[1]}` : browser,
    os: osMatch ? `${os} ${osMatch[1]}` : os,
    deviceClass: matchMedia("(pointer: coarse)").matches ? "mobile" as const : "desktop" as const,
    viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio, touch: navigator.maxTouchPoints > 0 },
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: typeof nav.connection?.saveData === "boolean" ? nav.connection.saveData : null,
    effectiveType: nav.connection?.effectiveType ?? null,
    hardwareConcurrency: navigator.hardwareConcurrency || null,
    deviceMemoryGiB: nav.deviceMemory ?? null,
  };
}

export function routeWebGLApiAvailability() {
  return {
    webgl1Api: typeof WebGLRenderingContext !== "undefined",
    webgl2Api: typeof WebGL2RenderingContext !== "undefined",
    detection: "api-presence-only" as const,
  };
}

function createDiagnostics(): RoutePerformanceDiagnostics {
  const diagnosticsStartedAt = performance.now();
  let scenarioName: string | null = null;
  let scenarioStartedAt = 0;
  let samples: number[] = [];
  let sampleWriteIndex = 0;
  let frameCount = 0;
  let renderCalls = 0;
  let renderTriangles = 0;
  let renderLines = 0;
  let renderPoints = 0;
  let initializationStartedAt: number | null = null;
  let initializationMs: number | null = null;
  let readinessStartedAt: number | null = null;
  let lastRenderer: WebGLRenderer | null = null;
  const completed: RoutePerformanceSample[] = [];
  const listeners = new Set<() => void>();
  let runtime = initialRuntime();
  const notify = () => listeners.forEach(listener => listener());
  const updateRuntimeSnapshot = () => {
    runtime = { ...runtime, fallbackReasons: fallbackReasons(runtime) };
    notify();
  };

  const collect = (): RoutePerformanceSample | null => {
    if (!scenarioName || !lastRenderer) return null;
    const ordered = [...samples].sort((a, b) => a - b);
    const percentile = (value: number) => ordered[Math.min(ordered.length - 1, Math.ceil(ordered.length * value) - 1)] ?? 0;
    const durationMs = performance.now() - scenarioStartedAt;
    const element = lastRenderer.domElement;
    const memory = lastRenderer.info.memory;
    const context = lastRenderer.getContext();
    const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
    return {
      name: scenarioName,
      durationMs,
      frames: frameCount,
      averageFps: durationMs > 0 ? frameCount * 1000 / durationMs : 0,
      frameTimeMs: { p50: percentile(0.5), p95: percentile(0.95), max: ordered[ordered.length - 1] ?? 0 },
      jankFrames: {
        over33ms: samples.filter(frame => frame > 33).length,
        over50ms: samples.filter(frame => frame > 50).length,
      },
      canvas: {
        cssWidth: element.clientWidth,
        cssHeight: element.clientHeight,
        bufferWidth: element.width,
        bufferHeight: element.height,
        dpr: lastRenderer.getPixelRatio(),
      },
      renderer: {
        callsPerFrame: frameCount ? renderCalls / frameCount : 0,
        trianglesPerFrame: frameCount ? renderTriangles / frameCount : 0,
        linesPerFrame: frameCount ? renderLines / frameCount : 0,
        pointsPerFrame: frameCount ? renderPoints / frameCount : 0,
        geometries: memory.geometries,
        textures: memory.textures,
      },
      webgl: {
        version: String(context.getParameter(context.VERSION)),
        vendor: String(context.getParameter(context.VENDOR)),
        renderer: String(context.getParameter(context.RENDERER)),
        unmaskedVendor: debugInfo ? String(context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)) : null,
        unmaskedRenderer: debugInfo ? String(context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : null,
      },
      jsHeap: heap(),
    };
  };

  return {
    startScenario(name) {
      scenarioName = name;
      scenarioStartedAt = performance.now();
      samples = [];
      sampleWriteIndex = 0;
      frameCount = 0;
      renderCalls = 0;
      renderTriangles = 0;
      renderLines = 0;
      renderPoints = 0;
      lastRenderer?.info.reset();
    },
    endScenario() {
      const result = collect();
      if (result) completed.push(result);
      scenarioName = null;
      return result;
    },
    markCanvasCreated(renderer) {
      initializationStartedAt = performance.now();
      initializationMs = null;
      runtime.canvas.rendererState = "created";
      const context = renderer.getContext();
      const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
      runtime.webglRenderer = {
        version: String(context.getParameter(context.VERSION)),
        vendor: String(context.getParameter(context.VENDOR)),
        renderer: String(context.getParameter(context.RENDERER)),
        unmaskedVendor: debugInfo ? String(context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)) : null,
        unmaskedRenderer: debugInfo ? String(context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : null,
      };
      updateRuntimeSnapshot();
    },
    markSceneReady() {
      if (initializationStartedAt !== null) initializationMs = performance.now() - initializationStartedAt;
      notify();
    },
    report() {
      return {
        environment: "development",
        coarsePointer: matchMedia("(pointer: coarse)").matches,
        initializationMs,
        activeScenario: scenarioName,
        completed: [...completed],
        runtime: {
          ...runtime,
          eligibility: { ...runtime.eligibility, blockers: [...runtime.eligibility.blockers], deferReasons: [...runtime.eligibility.deferReasons] },
          capability: { ...runtime.capability },
          canvas: { ...runtime.canvas },
          webglRenderer: runtime.webglRenderer ? { ...runtime.webglRenderer } : null,
          readiness: { ...runtime.readiness },
          poster: { ...runtime.poster },
          device: runtime.device ? { ...runtime.device, viewport: { ...runtime.device.viewport } } : null,
          fallbackReasons: [...runtime.fallbackReasons],
          errors: runtime.errors.map(error => ({ ...error })),
        },
      };
    },
    markCanvasMounted(mounted) {
      runtime.canvas.mounted = mounted;
      if (mounted && runtime.canvas.rendererState === "not-mounted") runtime.canvas.rendererState = "pending";
      updateRuntimeSnapshot();
    },
    markContextLost() {
      runtime.canvas.contextLost = true;
      runtime.canvas.rendererState = "failed";
      updateRuntimeSnapshot();
    },
    setRendererState(state) {
      runtime.canvas.rendererState = state;
      updateRuntimeSnapshot();
    },
    setReadiness(state, reason = null) {
      runtime.readiness.state = state;
      runtime.readiness.reason = reason;
      if (state === "compiling") readinessStartedAt = performance.now();
      if (state === "ready" || state === "failed" || state === "timed-out") {
        runtime.readiness.elapsedMs = readinessStartedAt === null ? null : performance.now() - readinessStartedAt;
      }
      updateRuntimeSnapshot();
    },
    updateRuntime(next) {
      runtime = { ...runtime, ...next };
      updateRuntimeSnapshot();
    },
    recordError(stage, message) {
      runtime.errors.push({
        stage,
        message: sanitizeError(message),
        elapsedMs: Math.round(performance.now() - diagnosticsStartedAt),
      });
      if (runtime.errors.length > MAX_ERRORS) runtime.errors.shift();
      updateRuntimeSnapshot();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    recordFrame(deltaSeconds, renderer) {
      lastRenderer = renderer;
      if (scenarioName) {
        const frameTime = deltaSeconds * 1000;
        if (samples.length < MAX_SAMPLES) samples.push(frameTime);
        else {
          samples[sampleWriteIndex] = frameTime;
          sampleWriteIndex = (sampleWriteIndex + 1) % MAX_SAMPLES;
        }
        frameCount++;
        renderCalls += renderer.info.render.calls;
        renderTriangles += renderer.info.render.triangles;
        renderLines += renderer.info.render.lines;
        renderPoints += renderer.info.render.points;
      }
      renderer.info.reset();
    },
  };
}

export function routePerformanceDiagnostics() {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") return null;
  return window.__routePerformance ?? (window.__routePerformance = createDiagnostics());
}
