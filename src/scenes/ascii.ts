// newTest.ts
import { Sketch, SketchProps } from '@p5-wrapper/react';
import { createBeatDetector } from '../utils/audio';

type MySketchProps = SketchProps & {
  analyzerNode: AnalyserNode | null;
};

export const ascii: Sketch<MySketchProps> = (p5) => {
  let analyzerNode: AnalyserNode | null = null;
  let frequencyDataArray: Uint8Array;

  const asciiChars = [
    ' ',
    '.',
    "'",
    '`',
    '^',
    '"',
    ',',
    ':',
    ';',
    'I',
    'l',
    '!',
    'i',
    '>',
    '<',
    '~',
    '+',
    '_',
    '-',
    '?',
    ']',
    '[',
    '}',
    '{',
    '1',
    ')',
    '(',
    '|',
    '\\',
    '/',
    't',
    'f',
    'j',
    'r',
    'x',
    'n',
    'u',
    'v',
    'c',
    'z',
    'X',
    'Y',
    'U',
    'J',
    'C',
    'L',
    'Q',
    '0',
    'O',
    'Z',
    'm',
    'w',
    'q',
    'p',
    'd',
    'b',
    'k',
    'h',
    'a',
    'o',
    '*',
    '#',
    'M',
    'W',
    '&',
    '8',
    '%',
    'B',
    '@',
    '$',
  ];

  const beatDetector = createBeatDetector({
    energyHistoryLength: 100,
    minTimeBetweenBeats: 200,
    beatsPerBar: 8,
    onBeatDetected: () => console.log('quarter beat detected!'),
    onBarCompleted: () => console.log('one bar completed!'),
  });

  function initializeArrays(): void {
    if (analyzerNode) {
      const numBands = analyzerNode.frequencyBinCount;
      frequencyDataArray = new Uint8Array(numBands);
    }
  }

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.colorMode(p5.HSB, 360, 100, 100);
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

  const getAsciiChar = (value: number): string => {
    const index = Math.floor(p5.map(value, 0, 255, 0, asciiChars.length - 1));
    return asciiChars[index];
  };

  const getHeatmapColor = (value: number): p5.Color => {
    const hue = p5.map(value, 0, 255, 240, 0);
    return p5.color(hue, 100, 100);
  };

  p5.draw = () => {
    if (analyzerNode && frequencyDataArray) {
      analyzerNode.getByteFrequencyData(frequencyDataArray);

      const totalEnergy = beatDetector.calculateTotalEnergy(frequencyDataArray);
      const energyFlux = beatDetector.spectralEnergyFlux(totalEnergy);

      p5.background(0);

      const canvasWidth = p5.width;
      const canvasHeight = p5.height;
      const numBands = frequencyDataArray.length;

      const aspectRatio = canvasWidth / canvasHeight;
      let cols = Math.ceil(Math.sqrt(numBands * aspectRatio));
      let rows = Math.ceil(numBands / cols);

      const cellWidth = canvasWidth / cols;
      const cellHeight = canvasHeight / rows;

      const textSize = Math.min(cellWidth, cellHeight) * 0.8;
      p5.textSize(textSize);

      beatDetector.detectBeat(p5.millis(), energyFlux);

      for (let i = 0; i < numBands; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const x = col * cellWidth + cellWidth / 2;
        const y = row * cellHeight + cellHeight / 2;

        const value = frequencyDataArray[i];
        const asciiChar = getAsciiChar(value);

        const heatmapColor = getHeatmapColor(value);
        p5.fill(heatmapColor);
        p5.text(asciiChar, x, y);
      }

      // Draw info text
      p5.colorMode(p5.RGB);
      p5.textSize(32);
      p5.fill(255);
      p5.text('beat: ' + beatDetector.getBeatCount(), 20, 40);
      p5.text('FFT size: ' + numBands * 2, 200, 40);
      p5.colorMode(p5.HSB, 360, 100, 100);
    }
  };
};
