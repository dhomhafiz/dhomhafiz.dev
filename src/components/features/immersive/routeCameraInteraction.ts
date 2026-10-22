import { MathUtils } from "three";

// Mouse offsets only. Opening/scroll path timing and damping stay in CameraRig.
export const cameraMouseSettings = {
  sensitivity: 1,
  // Keep the horizon calm, especially during vertical pointer movement.
  yawDegrees: 8,
  pitchDegrees: 3,
  response: 6,
  parallaxX: 0.1,
  parallaxY: 0.02,
  maxDelta: 0.1,
  // Leave a margin around the road's vanishing point on narrow viewports.
  horizontalFovFraction: 0.7,
  openingBlendStart: 0.3,
  scrollFadeStart: 0.2,
  scrollFadeEnd: 1,
} as const;

export const cameraTouchSettings = {
  ...cameraMouseSettings,
  yawDegrees: 10,
  pitchDegrees: 5,
  scrollFadeStart: 0,
  scrollFadeEnd: 1,
} as const;

interface CameraInteractionSettings {
  sensitivity: number;
  yawDegrees: number;
  pitchDegrees: number;
  response: number;
  parallaxX: number;
  parallaxY: number;
  maxDelta: number;
  horizontalFovFraction: number;
  openingBlendStart: number;
  scrollFadeStart: number;
  scrollFadeEnd: number;
}

export interface MouseInfluence { yaw: number; pitch: number; x: number; y: number }
interface MouseInput { x: number; y: number; scroll: number }

// Mutate a persistent offset without allocating objects in the animation loop.
export function updateMouseInfluence(
  state: MouseInfluence, input: MouseInput, delta: number, opening: number, horizontalHalfFov: number,
  config: CameraInteractionSettings = cameraMouseSettings,
) {
  const dt = MathUtils.clamp(delta, 0, config.maxDelta);
  const blend = MathUtils.smoothstep(opening, config.openingBlendStart, 1) *
    (1 - MathUtils.smoothstep(input.scroll, config.scrollFadeStart, config.scrollFadeEnd));
  const x = MathUtils.clamp(input.x * config.sensitivity, -1, 1);
  const y = MathUtils.clamp(input.y * config.sensitivity, -1, 1);
  const yaw = Math.min(MathUtils.degToRad(config.yawDegrees), horizontalHalfFov * config.horizontalFovFraction);
  state.yaw = MathUtils.damp(state.yaw, -x * yaw * blend, config.response, dt);
  state.pitch = MathUtils.damp(state.pitch, -y * MathUtils.degToRad(config.pitchDegrees) * blend, config.response, dt);
  state.x = MathUtils.damp(state.x, x * config.parallaxX * blend, config.response, dt);
  state.y = MathUtils.damp(state.y, -y * config.parallaxY * blend, config.response, dt);
}
