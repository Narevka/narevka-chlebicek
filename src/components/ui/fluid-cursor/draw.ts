
import { DoubleFBO, FBO, Config } from './types';
import type { Material } from './types';

/**
 * Draws the display material with the current dye texture
 */
export function drawDisplay(
  gl: WebGLRenderingContext,
  displayMaterial: Material,
  target: FBO | null,
  dye: DoubleFBO,
  config: Config,
  blit: (target: FBO | null, clear?: boolean) => void
) {
  let width = target == null ? gl.drawingBufferWidth : target.width;
  let height = target == null ? gl.drawingBufferHeight : target.height;
  displayMaterial.bind();
  if (config.SHADING)
    gl.uniform2f(
      displayMaterial.uniforms.texelSize,
      1.0 / width,
      1.0 / height
    );
  gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
  blit(target);
}
