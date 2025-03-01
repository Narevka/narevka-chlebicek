
import { wrap } from './math-utils';
import { scaleByPixelRatio } from './webgl-utils';
import { generateColor } from './pointer';
import { splatPointer } from './splat';
import { step } from './simulation';
import { initFramebuffers } from './framebuffers';
import { render } from './renderer';
import { PointerPrototype, Config } from './types';
import { updateFramebufferRefs } from './pointer-handlers';

export function initAnimation(
  gl: WebGLRenderingContext,
  ext: any,
  config: Config,
  pointers: PointerPrototype[],
  programs: any,
  displayMaterial: any,
  blit: any
) {
  let lastUpdateTime = Date.now();
  let colorUpdateTimer = 0.0;
  let { dye, velocity, divergence, curl, pressure } = initFramebuffers(gl, ext, config, programs.copyProgram, blit);

  // Update global framebuffer references
  updateFramebufferRefs(velocity, dye);

  function calcDeltaTime() {
    let now = Date.now();
    let dt = (now - lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    lastUpdateTime = now;
    return dt;
  }

  function resizeCanvas() {
    const canvas = gl.canvas as HTMLCanvasElement;
    let width = scaleByPixelRatio(canvas.clientWidth);
    let height = scaleByPixelRatio(canvas.clientHeight);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

  function updateColors(dt: number) {
    colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
    if (colorUpdateTimer >= 1) {
      colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
      pointers.forEach((p) => {
        p.color = generateColor();
      });
    }
  }

  function applyInputs() {
    pointers.forEach((p) => {
      if (p.moved) {
        p.moved = false;
        splatPointer(gl, p, velocity, dye, programs.splatProgram, blit, config);
      }
    });
  }

  function updateFrame() {
    const dt = calcDeltaTime();
    if (resizeCanvas()) {
      const framebuffers = initFramebuffers(gl, ext, config, programs.copyProgram, blit, dye, velocity, divergence, curl, pressure);
      dye = framebuffers.dye;
      velocity = framebuffers.velocity;
      divergence = framebuffers.divergence;
      curl = framebuffers.curl;
      pressure = framebuffers.pressure;
      
      // Update global framebuffer references after resize
      updateFramebufferRefs(velocity, dye);
    }
    updateColors(dt);
    applyInputs();
    step(
      gl, 
      dt, 
      velocity, 
      dye, 
      curl, 
      divergence, 
      pressure, 
      programs.curlProgram, 
      programs.vorticityProgram, 
      programs.divergenceProgram, 
      programs.clearProgram, 
      programs.pressureProgram, 
      programs.gradienSubtractProgram, 
      programs.advectionProgram, 
      ext, 
      config, 
      blit
    );
    render(gl, displayMaterial, null, dye, config, blit);
    requestAnimationFrame(updateFrame);
  }

  // Return the updateFrame function to be called initially
  return updateFrame;
}
