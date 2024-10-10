import { Sketch } from '@p5-wrapper/react';
import { createBeatDetector } from '../utils/audio';

type MySketchProps = {
  analyzerNode: AnalyserNode | null;
};

export const hex: Sketch<MySketchProps> = (p) => {
  let analyzerNode: AnalyserNode | undefined = undefined;
  let shuffledIndices: number[] = [];
  const numRows = 10;
  let numCols: number;
  let circleSize: number;
  const minSizeFactor = 0.5;
  let currentPalette: string[] = [];
  let paletteIndex = 0;

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

  function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(p.random(i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function calculateLayout() {
    circleSize = p.height / (numRows * 0.85); // Increased circle size
    numCols = Math.ceil(p.width / (circleSize * 0.866)) + 1;
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();
    calculateLayout();
    currentPalette = colorPalettes[0];
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    calculateLayout();
  };

  p.updateWithProps = (props: MySketchProps) => {
    if (props.analyzerNode) {
      analyzerNode = props.analyzerNode;
      beatDetector.initializeAnalyzerNode(analyzerNode);
      shuffledIndices = shuffleArray(
        Array.from({ length: analyzerNode.frequencyBinCount }, (_, i) => i)
      );
    }
  };

  p.draw = () => {
    p.background('#1A1A1A');

    if (analyzerNode) {
      const time = p.millis();
      const frequencyDataArray =
        beatDetector.detectBeat(time).frequencyDataArray;

      for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
          const x = j * circleSize * 0.866;
          const y = i * circleSize + (j % 2) * (circleSize / 2);

          const index = (i * numCols + j) % shuffledIndices.length;
          const frequency = frequencyDataArray[shuffledIndices[index]];
          const sizeFactor = p.map(frequency, 0, 255, 1, minSizeFactor);

          p.fill(currentPalette[(i + j) % currentPalette.length]);
          p.ellipse(x, y, circleSize * sizeFactor);
        }
      }
    }
  };
};
