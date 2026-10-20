import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';

const compiled = ts.transpileModule(fs.readFileSync('src/components/features/immersive/routeCameraPath.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
}).outputText;
const settings = ts.transpileModule(fs.readFileSync('src/components/features/immersive/routeBillboardSettings.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const settingsContext = { exports: {} };
vm.runInNewContext(settings, settingsContext);
const { billboardDestinations } = settingsContext.exports;
const billboardDestination = billboardDestinations.at(-1);
const context = { exports: {}, require: name => {
  if (name === 'three') return THREE;
  assert.equal(name, './routeBillboardSettings'); return settingsContext.exports;
} };
vm.runInNewContext(compiled, context);
const { sampleCameraPath: sample } = context.exports;
const position = new THREE.Vector3(), tangent = new THREE.Vector3(), rotation = { yaw: 0, pitch: 0 };

test('path remains continuous, forward, and inside the existing road corridor', () => {
  let previousZ = Infinity;
  let previousYaw = 0;
  for (let step = 0; step <= 1000; step++) {
    sample(step / 1000, position, tangent, rotation);
    assert.ok(position.z <= previousZ);
    if (step) assert.ok(previousZ - position.z < 1);
    assert.ok(position.x > -5.5 && position.x < 5.5);
    assert.ok(position.y >= 2.25 - 1e-10 && position.y <= 4.4 + 1e-10);
    assert.ok(Math.abs(rotation.yaw) < THREE.MathUtils.degToRad(35));
    assert.ok(Math.abs(rotation.pitch) < THREE.MathUtils.degToRad(20));
    assert.ok(Math.abs(rotation.yaw - previousYaw) < 0.015);
    previousZ = position.z;
    previousYaw = rotation.yaw;
  }
});

test('path clamps to clear endpoints and sampling is reversible without internal state', () => {
  sample(-1, position, tangent, rotation);
  assert.deepEqual(position.toArray(), [0, 2.25, 6]);
  assert.equal(rotation.yaw, 0);
  assert.equal(rotation.pitch, -0.025);
  sample(0.37, position, tangent, rotation);
  const forward = [...position.toArray(), rotation.yaw, rotation.pitch];
  sample(2, position, tangent, rotation);
  assert.ok(position.distanceTo(new THREE.Vector3(-5.4, 4.4, -194)) < 1e-10);
  sample(0.37, position, tangent, rotation);
  assert.deepEqual([...position.toArray(), rotation.yaw, rotation.pitch], forward);
});


test('narrow framing stays forward and inside the rails while aiming at the configured screen', () => {
  for (const degrees of [8, 12, 22, 40]) {
    let previousZ = Infinity;
    for (let step = 0; step <= 1000; step++) {
      sample(step / 1000, position, tangent, rotation, THREE.MathUtils.degToRad(degrees));
      assert.ok(position.z <= previousZ);
      assert.ok(position.x > -6.2 && position.x < 6.2);
      previousZ = position.z;
    }
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(rotation.pitch, rotation.yaw, 0, 'YXZ'));
    const target = new THREE.Vector3(...billboardDestination.position)
      .add(new THREE.Vector3(...billboardDestination.focusOffset)).sub(position).normalize();
    assert.ok(forward.dot(target) > 0.999999);
  }
});

test('billboard structure is beyond the right rail and the road extends past it', () => {
  for (const destination of billboardDestinations) {
    const [x, , z] = destination.position;
    const minX = Math.abs(x) - (destination.screen.width / 2 + 0.7) * Math.cos(destination.rotationY) - 1.6 * Math.abs(Math.sin(destination.rotationY));
    assert.ok(minX > 7.6);
    assert.ok(z - (-260) > 40);
  }
});

test('viewing intervals hold their composition and departures remain continuous', () => {
  for (const destination of billboardDestinations) {
    sample(destination.viewStart + .01, position, tangent, rotation);
    const pose = [...position.toArray(), rotation.yaw, rotation.pitch];
    sample(destination.viewEnd - .01, position, tangent, rotation);
    assert.deepEqual([...position.toArray(), rotation.yaw, rotation.pitch], pose);
  }
});
