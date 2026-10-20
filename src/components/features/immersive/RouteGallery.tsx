"use client";

import { useMemo, type RefObject } from "react";
import { BoxGeometry, CylinderGeometry, MeshStandardMaterial } from "three";
import type { GalleryProject } from "@/lib/workProjects";
import type { JourneyProgress } from "./routeJourneySettings";
import { billboardDestinations, type BillboardDestination } from "./routeBillboardSettings";
import { ProjectScreen3D } from "./ProjectScreen3D";

// Keep the existing scene slot; the destination is now entirely beside the road.
function useBillboardResources() {
  const box = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const steel = useMemo(() => new MeshStandardMaterial({ color: "#53636f", metalness: 0.8, roughness: 0.34 }), []);
  const concrete = useMemo(() => new MeshStandardMaterial({ color: "#41484b", roughness: 0.95 }), []);
  const trim = useMemo(() => new MeshStandardMaterial({ color: "#748491", metalness: 0.85, roughness: 0.28 }), []);
  const lamp = useMemo(() => new MeshStandardMaterial({ color: "#ffe6c4", emissive: "#ffc47a", emissiveIntensity: 1.4, toneMapped: false }), []);
  const edge = useMemo(() => new MeshStandardMaterial({ color: "#8b7354", metalness: 0.6, roughness: 0.38,
    emissive: "#d89e58", emissiveIntensity: 0.35 }), []);
  const cylinder = useMemo(() => new CylinderGeometry(1, 1, 1, 12), []);
  return { box, steel, concrete, trim, lamp, edge, cylinder };
}

export function RouteGallery({ projects, journey, onHover }: {
  projects: GalleryProject[]; journey: RefObject<JourneyProgress>; onHover: (slug: string, hovered: boolean) => void;
}) {
  const resources = useBillboardResources();
  return <>{billboardDestinations.map((destination, index) => {
    const project = projects.find(item => item.slug === destination.projectSlug);
    return project && <RoadsideBillboard key={project.slug} destination={destination} project={project} index={index}
      resources={resources} journey={journey} onHover={hovered => onHover(project.slug, hovered)} />;
  })}</>;
}

