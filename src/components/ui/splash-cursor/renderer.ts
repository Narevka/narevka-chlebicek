
import { Config, DoubleFBO, FBO, Pointer } from './types';
import { Program, Material, createDoubleFBO, resizeDoubleFBO, createFBO } from './webgl-classes';
import { correctRadius } from './utils';

export function drawDisplay(
  gl: WebGLRenderingContext,
  displayMaterial: Material, 
  config: Config,
  dye: DoubleFBO,
  target: FBO | null,
  blit: (target?: FBO | null, clear?: boolean) => void
) {
  let width = target == null ? gl.drawingBufferWidth : target.width;
  let height = target == null ? gl.drawingBufferHeight : target.height;
  
  displayMaterial.bind();
  
  if (config.SHADING) {
    gl.uniform2f(
      displayMaterial.uniforms.texelSize,
      1.0 / width,
      1.0 / height
    );
  }
  
  gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
  blit(target);
}

export function splatPointer(
  pointer: Pointer,
  config: Config,
  canvas: HTMLCanvasElement,
  splat: (x: number, y: number, dx: number, dy: number, color: { r: number, g: number, b: number }) => void
) {
  let dx = pointer.deltaX * config.SPLAT_FORCE;
  let dy = pointer.deltaY * config.SPLAT_FORCE;
  splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
}

export function splat(
  x: number,
  y: number,
  dx: number,
  dy: number,
  color: { r: number, g: number, b: number },
  canvas: HTMLCanvasElement,
  config: Config,
  splatProgram: Program,
  velocity: DoubleFBO,
  dye: DoubleFBO,
  gl: WebGLRenderingContext,
  blit: (target?: FBO | null, clear?: boolean) => void
) {
  splatProgram.bind();
  
  gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
  gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
  gl.uniform2f(splatProgram.uniforms.point, x, y);
  gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
  gl.uniform1f(
    splatProgram.uniforms.radius,
    correctRadius(config.SPLAT_RADIUS / 100.0, canvas)
  );
  
  blit(velocity.write);
  velocity.swap();

  gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
  gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
  
  blit(dye.write);
  dye.swap();
}

export function clickSplat(
  pointer: Pointer,
  generateColor: () => { r: number, g: number, b: number },
  splat: (
    x: number,
    y: number,
    dx: number,
    dy: number,
    color: { r: number, g: number, b: number }
  ) => void
) {
  const color = generateColor();
  color.r *= 10.0;
  color.g *= 10.0;
  color.b *= 10.0;
  
  let dx = 10 * (Math.random() - 0.5);
  let dy = 30 * (Math.random() - 0.5);
  
  splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
}

export function render(
  gl: WebGLRenderingContext,
  target: FBO | null,
  blit: (target?: FBO | null, clear?: boolean) => void,
  drawDisplay: (target: FBO | null) => void
) {
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  drawDisplay(target);
}

