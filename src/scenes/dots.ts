import { createBeatDetector } from '../utils/audio';
import { shuffleArray } from '../utils/array';
import { Visualizer, VisualizerProps } from '@/types';

export const dots: Visualizer = (p5) => {
  let analyzerNode: AnalyserNode | null = null;
  let currentColorPair = 0;
  let shuffledIndices: number[];
  let colorAssignments: boolean[];

  const colorPairs: Record<number, [string, string]> = {
    0: ['#ffffff', '#ffffff'],
    1: ['#ff0000', '#ff9900'],
    2: ['#44c8e9', '#09f529'],
    3: ['#0059ff', '#8400ff'],
  };

  const beatDetector = createBeatDetector({
    energyHistoryLength: 500,
    minTimeBetweenBeats: 200,
    beatsPerBar: 8,
    threshold: 100000,

    onBarCompleted: () => {
      currentColorPair =
        (currentColorPair + 1) % Object.keys(colorPairs).length;

      randomizeColorAssignments(colorAssignments.length);
    },
  });

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    initializeArrays();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.updateWithProps = (props: VisualizerProps) => {
    if (props.analyzerNode) {
      analyzerNode = props.analyzerNode;
      beatDetector.initializeAnalyzerNode(analyzerNode);
      initializeArrays();
    }
  };

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
    }
  }

  const getColor = (index: number): string => {
    const colorPair = colorPairs[currentColorPair];
    return colorAssignments[index] ? colorPair[0] : colorPair[1];
  };

  p5.draw = () => {
    if (analyzerNode) {
      const time = p5.millis();
      const frequencyDataArray =
        beatDetector.detectBeat(time).frequencyDataArray;

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
