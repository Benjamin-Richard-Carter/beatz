import React from 'react';
import './app.css';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import { useAudio } from './hooks/useAudio';

import { testing } from './scenes/testing';
import { dots } from './scenes/dots';
import { waves } from './scenes/waves';

function App() {
  const {
    audioFile,
    audioRef,
    analyzerNode,
    audioContext,
    handleFileDrop,
    handleDragOver,
  } = useAudio();

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
        key={audioFile ? audioFile.name : 'no-file'}
        sketch={dots}
        analyzerNode={analyzerNode}
        audioContext={audioContext}
      />
    </div>
  );
}

export default App;
