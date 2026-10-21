// Lightweight coordination settings; fallback visitors do not load Three.js.
export const routeJourneySettings = {
  billboardScreens: 8,
  scrollScreens: 12,
  response: 8,
  navigationSeconds: 2.4,
  contactDeparture: 8 / 12,
  contactArrival: 0.96,
  contactEntry: 0.975,
} as const;

export function billboardProgress(progress: number) {
  return progress <= routeJourneySettings.contactDeparture ? progress / routeJourneySettings.contactDeparture : -1;
}
export function dawnProgress(progress: number) {
  const t = Math.max(0, Math.min(1, (progress - routeJourneySettings.contactDeparture) /
    (routeJourneySettings.contactArrival - routeJourneySettings.contactDeparture)));
  return t * t * (3 - 2 * t);
}
export function contactReveal(progress: number) {
  const t = Math.max(0, Math.min(1, (progress - 0.84) / 0.11));
  return t * t * (3 - 2 * t);
}
export interface JourneyProgress { enabled: boolean; progress: number; galleryActive: boolean; activeBillboard: number; cameraProgress: number }
