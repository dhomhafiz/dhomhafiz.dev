// Route 666 art direction. Camera and interaction settings remain in RouteScene.
export const routeEnvironment = {
  sky: {
    resolution: 512,
    drift: 0.00012,
    moonDirection: [-0.42, 0.25, -0.87] as [number, number, number],
    moonColor: "#afc6d8",
    moonIntensity: 1.15,
    zenith: "#0b1425",
    horizon: "#354554",
    cloudShadow: "#111b29",
    cloudLight: "#5c6f80",
  },
  dawn: { zenith: "#354b69", horizon: "#c99566", fog: "#777e82", density: 0.011,
    skyLight: "#b4c4d3", groundLight: "#443b34", keyLight: "#edbb87" },
  atmosphere: { color: "#25333f", density: 0.0095 },
  road: { width: 12.4, length: 430, centerZ: -175, wetness: 0.78 },
  signs: { pairs: 9, firstZ: -12, spacing: 17, offset: 6.65, height: 1.72 },
  terrain: { widthSegments: 36, depthSegments: 84, rockCount: 54 },
  rails: { offset: 7.6, height: 0.73, startZ: 14, length: 410, postSpacing: 6 },
} as const;
