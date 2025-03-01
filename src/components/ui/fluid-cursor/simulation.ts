
import { DoubleFBO, FBO, Config } from './types';
import type { Program } from './types';
import { computeCurl } from './simulation/curl';
import { applyVorticity } from './simulation/vorticity';
import { computeDivergence } from './simulation/divergence';
import { solvePressure } from './simulation/pressure';
import { subtractGradient } from './simulation/gradient';
import { advect } from './simulation/advection';

/**
 * Performs a single step of the fluid simulation
 */
export function step(
  gl: WebGLRenderingContext,
  dt: number,
  velocity: DoubleFBO,
  dye: DoubleFBO,
  curl: FBO,
  divergence: FBO,
  pressure: DoubleFBO,
  curlProgram: Program,
  vorticityProgram: Program,
  divergenceProgram: Program,
  clearProgram: Program,
  pressureProgram: Program,
  gradienSubtractProgram: Program,
  advectionProgram: Program,
  ext: { supportLinearFiltering: boolean },
  config: Config,
  blit: (target: any, clear?: boolean) => void
) {
  gl.disable(gl.BLEND);
  
  // Curl computation
  computeCurl(gl, velocity, curl, curlProgram, blit);

  // Vorticity confinement
  applyVorticity(gl, dt, velocity, curl, vorticityProgram, config.CURL, blit);

  // Divergence computation
  computeDivergence(gl, velocity, divergence, divergenceProgram, blit);

  // Pressure solver
  solvePressure(
    gl, 
    velocity, 
    divergence, 
    pressure, 
    clearProgram, 
    pressureProgram, 
    config.PRESSURE, 
    config.PRESSURE_ITERATIONS, 
    blit
  );

  // Gradient subtraction
  subtractGradient(gl, velocity, pressure, gradienSubtractProgram, blit);

  // Advection
  advect(
    gl,
    dt,
    velocity,
    dye,
    advectionProgram,
    config.VELOCITY_DISSIPATION,
    config.DENSITY_DISSIPATION,
    ext.supportLinearFiltering,
    blit
  );
}
