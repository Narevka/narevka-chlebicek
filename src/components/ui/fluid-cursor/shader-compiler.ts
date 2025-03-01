
import { hashCode } from './math-utils';

export function compileShader(
  gl: WebGLRenderingContext, 
  type: number, 
  source: string, 
  keywords?: string[]
): WebGLShader {
  source = addKeywords(source, keywords);
  const shader = gl.createShader(type);
  
  if (!shader) {
    throw new Error('Failed to create shader');
  }
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    console.trace(gl.getShaderInfoLog(shader));
    
  return shader;
}

export function addKeywords(source: string, keywords?: string[]): string {
  if (!keywords) return source;
  let keywordsString = "";
  keywords.forEach((keyword) => {
    keywordsString += "#define " + keyword + "\n";
  });
  return keywordsString + source;
}

export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader, 
  fragmentShader: WebGLShader
): WebGLProgram {
  let program = gl.createProgram();
  
  if (!program) {
    throw new Error('Failed to create program');
  }
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    console.trace(gl.getProgramInfoLog(program));
    
  return program;
}

export function getUniforms(
  gl: WebGLRenderingContext, 
  program: WebGLProgram
): Record<string, WebGLUniformLocation> {
  let uniforms: Record<string, WebGLUniformLocation> = {};
  let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  
  for (let i = 0; i < uniformCount; i++) {
    const uniformInfo = gl.getActiveUniform(program, i);
    if (uniformInfo) {
      const uniformName = uniformInfo.name;
      const location = gl.getUniformLocation(program, uniformName);
      if (location) {
        uniforms[uniformName] = location;
      }
    }
  }
  
  return uniforms;
}
