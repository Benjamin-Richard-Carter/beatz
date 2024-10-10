import { Sketch } from '@p5-wrapper/react';
import { createBeatDetector } from '../utils/audio';

type MySketchProps = {
  analyzerNode: AnalyserNode | null;
};

type ColorPair = [string, string];

type Star = {
  x: number;
  y: number;
  z: number;
};

export const sphere: Sketch<MySketchProps> = (p) => {
  let analyzerNode: AnalyserNode | undefined = undefined;
  let points: { x: number; y: number; z: number; baseRadius: number }[] = [];
  let stars: Star[] = [];
  const numPoints = 1000;
  const numStars = 2000;
  const baseRadius = 200;
  let angle = 0;

  const colorPairs: ColorPair[] = [
    ['#FF00FF', '#00FFFF'],
    ['#FF0000', '#0000FF'],
    ['#FFFF00', '#00FF00'],
    ['#FFA500', '#800080'],
    ['#FF69B4', '#20B2AA'],
  ];

  let currentColorPairIndex = 0;

  const beatDetector = createBeatDetector({
    energyHistoryLength: 500,
    minTimeBetweenBeats: 200,
    beatsPerBar: 8,

    onBeatDetected: () => {
      currentColorPairIndex = (currentColorPairIndex + 1) % colorPairs.length;
    },
  });

  function createSpherePoints() {
    points = [];
    for (let i = 0; i < numPoints; i++) {
      const theta = p.random(0, p.PI * 2);
      const phi = p.random(0, p.PI);
      const x = baseRadius * p.sin(phi) * p.cos(theta);
      const y = baseRadius * p.sin(phi) * p.sin(theta);
      const z = baseRadius * p.cos(phi);
      points.push({ x, y, z, baseRadius: baseRadius });
    }
  }

  function createStars() {
    stars = [];
    for (let i = 0; i < numStars; i++) {
      const angle = p.random(p.TWO_PI);
      const radius = (p.sqrt(p.random(1)) * p.width) / 2;
      stars.push({
        x: p.cos(angle) * radius,
        y: p.sin(angle) * radius,
        z: p.random(p.width * 0.1, p.width),
      });
    }
  }

  function updateStars() {
    for (let star of stars) {
      star.z -= 3;
      if (star.z < 1) {
        const angle = p.random(p.TWO_PI);
        const radius = (p.sqrt(p.random(1)) * p.width) / 2;
        star.x = p.cos(angle) * radius;
        star.y = p.sin(angle) * radius;
        star.z = p.width;
      }
    }
  }

  function drawStars() {
    p.push();
    p.noStroke();
    for (let star of stars) {
      let sx = (star.x / star.z) * p.width;
      let sy = (star.y / star.z) * p.height;
      let r = p.map(star.z, 0, p.width, 3, 0.8);
      let alpha = p.map(star.z, 0, p.width, 255, 100);
      p.fill(255, alpha);
      p.ellipse(sx, sy, r, r);
    }
    p.pop();
  }

  function lerpColor(color1: string, color2: string, amount: number): number[] {
    const c1 = p.color(color1);
    const c2 = p.color(color2);
    return [
      p.lerp(p.red(c1), p.red(c2), amount),
      p.lerp(p.green(c1), p.green(c2), amount),
      p.lerp(p.blue(c1), p.blue(c2), amount),
    ];
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    p.colorMode(p.RGB);
    createSpherePoints();
    createStars();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    createStars();
  };

  p.updateWithProps = (props: MySketchProps) => {
    if (props.analyzerNode) {
      analyzerNode = props.analyzerNode;
      beatDetector.initializeAnalyzerNode(analyzerNode);
    }
  };

  p.draw = () => {
    p.background(0);

    p.push();
    drawStars();
    updateStars();
    p.pop();

    if (analyzerNode) {
      const time = p.millis();
      const frequencyDataArray =
        beatDetector.detectBeat(time).frequencyDataArray;

      p.rotateY(angle);
      angle += 0.01;

      const [colorTop, colorBottom] = colorPairs[currentColorPairIndex];

      p.noStroke();
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        const frequencyIndex = Math.floor(
          p.map(i, 0, points.length, 0, frequencyDataArray.length)
        );
        const frequencyValue = frequencyDataArray[frequencyIndex];
        const amplitudeFactor = p.map(frequencyValue, 0, 255, 1, 1.5);
        const x = point.x * amplitudeFactor;
        const y = point.y * amplitudeFactor;
        const z = point.z * amplitudeFactor;
        const colorAmount = p.map(y, -baseRadius, baseRadius, 0, 1);
        const [r, g, b] = lerpColor(colorTop, colorBottom, colorAmount);

        p.push();
        p.translate(x, y, z);
        p.fill(r, g, b);
        p.sphere(2);
        p.pop();
      }
    }
  };
};
