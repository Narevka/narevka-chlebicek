
import { DoubleFBO, FBO, Config } from './types';
import type { Material } from './types';
import { createBlit } from './blit';
import { drawDisplay } from './draw';

/**
 * Renders the fluid simulation to the screen
 */
export function render(
  gl: WebGLRenderingContext,
  displayMaterial: Material,
  target: FBO | null,
  dye: DoubleFBO,
  config: Config,
  blit: (target: FBO | null, clear?: boolean) => void
) {
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  drawDisplay(gl, displayMaterial, target, dye, config, blit);
}

// Re-export createBlit for backwards compatibility
export { createBlit };
