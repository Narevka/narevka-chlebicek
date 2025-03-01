
import { PointerPrototype } from './types';
import { correctRadius } from './pointer';
import { Program } from './webgl-classes';
import { generateColor } from './pointer';

export function splat(
  gl: WebGLRenderingContext,
  x: number, 
  y: number, 
  dx: number, 
  dy: number, 
  color: { r: number, g: number, b: number },
  velocity: any,
  dye: any,
  splatProgram: Program,
  blit: (target: any, clear?: boolean) => void,
  config: { SPLAT_RADIUS: number }
) {
  splatProgram.bind();
  gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
  gl.uniform1f(
    splatProgram.uniforms.aspectRatio,
    gl.canvas.width / gl.canvas.height
  );
  gl.uniform2f(splatProgram.uniforms.point, x, y);
  gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
  gl.uniform1f(
    splatProgram.uniforms.radius,
    correctRadius(config.SPLAT_RADIUS / 100.0, gl.canvas.width, gl.canvas.height)
  );
  blit(velocity.write);
  velocity.swap();

  gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
  gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
  blit(dye.write);
  dye.swap();
}

export function splatPointer(
  gl: WebGLRenderingContext,
  pointer: PointerPrototype,
  velocity: any,
  dye: any,
  splatProgram: Program,
  blit: (target: any, clear?: boolean) => void,
  config: { SPLAT_FORCE: number, SPLAT_RADIUS: number }
) {
  let dx = pointer.deltaX * config.SPLAT_FORCE;
  let dy = pointer.deltaY * config.SPLAT_FORCE;
  splat(
    gl,
    pointer.texcoordX, 
    pointer.texcoordY, 
    dx, 
    dy, 
    pointer.color,
    velocity,
    dye,
    splatProgram,
    blit,
    config
  );
}

export function clickSplat(
  gl: WebGLRenderingContext,
  pointer: PointerPrototype,
  velocity: any,
  dye: any,
  splatProgram: Program,
  blit: (target: any, clear?: boolean) => void,
  config: { SPLAT_RADIUS: number }
) {
  const color = generateColor();
  color.r *= 10.0;
  color.g *= 10.0;
  color.b *= 10.0;
  let dx = 10 * (Math.random() - 0.5);
  let dy = 30 * (Math.random() - 0.5);
  splat(
    gl,
    pointer.texcoordX, 
    pointer.texcoordY, 
    dx, 
    dy, 
    color,
    velocity,
    dye,
    splatProgram,
    blit,
    config
  );
}
