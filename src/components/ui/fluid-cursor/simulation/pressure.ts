
import { DoubleFBO, FBO } from '../types';
import type { Program } from '../types';

/**
 * Initializes the pressure field and performs pressure iterations
 */
export function solvePressure(
  gl: WebGLRenderingContext,
  velocity: DoubleFBO,
  divergence: FBO,
  pressure: DoubleFBO,
  clearProgram: Program,
  pressureProgram: Program,
  pressure_value: number,
  iterations: number,
  blit: (target: any, clear?: boolean) => void
) {
  // Clear pressure
  clearProgram.bind();
  gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
  gl.uniform1f(clearProgram.uniforms.value, pressure_value);
  blit(pressure.write);
  pressure.swap();

  // Pressure iterations
  pressureProgram.bind();
  gl.uniform2f(
    pressureProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
  for (let i = 0; i < iterations; i++) {
    gl.uniform1i(
      pressureProgram.uniforms.uPressure,
      pressure.read.attach(1)
    );
    blit(pressure.write);
    pressure.swap();
  }
}
