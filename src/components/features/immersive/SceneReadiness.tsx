"use client";

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";

interface ReadinessProps { onReady: () => void; onFailure: () => void }

// The Canvas stays hidden and its animation loop stopped during preparation.
// Environment layout effects have already baked the sky and populated instances.
export function SceneReadiness({ onReady, onFailure }: ReadinessProps) {
  const { gl, scene, camera } = useThree();
  const callbacks = useRef({ onReady, onFailure });
  callbacks.current = { onReady, onFailure };

  useEffect(() => {
    const candidate = gl.getContext();
    if (!("fenceSync" in candidate)) { callbacks.current.onFailure(); return; }
    const context = candidate;
    let disposed = false;
    let frame = 0;
    let fence: WebGLSync | null = null;
    const releaseFence = () => {
      if (fence) context.deleteSync(fence);
      fence = null;
    };
    const fail = () => { releaseFence(); if (!disposed) callbacks.current.onFailure(); };
    const checkFrame = () => {
      if (disposed) return;
      if (context.isContextLost() || !fence) { fail(); return; }
      const status = context.clientWaitSync(fence, 0, 0);
      if (status === context.WAIT_FAILED) { fail(); return; }
      if (status === context.TIMEOUT_EXPIRED) {
        frame = requestAnimationFrame(checkFrame);
        return;
      }
      releaseFence();
      callbacks.current.onReady();
    };
    const prepare = async () => {
      await gl.compileAsync(scene, camera);
      if (disposed) return;
      if (context.isContextLost()) { fail(); return; }
      // Upload geometry/textures and render all materials at the opening pose.
      // This does not advance useFrame, so loading never consumes the reveal.
      gl.render(scene, camera);
      fence = context.fenceSync(context.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!fence) { fail(); return; }
      context.flush();
      checkFrame();
    };
    void prepare().catch(fail);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      releaseFence();
    };
  }, [gl, scene, camera]);
  return null;
}
