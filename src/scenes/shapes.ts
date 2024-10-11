import { createBeatDetector } from '../utils/audio';
import { shuffleArray } from '../utils/array';
import { Visualizer, VisualizerProps } from '@/types';

export const shapes: Visualizer = (p5) => {
  let analyzerNode: AnalyserNode | undefined = undefined;
  type Shape = 'circle' | 'triangle';

  let grid: { shape: Shape }[][] = [];
  const gridSize = 8;
  let cellWidth: number;
  let cellHeight: number;
  let shuffledIndices: number[] = [];
  let color1: string;
  let color2: string;

  const colorPairs = [
    ['#552183', '#00BFFF'],
    ['#FFD700', '#32CD32'],
    ['#ff0000', '#0051ff'],
    ['#FF8C00', '#8A2BE2'],
    ['#000000', '#000000'],
  ];

  let shaderProgram: any;
  let bufferTexture: any;

  p5.setup = () => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight, p5.WEBGL);
    cellWidth = p5.width / gridSize;
    cellHeight = p5.height / gridSize;
    generateGrid();
    [color1, color2] = p5.random(colorPairs) as [string, string];

    shaderProgram = p5.createShader(vertexShader, fragmentShader);
    bufferTexture = p5.createGraphics(p5.width, p5.height);
  };

  p5.windowResized = () => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    cellWidth = p5.width / gridSize;
    cellHeight = p5.height / gridSize;
    bufferTexture = p5.createGraphics(p5.width, p5.height);
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

  const vertexShader = `
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 vTexCoord;

    void main() {
      vTexCoord = aTexCoord;
      vec4 positionVec4 = vec4(aPosition, 1.0);
      positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
      gl_Position = positionVec4;
    }
  `;

  const fragmentShader = `
    precision mediump float;
    uniform sampler2D uSampler;
    uniform float uTime;
    varying vec2 vTexCoord;

    void main() {
      vec2 uv = vTexCoord;
      float amplitude = 0.01;
      float frequency = 5.0;
      float waveX = sin(frequency * uv.y + uTime) * amplitude;
      float waveY = sin(frequency * uv.x + uTime) * amplitude;
      
      uv.x += waveX;
      uv.y += waveY;
      
      gl_FragColor = texture2D(uSampler, uv);
    }
  `;

  const beatDetector = createBeatDetector({
    energyHistoryLength: 500,
    minTimeBetweenBeats: 200,
    beatsPerBar: 8,
    onBarCompleted: () => {
      generateGrid();
      if (analyzerNode) {
        shuffledIndices = shuffleArray(
          Array.from({ length: analyzerNode.frequencyBinCount }, (_, i) => i)
        );
      }
      [color1, color2] = p5.random(colorPairs) as [string, string];
    },
    onBeatDetected: () => {},
  });

  function generateGrid() {
    grid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => ({
        shape: Math.random() < 0.5 ? 'circle' : 'triangle',
      }))
    );
  }

  p5.draw = () => {
    const time = p5.millis();

    bufferTexture.background(0);

    if (analyzerNode) {
      const frequencyDataArray =
        beatDetector.detectBeat(time).frequencyDataArray;

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const cell = grid[i][j];
          const x = j * cellWidth;
          const y = i * cellHeight;

          bufferTexture.noStroke();
          bufferTexture.fill((i + j) % 2 === 0 ? color1 : color2);
          bufferTexture.rect(x, y, cellWidth, cellHeight);

          const cellIndex = i * gridSize + j;
          const shuffledIndex =
            shuffledIndices[cellIndex % shuffledIndices.length];
          const frequency = frequencyDataArray[shuffledIndex];

          const minSize = Math.min(cellWidth, cellHeight) * 0.3;
          const maxSize = Math.min(cellWidth, cellHeight) * 0.8;
          const size = p5.map(frequency, 0, 255, minSize, maxSize);

          bufferTexture.fill(255);
          if (cell.shape === 'circle') {
            bufferTexture.ellipse(x + cellWidth / 2, y + cellHeight / 2, size);
          } else {
            const halfSize = size / 2;
            bufferTexture.triangle(
              x + cellWidth / 2,
              y + cellHeight / 2 - halfSize,
              x + cellWidth / 2 - halfSize,
              y + cellHeight / 2 + halfSize,
              x + cellWidth / 2 + halfSize,
              y + cellHeight / 2 + halfSize
            );
          }
        }
      }
    }

    p5.shader(shaderProgram);
    shaderProgram.setUniform('uSampler', bufferTexture);
    shaderProgram.setUniform('uTime', time * 0.002);

    p5.rect(-p5.width / 2, -p5.height / 2, p5.width, p5.height);
  };
};
