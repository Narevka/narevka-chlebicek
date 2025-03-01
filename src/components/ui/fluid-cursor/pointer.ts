
import { PointerPrototype } from './types';
import { HSVtoRGB } from './webgl-utils';

export function createPointerPrototype(): PointerPrototype {
  return {
    id: -1,
    texcoordX: 0,
    texcoordY: 0,
    prevTexcoordX: 0,
    prevTexcoordY: 0,
    deltaX: 0,
    deltaY: 0,
    down: false,
    moved: false,
    color: { r: 0, g: 0, b: 0 }
  };
}

export function generateColor() {
  let c = HSVtoRGB(Math.random(), 1.0, 1.0);
  c.r *= 0.15;
  c.g *= 0.15;
  c.b *= 0.15;
  return c;
}

export function correctDeltaX(delta: number, aspectRatio: number) {
  if (aspectRatio < 1) delta *= aspectRatio;
  return delta;
}

export function correctDeltaY(delta: number, aspectRatio: number) {
  if (aspectRatio > 1) delta /= aspectRatio;
  return delta;
}

export function correctRadius(radius: number, width: number, height: number) {
  let aspectRatio = width / height;
  if (aspectRatio > 1) radius *= aspectRatio;
  return radius;
}

export function updatePointerDownData(
  pointer: PointerPrototype, 
  id: number, 
  posX: number, 
  posY: number, 
  canvasWidth: number, 
  canvasHeight: number
) {
  pointer.id = id;
  pointer.down = true;
  pointer.moved = false;
  pointer.texcoordX = posX / canvasWidth;
  pointer.texcoordY = 1.0 - posY / canvasHeight;
  pointer.prevTexcoordX = pointer.texcoordX;
  pointer.prevTexcoordY = pointer.texcoordY;
  pointer.deltaX = 0;
  pointer.deltaY = 0;
  pointer.color = generateColor();
}

export function updatePointerMoveData(
  pointer: PointerPrototype, 
  posX: number, 
  posY: number, 
  color: { r: number, g: number, b: number },
  canvasWidth: number,
  canvasHeight: number
) {
  pointer.prevTexcoordX = pointer.texcoordX;
  pointer.prevTexcoordY = pointer.texcoordY;
  pointer.texcoordX = posX / canvasWidth;
  pointer.texcoordY = 1.0 - posY / canvasHeight;
  
  const aspectRatio = canvasWidth / canvasHeight;
  
  pointer.deltaX = correctDeltaX(
    pointer.texcoordX - pointer.prevTexcoordX, 
    aspectRatio
  );
  
  pointer.deltaY = correctDeltaY(
    pointer.texcoordY - pointer.prevTexcoordY, 
    aspectRatio
  );
  
  pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
  pointer.color = color;
}

export function updatePointerUpData(pointer: PointerPrototype) {
  pointer.down = false;
}
