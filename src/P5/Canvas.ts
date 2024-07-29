import type { P5CanvasInstance } from '@p5-wrapper/react';
import { SampleSketch } from '../sketches/sample';

export const Canvas = (p5: P5CanvasInstance) => {
  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  SampleSketch(p5);
};
