import React, { useState, useRef, useEffect } from 'react';
import './app.css';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import { waves } from './scenes/waves';
import { dots } from './scenes/dots';
import { newTest } from './scenes/newTest';
import { test } from './scenes/test';

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [analyzerNode, setAnalyzerNode] = useState<AnalyserNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

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
      setAudioContext(context);
      const source = context.createMediaElementSource(audioRef.current);
      const analyzer = context.createAnalyser();
      setAnalyzerNode(analyzer);

      source.connect(analyzer);
      analyzer.connect(context.destination);
    }
  }, [audioFile]);

  return (
    <div
      className="bg-red w-screen h-screen "
      onDrop={handleFileDrop}
      onDragOver={handleDragOver}>
      <div className="flex justify-center items-center bg-black">
        <audio
          ref={audioRef}
          //controls
          style={{ display: audioFile ? 'block' : 'none' }}
        />
      </div>
      <ReactP5Wrapper
        sketch={dots}
        analyzerNode={analyzerNode}
        audioContext={audioContext}
      />
    </div>
  );
}

export default App;
