"use client";

import { useGalleryPresentation } from "./GalleryPresentation";
import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3, type PerspectiveCamera, type WebGLRenderer } from "three";
import { RouteEnvironment } from "./RouteEnvironment";
import { SceneReadiness } from "./SceneReadiness";
import { cameraTouchSettings, updateMouseInfluence } from "./routeCameraInteraction";
import { sampleCameraPath } from "./routeCameraPath";
import { contactReveal, routeJourneySettings, type JourneyProgress } from "./routeJourneySettings";
import { RouteGallery } from "./RouteGallery";
import type { GalleryProject } from "@/lib/workProjects";

interface SceneProps {
  active: boolean;
  mobileProfile?: boolean;
  surface: RefObject<HTMLDivElement | null>;
  journey: RefObject<JourneyProgress>;
  projects: GalleryProject[];
  onHover: (slug: string, hovered: boolean) => void;
  onReady: () => void;
  onFailure: () => void;
}

function CameraRig({ surface, journey, mobileProfile }: Pick<SceneProps, "surface" | "journey" | "mobileProfile">) {
  const { suspended } = useGalleryPresentation();
  const { camera, size } = useThree();
  const contact = useRef<HTMLElement | null>(null);
  const input = useRef({ x: 0, y: 0, scroll: 0 });
  const touch = useRef({
    pointerId: -1, startX: 0, startY: 0, lookStartY: 0,
    intent: "idle" as "idle" | "pending" | "look" | "scroll",
    active: false, suppressClickUntil: 0,
  });
  const opening = useRef(0);
  const path = useRef({ y: camera.position.y, pitch: camera.rotation.x, z: camera.position.z, progress: 0, started: false,
    position: new Vector3(), direction: new Vector3(), rotation: { yaw: 0, pitch: -0.025 } });
  const mouse = useRef({ yaw: 0, pitch: 0, x: 0, y: 0 });
  const verticalHalfFov = MathUtils.degToRad((camera as PerspectiveCamera).fov / 2);
  const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * size.width / Math.max(1, size.height));
  const portraitFraming = mobileProfile && size.width / Math.max(1, size.height) < 0.65;

  useEffect(() => {
    contact.current = document.getElementById("contact");
    const hero = surface.current?.closest<HTMLElement>(".immersive-hero");
    if (!hero) return;
    const reset = () => { if (!suspended.current) input.current.x = input.current.y = 0; };
    const resetTouch = (returnToNeutral = true) => {
      touch.current.pointerId = -1;
      touch.current.intent = "idle";
      if (returnToNeutral) {
        input.current.x = input.current.y = 0;
        touch.current.active = true;
      }
    };
    const targetIsScene = (target: EventTarget | null) =>
      target instanceof Element && hero.contains(target) &&
      !target.closest("a, button, input, select, textarea, [contenteditable='true'], [role='button'], [role='link']");
    const touchStart = (event: PointerEvent) => {
      if (!mobileProfile || event.pointerType !== "touch" || suspended.current ||
        touch.current.pointerId >= 0 || !targetIsScene(event.target)) return;
      touch.current.suppressClickUntil = 0;
      touch.current.pointerId = event.pointerId;
      touch.current.startX = event.clientX;
      touch.current.startY = event.clientY;
      touch.current.lookStartY = event.clientY;
      touch.current.intent = "pending";
      input.current.x = input.current.y = 0;
    };
    const touchMove = (event: PointerEvent) => {
      const gesture = touch.current;
      if (event.pointerType !== "touch" || event.pointerId !== gesture.pointerId || suspended.current) return;
      const dx = event.clientX - gesture.startX;
      const dy = event.clientY - gesture.startY;
      if (gesture.intent === "pending") {
        if (Math.hypot(dx, dy) < 12) return;
        if (Math.abs(dx) < Math.abs(dy) * 1.5) {
          gesture.intent = "scroll";
          return;
        }
        gesture.intent = "look";
        gesture.active = true;
        gesture.lookStartY = event.clientY;
      }
      if (gesture.intent !== "look") return;
      input.current.x = MathUtils.clamp(dx / 150, -1, 1);
      input.current.y = MathUtils.clamp((event.clientY - gesture.lookStartY) / 100, -1, 1);
      input.current.scroll = 0;
    };
    const touchEnd = (event: PointerEvent) => {
      const gesture = touch.current;
      if (event.pointerId !== gesture.pointerId) return;
      const wasLook = gesture.intent === "look";
      if (wasLook) gesture.suppressClickUntil = performance.now() + 700;
      resetTouch(false);
      if (wasLook) {
        input.current.x = input.current.y = 0;
        gesture.active = true;
      }
    };
    const touchCancel = (event: PointerEvent) => {
      if (event.pointerId !== touch.current.pointerId) return;
      if (touch.current.intent === "look") touch.current.suppressClickUntil = performance.now() + 700;
      resetTouch();
      touch.current.intent = "scroll";
    };
    const suppressDraggedBillboardClick = (event: MouseEvent) => {
      if (performance.now() > touch.current.suppressClickUntil || !targetIsScene(event.target)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      touch.current.suppressClickUntil = 0;
    };
    const cancelOnResize = () => {
      if (touch.current.pointerId >= 0) resetTouch();
    };
    const pointer = (event: PointerEvent) => {
      if (suspended.current || event.pointerType !== "mouse") return;
      const rect = hero.getBoundingClientRect();
      if (event.clientX < 0 || event.clientY < 0 || event.clientX > innerWidth || event.clientY > innerHeight ||
        event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
        reset();
        return;
      }
      input.current.x = MathUtils.clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
      input.current.y = MathUtils.clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
    };
    const viewportExit = (event: PointerEvent) => { if (!event.relatedTarget) reset(); };
    const viewportEnter = (event: PointerEvent) => { if (!event.relatedTarget) pointer(event); };
    const visibility = () => { if (document.hidden) reset(); };
    // Track through the fixed HTML header without intercepting its interactions.
    window.addEventListener("pointermove", pointer, { passive: true });
    hero.addEventListener("pointerdown", touchStart, { passive: true });
    window.addEventListener("pointermove", touchMove, { passive: true });
    window.addEventListener("pointerup", touchEnd, { passive: true });
    window.addEventListener("pointercancel", touchCancel, { passive: true });
    window.addEventListener("resize", cancelOnResize);
    window.addEventListener("click", suppressDraggedBillboardClick, true);
    window.addEventListener("pointerover", viewportEnter, { passive: true });
    window.addEventListener("pointercancel", reset);
    window.addEventListener("pointerout", viewportExit);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pointermove", pointer);
      hero.removeEventListener("pointerdown", touchStart);
      window.removeEventListener("pointermove", touchMove);
      window.removeEventListener("pointerup", touchEnd);
      window.removeEventListener("pointercancel", touchCancel);
      window.removeEventListener("resize", cancelOnResize);
      window.removeEventListener("click", suppressDraggedBillboardClick, true);
      window.removeEventListener("pointerover", viewportEnter);
      window.removeEventListener("pointercancel", reset);
      window.removeEventListener("pointerout", viewportExit);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [mobileProfile, surface, suspended]);

  useFrame((_, delta) => {
    if (suspended.current) {
      input.current.x = input.current.y = 0;
      touch.current.pointerId = -1;
      touch.current.intent = "idle";
      touch.current.active = false;
      return;
    }
    const dt = Math.min(delta, 0.05);
    const progress = journey.current.enabled ? journey.current.progress : 0;
    // Deep links/restored scroll start at their path pose, without replaying the opening.
    if (!path.current.started) {
      path.current.started = true;
      if (progress > 0) {
        opening.current = 1;
        path.current.progress = progress;
        path.current.y = 2.25;
        path.current.pitch = -0.025;
        path.current.z = 6;
      }
    }
    opening.current = Math.min(1, opening.current + dt / 3.2);
    const reveal = 1 - Math.pow(1 - opening.current, 3);
    path.current.progress = MathUtils.damp(path.current.progress, progress, routeJourneySettings.response, Math.min(delta, 0.1));
    sampleCameraPath(path.current.progress, path.current.position, path.current.direction, path.current.rotation,
      horizontalHalfFov, portraitFraming ? verticalHalfFov : undefined, portraitFraming ? 0.72 : undefined);
    journey.current.cameraProgress = path.current.progress;
    if (journey.current.enabled && contact.current) {
      const reveal = contactReveal(path.current.progress);
      contact.current.style.setProperty("--route-contact-reveal", String(reveal));
      const interactive = contact.current.dataset.routeContact === "active" && reveal > 0.7;
      contact.current.inert = !interactive;
      contact.current.setAttribute("aria-hidden", String(!interactive));
    }
    // Preserve the opening's timing and damping; travel is additive to that reveal.
    path.current.y = MathUtils.damp(path.current.y, 2.25 + (1 - reveal) * 5, 4, dt);
    path.current.pitch = MathUtils.damp(path.current.pitch, -0.025 - (1 - reveal) * 0.17, 3, dt);
    path.current.z = MathUtils.damp(path.current.z, 6 + (1 - reveal) * 9, 4, dt);
    // Retain a small exploration layer at the screen without retuning hero sensitivity.
    const exploration = Math.min(1, path.current.progress / routeJourneySettings.contactDeparture);
    const touchLooking = mobileProfile && touch.current.active;
    input.current.scroll = touchLooking ? 0 :
      MathUtils.lerp(exploration, 0.78, MathUtils.smoothstep(exploration, 0.7, 1));
    updateMouseInfluence(mouse.current, input.current, delta, opening.current, horizontalHalfFov,
      touchLooking ? cameraTouchSettings : undefined);
    if (touchLooking && touch.current.intent !== "look" &&
      Math.abs(mouse.current.yaw) + Math.abs(mouse.current.pitch) + Math.abs(mouse.current.x) + Math.abs(mouse.current.y) < 0.001) {
      touch.current.active = false;
    }
    camera.position.x = path.current.position.x + mouse.current.x;
    camera.position.y = path.current.position.y + path.current.y - 2.25 + mouse.current.y;
    camera.position.z = path.current.position.z + path.current.z - 6;
    camera.rotation.set(path.current.rotation.pitch + path.current.pitch + 0.025 + mouse.current.pitch,
      path.current.rotation.yaw + mouse.current.yaw, 0, "YXZ");
  }, -1);
  return null;
}

export default function RouteScene({ active, mobileProfile = false, surface, journey, projects, onHover, onReady, onFailure }: SceneProps) {
  const [initialized, setInitialized] = useState(false);
  const lifecycle = useRef<{ gl: WebGLRenderer; lost: (event: Event) => void; fail: () => void } | null>(null);
  const failed = useRef(false);
  const callbacks = useRef({ onReady, onFailure });
  callbacks.current = { onReady, onFailure };
  const fail = () => {
    if (!failed.current) { failed.current = true; callbacks.current.onFailure(); }
  };
  useEffect(() => {
    const current = lifecycle.current;
    if (current) {
      current.gl.domElement.addEventListener("webglcontextlost", current.lost);
      current.gl.debug.onShaderError = current.fail;
    }
    return () => {
      const current = lifecycle.current;
      if (current) {
        current.gl.domElement.removeEventListener("webglcontextlost", current.lost);
        current.gl.debug.onShaderError = null;
      }
    };
  }, []);
  return <div className="route-canvas" data-initialized={initialized || undefined}>
    <Canvas dpr={mobileProfile ? 1 : [1, 1.5]} frameloop={initialized && active ? "always" : "never"}
      eventSource={surface.current?.parentElement ?? undefined} eventPrefix="client"
      camera={{ position: [0, 7.25, 15], rotation: [-0.195, 0, 0], fov: 58, near: 0.1, far: 420 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power", failIfMajorPerformanceCaveat: true }}
      onCreated={({ gl }) => {
        const lost = (event: Event) => { event.preventDefault(); fail(); };
        lifecycle.current = { gl, lost, fail };
        // Install before environment layout effects, including the sky bake.
        gl.domElement.addEventListener("webglcontextlost", lost);
        gl.debug.onShaderError = fail;
      }}
      fallback={null}>
      <Suspense fallback={null}>
      <RouteEnvironment journey={journey} /><RouteGallery projects={projects} journey={journey} onHover={onHover} /><CameraRig surface={surface} journey={journey} mobileProfile={mobileProfile} />
      <SceneReadiness onFailure={fail} onReady={() => {
        if (!failed.current) { setInitialized(true); callbacks.current.onReady(); }
      }} />
      </Suspense>
    </Canvas>
  </div>;
}
