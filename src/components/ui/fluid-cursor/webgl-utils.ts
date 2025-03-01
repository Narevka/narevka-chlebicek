import { WebGLContext, FBO, DoubleFBO, Resolution } from './types';

// Define WebGL2 constants that TypeScript doesn't recognize
interface WebGL2Constants {
  HALF_FLOAT: number;
  RGBA16F: number;
  RG16F: number;
  RG: number;
  R16F: number;
  RED: number;
}

export function getWebGLContext(canvas: HTMLCanvasElement): WebGLContext {
  const params = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
  };
  
  let gl = canvas.getContext("webgl2", params) as WebGL2RenderingContext | null;
  const isWebGL2 = !!gl;
  
  if (!isWebGL2)
    gl = (
      canvas.getContext("webgl", params) ||
      canvas.getContext("experimental-webgl", params)
    ) as WebGLRenderingContext | null;
  
  if (!gl) {
    throw new Error("WebGL not supported");
  }
  
  let halfFloat;
  let supportLinearFiltering;
  
  if (isWebGL2) {
    (gl as WebGL2RenderingContext).getExtension("EXT_color_buffer_float");
    supportLinearFiltering = (gl as WebGL2RenderingContext).getExtension("OES_texture_float_linear");
  } else {
    halfFloat = (gl as WebGLRenderingContext).getExtension("OES_texture_half_float");
    supportLinearFiltering = (gl as WebGLRenderingContext).getExtension("OES_texture_half_float_linear");
  }
  
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  // WebGL2 constants
  const HALF_FLOAT = isWebGL2 ? (gl as WebGL2RenderingContext).HALF_FLOAT : null;
  const RGBA16F = isWebGL2 ? (gl as WebGL2RenderingContext).RGBA16F : null;
  const RG16F = isWebGL2 ? (gl as WebGL2RenderingContext).RG16F : null;
  const RG = isWebGL2 ? (gl as WebGL2RenderingContext).RG : null;
  const R16F = isWebGL2 ? (gl as WebGL2RenderingContext).R16F : null;
  const RED = isWebGL2 ? (gl as WebGL2RenderingContext).RED : null;
  
  const halfFloatTexType = isWebGL2
    ? HALF_FLOAT
    : halfFloat && (halfFloat as any).HALF_FLOAT_OES;
  
  let formatRGBA;
  let formatRG;
  let formatR;

  if (isWebGL2) {
    formatRGBA = getSupportedFormat(
      gl as WebGLRenderingContext,
      RGBA16F!,
      gl.RGBA,
      halfFloatTexType
    );
    formatRG = getSupportedFormat(gl as WebGLRenderingContext, RG16F!, RG!, halfFloatTexType);
    formatR = getSupportedFormat(gl as WebGLRenderingContext, R16F!, RED!, halfFloatTexType);
  } else {
    formatRGBA = getSupportedFormat(gl as WebGLRenderingContext, gl.RGBA, gl.RGBA, halfFloatTexType);
    formatRG = getSupportedFormat(gl as WebGLRenderingContext, gl.RGBA, gl.RGBA, halfFloatTexType);
    formatR = getSupportedFormat(gl as WebGLRenderingContext, gl.RGBA, gl.RGBA, halfFloatTexType);
  }

  return {
    gl,
    ext: {
      formatRGBA,
      formatRG,
      formatR,
      halfFloatTexType,
      supportLinearFiltering,
    },
  };
}

export function getSupportedFormat(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  internalFormat: number,
  format: number,
  type: number
) {
  if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
    // Check if we're using WebGL2
    const isWebGL2 = !!(gl as WebGL2RenderingContext).HALF_FLOAT;
    
    if (isWebGL2) {
      const gl2 = gl as WebGL2RenderingContext;
      switch (internalFormat) {
        case gl2.R16F:
          return getSupportedFormat(gl, gl2.RG16F, gl2.RG, type);
        case gl2.RG16F:
          return getSupportedFormat(gl, gl2.RGBA16F, gl.RGBA, type);
        default:
          return null;
      }
    } else {
      return null;
    }
  }
  return {
    internalFormat,
    format,
  };
}

export function supportRenderTextureFormat(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  internalFormat: number,
  format: number,
  type: number
) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    internalFormat,
    4,
    4,
    0,
    format,
    type,
    null
  );
  
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );
  
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  return status === gl.FRAMEBUFFER_COMPLETE;
}

export function getResolution(resolution: number, gl: WebGLRenderingContext | WebGL2RenderingContext): Resolution {
  let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
  
  const min = Math.round(resolution);
  const max = Math.round(resolution * aspectRatio);
  
  if (gl.drawingBufferWidth > gl.drawingBufferHeight)
    return { width: max, height: min };
  else 
    return { width: min, height: max };
}

export function createFBO(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  param: number
): FBO {
  gl.activeTexture(gl.TEXTURE0);
  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    internalFormat,
    w,
    h,
    0,
    format,
    type,
    null
  );

  let fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let texelSizeX = 1.0 / w;
  let texelSizeY = 1.0 / h;
  
  return {
    texture,
    fbo,
    width: w,
    height: h,
    texelSizeX,
    texelSizeY,
    attach(id) {
      gl.activeTexture(gl.TEXTURE0 + id);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return id;
    },
  };
}

export function createDoubleFBO(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  param: number
): DoubleFBO {
  let fbo1 = createFBO(gl, w, h, internalFormat, format, type, param);
  let fbo2 = createFBO(gl, w, h, internalFormat, format, type, param);
  
  return {
    width: w,
    height: h,
    texelSizeX: fbo1.texelSizeX,
    texelSizeY: fbo1.texelSizeY,
    get read() {
      return fbo1;
    },
    set read(value) {
      fbo1 = value;
    },
    get write() {
      return fbo2;
    },
    set write(value) {
      fbo2 = value;
    },
    swap() {
      let temp = fbo1;
      fbo1 = fbo2;
      fbo2 = temp;
    },
  };
}

export function resizeFBO(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  copyProgram: any,
  target: FBO,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  param: number,
  blit: (target: FBO | null, clear?: boolean) => void
): FBO {
  let newFBO = createFBO(gl, w, h, internalFormat, format, type, param);
  copyProgram.bind();
  gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
  blit(newFBO);
  return newFBO;
}

export function resizeDoubleFBO(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  copyProgram: any,
  target: DoubleFBO,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  param: number,
  blit: (target: FBO | null, clear?: boolean) => void
): DoubleFBO {
  if (target.width === w && target.height === h) return target;
  
  target.read = resizeFBO(
    gl,
    copyProgram,
    target.read,
    w,
    h,
    internalFormat,
    format,
    type,
    param,
    blit
  );
  
  target.write = createFBO(gl, w, h, internalFormat, format, type, param);
  target.width = w;
  target.height = h;
  target.texelSizeX = 1.0 / w;
  target.texelSizeY = 1.0 / h;
  
  return target;
}

export function scaleByPixelRatio(input: number): number {
  const pixelRatio = window.devicePixelRatio || 1;
  return Math.floor(input * pixelRatio);
}

export function hashCode(s: string): number {
  if (s.length === 0) return 0;
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export function wrap(value: number, min: number, max: number): number {
  const range = max - min;
  if (range === 0) return min;
  return ((value - min) % range) + min;
}

export function HSVtoRGB(h: number, s: number, v: number): { r: number; g: number; b: number } {
  let r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      r = 0;
      g = 0;
      b = 0;
      break;
  }
  
  return { r, g, b };
}

export function loadTexture(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  texData: ImageData,
  index: number
) {
  gl.activeTexture(gl.TEXTURE0 + index);
  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texData);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
}
