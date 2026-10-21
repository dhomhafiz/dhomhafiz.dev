"use client";

import { useGalleryPresentation } from "./GalleryPresentation";
import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MathUtils, Vector3, type PerspectiveCamera, type WebGLRenderer } from "three";
import { RouteEnvironment } from "./RouteEnvironment";
import { SceneReadiness } from "./SceneReadiness";
import { updateMouseInfluence } from "./routeCameraInteraction";
import { sampleCameraPath } from "./routeCameraPath";
import { contactReveal, routeJourneySettings, type JourneyProgress } from "./routeJourneySettings";
import { RouteGallery } from "./RouteGallery";
import type { GalleryProject } from "@/lib/workProjects";

interface SceneProps {
  active: boolean;
  surface: RefObject<HTMLDivElement | null>;
  journey: RefObject<JourneyProgress>;
  projects: GalleryProject[];
  onHover: (slug: string, hovered: boolean) => void;
  onReady: () => void;
  onFailure: () => void;
}

function CameraRig({ surface, journey }: Pick<SceneProps, "surface" | "journey">) {
  const { suspended } = useGalleryPresentation();
  const { camera, size } = useThree();
  const contact = useRef<HTMLElement | null>(null);
  const input = useRef({ x: 0, y: 0, scroll: 0 });
  const opening = useRef(0);
  const path = useRef({ y: camera.position.y, pitch: camera.rotation.x, z: camera.position.z, progress: 0, started: false,
    position: new Vector3(), direction: new Vector3(), rotation: { yaw: 0, pitch: -0.025 } });
  const mouse = useRef({ yaw: 0, pitch: 0, x: 0, y: 0 });
  const horizontalHalfFov = Math.atan(Math.tan(MathUtils.degToRad((camera as PerspectiveCamera).fov / 2)) * size.width / Math.max(1, size.height));

  useEffect(() => {
    contact.current = document.getElementById("contact");
    const hero = surface.current?.closest<HTMLElement>(".immersive-hero");
    if (!hero) return;
    const reset = () => { if (!suspended.current) input.current.x = input.current.y = 0; };
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
    window.addEventListener("pointerover", viewportEnter, { passive: true });
    window.addEventListener("pointercancel", reset);
    window.addEventListener("pointerout", viewportExit);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("pointerover", viewportEnter);
      window.removeEventListener("pointercancel", reset);
      window.removeEventListener("pointerout", viewportExit);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [surface, suspended]);

  useFrame((_, delta) => {
    if (suspended.current) return;
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
    sampleCameraPath(path.current.progress, path.current.position, path.current.direction, path.current.rotation, horizontalHalfFov);
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
    input.current.scroll = MathUtils.lerp(exploration, 0.78, MathUtils.smoothstep(exploration, 0.7, 1));
    updateMouseInfluence(mouse.current, input.current, delta, opening.current, horizontalHalfFov);
    camera.position.x = path.current.position.x + mouse.current.x;
    camera.position.y = path.current.position.y + path.current.y - 2.25 + mouse.current.y;
    camera.position.z = path.current.position.z + path.current.z - 6;
    camera.rotation.set(path.current.rotation.pitch + path.current.pitch + 0.025 + mouse.current.pitch,
      path.current.rotation.yaw + mouse.current.yaw, 0, "YXZ");
  }, -1);
  return null;
}

export default function RouteScene({ active, surface, journey, projects, onHover, onReady, onFailure }: SceneProps) {
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
    <Canvas dpr={[1, 1.5]} frameloop={initialized && active ? "always" : "never"}
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
      <RouteEnvironment journey={journey} /><RouteGallery projects={projects} journey={journey} onHover={onHover} /><CameraRig surface={surface} journey={journey} />
      <SceneReadiness onFailure={fail} onReady={() => {
        if (!failed.current) { setInitialized(true); callbacks.current.onReady(); }
      }} />
      </Suspense>
    </Canvas>
  </div>;
}
