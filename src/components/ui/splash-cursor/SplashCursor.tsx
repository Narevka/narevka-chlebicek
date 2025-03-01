
"use client";
import { useEffect, useRef } from "react";
import { SplashCursorProps, Config, Pointer } from './types';
import { getWebGLContext, compileShader, getResolution, scaleByPixelRatio, wrap, generateColor } from './utils';
import { Material, Program, setupBlit } from './webgl-classes';
import { createPointerPrototype, setupEventListeners } from './pointer-manager';
import { 
  baseVertexShader, 
  copyShader, 
  clearShader, 
  displayShaderSource, 
  splatShader, 
  advectionShader, 
  divergenceShader, 
  curlShader, 
  vorticityShader, 
  pressureShader, 
  gradientSubtractShader 
} from './shaders';
import { 
  drawDisplay, 
  splatPointer, 
  splat, 
  clickSplat as clickSplatFn, 
  render, 
  step, 
  initFramebuffers 
} from './renderer';

export function SplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1024,
  CAPTURE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 4.0,
  VELOCITY_DISSIPATION = 2.5,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 2,
  SPLAT_RADIUS = 0.15,
  SPLAT_FORCE = 3000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0.5, g: 0, b: 0 },
  TRANSPARENT = true,
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let config: Config = {
      SIM_RESOLUTION,
      DYE_RESOLUTION,
      CAPTURE_RESOLUTION,
      DENSITY_DISSIPATION,
      VELOCITY_DISSIPATION,
      PRESSURE,
      PRESSURE_ITERATIONS,
      CURL,
      SPLAT_RADIUS,
      SPLAT_FORCE,
      SHADING,
      COLOR_UPDATE_SPEED,
      PAUSED: false,
      BACK_COLOR,
      TRANSPARENT,
    };

    // Create pointer
    let pointers: Pointer[] = [createPointerPrototype()];

    // Get WebGL context and extensions
    const { gl, ext } = getWebGLContext(canvas);
    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }

    // Compile shaders
    const baseVertexShaderCompiled = compileShader(gl, gl.VERTEX_SHADER, baseVertexShader);
    const copyShaderCompiled = compileShader(gl, gl.FRAGMENT_SHADER, copyShader);
    const clearShaderCompiled = compileShader(gl, gl.FRAGMENT_SHADER, clearShader);
    const splatShaderCompiled = compileShader(gl, gl.FRAGMENT_SHADER, splatShader);
    const advectionShaderCompiled = compileShader(
      gl, 
      gl.FRAGMENT_SHADER, 
      advectionShader, 
      ext.supportLinearFiltering ? null : ["MANUAL_FILTERING"]
    );
    const divergenceShaderCompiled = compileShader(gl, gl.FRAGMENT_SHADER, divergenceShader);
    const curlShaderCompiled = compileShader(gl, gl.FRAGMENT_SHADER, curlShader);
    const vorticityShaderCompiled = compileShader(gl, gl.FRAGMENT_SHADER, vorticityShader);
    const pressureShaderCompiled = compileShader(gl, gl.FRAGMENT_SHADER, pressureShader);
    const gradientSubtractShaderCompiled = compileShader(gl, gl.FRAGMENT_SHADER, gradientSubtractShader);
    
    // Create programs
    const copyProgram = new Program(gl, baseVertexShaderCompiled, copyShaderCompiled);
    const clearProgram = new Program(gl, baseVertexShaderCompiled, clearShaderCompiled);
    const splatProgram = new Program(gl, baseVertexShaderCompiled, splatShaderCompiled);
    const advectionProgram = new Program(gl, baseVertexShaderCompiled, advectionShaderCompiled);
    const divergenceProgram = new Program(gl, baseVertexShaderCompiled, divergenceShaderCompiled);
    const curlProgram = new Program(gl, baseVertexShaderCompiled, curlShaderCompiled);
    const vorticityProgram = new Program(gl, baseVertexShaderCompiled, vorticityShaderCompiled);
    const pressureProgram = new Program(gl, baseVertexShaderCompiled, pressureShaderCompiled);
    const gradienSubtractProgram = new Program(gl, baseVertexShaderCompiled, gradientSubtractShaderCompiled);
    const displayMaterial = new Material(gl, baseVertexShaderCompiled, displayShaderSource);

    // Initialize display material
    function updateKeywords() {
      let displayKeywords = [];
      if (config.SHADING) displayKeywords.push("SHADING");
      displayMaterial.setKeywords(displayKeywords);
    }

    // Setup blit
    const blit = setupBlit(gl);

    // Initialize framebuffers
    let { dye, velocity, divergence, curl, pressure } = initFramebuffers(
      gl, 
      config, 
      ext, 
      (resolution) => getResolution(resolution, gl),
      (w, h, internalFormat, format, type, param) => createDoubleFBO(gl, w, h, internalFormat, format, type, param),
      (target, w, h, internalFormat, format, type, param, copyProg) => {
        return {
          ...target,
          width: w,
          height: h,
          texelSizeX: 1.0 / w,
          texelSizeY: 1.0 / h
        };
      },
      copyProgram
    );

    updateKeywords();
    
    // Initialize animation variables
    let lastUpdateTime = Date.now();
    let colorUpdateTimer = 0.0;

    // Main rendering function
    function updateFrame() {
      const dt = calcDeltaTime();
      if (resizeCanvas()) {
        ({ dye, velocity, divergence, curl, pressure } = initFramebuffers(
          gl, 
          config, 
          ext, 
          (resolution) => getResolution(resolution, gl),
          (w, h, internalFormat, format, type, param) => createDoubleFBO(gl, w, h, internalFormat, format, type, param),
          (target, w, h, internalFormat, format, type, param, copyProg) => {
            return {
              ...target,
              width: w,
              height: h,
              texelSizeX: 1.0 / w,
              texelSizeY: 1.0 / h
            };
          },
          copyProgram,
          dye,
          velocity,
          divergence,
          curl,
          pressure
        ));
      }
      updateColors(dt);
      applyInputs();
      step(
        gl, 
        dt, 
        config, 
        curlProgram, 
        vorticityProgram, 
        divergenceProgram, 
        clearProgram, 
        pressureProgram, 
        gradienSubtractProgram, 
        advectionProgram, 
        velocity, 
        curl, 
        divergence, 
        pressure, 
        dye, 
        ext, 
        blit
      );
      render(gl, null, blit, (target) => drawDisplay(
        gl, 
        displayMaterial, 
        config, 
        dye, 
        target, 
        blit
      ));
      requestAnimationFrame(updateFrame);
    }

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
          splatPointer(p, config, canvas, (x, y, dx, dy, color) => 
            splat(x, y, dx, dy, color, canvas, config, splatProgram, velocity, dye, gl, blit)
          );
        }
      });
    }

    function clickSplat(pointer: Pointer) {
      clickSplatFn(pointer, generateColor, (x, y, dx, dy, color) => 
        splat(x, y, dx, dy, color, canvas, config, splatProgram, velocity, dye, gl, blit)
      );
    }

    // Setup event listeners
    setupEventListeners(canvas, pointers, updateFrame, clickSplat);

    // Start animation
    updateFrame();

    // Cleanup function
    return () => {
      // Remove event listeners if needed
      // Any additional cleanup
    };
  }, [
    SIM_RESOLUTION,
    DYE_RESOLUTION,
    CAPTURE_RESOLUTION,
    DENSITY_DISSIPATION,
    VELOCITY_DISSIPATION,
    PRESSURE,
    PRESSURE_ITERATIONS,
    CURL,
    SPLAT_RADIUS,
    SPLAT_FORCE,
    SHADING,
    COLOR_UPDATE_SPEED,
    BACK_COLOR,
    TRANSPARENT,
  ]);

  return (
    <div className="fixed top-0 left-0 z-50 pointer-events-none">
      <canvas ref={canvasRef} id="fluid" className="w-screen h-screen" />
    </div>
  );
}
