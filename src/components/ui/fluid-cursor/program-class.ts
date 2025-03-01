
import { Program } from './types';
import { createProgram, getUniforms } from './shader-compiler';

export class ProgramClass implements Program {
  uniforms: Record<string, WebGLUniformLocation>;
  program: WebGLProgram;
  gl: WebGLRenderingContext;

  constructor(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader, 
    fragmentShader: WebGLShader
  ) {
    this.gl = gl;
    this.program = createProgram(gl, vertexShader, fragmentShader);
    this.uniforms = getUniforms(gl, this.program);
  }

  bind() {
    this.gl.useProgram(this.program);
  }
}

// Export the Program interface type and implementation class
export type { Program };
