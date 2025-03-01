
export function createWebGLProgram(
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
): WebGLProgram | null {
  // Create shaders
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  // Create program
  const program = gl.createProgram();
  if (!program) {
    return null;
  }

  // Attach shaders to program
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // Link program
  gl.linkProgram(program);

  // Check for linking errors
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(
      "Unable to initialize the shader program: " +
        gl.getProgramInfoLog(program)
    );
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error("An error occurred creating the shader");
    return null;
  }

  // Set the shader source code
  gl.shaderSource(shader, source);

  // Compile the shader
  gl.compileShader(shader);

  // Check if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "An error occurred compiling the shader: " + gl.getShaderInfoLog(shader)
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

// Add all the missing functions needed by splash-cursor-engine.ts and webgl-classes.ts
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
    // Fix: Using a type compatible with WebGLRenderingContext
    // The number 36193 corresponds to halfFloat.HALF_FLOAT_OES
    // We need to use the correct type that TypeScript expects
    ext.halfFloatTexType = halfFloat.HALF_FLOAT_OES as unknown as number;
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

export function createFBO(
  gl: WebGLRenderingContext,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  filter: number
) {
  gl.activeTexture(gl.TEXTURE0);
  
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, w, h);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const texelSizeX = 1.0 / w;
  const texelSizeY = 1.0 / h;

  return {
    texture,
    fbo,
    width: w,
    height: h,
    texelSizeX,
    texelSizeY,
    attach: (id: number) => {
      gl.activeTexture(gl.TEXTURE0 + id);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return id;
    }
  };
}

export function createDoubleFBO(
  gl: WebGLRenderingContext,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  filter: number
) {
  let fbo1 = createFBO(gl, w, h, internalFormat, format, type, filter);
  let fbo2 = createFBO(gl, w, h, internalFormat, format, type, filter);

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
      const temp = fbo1;
      fbo1 = fbo2;
      fbo2 = temp;
    }
  };
}

export function resizeDoubleFBO(
  gl: WebGLRenderingContext,
  copyProgram: any,
  target: any,
  w: number,
  h: number,
  internalFormat: number,
  format: number,
  type: number,
  filter: number,
  blit: (target: any, clear?: boolean) => void
) {
  const newFBO = createDoubleFBO(gl, w, h, internalFormat, format, type, filter);
  copyProgram.bind();
  gl.uniform1i(copyProgram.uniforms.uTexture, target.read.attach(0));
  blit(newFBO.write);
  newFBO.swap();
  return newFBO;
}

export function scaleByPixelRatio(input: number): number {
  const pixelRatio = window.devicePixelRatio || 1;
  return Math.floor(input * pixelRatio);
}

export function wrap(value: number, min: number, max: number): number {
  const range = max - min;
  if (range === 0) return min;
  return (value - min) % range + min;
}

export function HSVtoRGB(h: number, s: number, v: number) {
  let r = 0, g = 0, b = 0;
  
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return { r, g, b };
}

export function hashCode(s: string): number {
  if (s.length === 0) return 0;
  
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  return hash;
}
