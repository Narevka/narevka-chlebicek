
import { DoubleFBO, FBO } from '../types';
import type { Program } from '../types';

/**
 * Subtracts the pressure gradient from the velocity field
 */
export function subtractGradient(
  gl: WebGLRenderingContext,
  velocity: DoubleFBO,
  pressure: DoubleFBO,
  gradienSubtractProgram: Program,
  blit: (target: any, clear?: boolean) => void
) {
  gradienSubtractProgram.bind();
  gl.uniform2f(
    gradienSubtractProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(
    gradienSubtractProgram.uniforms.uPressure,
    pressure.read.attach(0)
  );
  gl.uniform1i(
    gradienSubtractProgram.uniforms.uVelocity,
    velocity.read.attach(1)
  );
  blit(velocity.write);
  velocity.swap();
}
