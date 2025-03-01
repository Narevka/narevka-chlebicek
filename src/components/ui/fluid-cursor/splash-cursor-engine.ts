
import { compileShader, createProgram, MaterialClass as Material, ProgramClass as Program } from './webgl-classes';
import { baseVertexShader, copyShader, clearShader, splatShader, advectionShader, divergenceShader, curlShader, vorticityShader, pressureShader, gradientSubtractShader, displayShaderSource } from './shaders';
import { getWebGLContext, scaleByPixelRatio, wrap } from './webgl-utils';
import { SplashCursorProps, PointerPrototype } from './types';
import { createConfig } from './config';
import { createPointerPrototype, updatePointerDownData, updatePointerMoveData, updatePointerUpData, generateColor, correctDeltaX, correctDeltaY } from './pointer';
import { createBlit, render } from './renderer';
import { splatPointer, clickSplat } from './splat';
import { step } from './simulation';
import { initFramebuffers } from './framebuffers';

export function initFluidCursor(canvas: HTMLCanvasElement, options: SplashCursorProps = {}) {
  // Create configuration
  const config = createConfig(options);
  
  // Initialize pointers
  let pointers: PointerPrototype[] = [(createPointerPrototype() as unknown) as PointerPrototype];

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

  // Initialize framebuffers
  let { dye, velocity, divergence, curl, pressure } = initFramebuffers(gl, ext, config, copyProgram, blit);

  function updateKeywords() {
    let displayKeywords = [];
    if (config.SHADING) displayKeywords.push("SHADING");
    displayMaterial.setKeywords(displayKeywords);
  }

  updateKeywords();

  let lastUpdateTime = Date.now();
  let colorUpdateTimer = 0.0;

  function calcDeltaTime() {
    let now = Date.now();
    let dt = (now - lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    lastUpdateTime = now;
    return dt;
  }

  function resizeCanvas() {
    let width = scaleByPixelRatio(canvas.clientWidth);
    let height = scaleByPixelRatio(canvas.clientHeight);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

  function updateColors(dt: number) {
    colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
    if (colorUpdateTimer >= 1) {
      colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
      pointers.forEach((p) => {
        p.color = generateColor();
      });
    }
  }

  function applyInputs() {
    pointers.forEach((p) => {
      if (p.moved) {
        p.moved = false;
        splatPointer(gl, p, velocity, dye, splatProgram, blit, config);
      }
    });
  }

  function updateFrame() {
    const dt = calcDeltaTime();
    if (resizeCanvas()) {
      const framebuffers = initFramebuffers(gl, ext, config, copyProgram, blit, dye, velocity, divergence, curl, pressure);
      dye = framebuffers.dye;
      velocity = framebuffers.velocity;
      divergence = framebuffers.divergence;
      curl = framebuffers.curl;
      pressure = framebuffers.pressure;
    }
    updateColors(dt);
    applyInputs();
    step(gl, dt, velocity, dye, curl, divergence, pressure, curlProgram, vorticityProgram, divergenceProgram, clearProgram, pressureProgram, gradienSubtractProgram, advectionProgram, ext, config, blit);
    render(gl, displayMaterial, null, dye, config, blit);
    requestAnimationFrame(updateFrame);
  }

  // Event listeners
  window.addEventListener("mousedown", (e) => {
    let pointer = pointers[0];
    let posX = scaleByPixelRatio(e.clientX);
    let posY = scaleByPixelRatio(e.clientY);
    updatePointerDownData(pointer, -1, posX, posY, canvas.width, canvas.height);
    clickSplat(gl, pointer, velocity, dye, splatProgram, blit, config);
  });

  document.body.addEventListener(
    "mousemove",
    function handleFirstMouseMove(e) {
      let pointer = pointers[0];
      let posX = scaleByPixelRatio(e.clientX);
      let posY = scaleByPixelRatio(e.clientY);
      let color = generateColor();
      updateFrame(); // start animation loop
      updatePointerMoveData(pointer, posX, posY, color, canvas.width, canvas.height);
      document.body.removeEventListener("mousemove", handleFirstMouseMove);
    }
  );

  window.addEventListener("mousemove", (e) => {
    let pointer = pointers[0];
    let posX = scaleByPixelRatio(e.clientX);
    let posY = scaleByPixelRatio(e.clientY);
    let color = pointer.color;
    updatePointerMoveData(pointer, posX, posY, color, canvas.width, canvas.height);
  });

  document.body.addEventListener(
    "touchstart",
    function handleFirstTouchStart(e) {
      const touches = e.targetTouches;
      let pointer = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        let posX = scaleByPixelRatio(touches[i].clientX);
        let posY = scaleByPixelRatio(touches[i].clientY);
        updateFrame(); // start animation loop
        updatePointerDownData(pointer, touches[i].identifier, posX, posY, canvas.width, canvas.height);
      }
      document.body.removeEventListener("touchstart", handleFirstTouchStart);
    }
  );

  window.addEventListener("touchstart", (e) => {
    const touches = e.targetTouches;
    let pointer = pointers[0];
    for (let i = 0; i < touches.length; i++) {
      let posX = scaleByPixelRatio(touches[i].clientX);
      let posY = scaleByPixelRatio(touches[i].clientY);
      updatePointerDownData(pointer, touches[i].identifier, posX, posY, canvas.width, canvas.height);
    }
  });

  window.addEventListener(
    "touchmove",
    (e) => {
      const touches = e.targetTouches;
      let pointer = pointers[0];
      for (let i = 0; i < touches.length; i++) {
        let posX = scaleByPixelRatio(touches[i].clientX);
        let posY = scaleByPixelRatio(touches[i].clientY);
        updatePointerMoveData(pointer, posX, posY, pointer.color, canvas.width, canvas.height);
      }
    },
    false
  );

  window.addEventListener("touchend", (e) => {
    const touches = e.changedTouches;
    let pointer = pointers[0];
    for (let i = 0; i < touches.length; i++) {
      updatePointerUpData(pointer);
    }
  });

  // Initial update
  updateFrame();
  
  // Return cleanup function
  return () => {
    // Remove all event listeners here if needed
  };
}
