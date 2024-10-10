import { useRef, useState } from 'react';
import './app.css';
import { ReactP5Wrapper, Sketch } from '@p5-wrapper/react';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { dots } from './scenes/dots';
import { waves } from './scenes/waves';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { PlayerControls } from './menu/playerControls';
import { ScreenControls, Exit, TrackInfo } from './menu/screenControls';
import { MenuContainer, MenuBackdrop } from './menu/layout';
import { SketchControls } from './menu/sketchControls';

export type SketchNames = 'dots' | 'waves';
export type sketchList = Record<SketchNames, Sketch>;

function App() {
  const player = useAudioPlayer();
  const [menuToggled, setMenuToggled] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);
  const [currentSketch, setCurrentSketch] = useState<SketchNames>('dots');

  const scenes: sketchList = {
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
      onDrop={player.handleFileDrop}
      onDragOver={player.handleDragOver}
      onTap={handleonClick}
      ref={screenRef}>
      <audio
        ref={player.audioRef}
        style={{ display: player.audioFile ? 'block' : 'none' }}
      />

      <AnimatePresence>
        {menuToggled && (
          <>
            <MenuBackdrop>
              <MenuContainer>
                <div className="flex flex-row w-full gap-3 ">
                  <TrackInfo {...player.trackData} />
                  <ScreenControls screenRef={screenRef} />
                  <Exit onClick={() => setMenuToggled(false)} />
                </div>

                {player.audioFile && <PlayerControls {...player} />}
                <SketchControls
                  setCurrentSketch={setCurrentSketch}
                  currentSketch={currentSketch}
                />
              </MenuContainer>
            </MenuBackdrop>
          </>
        )}
      </AnimatePresence>

      <div className="absolute z-0">
        <ReactP5Wrapper
          key={player.audioFile ? player.audioFile.name : 'no-file'}
          sketch={scenes[currentSketch]}
          analyzerNode={player.analyzerNode}
          audioContext={player.audioContext}
        />
      </div>
    </motion.div>
  );
}

export default App;
