// Lightweight coordination settings; fallback visitors do not load Three.js.
export const routeJourneySettings = {
  scrollScreens: 8,
  response: 8,
  navigationSeconds: 2.4,
} as const;

export interface JourneyProgress { enabled: boolean; progress: number; galleryActive: boolean; activeBillboard: number; cameraProgress: number }
