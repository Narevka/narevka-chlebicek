
import { DoubleFBO, FBO } from '../types';
import type { Program } from '../types';

/**
 * Computes curl from the velocity field
 */
export function computeCurl(
  gl: WebGLRenderingContext,
  velocity: DoubleFBO,
  curl: FBO,
  curlProgram: Program,
  blit: (target: any, clear?: boolean) => void
) {
  curlProgram.bind();
  gl.uniform2f(
    curlProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
  blit(curl);
}
