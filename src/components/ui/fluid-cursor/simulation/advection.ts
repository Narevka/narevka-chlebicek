
import { DoubleFBO } from '../types';
import type { Program } from '../types';

/**
 * Performs advection on both velocity and dye fields
 */
export function advect(
  gl: WebGLRenderingContext,
  dt: number,
  velocity: DoubleFBO,
  dye: DoubleFBO,
  advectionProgram: Program,
  velocity_dissipation: number,
  density_dissipation: number,
  supportLinearFiltering: boolean,
  blit: (target: any, clear?: boolean) => void
) {
  // Advect velocity
  advectionProgram.bind();
  gl.uniform2f(
    advectionProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  if (!supportLinearFiltering)
    gl.uniform2f(
      advectionProgram.uniforms.dyeTexelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
  let velocityId = velocity.read.attach(0);
  gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
  gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
  gl.uniform1f(advectionProgram.uniforms.dt, dt);
  gl.uniform1f(
    advectionProgram.uniforms.dissipation,
    velocity_dissipation
  );
  blit(velocity.write);
  velocity.swap();

  // Advect dye
  if (!supportLinearFiltering)
    gl.uniform2f(
      advectionProgram.uniforms.dyeTexelSize,
      dye.texelSizeX,
      dye.texelSizeY
    );
  gl.uniform1i(
    advectionProgram.uniforms.uVelocity,
    velocity.read.attach(0)
  );
  gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
  gl.uniform1f(
    advectionProgram.uniforms.dissipation,
    density_dissipation
  );
  blit(dye.write);
  dye.swap();
}
