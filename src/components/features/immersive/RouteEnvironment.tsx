"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BackSide, BufferGeometry, Color, CubeCamera, DoubleSide, Float32BufferAttribute,
  InstancedMesh, LinearMipmapLinearFilter, LinearSRGBColorSpace, Mesh, Object3D,
  Scene, ShaderMaterial, Shape, SphereGeometry, Vector3, WebGLCubeRenderTarget,
} from "three";
import { routeEnvironment as settings } from "./routeEnvironmentSettings";
import { roadFragment, skyBakeFragment, skyFragment, worldVertex } from "./routeShaders";

function roundedPanel(width: number, height: number, radius: number) {
  const x = -width / 2, y = -height / 2;
  return new Shape().moveTo(x + radius, y).lineTo(x + width - radius, y)
    .quadraticCurveTo(x + width, y, x + width, y + radius)
    .lineTo(x + width, y + height - radius).quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    .lineTo(x + radius, y + height).quadraticCurveTo(x, y + height, x, y + height - radius)
    .lineTo(x, y + radius).quadraticCurveTo(x, y, x + radius, y);
}

function terrainNoise(x: number, z: number) {
  const hash = (a: number, b: number) => {
    const value = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const ix = Math.floor(x), iz = Math.floor(z);
  const sx = x - ix, sz = z - iz;
  const u = sx * sx * (3 - 2 * sx), v = sz * sz * (3 - 2 * sz);
  const near = hash(ix, iz) * (1 - u) + hash(ix + 1, iz) * u;
  const far = hash(ix, iz + 1) * (1 - u) + hash(ix + 1, iz + 1) * u;
  return near * (1 - v) + far * v;
}

// Two authored mountain profiles, sampled densely near the road and coarsely afar.
function terrainGeometry(side: number) {
  const { widthSegments: columns, depthSegments: rows } = settings.terrain;
  const positions: number[] = [], colors: number[] = [], indices: number[] = [];
  const base = new Color("#3c4953"), shade = new Color();
  const peak = (x: number, z: number, cx: number, cz: number, width: number, depth: number, height: number) =>
    height * Math.exp(-(((x - cx) / width) ** 2 + ((z - cz) / depth) ** 2));
  for (let row = 0; row <= rows; row++) for (let column = 0; column <= columns; column++) {
    const x = 7.9 + (column / columns) ** 1.65 * 180;
    const z = 32 - row / rows * 350;
    const mass = side < 0
      ? peak(x, z, 34, -51, 22, 43, 11) + peak(x, z, 76, -151, 50, 68, 32) + peak(x, z, 135, -245, 65, 85, 47)
      : peak(x, z, 39, -84, 25, 48, 12) + peak(x, z, 95, -199, 62, 82, 39);
    const ridge = 0.71 + terrainNoise(x * 0.085, z * 0.065) * 0.4 + terrainNoise(x * 0.24, z * 0.21) * 0.1;
    const verge = Math.min(1, (x - 7.9) / 14);
    const y = -0.08 + mass * ridge * verge + (terrainNoise(x * 0.7, z * 0.6) - 0.5) * 0.45 * verge;
    positions.push(side * x, y, z);
    const strata = 0.7 + Math.sin(y * 1.8 + z * 0.05) * 0.035 + Math.sin(x * 1.7 + z * 1.1) * 0.025;
    shade.copy(base).multiplyScalar(strata);
    colors.push(shade.r, shade.g, shade.b);
    if (row < rows && column < columns) {
      const a = row * (columns + 1) + column, b = a + columns + 1;
      if (side > 0) indices.push(a, a + 1, b, a + 1, b + 1, b);
      else indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// A folded W section catches grazing moonlight without a high-poly rail model.
function railGeometry() {
  const profile = [[-0.055, -0.15], [0.025, -0.09], [-0.015, 0], [0.025, 0.09], [-0.055, 0.15]];
  const positions: number[] = [], indices: number[] = [];
  for (const z of [settings.rails.startZ, settings.rails.startZ - settings.rails.length]) {
    for (const [x, y] of profile) positions.push(x, y, z);
  }
  for (let i = 0; i < profile.length - 1; i++) indices.push(i, i + 5, i + 1, i + 1, i + 5, i + 6);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function ChevronSigns() {
  const trim = useRef<InstancedMesh>(null), faces = useRef<InstancedMesh>(null);
  const arrows = useRef<InstancedMesh>(null), posts = useRef<InstancedMesh>(null);
  const hoods = useRef<InstancedMesh>(null), lamps = useRef<InstancedMesh>(null);
  const count = settings.signs.pairs * 2;
  const shapes = useMemo(() => ({
    trim: roundedPanel(0.94, 1.12, 0.055), face: roundedPanel(0.85, 1.03, 0.035),
    arrow: new Shape().moveTo(-0.29, 0.42).lineTo(-0.04, 0.42).lineTo(0.3, 0)
      .lineTo(-0.04, -0.42).lineTo(-0.29, -0.42).lineTo(0.045, 0).closePath(),
  }), []);
  const extrusion = useMemo(() => ({ depth: 0.045, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 1, steps: 1, curveSegments: 3 }), []);
  useLayoutEffect(() => {
    const object = new Object3D();
    for (let i = 0; i < count; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * settings.signs.offset, z = settings.signs.firstZ - Math.floor(i / 2) * settings.signs.spacing;
      object.rotation.set(0, side * -0.14, 0);
      object.scale.set(1, 1, 1);
      const place = (target: InstancedMesh, y: number, depth: number) => {
        object.position.set(x + Math.sin(object.rotation.y) * depth, y, z + Math.cos(object.rotation.y) * depth);
        object.updateMatrix();
        target.setMatrixAt(i, object.matrix);
      };
      place(trim.current!, settings.signs.height, 0);
      place(faces.current!, settings.signs.height, 0.066);
      place(posts.current!, 0.61, -0.025);
      place(hoods.current!, settings.signs.height + 0.6, 0.05);
      place(lamps.current!, settings.signs.height + 0.574, 0.084);
      // Rotate the opposite arrow rather than mirroring an instance's normals.
      object.rotation.z = side < 0 ? 0 : Math.PI;
      place(arrows.current!, settings.signs.height, 0.071);
    }
    [trim, faces, arrows, posts, hoods, lamps].forEach(ref => {
      ref.current!.instanceMatrix.needsUpdate = true;
      ref.current!.computeBoundingSphere();
    });
  }, [count]);
  return <>
    <instancedMesh ref={trim} args={[undefined, undefined, count]}>
      <extrudeGeometry args={[shapes.trim, extrusion]} /><meshStandardMaterial color="#626b6c" metalness={0.7} roughness={0.43} />
    </instancedMesh>
    <instancedMesh ref={faces} args={[undefined, undefined, count]}>
      <shapeGeometry args={[shapes.face, 3]} /><meshStandardMaterial color="#d2ac55" metalness={0.15} roughness={0.42} emissive="#a16e27" emissiveIntensity={0.14} />
    </instancedMesh>
    <instancedMesh ref={arrows} args={[undefined, undefined, count]}>
      <shapeGeometry args={[shapes.arrow]} /><meshStandardMaterial color="#101515" metalness={0.05} roughness={0.68} />
    </instancedMesh>
    <instancedMesh ref={posts} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.065, 1.3, 0.065]} /><meshStandardMaterial color="#697176" metalness={0.65} roughness={0.5} />
    </instancedMesh>
    <instancedMesh ref={hoods} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.96, 0.055, 0.22]} /><meshStandardMaterial color="#2a3339" metalness={0.65} roughness={0.4} />
    </instancedMesh>
    <instancedMesh ref={lamps} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.62, 0.012, 0.11]} /><meshStandardMaterial color="#ddc29a" emissive="#ddc29a" emissiveIntensity={1.2} roughness={0.5} />
    </instancedMesh>
  </>;
}

