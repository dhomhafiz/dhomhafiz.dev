import { CatmullRomCurve3, MathUtils, Vector3 } from "three";
import { routeJourneySettings, billboardProgress } from "./routeJourneySettings";
import { billboardDestinations as destinations } from "./routeBillboardSettings";

const paths = destinations.map(item => new CatmullRomCurve3(item.approach.map(point => new Vector3(...point)), false, "centripetal"));
const previousPosition = new Vector3(), previousDirection = new Vector3();
const previousRotation = { yaw: 0, pitch: 0 };

// Sample into reusable outputs. Travel and framing reference the destination,
// never project-specific coordinates or identity.
function sampleDestination(index: number, progress: number, position: Vector3, direction: Vector3, rotation: { yaw: number; pitch: number },
  horizontalHalfFov?: number, verticalHalfFov?: number, framingScale = 0.58) {
  const destination = destinations[index];
  const end = destination.approach[destination.approach.length - 1];
  const [targetX, targetY, targetZ] = destination.position.map((value, axis) => value + destination.focusOffset[axis]);
  const t = MathUtils.clamp(progress, 0, 1);
  paths[index].getPoint(t, position);
  paths[index].getTangent(t, direction);
  if (horizontalHalfFov !== undefined) {
    const horizontalDistance = destination.screen.width * framingScale / Math.tan(horizontalHalfFov);
    const verticalDistance = verticalHalfFov === undefined ? 0 :
      destination.screen.height * framingScale / Math.tan(verticalHalfFov);
    const distance = Math.max(horizontalDistance, verticalDistance);
    const dx = targetX - end[0], dy = targetY - end[1];
    const verticalOffset = verticalHalfFov === undefined ? 0 : dy ** 2;
    const desiredZ = targetZ + Math.sqrt(Math.max(0, distance ** 2 - dx ** 2 - verticalOffset));
    const retreat = MathUtils.clamp(desiredZ - end[2], 0, destination.maxRetreat);
    const travel = destination.approach[0][2] - end[2];
    // Distribute retreat across travel to preserve monotonic forward motion even
    // on very narrow desktops; camera x stays inside the roadside guardrail.
    position.z += retreat * (destination.approach[0][2] - position.z) / travel;
    direction.z *= 1 - retreat / travel;
  }
  const openingBlend = MathUtils.smoothstep(t, 0, 0.15);
  rotation.yaw = Math.atan2(-direction.x, -direction.z) * openingBlend;
  rotation.pitch = -0.025 + Math.atan2(direction.y, Math.hypot(direction.x, direction.z)) * openingBlend;
  const focus = MathUtils.smoothstep(t, destination.focusStart, 1);
  const dx = targetX - position.x, dz = targetZ - position.z;
  rotation.yaw = MathUtils.lerp(rotation.yaw, Math.atan2(-dx, -dz), focus);
  rotation.pitch = MathUtils.lerp(rotation.pitch, Math.atan2(targetY - position.y, Math.hypot(dx, dz)), focus);
}

// One reversible sampler. Travel eases to zero velocity at scroll viewing intervals;
// no timed stops or additional animation/scroll controllers.
export function sampleCameraPath(progress: number, position: Vector3, direction: Vector3,
  rotation: { yaw: number; pitch: number }, horizontalHalfFov?: number, verticalHalfFov?: number, framingScale = 0.58) {
  const t = MathUtils.clamp(billboardProgress(progress), 0, 1);
  if (progress > routeJourneySettings.contactDeparture) {
    // Depart the existing Squid Game pose, including narrow-aspect retreat.
    sampleDestination(destinations.length - 1, 1, previousPosition, previousDirection, previousRotation,
      horizontalHalfFov, verticalHalfFov, framingScale);
    const travel = MathUtils.smoothstep(progress, routeJourneySettings.contactDeparture, routeJourneySettings.contactArrival);
    const center = MathUtils.smoothstep(travel, 0, 0.6);
    position.set(MathUtils.lerp(previousPosition.x, 0, center), MathUtils.lerp(previousPosition.y, 2.8, center),
      MathUtils.lerp(previousPosition.z, -278, travel));
    direction.set(0, 0, -1);
    const turn = MathUtils.smoothstep(travel, 0, 0.42);
    rotation.yaw = MathUtils.lerp(previousRotation.yaw, 0, turn);
    rotation.pitch = MathUtils.lerp(previousRotation.pitch, -0.012, turn);
    return;
  }
  let index = destinations.length - 1;
  while (index > 0 && t <= destinations[index].travelStart) index--;
  const item = destinations[index];
  const travel = MathUtils.smoothstep(t, item.travelStart, item.viewStart);
  sampleDestination(index, travel, position, direction, rotation, horizontalHalfFov, verticalHalfFov, framingScale);
  if (index > 0) {
    sampleDestination(index - 1, 1, previousPosition, previousDirection, previousRotation,
      horizontalHalfFov, verticalHalfFov, framingScale);
    const departure = MathUtils.smoothstep(travel, 0, 0.3);
    rotation.yaw = MathUtils.lerp(previousRotation.yaw, rotation.yaw, departure);
    rotation.pitch = MathUtils.lerp(previousRotation.pitch, rotation.pitch, departure);
    // Carry narrow-aspect retreat out smoothly instead of jumping at departure.
    const start = item.approach[0];
    position.x += (previousPosition.x - start[0]) * (1 - travel);
    position.y += (previousPosition.y - start[1]) * (1 - travel);
    position.z += (previousPosition.z - start[2]) * (1 - travel);
  }
}
