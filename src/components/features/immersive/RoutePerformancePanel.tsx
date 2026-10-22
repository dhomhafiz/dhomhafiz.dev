"use client";

import { useEffect, useRef, useState } from "react";
import { routePerformanceDiagnostics, type RoutePerformanceSample } from "./routePerformanceDiagnostics";

const SAMPLE_DURATION_MS = 3000;
const SCENARIOS = [
  "Hero idle",
  "Hero camera look-around",
  "Hero to Dental scroll",
  "Dental billboard viewing stop",
  "Dental to Squid Game scroll",
  "Squid Game billboard viewing stop",
  "Squid Game to Contact scroll",
  "Contact idle",
  "Gallery open",
  "Gallery close",
];

function formatMetric(value: number | undefined, suffix: string) {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toFixed(1)}${suffix}` : "—";
}

export function RoutePerformancePanel() {
  const diagnostics = routePerformanceDiagnostics();
  const [expanded, setExpanded] = useState(false);
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [sample, setSample] = useState<RoutePerformanceSample | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [status, setStatus] = useState("Ready when the 3D scene is active.");
  const [report, setReport] = useState(() => diagnostics?.report() ?? null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef(0);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    if (progressTimer.current) clearInterval(progressTimer.current);
    diagnostics?.endScenario();
  }, [diagnostics]);

  useEffect(() => {
    if (!diagnostics) return;
    const refresh = () => setReport(diagnostics.report());
    refresh();
    return diagnostics.subscribe(refresh);
  }, [diagnostics]);

  const finishSample = () => {
    if (timer.current) clearTimeout(timer.current);
    if (progressTimer.current) clearInterval(progressTimer.current);
    timer.current = null;
    progressTimer.current = null;
    setRemainingMs(0);
    const result = diagnostics?.endScenario() ?? null;
    if (!result) {
      setStatus("No WebGL frame was recorded. Wait for the 3D scene to be ready, then try again.");
      return;
    }
    setSample(result);
    setReport(diagnostics?.report() ?? null);
    setStatus(`Sample complete (${(result.durationMs / 1000).toFixed(2)} s).`);
  };

  const startSample = () => {
    if (!diagnostics) {
      setStatus("Development diagnostics are unavailable.");
      return;
    }
    if (diagnostics.report().initializationMs === null) {
      setStatus("Wait until the 3D scene is ready before sampling.");
      return;
    }
    setSample(null);
    startedAt.current = performance.now();
    setRemainingMs(SAMPLE_DURATION_MS);
    setStatus("Sampling. Perform the selected scenario now.");
    diagnostics.startScenario(scenario);
    progressTimer.current = setInterval(() => {
      setRemainingMs(Math.max(0, SAMPLE_DURATION_MS - (performance.now() - startedAt.current)));
    }, 100);
    timer.current = setTimeout(finishSample, SAMPLE_DURATION_MS);
  };

  const exportPayload = () => JSON.stringify({
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    report,
  }, null, 2);

  const copyDiagnostics = async () => {
    if (!report) {
      setStatus("Diagnostics are still initializing. Try again shortly.");
      return;
    }
    if (!navigator.clipboard?.writeText) {
      setStatus("Clipboard access is unavailable here. Use Export JSON instead.");
      return;
    }
    try {
      await navigator.clipboard.writeText(exportPayload());
      setStatus("Diagnostics copied to clipboard.");
    } catch (error) {
      setStatus(`Copy failed: ${error instanceof Error ? error.message : "clipboard permission denied"}. Use Export JSON instead.`);
    }
  };

  const exportResults = async () => {
    if (!report) {
      setStatus("Diagnostics are still initializing. Try again shortly.");
      return;
    }
    const contents = exportPayload();
    const file = new File([contents], "route-diagnostics.json", { type: "application/json" });
    try {
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({ files: [file], title: "Route 666 diagnostics" });
        setStatus("Diagnostics shared.");
        return;
      }
      const url = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "route-diagnostics.json";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("JSON diagnostics export started. Save or share the downloaded file.");
    } catch (error) {
      setStatus(`Export failed: ${error instanceof Error ? error.message : "file sharing is unavailable"}.`);
    }
  };

  const runtime = report?.runtime;
  const renderer = sample?.webgl.unmaskedRenderer ?? sample?.webgl.renderer ??
    runtime?.webglRenderer?.unmaskedRenderer ?? runtime?.webglRenderer?.renderer;
  const initializationMs = report?.initializationMs;

  return <aside className="route-performance-panel" aria-label="Development performance diagnostics">
    <button className="route-performance-toggle" type="button" aria-expanded={expanded}
      onClick={() => setExpanded(value => !value)}>
      {expanded ? "Close perf" : "Perf"}
    </button>
    {expanded && <section className="route-performance-card">
      <h2>Route 666 diagnostics</h2>
      <label>
        Scenario
        <select value={scenario} onChange={event => setScenario(event.target.value)} disabled={remainingMs > 0}>
          {SCENARIOS.map(name => <option key={name}>{name}</option>)}
        </select>
      </label>
      <div className="route-performance-controls">
        {remainingMs > 0
          ? <button type="button" onClick={finishSample}>Stop Sample ({(remainingMs / 1000).toFixed(1)}s)</button>
          : <button type="button" onClick={startSample}>Start Sample (3s)</button>}
      </div>
      <p className="route-performance-status" role="status" aria-live="polite">{status}</p>
      <section className="route-diagnostic-section" aria-label="Fallback diagnosis">
        <h3>Scene activation</h3>
        <dl>
          <div><dt>Display</dt><dd>{runtime?.display ?? "—"}</dd></div>
          <div><dt>Eligibility</dt><dd>{runtime?.eligibility.checked ? runtime.eligibility.eligible ? "eligible" : "blocked" : "not checked"}</dd></div>
          <div><dt>Canvas mounted</dt><dd>{runtime?.canvas.mounted ? "yes" : "no"}</dd></div>
          <div><dt>Renderer creation</dt><dd>{runtime?.canvas.rendererState ?? "—"}</dd></div>
          <div><dt>WebGL API</dt><dd>{runtime ? `WebGL1 ${runtime.capability.webgl1Api ? "available" : "missing"} / WebGL2 ${runtime.capability.webgl2Api ? "available" : "missing"} (${runtime.capability.detection})` : "—"}</dd></div>
          <div className="route-performance-renderer"><dt>WebGL renderer</dt><dd>{renderer ?? "Not available"}</dd></div>
          <div><dt>Context lost</dt><dd>{runtime?.canvas.contextLost ? "yes" : "no"}</dd></div>
          <div><dt>Scene readiness</dt><dd>{runtime?.readiness.state ?? "—"}</dd></div>
          <div><dt>Readiness elapsed / threshold</dt><dd>{runtime ? `${formatMetric(runtime.readiness.elapsedMs ?? undefined, " ms")} / ${runtime.readiness.timeoutMs} ms` : "—"}</dd></div>
          {runtime?.readiness.reason && <div className="route-performance-renderer"><dt>Readiness detail</dt><dd>{runtime.readiness.reason}</dd></div>}
        </dl>
        <h3>Fallback / defer reasons</h3>
        {runtime?.fallbackReasons.length
          ? <ul>{runtime.fallbackReasons.map((reason, index) => <li key={`${index}-${reason}`}>{reason}</li>)}</ul>
          : <p>None reported.</p>}
        <h3>Browser/device summary</h3>
        <p>{runtime?.device
          ? `${runtime.device.browser} / ${runtime.device.os} / ${runtime.device.deviceClass}; ${runtime.device.viewport.width}×${runtime.device.viewport.height} @${runtime.device.viewport.dpr}; touch ${runtime.device.viewport.touch ? "yes" : "no"}; reduced motion ${runtime.device.reducedMotion ? "yes" : "no"}; Save-Data ${runtime.device.saveData === null ? "unknown" : runtime.device.saveData ? "on" : "off"}; cores ${runtime.device.hardwareConcurrency ?? "unknown"}; memory ${runtime.device.deviceMemoryGiB ?? "unknown"} GiB`
          : "—"}</p>
        {runtime?.errors.length ? <>
          <h3>Observed errors</h3>
          <ul>{runtime.errors.map((error, index) =>
            <li key={`${index}-${error.stage}`}>+{(error.elapsedMs / 1000).toFixed(1)}s {error.stage}: {error.message}</li>)}</ul>
        </> : null}
      </section>
      <dl>
        <div><dt>Average FPS</dt><dd>{formatMetric(sample?.averageFps, "")}</dd></div>
        <div><dt>Frame P50 / P95</dt><dd>{formatMetric(sample?.frameTimeMs.p50, " ms")} / {formatMetric(sample?.frameTimeMs.p95, " ms")}</dd></div>
        <div><dt>Jank &gt;33 / &gt;50 ms</dt><dd>{sample ? `${sample.jankFrames.over33ms} / ${sample.jankFrames.over50ms}` : "—"}</dd></div>
        <div><dt>Current DPR</dt><dd>{formatMetric(sample?.canvas.dpr, "")}</dd></div>
        <div><dt>Scene ready</dt><dd>{formatMetric(initializationMs ?? undefined, " ms")}</dd></div>
        <div className="route-performance-renderer"><dt>Sample renderer</dt><dd>{renderer ?? "Not sampled"}</dd></div>
      </dl>
      <div className="route-performance-controls">
        <button type="button" onClick={copyDiagnostics} disabled={!report}>Copy Diagnostics</button>
        <button type="button" onClick={exportResults} disabled={!report}>Export JSON</button>
      </div>
    </section>}
  </aside>;
}
