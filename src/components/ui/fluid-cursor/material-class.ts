
import { Material } from './types';
import { compileShader, createProgram, getUniforms } from './shader-compiler';
import { hashCode } from './math-utils';

export class MaterialClass implements Material {
  vertexShader: WebGLShader;
  fragmentShaderSource: string;
  programs: WebGLProgram[] = [];
  activeProgram: WebGLProgram | null = null;
  uniforms: Record<string, WebGLUniformLocation> = {};
  gl: WebGLRenderingContext;

  constructor(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader, 
    fragmentShaderSource: string
  ) {
    this.gl = gl;
    this.vertexShader = vertexShader;
    this.fragmentShaderSource = fragmentShaderSource;
  }

  setKeywords(keywords: string[]) {
    let hash = 0;
    for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i]);
    let program = this.programs[hash];
    
    if (program == null) {
      let fragmentShader = compileShader(
        this.gl,
        this.gl.FRAGMENT_SHADER,
        this.fragmentShaderSource,
        keywords
      );
      program = createProgram(this.gl, this.vertexShader, fragmentShader);
      this.programs[hash] = program;
    }
    
    if (program === this.activeProgram) return;
    this.uniforms = getUniforms(this.gl, program);
    this.activeProgram = program;
  }

  bind() {
    if (this.activeProgram) {
      this.gl.useProgram(this.activeProgram);
    }
  }
}

// Export the Material interface type and implementation class
export type { Material };
