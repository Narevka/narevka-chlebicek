
// Default configuration for the fluid simulation
export const config = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1024,
  CAPTURE_RESOLUTION: 512,
  DENSITY_DISSIPATION: 4.0,
  VELOCITY_DISSIPATION: 2.5,
  PRESSURE: 0.1,
  PRESSURE_ITERATIONS: 20,
  CURL: 2,
  SPLAT_RADIUS: 0.15,
  SPLAT_FORCE: 3000,
  SHADING: true,
  COLOR_UPDATE_SPEED: 10,
  BACK_COLOR: { r: 0.5, g: 0, b: 0 },
  TRANSPARENT: true,
  PAUSED: false,
};

// Types for materials and program objects
export interface Uniforms {
  [key: string]: WebGLUniformLocation;
}

export interface Program {
  program: WebGLProgram;
  uniforms: Uniforms;
  bind: () => void;
}

export interface Material {
  vertexShader: WebGLShader;
  fragmentShaderSource: string;
  programs: { [key: number]: WebGLProgram };
  activeProgram: WebGLProgram | null;
  uniforms: Uniforms;
  setKeywords: (keywords: string[]) => void;
  bind: () => void;
}

export interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}

export interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
}

export interface WebGLExtensions {
  formatRGBA: { internalFormat: number; format: number };
  formatRG: { internalFormat: number; format: number };
  formatR: { internalFormat: number; format: number };
  halfFloatTexType: number;
  supportLinearFiltering: boolean;
}

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface Pointer {
  id: number;
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  down: boolean;
  moved: boolean;
  color: ColorRGB;
}
