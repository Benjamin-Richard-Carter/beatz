import { createBeatDetector } from '../utils/audio';
import { Visualizer, VisualizerProps } from '@/types';

export const sphere: Visualizer = (p5) => {
  let analyzerNode: AnalyserNode | undefined;
  let points: { x: number; y: number; z: number; baseRadius: number }[] = [];
  let stars: { x: number; y: number; z: number }[] = [];
  let angle = 0;
  let currentColorPairIndex = 0;
  const numPoints = 1000;
  const numStars = 2000;
  const baseRadius = 200;

  const colorPairs: [string, string][] = [
    ['#FF00FF', '#00FFFF'],
    ['#FF0000', '#0000FF'],
    ['#FFFF00', '#00FF00'],
    ['#FFA500', '#800080'],
    ['#FF69B4', '#20B2AA'],
  ];

  const beatDetector = createBeatDetector({
    energyHistoryLength: 500,
    minTimeBetweenBeats: 200,
    beatsPerBar: 8,
    onBeatDetected: () => {
      currentColorPairIndex = (currentColorPairIndex + 1) % colorPairs.length;
    },
  });

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
    p5.colorMode(p5.RGB);
    createSpherePoints();
    createStars();
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    createStars();
  };

  p5.updateWithProps = (props: VisualizerProps) => {
    if (props.analyzerNode) {
      analyzerNode = props.analyzerNode;
      beatDetector.initializeAnalyzerNode(analyzerNode);
    }
  };

  function createSpherePoints() {
    points = Array.from({ length: numPoints }, () => {
      const theta = p5.random(0, p5.TWO_PI);
      const phi = p5.random(0, p5.PI);
      return {
        x: baseRadius * p5.sin(phi) * p5.cos(theta),
        y: baseRadius * p5.sin(phi) * p5.sin(theta),
        z: baseRadius * p5.cos(phi),
        baseRadius,
      };
    });
  }

  function createStars() {
    stars = Array.from({ length: numStars }, () => {
      const angle = p5.random(p5.TWO_PI);
      const radius = (p5.sqrt(p5.random(1)) * p5.width) / 2;
      return {
        x: p5.cos(angle) * radius,
        y: p5.sin(angle) * radius,
        z: p5.random(p5.width * 0.1, p5.width),
      };
    });
  }

  function updateStars() {
    stars.forEach((star) => {
      star.z -= 3;
      if (star.z < 1) {
        const angle = p5.random(p5.TWO_PI);
        const radius = (p5.sqrt(p5.random(1)) * p5.width) / 2;
        star.x = p5.cos(angle) * radius;
        star.y = p5.sin(angle) * radius;
        star.z = p5.width;
      }
    });
  }

  function drawStars() {
    p5.push();
    p5.noStroke();
    stars.forEach((star) => {
      const sx = (star.x / star.z) * p5.width;
      const sy = (star.y / star.z) * p5.height;
      const r = p5.map(star.z, 0, p5.width, 3, 0.8);
      const alpha = p5.map(star.z, 0, p5.width, 255, 100);
      p5.fill(255, alpha);
      p5.ellipse(sx, sy, r, r);
    });
    p5.pop();
  }

  p5.draw = () => {
    p5.background(0);
    drawStars();
    updateStars();

    if (analyzerNode) {
      const time = p5.millis();
      const { frequencyDataArray } = beatDetector.detectBeat(time);

      p5.rotateY(angle);
      angle += 0.01;

      const [colorTop, colorBottom] = colorPairs[currentColorPairIndex];

      p5.noStroke();
      points.forEach((point, i) => {
        const frequencyIndex = Math.floor(
          p5.map(i, 0, points.length, 0, frequencyDataArray.length)
        );
        const frequencyValue = frequencyDataArray[frequencyIndex];
        const amplitudeFactor = p5.map(frequencyValue, 0, 255, 1, 1.5);
        const x = point.x * amplitudeFactor;
        const y = point.y * amplitudeFactor;
        const z = point.z * amplitudeFactor;
        const colorAmount = p5.map(y, -baseRadius, baseRadius, 0, 1);
        const color = p5.lerpColor(
          p5.color(colorTop),
          p5.color(colorBottom),
          colorAmount
        );

        p5.push();
        p5.translate(x, y, z);
        p5.fill(color);
        p5.sphere(2);
        p5.pop();
      });
    }
  };
};
