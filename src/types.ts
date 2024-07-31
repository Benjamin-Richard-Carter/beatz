import type { P5CanvasInstance } from '@p5-wrapper/react';

export type SceneParams = {
  p5: P5CanvasInstance;
  analyzerNode: AnalyserNode | null;
};

export type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
