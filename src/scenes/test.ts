import { Sketch, SketchProps } from '@p5-wrapper/react';

type MySketchProps = SketchProps & {
  analyzerNode: AnalyserNode | null;
};

export const test: Sketch<MySketchProps> = (p5) => {
  let analyzerNode: AnalyserNode | null = null;
  let frequencyDataArray: Uint8Array;
  let amplitudeHistory: number[][];
  const historyLength = 10;

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

  p5.draw = () => {
    if (analyzerNode) {
      frequencyDataArray = new Uint8Array(analyzerNode.frequencyBinCount);
      analyzerNode.getByteFrequencyData(frequencyDataArray);
      p5.background(0);

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
      const numBars = 5;
      const barHeight = canvasHeight / (numBars - 10);
      const colors = ['#552183', '#00BFFF', '#FFD700', '#32CD32', '#FF4500'];
      const selectedIndex = Math.floor(numBands / 5);
      const selectedValue = frequencyDataArray[selectedIndex];
      const distortion = p5.map(selectedValue, 0, 255, 0, barHeight * 0.3);

      for (let i = numBars - 1; i >= 0; i--) {
        const y = i * (canvasHeight / (numBars - 1));

        p5.noStroke();
        p5.fill(colors[i]);

        p5.beginShape();
        for (let x = 0; x < canvasWidth; x++) {
          const waveX = x * 0.05;
          let topOffset =
            Math.sin(waveX) * distortion +
            Math.sin(waveX * 1) * distortion * 0.5;
          p5.vertex(x, y + topOffset);
        }
        for (let x = canvasWidth; x >= 0; x--) {
          const waveX = x * 0.05;
          let bottomOffset =
            Math.sin(waveX) * distortion +
            Math.sin(waveX * 1) * distortion * 0.5;
          p5.vertex(x, y + barHeight + bottomOffset);
        }
        p5.endShape(p5.CLOSE);
      }
    }
  };
};
