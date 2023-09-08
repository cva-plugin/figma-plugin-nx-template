import { createFigma as baseCreateFigma } from 'figma-api-stub';

export function createFigma(config = {}) {

  const figma = baseCreateFigma(config);

  // Add missing Figma Plugin API methods here
  
  return figma;
}
