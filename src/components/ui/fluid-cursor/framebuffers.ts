
import { getResolution, createDoubleFBO, createFBO, resizeDoubleFBO } from './webgl-utils';
import { DoubleFBO, FBO } from './types';
import { Program } from './webgl-classes';

export function initFramebuffers(
  gl: WebGLRenderingContext,
  ext: {
    formatRGBA: { internalFormat: number; format: number };
    formatRG: { internalFormat: number; format: number };
    formatR: { internalFormat: number; format: number };
    halfFloatTexType: number;
    supportLinearFiltering: boolean;
  },
  config: { SIM_RESOLUTION: number; DYE_RESOLUTION: number },
  copyProgram: Program,
  blit: (target: FBO | null, clear?: boolean) => void,
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

  if (!dye)
    dye = createDoubleFBO(
      gl,
      dyeRes.width,
      dyeRes.height,
      rgba.internalFormat,
      rgba.format,
      texType,
      filtering
    );
  else
    dye = resizeDoubleFBO(
      gl, 
      copyProgram, 
      dye,
      dyeRes.width,
      dyeRes.height,
      rgba.internalFormat,
      rgba.format,
      texType,
      filtering,
      blit
    );

  if (!velocity)
    velocity = createDoubleFBO(
      gl,
      simRes.width,
      simRes.height,
      rg.internalFormat,
      rg.format,
      texType,
      filtering
    );
  else
    velocity = resizeDoubleFBO(
      gl,
      copyProgram,
      velocity,
      simRes.width,
      simRes.height,
      rg.internalFormat,
      rg.format,
      texType,
      filtering,
      blit
    );

  divergence = createFBO(
    gl,
    simRes.width,
    simRes.height,
    r.internalFormat,
    r.format,
    texType,
    gl.NEAREST
  );
  
  curl = createFBO(
    gl,
    simRes.width,
    simRes.height,
    r.internalFormat,
    r.format,
    texType,
    gl.NEAREST
  );
  
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
