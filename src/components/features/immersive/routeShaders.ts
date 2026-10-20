import { routeEnvironment } from "./routeEnvironmentSettings";

// All surfaces are authored procedurally; no downloaded texture/model assets.
export const worldVertex = /* glsl */`
  varying vec3 vWorld;
  void main() {
    vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
  }
`;

const noise = /* glsl */`
  float hash(vec2 p) {
    vec3 q = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    q += dot(q, q.yzx + 33.33);
    return fract((q.x + q.y) * q.z);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float value = 0.0, amplitude = 0.5;
    mat2 turn = mat2(0.8, -0.6, 0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      value += noise(p) * amplitude;
      p = turn * p * 2.07 + vec2(17.13, 9.27);
      amplitude *= 0.48;
    }
    return value;
  }
`;

// Evaluated only for the six cubemap faces on mount, never per animation frame.
export const skyBakeFragment = /* glsl */`
  varying vec3 vWorld;
  uniform vec3 uZenith, uHorizon, uCloudShadow, uCloudLight, uFogColor, uMoonDirection;
  ${noise}
  void main() {
    vec3 ray = normalize(vWorld - cameraPosition);
    float height = max(ray.y, 0.0);
    vec2 p = ray.xz / (height + 0.17) * 1.35;
    vec2 warp = vec2(fbm(p * 0.48 + 12.0), fbm(p * 0.42 - 19.0)) - 0.45;
    float low = fbm(p + warp * 2.5);
    float underside = fbm(p + warp * 2.5 + vec2(0.26, -0.18));
    float high = fbm(p * 0.43 + vec2(21.7, -15.3) + warp * 0.8);
    float thickness = smoothstep(0.27, 0.72, low);
    float veil = smoothstep(0.28, 0.75, high);
    float illumination = smoothstep(-0.08, 0.16, underside - low);
    vec3 color = mix(uZenith, uHorizon, exp(-height * 4.5));
    // Upper veil and a darker, sculpted low deck overlap at different scales.
    color = mix(color, uCloudLight * 0.36, veil * 0.48);
    vec3 lowCloud = mix(uCloudShadow, uCloudLight * 0.6, illumination);
    lowCloud *= 0.55 + 0.45 * (1.0 - thickness);
    color = mix(color, lowCloud, thickness * 0.94);
    float moon = max(dot(ray, uMoonDirection), 0.0);
    float halo = pow(moon, 22.0) * (1.0 - thickness * 0.65);
    color += vec3(0.045, 0.065, 0.09) * halo;
    float disc = smoothstep(0.999984, 0.999994, moon);
    color += vec3(0.7, 0.79, 0.88) * disc * (1.0 - thickness * 0.93);
    // A blue-grey bank hides the sky/ground seam; no sunrise-orange horizon.
    float horizonFog = exp(-abs(ray.y) * 19.0);
    color = mix(color, uFogColor, horizonFog * 0.78);
    color = mix(color, uFogColor * 0.45, (1.0 - smoothstep(-0.3, 0.0, ray.y)));
    gl_FragColor = vec4(color, 1.0);
  }
`;

const skySampling = /* glsl */`
  uniform samplerCube uSky;
  uniform float uTime;
  vec3 skyDirection(vec3 direction) {
    float angle = uTime;
    direction.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * direction.xz;
    return direction;
  }
`;

