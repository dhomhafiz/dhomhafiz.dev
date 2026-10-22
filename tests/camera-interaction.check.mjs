import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
const { MathUtils } = THREE;
const compiled = ts.transpileModule(fs.readFileSync('src/components/features/immersive/routeCameraInteraction.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
}).outputText;
const context = { exports: {}, require: name => { assert.equal(name, 'three'); return THREE; } };
vm.runInNewContext(compiled, context);
const { updateMouseInfluence: step, cameraTouchSettings } = context.exports;
const empty = () => ({ yaw: 0, pitch: 0, x: 0, y: 0 });
const input = { x: 1, y: 1, scroll: 0 };
const advance = (state, target, frames, rate, opening = 1, halfFov = MathUtils.degToRad(40), config) => {
  for (let frame = 0; frame < frames; frame++) step(state, target, 1 / rate, opening, halfFov, config);
  return state;
};

test('desktop keeps a gentle range and settles smoothly without overshoot', () => {
  const state = advance(empty(), input, 24, 60);
  assert.ok(Math.abs(state.yaw) > MathUtils.degToRad(7.2)); // >90% in 400 ms
  assert.ok(Math.abs(state.yaw) < MathUtils.degToRad(8));
  advance(state, input, 156, 60);
  assert.ok(Math.abs(state.yaw + MathUtils.degToRad(8)) < 1e-8);
  assert.ok(Math.abs(state.pitch + MathUtils.degToRad(3)) < 1e-8);
  assert.ok(Math.abs(state.x - 0.1) < 1e-8);
  assert.ok(Math.abs(state.y + 0.02) < 1e-8);
});

test('mouse damping agrees at 10, 20, 30, 60, 120, and 144 Hz', () => {
  const states = [10, 20, 30, 60, 120, 144].map(rate => advance(empty(), input, rate, rate));
  for (const state of states) for (const key of ['yaw', 'pitch', 'x', 'y']) {
    assert.ok(Math.abs(state[key] - states[0][key]) < 1e-12);
  }
});

test('rapid reversals stay bounded and release converges monotonically to rest', () => {
  const state = empty();
  for (let frame = 0; frame < 240; frame++) {
    const direction = frame % 7 < 3 ? 1 : -1;
    step(state, { x: direction * 5, y: direction * 5, scroll: 0 }, 1 / 60, 1, MathUtils.degToRad(40));
    assert.ok(Math.abs(state.yaw) <= MathUtils.degToRad(8));
    assert.ok(Math.abs(state.pitch) <= MathUtils.degToRad(3));
  }
  for (let frame = 0; frame < 180; frame++) {
    const previous = Math.abs(state.yaw);
    step(state, { x: 0, y: 0, scroll: 0 }, 1 / 60, 1, MathUtils.degToRad(40));
    assert.ok(Math.abs(state.yaw) <= previous);
  }
  assert.ok(Math.abs(state.yaw) < 1e-9);
});

test('mouse offsets leave the opening intact and fade out along the scroll path', () => {
  const start = advance(empty(), input, 60, 60, 0.2);
  assert.equal(start.yaw, 0);
  assert.equal(start.pitch, 0);
  const nearExit = advance(empty(), { ...input, scroll: 0.8 }, 120, 60);
  assert.ok(Math.abs(nearExit.yaw) < MathUtils.degToRad(1.3));
  advance(nearExit, { ...input, scroll: 1 }, 180, 60);
  assert.ok(Math.abs(nearExit.yaw) < 1e-9);
});

test('narrow viewports retain a vanishing-point margin and stalls cannot snap to target', () => {
  const halfFov = MathUtils.degToRad(6);
  const state = advance(empty(), input, 120, 60, 1, halfFov);
  assert.ok(Math.abs(state.yaw) < halfFov * 0.71);
  const resumed = empty();
  step(resumed, input, 20, 1, MathUtils.degToRad(40));
  assert.ok(Math.abs(resumed.yaw) < MathUtils.degToRad(4));
});

test('touch look reaches its capped range and returns smoothly to the scripted pose', () => {
  const state = empty();
  const halfFov = MathUtils.degToRad(40);
  advance(state, input, 120, 60, 1, halfFov, cameraTouchSettings);
  assert.ok(Math.abs(state.yaw) <= MathUtils.degToRad(10));
  assert.ok(Math.abs(state.yaw) > MathUtils.degToRad(9.8));
  assert.ok(Math.abs(state.pitch) <= MathUtils.degToRad(5));
  assert.ok(Math.abs(state.pitch) > MathUtils.degToRad(4.9));
  for (let frame = 0; frame < 180; frame++) {
    const previousYaw = Math.abs(state.yaw), previousPitch = Math.abs(state.pitch);
    step(state, { x: 0, y: 0, scroll: 0 }, 1 / 60, 1, halfFov, cameraTouchSettings);
    assert.ok(Math.abs(state.yaw) <= previousYaw);
    assert.ok(Math.abs(state.pitch) <= previousPitch);
  }
  assert.ok(Math.abs(state.yaw) < 1e-8);
  assert.ok(Math.abs(state.pitch) < 1e-8);
});
