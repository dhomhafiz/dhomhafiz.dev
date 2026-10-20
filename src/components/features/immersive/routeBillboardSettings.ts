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
  position: [15.9, 13.6, -138] as [number, number, number],
  // Face approaching traffic; a compact footprint keeps the housing beyond the rail.
  rotationY: -0.45,
  // Inner aperture matches the original 1440 x 1000 preview without cropping.
  screen: { width: 15.1, height: 10.6 },
  focusOffset: [-2, -1, 0] as [number, number, number],
  approach: [
    [0, 2.25, 6], [-0.45, 2.35, -24], [0.65, 2.5, -65],
    [1.6, 2.9, -94], [3.8, 3.7, -108], [5.4, 4.4, -115],
  ] as [number, number, number][],
  focusStart: 0.45,
  maxRetreat: 25,
  travelStart: 0,
  viewStart: 0.4,
  viewEnd: 0.5,
}, {
  projectSlug: "netflix-squid-game-2",
  position: [-15.9, 13.6, -218],
  rotationY: 0.45,
  screen: { width: 15.1, height: 11.425 },
  focusOffset: [2, -1, 0],
  approach: [
    [5.4, 4.4, -115], [3, 3.2, -135], [0, 2.6, -158],
    [-1.8, 3, -178], [-3.8, 3.7, -188], [-5.4, 4.4, -194],
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
