import { createBeatDetector } from '../utils/audio';
import { Visualizer, VisualizerProps } from '@/types';

export const waves: Visualizer = (p5) => {
  let analyzerNode: AnalyserNode | undefined = undefined;
  let currentPhase = 0;

  let colors = [
    '#552183',
    '#00BFFF',
    '#FFD700',
    '#32CD32',
    '#FF4500',
    '#FF1493',
    '#FF8C00',
    '#8A2BE2',
    '#FF00FF',
    '#00FF00',
  ];

  type Phases = {
    [key: number]: [number, number, number, number, number, number, number];
  };

  const phases: Phases = {
    0: [0.05, 0.05, 0.2, 0.5, 15, 0, 5],
    1: [0.05, 0.05, 0.8, 0.8, 0.5, 1.5, 4],
    2: [0.01, 0.01, 3, 0.01, 0.3, 0.4, 5],
    3: [0.01, 0.1, 0.1, 3, 0.2, 0.4, 5],
    4: [0.05, 0.05, 0.5, 0.5, 1, 1, 4],
    5: [0.04, 0.03, 10, 0.5, 0.2, 0.3, 3],
  };

  const beatDetector = createBeatDetector({
    energyHistoryLength: 500,
    minTimeBetweenBeats: 200,
    beatsPerBar: 8,
    onBarCompleted: () => {
      currentPhase = (currentPhase + 1) % 6;
    },
    onBeatDetected: () => {
      colors = colors.sort(() => Math.random() - 0.5);
    },
  });

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  p5.updateWithProps = (props: VisualizerProps) => {
    if (props.analyzerNode) {
      analyzerNode = props.analyzerNode;
      beatDetector.initializeAnalyzerNode(analyzerNode);
    }
  };

  p5.draw = () => {
    if (analyzerNode) {
      const time = p5.millis();
      const frequencyDataArray =
        beatDetector.detectBeat(time).frequencyDataArray;

      p5.background(0);
      const value = phases[currentPhase];
      const numBands = frequencyDataArray.length;
      const canvasWidth = p5.width;
      const canvasHeight = p5.height;
      const numBars = value[6];
      const barHeight = canvasHeight / (numBars - 10);
      const selectedIndex = Math.floor(numBands / 5);
      const selectedValue = frequencyDataArray[selectedIndex];
      const distortion = p5.map(selectedValue, 0, 255, 0, barHeight * 0.4);

      for (let i = numBars - 1; i >= 0; i--) {
        const y = i * (canvasHeight / (numBars - 1));

        p5.noStroke();
        p5.fill(colors[i]);

        p5.beginShape();
        for (let x = 0; x < canvasWidth; x++) {
          const waveX = x * value[0];
          let topOffset =
            Math.sin(waveX) * distortion +
            Math.sin(waveX * value[4]) * distortion * value[2];
          p5.vertex(x, y + topOffset);
        }
        for (let x = canvasWidth; x >= 0; x--) {
          const waveX = x * value[1];
          let bottomOffset =
            Math.sin(waveX) * distortion +
            Math.sin(waveX * value[5]) * distortion * value[3];
          p5.vertex(x, y + barHeight + bottomOffset);
        }
        p5.endShape(p5.CLOSE);
      }
    }
  };
};
