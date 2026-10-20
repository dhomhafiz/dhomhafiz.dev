"use client";

import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useLoader, type ThreeEvent } from "@react-three/fiber";
import { BoxGeometry, MathUtils, MeshBasicMaterial, MeshStandardMaterial, SRGBColorSpace, TextureLoader } from "three";
import type { GalleryProject } from "@/lib/workProjects";
import type { JourneyProgress } from "./routeJourneySettings";
import { viewingBillboard } from "./routeBillboardSettings";

interface ProjectScreenProps {
  project: GalleryProject;
  journey: RefObject<JourneyProgress>;
  onHover: (hovered: boolean) => void;
  width: number;
  height: number;
  index: number;
}

// The existing texture, feedback and raycast handlers, shared by physical displays.
export function ProjectScreen3D({ project, index, journey, onHover, width, height }: ProjectScreenProps) {
  const texture = useLoader(TextureLoader, project.preview.src);
  const edge = useRef<MeshBasicMaterial>(null);
  const hovered = useRef(false);
  const box = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const metal = useMemo(() => new MeshStandardMaterial({ color: "#53616b", metalness: 0.78, roughness: 0.32 }), []);
  useLayoutEffect(() => { texture.colorSpace = SRGBColorSpace; texture.needsUpdate = true; }, [texture]);
  const hover = (value: boolean) => {
    if (hovered.current === value) return;
    hovered.current = value;
    onHover(value);
  };
  const active = () => journey.current.galleryActive && journey.current.activeBillboard === index &&
    viewingBillboard(journey.current.cameraProgress) === index;
  const allowed = (event: ThreeEvent<PointerEvent | MouseEvent>) => active() &&
    !(event.nativeEvent.target as Element)?.closest("a, button");
  useFrame((_, delta) => {
    if (!active()) hover(false);
    if (edge.current) edge.current.opacity = MathUtils.damp(edge.current.opacity, hovered.current ? 1 : 0.28, 8, Math.min(delta, 0.1));
  });
  const innerWidth = width - 0.4, innerHeight = height - 0.4;
  return <group>
    <mesh geometry={box} material={metal} position={[0, 0, -0.25]} scale={[width + 0.8, height + 0.8, 0.5]} />
    <mesh position={[0, 0, 0.01]}><planeGeometry args={[width + 0.45, height + 0.45]} /><meshBasicMaterial ref={edge} color="#d5b584" transparent opacity={0.28} toneMapped={false} /></mesh>
    <mesh position={[0, 0, 0.04]}><planeGeometry args={[width, height]} /><meshBasicMaterial color="#02070a" /></mesh>
    <mesh name="project-screen" position={[0, 0, 0.06]}
      onPointerOver={event => { if (allowed(event)) { event.stopPropagation(); hover(true); } }}
      onPointerMove={event => { if (allowed(event)) { event.stopPropagation(); hover(true); } }}
      onPointerOut={() => hover(false)}
      onClick={event => { if (allowed(event)) { event.stopPropagation(); window.location.assign(project.href); } }}>
      <planeGeometry args={[Math.min(innerWidth, innerHeight * project.preview.width / project.preview.height), Math.min(innerHeight, innerWidth * project.preview.height / project.preview.width)]} />
      <meshBasicMaterial map={texture} toneMapped={false} fog={false} />
    </mesh>
  </group>;
}
