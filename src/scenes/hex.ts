import { createBeatDetector } from '../utils/audio';
import { shuffleArray } from '../utils/array';
import { Visualizer, VisualizerProps } from '@/types';

export const hex: Visualizer = (p5) => {
  let analyzerNode: AnalyserNode | undefined = undefined;
  let shuffledIndices: number[] = [];
  let numCols: number;
  let circleSize: number;
  let currentPalette: string[] = [];
  let paletteIndex = 0;
  const numRows = 10;
  const minSizeFactor = 0.5;

  const colorPalettes = [
    ['#FF6B35', '#F7C59F', '#EFEFD0', '#004E89', '#2A9D8F', '#E9C46A'],
    ['#8D5A97', '#907F9F', '#A4C2A5', '#D0E3CC', '#F7FFE0'],
    ['#FFA69E', '#FAF3DD', '#B8F2E6', '#AED9E0', '#5E6472'],
    ['#F2C57C', '#DDAE7E', '#7FB685', '#426A5A', '#EF6F6C'],
  ];

  const beatDetector = createBeatDetector({
    energyHistoryLength: 500,
    minTimeBetweenBeats: 200,
    beatsPerBar: 8,
    onBarCompleted: () => {
      if (analyzerNode) {
        shuffledIndices = shuffleArray(
          Array.from({ length: analyzerNode.frequencyBinCount }, (_, i) => i)
        );
        paletteIndex = (paletteIndex + 1) % colorPalettes.length;
        currentPalette = colorPalettes[paletteIndex];
      }
    },
  });

  function calculateLayout() {
    circleSize = p5.height / (numRows * 0.85);
    numCols = Math.ceil(p5.width / (circleSize * 0.866)) + 1;
  }

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.noStroke();
    calculateLayout();
    currentPalette = colorPalettes[0];
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    calculateLayout();
  };

  p5.updateWithProps = (props: VisualizerProps) => {
    if (props.analyzerNode) {
      analyzerNode = props.analyzerNode;
      beatDetector.initializeAnalyzerNode(analyzerNode);
      shuffledIndices = shuffleArray(
        Array.from({ length: analyzerNode.frequencyBinCount }, (_, i) => i)
      );
    }
  };

  p5.draw = () => {
    p5.background('#1A1A1A');

    if (analyzerNode) {
      const time = p5.millis();
      const frequencyDataArray =
        beatDetector.detectBeat(time).frequencyDataArray;

      for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
          const x = j * circleSize * 0.866;
          const y = i * circleSize + (j % 2) * (circleSize / 2);

          const index = (i * numCols + j) % shuffledIndices.length;
          const frequency = frequencyDataArray[shuffledIndices[index]];
          const sizeFactor = p5.map(frequency, 0, 255, 1, minSizeFactor);

          p5.fill(currentPalette[(i + j) % currentPalette.length]);
          p5.ellipse(x, y, circleSize * sizeFactor);
        }
      }
    }
  };
};