function RoadsideBillboard({ destination, project, index, journey, onHover, resources }: {
  destination: BillboardDestination; project: GalleryProject; index: number;
  journey: RefObject<JourneyProgress>; onHover: (hovered: boolean) => void; resources: ReturnType<typeof useBillboardResources>;
}) {
  const { box, steel, concrete, trim, lamp, edge, cylinder } = resources;
  const [width, height] = [destination.screen.width, destination.screen.height];
  const elevation = destination.position[1];
  const deckY = -height / 2 - 0.55;
  const deckWidth = width + 0.85;
  const span = deckWidth / 6;
  return <group position={destination.position} rotation={[0, destination.rotationY, 0]} name={`roadside-billboard-${project.slug}`}>
    <ProjectScreen3D project={project} index={index} journey={journey} onHover={onHover} width={width} height={height} />
    {/* Round steel columns, mounting collars and bolted foundation plates. */}
    {[-width * 0.25, width * 0.25].map(x => <group key={x}>
      <mesh geometry={cylinder} material={steel} position={[x, -elevation / 2, -0.75]} scale={[0.32, elevation, 0.32]} />
      <mesh geometry={box} material={concrete} position={[x, -elevation + 0.25, -0.75]} scale={[2.2, 0.5, 2]} />
      <mesh geometry={box} material={trim} position={[x, -elevation + 0.55, -0.75]} scale={[1.25, 0.13, 1.25]} />
      {[-0.44, 0.44].flatMap(dx => [-0.44, 0.44].map(dz => <mesh key={`${dx}/${dz}`} geometry={cylinder} material={trim}
        position={[x + dx, -elevation + 0.66, -0.75 + dz]} scale={[0.07, 0.1, 0.07]} />))}
      {[deckY - 0.5, deckY + 0.15].map(y => <mesh key={y} geometry={cylinder} material={trim}
        position={[x, y, -0.75]} scale={[0.39, 0.18, 0.39]} />)}
    </group>)}
    {/* Rear rails and vertical frame keep the sign visibly structural from the approach. */}
    {[-height * 0.3, 0, height * 0.3].map(y => <mesh key={y} geometry={box} material={steel}
      position={[0, y, -0.85]} scale={[width + 0.4, 0.22, 0.28]} />)}
    {[-1, 1].map(side => <group key={side}>
      <mesh geometry={box} material={steel} position={[side * (width / 2 + 0.28), 0, -0.6]} scale={[0.18, height + 1.15, 0.65]} />
      <mesh geometry={box} material={edge} position={[side * (width / 2 + 0.12), 0, 0.07]} scale={[0.035, height + 0.3, 0.04]} />
      {[-0.47, 0, 0.47].map(fraction => <mesh key={fraction} geometry={cylinder} material={trim}
        position={[side * (width / 2 + 0.27), height * fraction, 0.025]} rotation={[Math.PI / 2, 0, 0]} scale={[0.055, 0.05, 0.055]} />)}
    </group>)}
    {/* Narrow service catwalk, handrail and triangulated lower truss. */}
    <mesh geometry={box} material={steel} position={[0, deckY, 0.05]} scale={[deckWidth, 0.13, 1.35]} />
    {[-0.55, 0.68].map(z => <mesh key={z} geometry={box} material={trim} position={[0, deckY + 0.58, z]} scale={[deckWidth, 0.055, 0.055]} />)}
    {Array.from({ length: 7 }, (_, i) => <group key={i} position={[-deckWidth / 2 + span * i, deckY, 0]}>
      <mesh geometry={box} material={trim} position={[0, 0.29, 0.68]} scale={[0.055, 0.58, 0.055]} />
      <mesh geometry={box} material={steel} position={[0, -0.35, -0.45]} scale={[0.07, 0.7, 0.07]} />
      {i < 6 && <mesh geometry={box} material={steel} position={[span / 2, -0.35, -0.45]}
        rotation={[0, 0, (i % 2 ? -1 : 1) * Math.atan2(0.7, span)]} scale={[Math.hypot(span, 0.7), 0.07, 0.07]} />}
    </group>)}
    <mesh geometry={box} material={steel} position={[0, deckY - 0.7, -0.45]} scale={[deckWidth, 0.1, 0.12]} />
    <mesh geometry={box} material={edge} position={[0, deckY - 0.04, 0.735]} scale={[width, 0.035, 0.035]} />
    {/* Twin ladder stiles, with rungs up to the service deck. */}
    {[-0.24, 0.24].map(dx => <mesh key={dx} geometry={box} material={trim}
      position={[width / 2 + 0.38 + dx, (-elevation + deckY) / 2, -0.8]} scale={[0.06, elevation + deckY, 0.06]} />)}
    {Array.from({ length: Math.floor((elevation + deckY) / 0.5) }, (_, i) => <mesh key={i} geometry={box} material={trim}
      position={[width / 2 + 0.38, -elevation + 0.6 + i * 0.5, -0.8]} scale={[0.55, 0.055, 0.08]} />)}
    {/* Visible floodlight fixtures are emissive; only two shared lights illuminate steel. */}
    {[-0.4, -0.2, 0, 0.2, 0.4].map(fraction => <group key={fraction} position={[width * fraction, height / 2 + 0.55, 0]}>
      <mesh geometry={box} material={trim} position={[0, 0.2, 0.36]} rotation={[0.35, 0, 0]} scale={[0.07, 0.6, 0.07]} />
      <mesh geometry={box} material={steel} position={[0, 0.48, 0.7]} rotation={[-0.55, 0, 0]} scale={[0.64, 0.13, 0.34]} />
      <mesh geometry={box} material={lamp} position={[0, 0.41, 0.73]} rotation={[-0.55, 0, 0]} scale={[0.49, 0.025, 0.25]} />
    </group>)}
    <mesh geometry={box} material={trim} position={[0, height / 2 + 0.4, -0.1]} scale={[width + 0.7, 0.12, 0.3]} />
    <pointLight position={[0, height / 2 + 0.75, 1.6]} color="#ffe0af" intensity={180} distance={20} decay={2} />
    <pointLight position={[0, deckY + 0.1, 1.8]} color="#ffd5a0" intensity={65} distance={13} decay={2} />
  </group>;
}
