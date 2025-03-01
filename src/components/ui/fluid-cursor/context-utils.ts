
/**
 * Utilities for WebGL context initialization and setup
 */

export function getWebGLContext(canvas: HTMLCanvasElement): { gl: WebGLRenderingContext; ext: any } {
  const params = {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false
  };

  let gl = canvas.getContext("webgl", params) as WebGLRenderingContext;
  if (!gl) {
    gl = canvas.getContext("experimental-webgl", params) as WebGLRenderingContext;
  }
  if (!gl) {
    throw new Error("WebGL not supported");
  }

  const ext = {
    formatRGBA: {
      internalFormat: gl.RGBA,
      format: gl.RGBA
    },
    formatRG: {
      internalFormat: gl.RGBA,
      format: gl.RGBA
    },
    formatR: {
      internalFormat: gl.RGBA,
      format: gl.RGBA
    },
    halfFloatTexType: gl.UNSIGNED_BYTE,
    supportLinearFiltering: false
  };

  // Try to get half float extension
  const halfFloat = gl.getExtension("OES_texture_half_float");
  const supportLinearFiltering = gl.getExtension("OES_texture_half_float_linear");
  if (halfFloat) {
    // Fix: Using the gl.UNSIGNED_BYTE as a fallback
    ext.halfFloatTexType = gl.UNSIGNED_BYTE;
    if (halfFloat.HALF_FLOAT_OES !== undefined) {
      // Need to cast the value to avoid type errors
      ext.halfFloatTexType = halfFloat.HALF_FLOAT_OES as unknown as number & 5121;
    }
    ext.supportLinearFiltering = !!supportLinearFiltering;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  return { gl, ext };
}

export function getResolution(resolution: number, gl: WebGLRenderingContext) {
  let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

  let min = Math.round(resolution);
  let max = Math.round(resolution * aspectRatio);

  if (gl.drawingBufferWidth > gl.drawingBufferHeight)
    return { width: max, height: min };
  else
    return { width: min, height: max };
}

export function scaleByPixelRatio(input: number): number {
  const pixelRatio = window.devicePixelRatio || 1;
  return Math.floor(input * pixelRatio);
}
