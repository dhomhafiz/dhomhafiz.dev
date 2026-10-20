import { expect } from '@playwright/test';
import { Euler, Matrix4, Vector3, MathUtils } from 'three';

export async function cameraPose(page) {
  const view = await page.evaluate(() => window.cameraView);
  const world = new Matrix4().fromArray(view).invert();
  const rotation = new Euler().setFromRotationMatrix(world, 'YXZ');
  const position = new Vector3().setFromMatrixPosition(world);
  return { yaw: MathUtils.radToDeg(rotation.y), pitch: MathUtils.radToDeg(rotation.x), x: position.x, y: position.y, z: position.z };
}

export async function openScene(page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    // Observe real camera matrices sent to WebGL, without product debug hooks.
    const uniforms = new WeakSet();
    const proto = WebGL2RenderingContext.prototype;
    const locate = proto.getUniformLocation;
    proto.getUniformLocation = function (program, name) {
      const location = locate.call(this, program, name);
      if (name === 'viewMatrix' && location) uniforms.add(location);
      return location;
    };
    const upload = proto.uniformMatrix4fv;
    proto.uniformMatrix4fv = function (location, transpose, value, ...rest) {
      if (uniforms.has(location)) window.cameraView = Array.from(value);
      return upload.call(this, location, transpose, value, ...rest);
    };
  });
  await page.goto('/');
  await expect(page.locator('.route-surface')).toHaveAttribute('data-scene', 'ready');
  await expect(page.locator('.route-journey')).toHaveAttribute('data-journey', 'active');
  await page.mouse.move(720, 500);
  // Wait on the observed path, not wall-clock time on a variable-speed GPU.
  await expect.poll(async () => Math.abs((await cameraPose(page)).y - 2.25), { timeout: 15_000 }).toBeLessThan(0.0005);
}

