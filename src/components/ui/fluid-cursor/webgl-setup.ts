
import { compileShader, MaterialClass as Material, ProgramClass as Program } from './webgl-classes';
import {
  baseVertexShader,
  copyShader,
  clearShader,
  splatShader,
  advectionShader,
  divergenceShader,
  curlShader,
  vorticityShader,
  pressureShader,
  gradientSubtractShader,
  displayShaderSource
} from './shaders';
import { getWebGLContext } from './webgl-utils';
import { createBlit } from './blit';
import { Config } from './types';

export function setupWebGL(canvas: HTMLCanvasElement, config: Config) {
  // Initialize WebGL
  const { gl, ext } = getWebGLContext(canvas);
  if (!ext.supportLinearFiltering) {
    config.DYE_RESOLUTION = 256;
    config.SHADING = false;
  }

  // Initialize WebGL programs
  const copyProgram = new Program(gl, compileShader(gl, gl.VERTEX_SHADER, baseVertexShader), compileShader(gl, gl.FRAGMENT_SHADER, copyShader));
  const clearProgram = new Program(gl, compileShader(gl, gl.VERTEX_SHADER, baseVertexShader), compileShader(gl, gl.FRAGMENT_SHADER, clearShader));
  const splatProgram = new Program(gl, compileShader(gl, gl.VERTEX_SHADER, baseVertexShader), compileShader(gl, gl.FRAGMENT_SHADER, splatShader));
  const advectionProgram = new Program(
    gl, 
    compileShader(gl, gl.VERTEX_SHADER, baseVertexShader), 
    compileShader(gl, gl.FRAGMENT_SHADER, advectionShader, ext.supportLinearFiltering ? null : ["MANUAL_FILTERING"])
  );
  const divergenceProgram = new Program(gl, compileShader(gl, gl.VERTEX_SHADER, baseVertexShader), compileShader(gl, gl.FRAGMENT_SHADER, divergenceShader));
  const curlProgram = new Program(gl, compileShader(gl, gl.VERTEX_SHADER, baseVertexShader), compileShader(gl, gl.FRAGMENT_SHADER, curlShader));
  const vorticityProgram = new Program(gl, compileShader(gl, gl.VERTEX_SHADER, baseVertexShader), compileShader(gl, gl.FRAGMENT_SHADER, vorticityShader));
  const pressureProgram = new Program(gl, compileShader(gl, gl.VERTEX_SHADER, baseVertexShader), compileShader(gl, gl.FRAGMENT_SHADER, pressureShader));
  const gradienSubtractProgram = new Program(gl, compileShader(gl, gl.VERTEX_SHADER, baseVertexShader), compileShader(gl, gl.FRAGMENT_SHADER, gradientSubtractShader));
  const displayMaterial = new Material(gl, compileShader(gl, gl.VERTEX_SHADER, baseVertexShader), displayShaderSource);

  // Create WebGL blit function
  const blit = createBlit(gl);

  // Update shader keywords based on config
  const updateKeywords = () => {
    let displayKeywords = [];
    if (config.SHADING) displayKeywords.push("SHADING");
    displayMaterial.setKeywords(displayKeywords);
  };

  updateKeywords();

  return { 
    gl, 
    ext, 
    programs: {
      copyProgram,
      clearProgram, 
      splatProgram,
      advectionProgram,
      divergenceProgram,
      curlProgram,
      vorticityProgram,
      pressureProgram,
      gradienSubtractProgram
    }, 
    displayMaterial, 
    blit
  };
}
