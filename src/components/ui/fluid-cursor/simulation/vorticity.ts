
import { DoubleFBO, FBO } from '../types';
import type { Program } from '../types';

/**
 * Applies vorticity confinement to enhance vortices
 */
export function applyVorticity(
  gl: WebGLRenderingContext,
  dt: number,
  velocity: DoubleFBO,
  curl: FBO,
  vorticityProgram: Program,
  curl_strength: number,
  blit: (target: any, clear?: boolean) => void
) {
  vorticityProgram.bind();
  gl.uniform2f(
    vorticityProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(
    vorticityProgram.uniforms.uVelocity,
    velocity.read.attach(0)
  );
  gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
  gl.uniform1f(vorticityProgram.uniforms.curl, curl_strength);
  gl.uniform1f(vorticityProgram.uniforms.dt, dt);
  blit(velocity.write);
  velocity.swap();
}