export function step(
  gl: WebGLRenderingContext,
  dt: number,
  config: Config,
  curlProgram: Program,
  vorticityProgram: Program,
  divergenceProgram: Program,
  clearProgram: Program,
  pressureProgram: Program,
  gradienSubtractProgram: Program,
  advectionProgram: Program,
  velocity: DoubleFBO,
  curl: FBO,
  divergence: FBO,
  pressure: DoubleFBO,
  dye: DoubleFBO,
  ext: {
    supportLinearFiltering: boolean;
  },
  blit: (target?: FBO | null, clear?: boolean) => void
) {
  gl.disable(gl.BLEND);
  
  // Curl
  curlProgram.bind();
  gl.uniform2f(
    curlProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
  blit(curl);

  // Vorticity
  vorticityProgram.bind();
  gl.uniform2f(
    vorticityProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
  gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
  gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
  gl.uniform1f(vorticityProgram.uniforms.dt, dt);
  blit(velocity.write);
  velocity.swap();

  // Divergence
  divergenceProgram.bind();
  gl.uniform2f(
    divergenceProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
  blit(divergence);

  // Clear pressure
  clearProgram.bind();
  gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
  gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
  blit(pressure.write);
  pressure.swap();

  // Pressure
  pressureProgram.bind();
  gl.uniform2f(
    pressureProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
  
  for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
    gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
    blit(pressure.write);
    pressure.swap();
  }

  // Gradient Subtract
  gradienSubtractProgram.bind();
  gl.uniform2f(
    gradienSubtractProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
  gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
  blit(velocity.write);
  velocity.swap();

  // Advection
  advectionProgram.bind();
  gl.uniform2f(
    advectionProgram.uniforms.texelSize,
    velocity.texelSizeX,
    velocity.texelSizeY
  );
  
  if (!ext.supportLinearFiltering) {
    gl.uniform2f(
      advectionProgram.uniforms.dyeTexelSize,
      velocity.texelSizeX,
      velocity.texelSizeY
    );
  }
  
  let velocityId = velocity.read.attach(0);
  gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
  gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
  gl.uniform1f(advectionProgram.uniforms.dt, dt);
  gl.uniform1f(
    advectionProgram.uniforms.dissipation,
    config.VELOCITY_DISSIPATION
  );
  blit(velocity.write);
  velocity.swap();

  if (!ext.supportLinearFiltering) {
    gl.uniform2f(
      advectionProgram.uniforms.dyeTexelSize,
      dye.texelSizeX,
      dye.texelSizeY
    );
  }
  
  gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
  gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
  gl.uniform1f(
    advectionProgram.uniforms.dissipation,
    config.DENSITY_DISSIPATION
  );
  blit(dye.write);
  dye.swap();
}

export function initFramebuffers(
  gl: WebGLRenderingContext,
  config: Config,
  ext: {
    halfFloatTexType: number;
    formatRGBA: { internalFormat: number; format: number };
    formatRG: { internalFormat: number; format: number };
    formatR: { internalFormat: number; format: number };
    supportLinearFiltering: boolean;
  },
  getResolution: (resolution: number, gl: WebGLRenderingContext) => { width: number; height: number },
  createDoubleFBO: (
    gl: WebGLRenderingContext,
    w: number, 
    h: number, 
    internalFormat: number, 
    format: number, 
    type: number, 
    param: number
  ) => DoubleFBO,
  resizeDoubleFBO: (
    gl: WebGLRenderingContext,
    target: DoubleFBO,
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    type: number,
    param: number,
    copyProgram: Program
  ) => DoubleFBO,
  copyProgram: Program,
  dye?: DoubleFBO,
  velocity?: DoubleFBO,
  divergence?: FBO,
  curl?: FBO,
  pressure?: DoubleFBO
) {
  let simRes = getResolution(config.SIM_RESOLUTION, gl);
  let dyeRes = getResolution(config.DYE_RESOLUTION, gl);
  
  const texType = ext.halfFloatTexType;
  const rgba = ext.formatRGBA;
  const rg = ext.formatRG;
  const r = ext.formatR;
  const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
  
  gl.disable(gl.BLEND);

  // Initialize or resize the dye framebuffer
  if (!dye) {
    dye = createDoubleFBO(
      gl,
      dyeRes.width,
      dyeRes.height,
      rgba.internalFormat,
      rgba.format,
      texType,
      filtering
    );
  } else {
    dye = resizeDoubleFBO(
      gl,
      dye,
      dyeRes.width,
      dyeRes.height,
      rgba.internalFormat,
      rgba.format,
      texType,
      filtering,
      copyProgram
    );
  }

  // Initialize or resize the velocity framebuffer
  if (!velocity) {
    velocity = createDoubleFBO(
      gl,
      simRes.width,
      simRes.height,
      rg.internalFormat,
      rg.format,
      texType,
      filtering
    );
  } else {
    velocity = resizeDoubleFBO(
      gl,
      velocity,
      simRes.width,
      simRes.height,
      rg.internalFormat,
      rg.format,
      texType,
      filtering,
      copyProgram
    );
  }

  // Create or replace the divergence framebuffer
  divergence = createFBO(
    gl,
    simRes.width,
    simRes.height,
    r.internalFormat,
    r.format,
    texType,
    gl.NEAREST
  );
  
  // Create or replace the curl framebuffer
  curl = createFBO(
    gl,
    simRes.width,
    simRes.height,
    r.internalFormat,
    r.format,
    texType,
    gl.NEAREST
  );
  
  // Create or replace the pressure framebuffer
  pressure = createDoubleFBO(
    gl,
    simRes.width,
    simRes.height,
    r.internalFormat,
    r.format,
    texType,
    gl.NEAREST
  );

  return { dye, velocity, divergence, curl, pressure };
}
