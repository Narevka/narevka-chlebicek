
import { DoubleFBO, FBO } from '../types';
import type { Program } from '../types';

/**
 * Computes the divergence of the velocity field
 */
export function computeDivergence(
  gl: WebGLRenderingContext,
  velocity: DoubleFBO,
  divergence: FBO,
  divergenceProgram: Program,
  blit: (target: any, clear?: boolean) => void
) {
  divergenceProgram.bind();
  gl.uniform2f(
    divergenceProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(
    divergenceProgram.uniforms.uVelocity,
    velocity.read.attach(0)
  );
  blit(divergence);
}
