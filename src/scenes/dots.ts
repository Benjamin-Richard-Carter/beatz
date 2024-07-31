import { Sketch, SketchProps } from '@p5-wrapper/react';
import chroma from 'chroma-js';

type MySketchProps = SketchProps & {
  analyzerNode: AnalyserNode | null;
};

export const dots: Sketch<MySketchProps> = (p5) => {
  let analyzerNode: AnalyserNode | null = null;
  let frequencyDataArray: Uint8Array;
  let amplitudeHistory: number[][];
  const historyLength = 5;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);

    frequencyDataArray = new Uint8Array(p5.width);

    amplitudeHistory = Array.from({ length: historyLength }, () =>
      new Array(frequencyDataArray.length).fill(0)
    );
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.updateWithProps = (props: MySketchProps) => {
    if (props.analyzerNode) {
      analyzerNode = props.analyzerNode;
    }
  };

  const getColor = (frequency: number) => {
    const ratio = frequency / 255;
    return chroma.mix('#0077ff', '#03ff4f', ratio, 'hsl').hex();
  };

  p5.draw = () => {
    if (analyzerNode) {
      frequencyDataArray = new Uint8Array(analyzerNode.frequencyBinCount);
      analyzerNode.getByteFrequencyData(frequencyDataArray);
      p5.background('#000000');

      if (!amplitudeHistory) {
        amplitudeHistory = Array.from({ length: historyLength }, () =>
          new Array(frequencyDataArray.length).fill(0)
        );
      }

      amplitudeHistory.pop();
      amplitudeHistory.unshift([...frequencyDataArray]);

      const numBands = frequencyDataArray.length;
      const canvasWidth = p5.width;
      const canvasHeight = p5.height;
      const aspectRatio = canvasWidth / canvasHeight;
      const cols = Math.ceil(Math.sqrt(numBands * aspectRatio));
      const rows = Math.ceil(numBands / cols);
      const cellSize = Math.min(canvasWidth / cols, canvasHeight / rows);
      const visibleCols = Math.floor(canvasWidth / cellSize);
      const fullRows = Math.floor(numBands / visibleCols);
      const startX = (canvasWidth - visibleCols * cellSize) / 2;
      const startY = (canvasHeight - fullRows * cellSize) / 2;

      for (let i = 0; i < numBands; i++) {
        const col = i % visibleCols;
        const row = Math.floor(i / visibleCols);

        if (row < fullRows) {
          const x = startX + col * cellSize + cellSize / 2;
          const y = startY + row * cellSize + cellSize / 2;

          const averageAmplitude =
            amplitudeHistory.reduce((sum, history) => sum + history[i], 0) /
            amplitudeHistory.length;

          const maxDiameter = cellSize * 1.2;
          const baseDiameter = maxDiameter * 0.3;
          const diameter = p5.map(
            averageAmplitude * 0.5,
            0,
            255,
            baseDiameter,
            maxDiameter
          );

          p5.fill(getColor(frequencyDataArray[i]));

          p5.noStroke();
          p5.ellipse(x, y, diameter, diameter);
        }
      }
    }
  };
};
