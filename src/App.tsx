import { P5CanvasInstance, ReactP5Wrapper } from '@p5-wrapper/react';
import React, { useState, useRef, useEffect } from 'react';

import './app.css';

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [analyzerNode, setAnalyzerNode] = useState<AnalyserNode | null>(null);
  const [circleData, setCircleData] = useState<
    { index: number; color: string }[] | null
  >(null);

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'audio/mpeg' || file.type === 'audio/mp3') {
        setAudioFile(file);
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(file);
          audioRef.current.play();
        }
      } else {
        alert('Please drop an MP3 file.');
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    if (audioFile && audioRef.current) {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audioRef.current);

      const analyzer = context.createAnalyser();
      analyzer.fftSize = 128;

      source.connect(analyzer);
      analyzer.connect(context.destination);

      const bufferLength = analyzer.frequencyBinCount;
      const data = Array.from({ length: bufferLength }, (_, i) => ({
        index: i,
        color: getRandomColor(),
      }));

      shuffleArray(data);
      setCircleData(data);
      setAnalyzerNode(analyzer);
    }
  }, [audioFile]);

  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = '100%';
    const lightness = '50%';

    return `hsl(${hue}, ${saturation}, ${lightness})`;
  };

  const BarVisualiser = (p5: P5CanvasInstance) => {
    let frequencyDataArray: Uint8Array;
    let amplitudeHistory: number[][];
    const historyLength = 10;

    p5.setup = () => {
      p5.createCanvas(p5.windowWidth, p5.windowHeight);

      if (analyzerNode) {
        const bufferLength = analyzerNode.frequencyBinCount;
        frequencyDataArray = new Uint8Array(bufferLength);
        amplitudeHistory = Array.from({ length: bufferLength }, () =>
          Array(historyLength).fill(0)
        );
      }
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };

    p5.draw = () => {
      p5.background(0);

      if (analyzerNode && circleData) {
        analyzerNode.getByteFrequencyData(frequencyDataArray);

        for (let i = 0; i < frequencyDataArray.length; i++) {
          amplitudeHistory[i].shift();
          amplitudeHistory[i].push(frequencyDataArray[i]);
        }

        let maxAmplitude = 0;
        let minAmplitude = 255;
        for (let i = 0; i < frequencyDataArray.length; i++) {
          const maxHist = Math.max(...amplitudeHistory[i]);
          const minHist = Math.min(...amplitudeHistory[i]);
          maxAmplitude = Math.max(maxAmplitude, maxHist);
          minAmplitude = Math.min(minAmplitude, minHist);
        }

        const cols = Math.ceil(Math.sqrt(circleData.length));
        const rows = Math.ceil(circleData.length / cols);
        const cellWidth = p5.width / cols;
        const cellHeight = p5.height / rows;

        for (let i = 0; i < circleData.length; i++) {
          const { index, color } = circleData[i];
          const amplitude = frequencyDataArray[index];
          const col = i % cols;
          const row = Math.floor(i / cols);

          const x = col * cellWidth + cellWidth / 2;
          const y = row * cellHeight + cellHeight / 2;

          const maxDiameter = Math.min(cellWidth, cellHeight) * 0.8;
          const baseDiameter = maxDiameter * 0.3;

          const amplitudeRange = maxAmplitude - minAmplitude;
          const normalizedAmplitude =
            amplitudeRange > 0
              ? (amplitude - minAmplitude) / amplitudeRange
              : 0;

          const accentuatedAmplitude =
            Math.pow(normalizedAmplitude, 2) * (maxDiameter - baseDiameter);

          const diameter = baseDiameter + accentuatedAmplitude;

          p5.fill('white');
          p5.noStroke();
          p5.ellipse(x, y, diameter, diameter);
        }
      }
    };
  };

  return (
    <div
      className="bg-black w-screen h-screen "
      onDrop={handleFileDrop}
      onDragOver={handleDragOver}>
      <div className="flex p-2 justify-center items-center">
        <audio
          ref={audioRef}
          controls
          style={{ display: audioFile ? 'block' : 'none' }}
        />
      </div>

      <ReactP5Wrapper sketch={BarVisualiser} />
    </div>
  );
}

export default App;
