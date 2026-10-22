export interface BillboardDestination {
  projectSlug: string;
  position: [number, number, number];
  rotationY: number;
  screen: { width: number; height: number };
  focusOffset: [number, number, number];
  approach: [number, number, number][];
  focusStart: number;
  maxRetreat: number;
  travelStart: number;
  viewStart: number;
  viewEnd: number;
}

// Progress intervals share one document-scroll journey, including inspectable plateaus.
export const billboardDestinations: readonly BillboardDestination[] = [{
  projectSlug: "still-dental",
  position: [15.9, 13.6, -115] as [number, number, number],
  // Face approaching traffic; a compact footprint keeps the housing beyond the rail.
  rotationY: -0.45,
  // Inner aperture matches the original 1440 x 1000 preview without cropping.
  screen: { width: 15.1, height: 10.6 },
  focusOffset: [-2, -1, 0] as [number, number, number],
  approach: [
    [0, 2.25, 6], [-0.45, 2.35, -18.5], [0.65, 2.5, -52.1],
    [1.6, 2.9, -75.8], [3.8, 3.7, -87.3], [5.4, 4.4, -93],
  ] as [number, number, number][],
  focusStart: 0.45,
  maxRetreat: 25,
  travelStart: 0,
  viewStart: 0.4,
  viewEnd: 0.5,
}, {
  projectSlug: "netflix-squid-game-2",
  position: [-15.9, 15.6, -182],
  rotationY: 0.45,
  screen: { width: 15.1, height: 11.425 },
  focusOffset: [2, -1, 0],
  approach: [
    [5.4, 4.4, -93], [3, 3.2, -109.5], [1.5, 2.6, -128.4],
    [0.2, 3.3, -145], [-1, 4.4, -153.2], [-1.5, 5.4, -158],
  ],
  focusStart: 0.45,
  maxRetreat: 25,
  travelStart: 0.5,
  viewStart: 0.92,
  viewEnd: 1,
}];

export function viewingBillboard(progress: number) {
  return billboardDestinations.findIndex(item => progress >= item.viewStart - 0.0001 && progress <= item.viewEnd + 0.0001);
}

export function billboardEntry(index: number) {
  const item = billboardDestinations[index];
  return (item.viewStart + item.viewEnd) / 2;
}