function Roadside() {
  const rocks = useRef<InstancedMesh>(null), supports = useRef<InstancedMesh>(null);
  const reflectors = useRef<InstancedMesh>(null);
  const left = useMemo(() => terrainGeometry(-1), []), right = useMemo(() => terrainGeometry(1), []);
  const rail = useMemo(railGeometry, []);
  const supportCount = Math.floor(settings.rails.length / settings.rails.postSpacing) * 2;
  useLayoutEffect(() => () => {
    // These geometries are supplied as props, so their owner releases them.
    left.dispose();
    right.dispose();
    rail.dispose();
  }, [left, right, rail]);
  useLayoutEffect(() => {
    const object = new Object3D(), color = new Color();
    for (let i = 0; i < settings.terrain.rockCount; i++) {
      const side = i % 2 === 0 ? -1 : 1, station = Math.floor(i / 2);
      const variation = (Math.sin(i * 71.27 + 18.13) + 1) / 2;
      const size = 0.35 + variation * 1.6;
      object.position.set(side * (9 + variation * 12), size * 0.15, 7 - station * 8.3);
      object.rotation.set(variation * 0.5, i * 1.13, variation * 0.8);
      object.scale.set(size * 1.8, size * 0.75, size * (0.8 + variation));
      object.updateMatrix();
      rocks.current!.setMatrixAt(i, object.matrix);
      rocks.current!.setColorAt(i, color.set("#46535c").multiplyScalar(0.6 + variation * 0.5));
    }
    for (let i = 0; i < supportCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      object.rotation.set(0, 0, 0);
      object.scale.set(1, 1, 1);
      object.position.set(side * settings.rails.offset, 0.35, settings.rails.startZ - Math.floor(i / 2) * settings.rails.postSpacing);
      object.updateMatrix();
      supports.current!.setMatrixAt(i, object.matrix);
    }
    for (let i = 0; i < settings.signs.pairs * 2; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      object.position.set(side * (settings.rails.offset - 0.05), settings.rails.height + 0.08, -2 - Math.floor(i / 2) * settings.signs.spacing);
      object.updateMatrix();
      reflectors.current!.setMatrixAt(i, object.matrix);
    }
    [rocks, supports, reflectors].forEach(ref => {
      ref.current!.instanceMatrix.needsUpdate = true;
      ref.current!.computeBoundingSphere();
    });
    if (rocks.current!.instanceColor) rocks.current!.instanceColor.needsUpdate = true;
  }, [supportCount]);
  return <>
    <mesh geometry={left}><meshStandardMaterial vertexColors roughness={0.94} /></mesh>
    <mesh geometry={right}><meshStandardMaterial vertexColors roughness={0.94} /></mesh>
    <instancedMesh ref={rocks} args={[undefined, undefined, settings.terrain.rockCount]}>
      <icosahedronGeometry args={[1, 1]} /><meshStandardMaterial roughness={0.88} flatShading />
    </instancedMesh>
    {[-1, 1].map(side => <mesh key={side} geometry={rail} position={[side * settings.rails.offset, settings.rails.height, 0]} scale={[side, 1, 1]}>
      <meshStandardMaterial color="#60707a" metalness={0.72} roughness={0.35} side={DoubleSide} />
    </mesh>)}
    <instancedMesh ref={supports} args={[undefined, undefined, supportCount]}>
      <boxGeometry args={[0.085, 0.85, 0.11]} /><meshStandardMaterial color="#53616b" metalness={0.65} roughness={0.5} />
    </instancedMesh>
    <instancedMesh ref={reflectors} args={[undefined, undefined, settings.signs.pairs * 2]}>
      <boxGeometry args={[0.075, 0.085, 0.025]} /><meshStandardMaterial color="#d6b272" roughness={0.38} metalness={0.2} emissive="#a87b3f" emissiveIntensity={0.12} />
    </instancedMesh>
  </>;
}

