
import { PointerPrototype } from './types';
import { createPointerPrototype, updatePointerDownData, updatePointerMoveData, updatePointerUpData, generateColor } from './pointer';
import { clickSplat } from './splat';
import { scaleByPixelRatio } from './webgl-utils';
import type { Program } from './webgl-classes';
import { DoubleFBO } from './types';

export function initPointers() {
  const pointers: PointerPrototype[] = [(createPointerPrototype() as unknown) as PointerPrototype];
  return { pointers };
}

// Create a global bridge to store framebuffer references
let velocityBuffer: DoubleFBO | null = null;
let dyeBuffer: DoubleFBO | null = null;

// Function to update the framebuffers from animation loop
export function updateFramebufferRefs(velocity: DoubleFBO, dye: DoubleFBO) {
  velocityBuffer = velocity;
  dyeBuffer = dye;
}

export function updatePointerHandlers(
  canvas: HTMLCanvasElement,
  pointers: PointerPrototype[],
  gl: WebGLRenderingContext,
  splatProgram: Program,
  blit: (target: any, clear?: boolean) => void,
  config: any,
  updateFrame: () => void
) {
  // Mouse down handler
  const handleMouseDown = (e: MouseEvent) => {
    if (!velocityBuffer || !dyeBuffer) return;
    
    let pointer = pointers[0];
    let posX = scaleByPixelRatio(e.clientX);
    let posY = scaleByPixelRatio(e.clientY);
    updatePointerDownData(pointer, -1, posX, posY, canvas.width, canvas.height);
    clickSplat(gl, pointer, velocityBuffer, dyeBuffer, splatProgram, blit, config);
  };

  // First mouse move starts animation
  const handleFirstMouseMove = (e: MouseEvent) => {
    let pointer = pointers[0];
    let posX = scaleByPixelRatio(e.clientX);
    let posY = scaleByPixelRatio(e.clientY);
    let color = generateColor();
    updateFrame(); // start animation loop
    updatePointerMoveData(pointer, posX, posY, color, canvas.width, canvas.height);
    document.body.removeEventListener("mousemove", handleFirstMouseMove);
  };

  // Regular mouse move
  const handleMouseMove = (e: MouseEvent) => {
    let pointer = pointers[0];
    let posX = scaleByPixelRatio(e.clientX);
    let posY = scaleByPixelRatio(e.clientY);
    let color = pointer.color;
    updatePointerMoveData(pointer, posX, posY, color, canvas.width, canvas.height);
  };

  // First touch starts animation
  const handleFirstTouchStart = (e: TouchEvent) => {
    const touches = e.targetTouches;
    let pointer = pointers[0];
    for (let i = 0; i < touches.length; i++) {
      let posX = scaleByPixelRatio(touches[i].clientX);
      let posY = scaleByPixelRatio(touches[i].clientY);
      updateFrame(); // start animation loop
      updatePointerDownData(pointer, touches[i].identifier, posX, posY, canvas.width, canvas.height);
    }
    document.body.removeEventListener("touchstart", handleFirstTouchStart);
  };

  // Regular touch start
  const handleTouchStart = (e: TouchEvent) => {
    const touches = e.targetTouches;
    let pointer = pointers[0];
    for (let i = 0; i < touches.length; i++) {
      let posX = scaleByPixelRatio(touches[i].clientX);
      let posY = scaleByPixelRatio(touches[i].clientY);
      updatePointerDownData(pointer, touches[i].identifier, posX, posY, canvas.width, canvas.height);
    }
  };

  // Touch move
  const handleTouchMove = (e: TouchEvent) => {
    const touches = e.targetTouches;
    let pointer = pointers[0];
    for (let i = 0; i < touches.length; i++) {
      let posX = scaleByPixelRatio(touches[i].clientX);
      let posY = scaleByPixelRatio(touches[i].clientY);
      updatePointerMoveData(pointer, posX, posY, pointer.color, canvas.width, canvas.height);
    }
  };

  // Touch end
  const handleTouchEnd = (e: TouchEvent) => {
    const touches = e.changedTouches;
    let pointer = pointers[0];
    for (let i = 0; i < touches.length; i++) {
      updatePointerUpData(pointer);
    }
  };

  // Add event listeners
  window.addEventListener("mousedown", handleMouseDown);
  document.body.addEventListener("mousemove", handleFirstMouseMove);
  window.addEventListener("mousemove", handleMouseMove);
  document.body.addEventListener("touchstart", handleFirstTouchStart);
  window.addEventListener("touchstart", handleTouchStart);
  window.addEventListener("touchmove", handleTouchMove, false);
  window.addEventListener("touchend", handleTouchEnd);

  // Return cleanup function
  return () => {
    window.removeEventListener("mousedown", handleMouseDown);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
    // Also try to clean up the first move handlers if they haven't been removed yet
    document.body.removeEventListener("mousemove", handleFirstMouseMove);
    document.body.removeEventListener("touchstart", handleFirstTouchStart);
  };
}
