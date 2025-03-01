
import { SplashCursorProps, PointerPrototype } from './types';
import { createConfig } from './config';
import { initPointers, updatePointerHandlers } from './pointer-handlers';
import { setupWebGL } from './webgl-setup';
import { initAnimation } from './animation-loop';

export function initFluidCursor(canvas: HTMLCanvasElement, options: SplashCursorProps = {}) {
  // Create configuration
  const config = createConfig(options);
  
  // Initialize pointers
  const { pointers } = initPointers();

  // Initialize WebGL
  const { gl, ext, programs, displayMaterial, blit } = setupWebGL(canvas, config);
  
  // Initialize framebuffers and animation
  const updateFrame = initAnimation(gl, ext, config, pointers, programs, displayMaterial, blit);

  // Attach event listeners
  const cleanup = updatePointerHandlers(canvas, pointers, gl, programs.splatProgram, blit, config, updateFrame);
  
  // Initial update
  updateFrame();
  
  // Return cleanup function
  return cleanup;
}
