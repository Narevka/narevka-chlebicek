
import { DoubleFBO, FBO, Config } from './types';
import { Material, Program } from './webgl-classes';

export function createBlit(gl: WebGLRenderingContext) {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
    gl.STATIC_DRAW
  );
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array([0, 1, 2, 0, 2, 3]),
    gl.STATIC_DRAW
  );
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
  
  return (target: FBO | null, clear = false) => {
    if (target == null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    }
    if (clear) {
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  };
}

export function drawDisplay(
  gl: WebGLRenderingContext,
  displayMaterial: Material,
  target: FBO | null,
  dye: DoubleFBO,
  config: Config,
  blit: (target: FBO | null, clear?: boolean) => void
) {
  let width = target == null ? gl.drawingBufferWidth : target.width;
  let height = target == null ? gl.drawingBufferHeight : target.height;
  displayMaterial.bind();
  if (config.SHADING)
    gl.uniform2f(
      displayMaterial.uniforms.texelSize,
      1.0 / width,
      1.0 / height
    );
  gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
  blit(target);
}

export function render(
  gl: WebGLRenderingContext,
  displayMaterial: Material,
  target: FBO | null,
  dye: DoubleFBO,
  config: Config,
  blit: (target: FBO | null, clear?: boolean) => void
) {
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  drawDisplay(gl, displayMaterial, target, dye, config, blit);
}
