
// Re-export all the components from their individual files
import { compileShader, addKeywords, createProgram, getUniforms } from './shader-compiler';
import { MaterialClass } from './material-class';
import { ProgramClass } from './program-class';
import type { Material, Program } from './types';

// Re-export everything
export {
  compileShader,
  addKeywords,
  createProgram,
  getUniforms,
  MaterialClass,
  ProgramClass
};

// Re-export types
export type { Material, Program };
