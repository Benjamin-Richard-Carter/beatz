import { Sketch, SketchProps } from '@p5-wrapper/react';

export type AudioMode = 'file' | 'mic' | 'tap';

export type AudioSource =
  | MediaElementAudioSourceNode
  | MediaStreamAudioSourceNode;

interface VisualizerProps extends SketchProps {}