export function RouteEnvironment() {
  const { gl } = useThree();
  const sky = useRef<ShaderMaterial>(null), road = useRef<ShaderMaterial>(null);
  const elapsed = useRef(0);
  const cube = useMemo(() => new WebGLCubeRenderTarget(settings.sky.resolution, {
    generateMipmaps: true, minFilter: LinearMipmapLinearFilter, colorSpace: LinearSRGBColorSpace, depthBuffer: false,
  }), []);
  const moon = useMemo(() => new Vector3(...settings.sky.moonDirection).normalize(), []);
  const uniforms = useMemo(() => ({
    uSky: { value: cube.texture }, uTime: { value: 0 },
    uFogColor: { value: new Color(settings.atmosphere.color) }, uFogDensity: { value: settings.atmosphere.density },
    uMoonDirection: { value: moon }, uWetness: { value: settings.road.wetness },
    uSignFirstZ: { value: settings.signs.firstZ }, uSignSpacing: { value: settings.signs.spacing },
    uSignOffset: { value: settings.signs.offset }, uSignHeight: { value: settings.signs.height },
  }), [cube, moon]);

  useLayoutEffect(() => {
    const scene = new Scene();
    const geometry = new SphereGeometry(5, 16, 12);
    const material = new ShaderMaterial({ side: BackSide, vertexShader: worldVertex, fragmentShader: skyBakeFragment, toneMapped: false,
      uniforms: {
        uZenith: { value: new Color(settings.sky.zenith) }, uHorizon: { value: new Color(settings.sky.horizon) },
        uCloudShadow: { value: new Color(settings.sky.cloudShadow) }, uCloudLight: { value: new Color(settings.sky.cloudLight) },
        uFogColor: { value: new Color(settings.atmosphere.color) }, uMoonDirection: { value: moon },
      },
    });
    scene.add(new Mesh(geometry, material));
    new CubeCamera(0.1, 10, cube).update(gl, scene);
    geometry.dispose();
    material.dispose();
    return () => { cube.dispose(); };
  }, [cube, gl, moon]);
  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, 0.05) * settings.sky.drift;
    // Both materials sample the same cached cloud lighting at the same rotation.
    if (sky.current) sky.current.uniforms.uTime.value = elapsed.current;
    if (road.current) road.current.uniforms.uTime.value = elapsed.current;
  });
  return <>
    <color attach="background" args={[settings.atmosphere.color]} />
    <fogExp2 attach="fog" args={[settings.atmosphere.color, settings.atmosphere.density]} />
    <hemisphereLight args={["#8298ab", "#151c22", 0.7]} />
    <directionalLight position={settings.sky.moonDirection.map(value => value * 100) as [number, number, number]} intensity={settings.sky.moonIntensity} color={settings.sky.moonColor} />
    <directionalLight position={[15, 12, 40]} intensity={0.35} color="#8c9ba8" />
    <pointLight position={[settings.signs.offset, settings.signs.height + 0.55, settings.signs.firstZ + 0.15]} color="#dfb675" intensity={7} distance={22} decay={2} />
    <mesh renderOrder={-10}>
      <sphereGeometry args={[260, 24, 16]} /><shaderMaterial ref={sky} side={BackSide} vertexShader={worldVertex} fragmentShader={skyFragment} uniforms={uniforms} depthWrite={false} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -110]}>
      <planeGeometry args={[500, 500]} /><meshStandardMaterial color="#182028" roughness={0.95} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, settings.road.centerZ]}>
      <planeGeometry args={[settings.road.width, settings.road.length]} /><shaderMaterial ref={road} vertexShader={worldVertex} fragmentShader={roadFragment} uniforms={uniforms} />
    </mesh>
    <Roadside /><ChevronSigns />
  </>;
}