export const skyFragment = /* glsl */`
  varying vec3 vWorld;
  ${skySampling}
  void main() {
    gl_FragColor = vec4(textureCube(uSky, skyDirection(normalize(vWorld - cameraPosition))).rgb, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const roadFragment = /* glsl */`
  varying vec3 vWorld;
  uniform vec3 uFogColor, uMoonDirection;
  uniform float uFogDensity, uWetness, uSignFirstZ, uSignSpacing, uSignOffset, uSignHeight;
  ${noise}
  ${skySampling}
  float line(float coordinate, float center, float width, float aa) {
    return 1.0 - smoothstep(width, width + aa, abs(coordinate - center));
  }
  void main() {
    vec2 p = vWorld.xz;
    vec3 view = normalize(cameraPosition - vWorld);
    vec2 footprint = fwidth(p);
    float detail = 1.0 - smoothstep(0.025, 0.15, max(footprint.x, footprint.y));
    vec2 warp = vec2(noise(p * 0.17), noise(p * 0.13 + 81.0));
    float variation = fbm(p * vec2(0.61, 0.34) + warp * 1.7);
    float aggregate = noise(p * 79.0) * detail;
    float streak = noise(p * vec2(16.0, 0.6));
    float puddle = smoothstep(0.39, 0.66, variation + streak * 0.08) * uWetness;
    float roughness = mix(0.5, 0.1, puddle) + (streak - 0.5) * 0.07;
    // A little exposed aggregate breaks up the dark binder without chalky clouds.
    vec3 asphalt = mix(vec3(0.011, 0.015, 0.019), vec3(0.025, 0.03, 0.034), variation);
    asphalt += aggregate * 0.009 * (1.0 - puddle);
    vec3 normal = normalize(vec3((noise(p * 31.0) - 0.5) * 0.045 * detail,
      1.0, (noise(p * 27.0 + 43.0) - 0.5) * 0.025 * detail));
    float facing = max(dot(normal, view), 0.0);
    float fresnel = mix(0.025, 0.07, puddle) + 0.93 * pow(1.0 - facing, 5.0);
    vec3 reflection = textureCube(uSky, skyDirection(reflect(-view, normal)), roughness * 5.0).rgb;
    // Broken puddles reveal the cloud deck; rougher asphalt returns a softer sky.
    vec3 color = asphalt * (0.7 - puddle * 0.3) + reflection * fresnel * mix(0.3, 0.95, puddle);
    float aa = max(0.008, fwidth(p.x));
    float edge = line(abs(p.x), 5.62, 0.055, aa);
    float median = line(abs(p.x), 0.14, 0.037, aa);
    float dashZ = mod(-p.y + 1.0, 9.0);
    float dash = line(abs(p.x), 2.87, 0.055, aa) *
      smoothstep(0.0, max(0.02, fwidth(p.y)), dashZ) * (1.0 - smoothstep(3.0, 3.0 + max(0.02, fwidth(p.y)), dashZ));
    float chips = mix(0.65, 1.0, noise(p * 35.0)) * (0.8 + variation * 0.3);
    color = mix(color, vec3(0.22, 0.25, 0.25) * chips, max(edge, dash) * 0.72);
    color = mix(color, vec3(0.31, 0.21, 0.065) * chips, median * 0.8);
    // Small, rough specular returns from the signs' downlights. No glow/bloom.
    float side = p.x < 0.0 ? -1.0 : 1.0;
    float highlights = 0.0;
    for (int i = 0; i < ${routeEnvironment.signs.pairs}; i++) {
      vec3 lamp = vec3(side * uSignOffset, uSignHeight + 0.55, uSignFirstZ - float(i) * uSignSpacing);
      vec3 toLamp = lamp - vWorld;
      vec3 halfVector = normalize(normalize(toLamp) + view);
      vec2 slope = (halfVector.xz - normal.xz) / vec2(0.045 + roughness * 0.1, 0.14 + roughness * 0.24);
      float lobe = 1.0 / pow(1.0 + dot(slope, slope), 2.0);
      highlights += lobe / (1.0 + dot(toLamp, toLamp) * 0.035);
    }
    color += vec3(0.48, 0.29, 0.105) * highlights * (0.25 + puddle * 1.7);
    vec3 moonHalf = normalize(uMoonDirection + view);
    float moonSpecular = pow(max(dot(normal, moonHalf), 0.0), mix(40.0, 180.0, puddle));
    color += vec3(0.11, 0.15, 0.19) * moonSpecular * (0.15 + puddle);
    // Frayed verge and a narrow drainage/gravel shoulder replace a hard plane edge.
    float shoulder = smoothstep(5.87, 6.16, abs(p.x) + (noise(p * 8.0) - 0.5) * 0.12);
    vec3 gravel = vec3(0.02, 0.026, 0.03) * (0.6 + noise(p * 48.0) * detail * 0.8);
    color = mix(color, gravel, shoulder);
    float distanceFog = 1.0 - exp(-pow(length(cameraPosition - vWorld) * uFogDensity, 2.0));
    color = mix(color, uFogColor, distanceFog);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
