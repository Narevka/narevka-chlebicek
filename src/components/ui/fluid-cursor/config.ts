
import { Config, SplashCursorProps } from './types';

export function createConfig(options: SplashCursorProps = {}): Config {
  return {
    SIM_RESOLUTION: options.SIM_RESOLUTION || 128,
    DYE_RESOLUTION: options.DYE_RESOLUTION || 1024, 
    CAPTURE_RESOLUTION: options.CAPTURE_RESOLUTION || 512,
    DENSITY_DISSIPATION: options.DENSITY_DISSIPATION || 4.0, 
    VELOCITY_DISSIPATION: options.VELOCITY_DISSIPATION || 2.5, 
    PRESSURE: options.PRESSURE || 0.1,
    PRESSURE_ITERATIONS: options.PRESSURE_ITERATIONS || 20,
    CURL: options.CURL || 2, 
    SPLAT_RADIUS: options.SPLAT_RADIUS || 0.15, 
    SPLAT_FORCE: options.SPLAT_FORCE || 3000, 
    SHADING: options.SHADING !== undefined ? options.SHADING : true,
    COLOR_UPDATE_SPEED: options.COLOR_UPDATE_SPEED || 10,
    PAUSED: false,
    BACK_COLOR: options.BACK_COLOR || { r: 0.5, g: 0, b: 0 },
    TRANSPARENT: options.TRANSPARENT !== undefined ? options.TRANSPARENT : true,
  };
}
