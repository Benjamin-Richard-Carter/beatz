import { Sketch, SketchProps } from '@p5-wrapper/react';
import { createBeatDetector } from '../utils/audio';

type MySketchProps = SketchProps & {
  analyzerNode: AnalyserNode | null;
};

export const testing: Sketch<MySketchProps> = (p5) => {
  let analyzerNode: AnalyserNode | null = null;

  const BeatDetector = createBeatDetector({
    beatsPerBar: 4,
    energyHistoryLength: 500,
    minTimeBetweenBeats: 200,
    threshold: 1000,
    onBarCompleted: () => console.log('Bar completed!'),
    onBeatDetected: () => console.log('Beat detected!'),
  });

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.updateWithProps = (props: MySketchProps) => {
    if (props.analyzerNode) {
      analyzerNode = props.analyzerNode;
      BeatDetector.initializeAnalyzerNode(analyzerNode);
    }
  };

  p5.draw = () => {
    if (analyzerNode) {
      const { lastBeatTime, totalEnergy, spectralEnergyFlux, beatAccumulator } =
        BeatDetector.detectBeat(p5.millis());
      console.log(`Last beat time: ${lastBeatTime}`);
      console.log(`Total energy: ${totalEnergy}`);
      console.log(`Spectral energy flux: ${spectralEnergyFlux}`);
      console.log(`Beat accumulator: ${beatAccumulator}`);
      //console.log(`Detected tempo: ${tempo} BPM`);
      //console.log(`Beat positions: ${beatPositions}`);
    }
  };
};
