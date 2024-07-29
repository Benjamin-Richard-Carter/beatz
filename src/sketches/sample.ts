import type { P5CanvasInstance } from '@p5-wrapper/react';

export const SampleSketch = (p5: P5CanvasInstance) => {
  p5.draw = () => {
    p5.normalMaterial();
    p5.push();
    p5.plane(400);
    p5.pop();
  };
};
