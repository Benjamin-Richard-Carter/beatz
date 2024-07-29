import { ReactP5Wrapper } from '@p5-wrapper/react';
import { Canvas } from './P5/Canvas';
import React, { useState, useRef, useEffect } from 'react';

import './app.css';

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyzerNode, setAnalyzerNode] = useState<AnalyserNode | null>(null);

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
      source.connect(analyzer);
      analyzer.connect(context.destination);
      setAudioContext(context);
      setAnalyzerNode(analyzer);
    }
  }, [audioFile]);

  useEffect(() => {
    if (audioContext && analyzerNode) {
      const bufferLength = analyzerNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzerNode.getByteFrequencyData(dataArray);
    }
  }, [audioContext, analyzerNode]);

  return (
    <div
      className="p-0 bg-red-600"
      onDrop={handleFileDrop}
      onDragOver={handleDragOver}>
      <audio
        ref={audioRef}
        style={{ display: audioFile ? 'block' : 'none' }}
      />

      <ReactP5Wrapper sketch={Canvas} />
    </div>
  );
}

export default App;
