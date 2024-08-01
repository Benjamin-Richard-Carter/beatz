// newTest.ts
import { Sketch, SketchProps } from '@p5-wrapper/react';
import { createBeatDetector } from '../utils/audio';

type MySketchProps = SketchProps & {
  analyzerNode: AnalyserNode | null;
};

export const newTest: Sketch<MySketchProps> = (p5) => {
  let analyzerNode: AnalyserNode | null = null;
  let frequencyDataArray: Uint8Array;
  let currentColorPair = 0;
  let shuffledIndices: number[];
  let colorAssignments: boolean[];

  type ColorPair = [string, string];

  const colorPairs: Record<number, ColorPair> = {
    0: ['#9b52bd', '#00ff4c'],
    1: ['#ffffff', '#505050'],
    2: ['#ff0000', '#ffe600'],
    3: ['#0059ff', '#8400ff'],
    4: ['#8400ff', '#ff008c'],
  };

  const beatDetector = createBeatDetector({
    energyHistoryLength: 500,
    minTimeBetweenBeats: 200,
    beatsPerBar: 4,

    onBarCompleted: () => {
      currentColorPair =
        (currentColorPair + 1) % Object.keys(colorPairs).length;
      randomizeColorAssignments(colorAssignments.length);
    },
  });

  function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function randomizeColorAssignments(numCells: number): void {
    colorAssignments = Array(numCells)
      .fill(false)
      .map(() => Math.random() < 0.5);
  }

  function initializeArrays(): void {
    if (analyzerNode) {
      const numBands = analyzerNode.frequencyBinCount;
      shuffledIndices = shuffleArray(
        Array.from({ length: numBands }, (_, i) => i)
      );
      randomizeColorAssignments(numBands);
      frequencyDataArray = new Uint8Array(numBands);
    }
  }

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    initializeArrays();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.updateWithProps = (props: MySketchProps) => {
    if (props.analyzerNode) {
      analyzerNode = props.analyzerNode;
      initializeArrays();
    }
  };

  const getColor = (index: number): string => {
    const colorPair = colorPairs[currentColorPair];
    return colorAssignments[index] ? colorPair[0] : colorPair[1];
  };

  p5.draw = () => {
    if (analyzerNode && frequencyDataArray) {
      analyzerNode.getByteFrequencyData(frequencyDataArray);

      const totalEnergy = beatDetector.calculateTotalEnergy(frequencyDataArray);
      const energyFlux = beatDetector.spectralEnergyFlux(totalEnergy);

      p5.background('#000000');

      const numBands = frequencyDataArray.length;
      const canvasWidth = p5.width;
      const canvasHeight = p5.height;

      const aspectRatio = canvasWidth / canvasHeight;
      let cols = Math.round(Math.sqrt(numBands * aspectRatio));
      let rows = Math.round(Math.sqrt(numBands / aspectRatio));

      while (cols * rows < numBands) {
        if (cols / rows < aspectRatio) {
          cols++;
        } else {
          rows++;
        }
      }

      const cellWidth = canvasWidth / cols;
      const cellHeight = canvasHeight / rows;
      const cellSize = Math.min(cellWidth, cellHeight);

      const startX = (canvasWidth - cols * cellSize) / 2;
      const startY = (canvasHeight - rows * cellSize) / 2;

      beatDetector.detectBeat(p5.millis(), energyFlux);

      for (let i = 0; i < cols * rows; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const x = startX + col * cellSize + cellSize / 2;
        const y = startY + row * cellSize + cellSize / 2;

        const frequencyIndex = i % numBands;
        const shuffledIndex = shuffledIndices[frequencyIndex];

        const maxDiameter = cellSize * 0.9;
        const baseDiameter = maxDiameter * 0.3;
        const diameter = p5.map(
          frequencyDataArray[shuffledIndex],
          0,
          255,
          baseDiameter,
          maxDiameter
        );

        p5.fill(getColor(frequencyIndex));
        p5.noStroke();
        p5.ellipse(x, y, diameter, diameter);
      }
    }
  };
};
