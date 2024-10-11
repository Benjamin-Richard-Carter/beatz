import { SketchProps, Sketch } from '@p5-wrapper/react';

export type VisualizerProps = SketchProps & {
  analyzerNode: AnalyserNode | null;
};

export type Visualizer = Sketch<VisualizerProps>;
