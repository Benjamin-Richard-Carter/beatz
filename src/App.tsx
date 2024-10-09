import { useRef, useState } from 'react';
import './app.css';
import { ReactP5Wrapper, Sketch } from '@p5-wrapper/react';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { dots } from './scenes/dots';
import { waves } from './scenes/waves';
import {
  Exit,
  Menu,
  MenuBackdrop,
  ModeSelector,
  PlayerControls,
  ScreenControls,
} from './menu';
import { AnimatePresence, m } from 'framer-motion';
import { motion } from 'framer-motion';

function App() {
  const {
    audioFile,
    audioRef,
    analyzerNode,
    audioContext,
    playerInfo,
    handleFileDrop,
    handleDragOver,
    handleFileSelect,
  } = useAudioPlayer();

  const [menuToggled, setMenuToggled] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);

  const scenes: Record<string, Sketch> = {
    dots: dots,
    waves: waves,
  };

  const handleonClick = () => {
    if (!menuToggled) {
      setMenuToggled(true);
    }
  };

  return (
    <motion.div
      className="bg-black w-screen h-screen flex flex-col items-center justify-center"
      onDrop={handleFileDrop}
      onDragOver={handleDragOver}
      onTap={handleonClick}
      ref={screenRef}>
      <audio
        ref={audioRef}
        style={{ display: audioFile ? 'block' : 'none' }}
      />

      <AnimatePresence>
        {menuToggled && (
          <>
            <MenuBackdrop>
              <Menu>
                <div className="flex flex-row w-full gap-3">
                  <ModeSelector
                    handleFileSelect={handleFileSelect}
                    audioMode={playerInfo.audioMode}
                  />
                  <ScreenControls screenRef={screenRef} />
                  <Exit onClick={() => setMenuToggled(false)} />
                </div>

                {audioFile && <PlayerControls {...playerInfo} />}
              </Menu>
            </MenuBackdrop>
          </>
        )}
      </AnimatePresence>

      <div className="absolute z-0">
        <ReactP5Wrapper
          key={audioFile ? audioFile.name : 'no-file'}
          sketch={dots}
          analyzerNode={analyzerNode}
          audioContext={audioContext}
        />
      </div>
    </motion.div>
  );
}

export default App;
