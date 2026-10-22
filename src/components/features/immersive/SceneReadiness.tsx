"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { routePerformanceDiagnostics, SCENE_READINESS_DIAGNOSTIC_TIMEOUT_MS } from "./routePerformanceDiagnostics";

interface ReadinessProps { onReady: () => void; onFailure: (reason: string) => void }

// The Canvas stays hidden and its animation loop stopped during preparation.
// Environment layout effects have already baked the sky and populated instances.
export function SceneReadiness({ onReady, onFailure }: ReadinessProps) {
  const { gl, scene, camera } = useThree();
  const callbacks = useRef({ onReady, onFailure });
  callbacks.current = { onReady, onFailure };

  useEffect(() => {
    const candidate = gl.getContext();
    const diagnostics = process.env.NODE_ENV === "development" ? routePerformanceDiagnostics() : null;
    if (!("fenceSync" in candidate)) {
      const reason = diagnostics
        ? "The WebGL context does not support GPU fence synchronization."
        : "Scene readiness failed.";
      diagnostics?.setReadiness("failed", reason);
      diagnostics?.recordError("scene-readiness", reason);
      callbacks.current.onFailure(reason);
      return;
    }
    const context = candidate;
    let disposed = false;
    let frame = 0;
    const timeout = diagnostics ? window.setTimeout(() => {
      if (disposed) return;
      const reason = `Scene readiness has not completed after ${SCENE_READINESS_DIAGNOSTIC_TIMEOUT_MS / 1000} seconds; shader compilation or GPU completion may still be pending.`;
      diagnostics.setReadiness("timed-out", reason);
      diagnostics.recordError("scene-readiness-timeout", reason);
    }, SCENE_READINESS_DIAGNOSTIC_TIMEOUT_MS) : null;
    let fence: WebGLSync | null = null;
    const releaseFence = () => {
      if (fence) context.deleteSync(fence);
      fence = null;
    };
    const fail = (reason: string) => {
      releaseFence();
      if (!disposed) {
        diagnostics?.setReadiness("failed", reason);
        diagnostics?.recordError("scene-readiness", reason);
        callbacks.current.onFailure(diagnostics ? reason : "Scene readiness failed.");
      }
    };
    const checkFrame = () => {
      if (disposed) return;
      if (context.isContextLost() || !fence) { fail("The WebGL context was lost or the GPU fence was unavailable."); return; }
      const status = context.clientWaitSync(fence, 0, 0);
      if (status === context.WAIT_FAILED) { fail("The WebGL GPU completion fence returned WAIT_FAILED."); return; }
      if (status === context.TIMEOUT_EXPIRED) {
        frame = requestAnimationFrame(checkFrame);
        return;
      }
      releaseFence();
      diagnostics?.setReadiness("ready");
      callbacks.current.onReady();
    };
    const prepare = async () => {
      diagnostics?.setReadiness("compiling");
      await gl.compileAsync(scene, camera);
      if (disposed) return;
      if (context.isContextLost()) { fail("The WebGL context was lost during shader compilation."); return; }
      // Upload geometry/textures and render all materials at the opening pose.
      // This does not advance useFrame, so loading never consumes the reveal.
      diagnostics?.setReadiness("uploading");
      gl.render(scene, camera);
      fence = context.fenceSync(context.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!fence) { fail("The browser did not provide a WebGL GPU completion fence."); return; }
      diagnostics?.setReadiness("waiting-gpu");
      context.flush();
      checkFrame();
    };
    void prepare().catch(error => fail(error instanceof Error ? error.message : "Unknown scene compilation or upload failure."));
    return () => {
      disposed = true;
      if (timeout !== null) window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
      releaseFence();
    };
  }, [gl, scene, camera]);
  return null;
}
