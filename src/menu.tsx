import { forwardRef, PropsWithChildren, useRef } from 'react';
import type { useAudioPlayerReturn } from './hooks/useAudioPlayer';
import { AudioMode } from './types';
import {
  TbDeviceFloppy,
  TbMicrophone,
  TbHandFinger,
  TbX,
  TbViewportWide,
  TbPlayerPlay,
  TbPlayerPause,
  TbViewportNarrow,
} from 'react-icons/tb';
import { AnimatePresence, motion } from 'framer-motion';
import { useFullscreen } from 'ahooks';

export const Menu = ({ children }: PropsWithChildren) => {
  return (
    <motion.div
      layout="position"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      className="w-full m-5 rounded-3xl p-3 gap-3 flex flex-col z-50 overflow-clip md:w-1/3 items-center  ">
      <AnimatePresence>{children}</AnimatePresence>
    </motion.div>
  );
};

export const MenuBackdrop = ({ children }: PropsWithChildren) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full h-full flex items-center justify-center z-50 backdrop-blur"
      onClick={(e) => e.stopPropagation()}>
      {children}
    </motion.div>
  );
};

type ModeSelector = Pick<
  useAudioPlayerReturn,
  'handleFileSelect' | 'audioMode'
>;

export const ModeSelector = ({
  handleFileSelect,
  audioMode,
  handleSetAudioMode,
}: ModeSelector) => {
  type Mode = {
    mode: AudioMode;
    name: string;
    icon: JSX.Element;
    onClick?: () => void;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const modes: Mode[] = [
    {
      mode: 'file',
      name: 'File',
      icon: <TbDeviceFloppy />,
      onClick: handleClick,
    },
    {
      mode: 'mic',
      name: 'Mic',
      icon: <TbMicrophone />,
      onClick: () => handleSetAudioMode('mic'),
    },
    { mode: 'tap', name: 'Tap', icon: <TbHandFinger /> },
  ];

  return (
    <motion.div className="flex flex-row justify-center gap-3 bg-white rounded-2xl w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />

      {modes.map((mode) => (
        <button
          key={mode.name}
          onClick={mode.onClick}
          className="text-black rounded-2xl w-full py-5 flex flex-row justify-center items-center gap-3">
          <span className="text-3xl">{mode.icon}</span>
        </button>
      ))}
    </motion.div>
  );
};

type ScreenControls = {
  screenRef: React.RefObject<HTMLDivElement>;
};

export const ScreenControls = ({ screenRef }: ScreenControls) => {
  const [isFullScreen, { enterFullscreen, exitFullscreen }] =
    useFullscreen(screenRef);

  const handleFullscreen = () => {
    if (isFullScreen) {
      console.log('exiting fullscreen');
      exitFullscreen();
    }
    if (!isFullScreen) {
      console.log('entering fullscreen');
      enterFullscreen();
    }
  };

  return (
    <motion.div className="flex flex-col justify-center p-5 gap-3 bg-white text-black rounded-2xl">
      <button
        className="text-2xl"
        onClick={handleFullscreen}>
        {isFullScreen ? <TbViewportNarrow /> : <TbViewportWide />}
      </button>
    </motion.div>
  );
};

type Exit = {
  onClick?: () => void;
};

export const Exit = ({ onClick }: Exit) => {
  return (
    <motion.div className="flex flex-col justify-center p-5 gap-3 bg-white text-black rounded-2xl py-5">
      <div className="flex flex-row items-center justify-center gap-5 ">
        <button
          className="text-2xl"
          onClick={onClick}>
          <TbX />
        </button>
      </div>
    </motion.div>
  );
};

export const PlayerControls = ({
  isPlaying,
  togglePlayPause,
  seekToPositionfromPercentage,
  elapsedTimePercentage,
  audioDurationFormatted,
  elapsedTimeFormatted,
}: useAudioPlayerReturn['playerInfo']) => {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!seekToPositionfromPercentage) return;
    seekToPositionfromPercentage(Number(e.target.value));
  };

  return (
    <motion.div className="w-full flex flex-col justify-center p-3 gap-3 bg-white text-black rounded-2xl py-5">
      <div className="flex flex-row items-center justify-center gap-3 ">
        <button
          onClick={togglePlayPause}
          className="text-3xl">
          {!isPlaying ? <TbPlayerPlay /> : <TbPlayerPause />}
        </button>

        <div>{elapsedTimeFormatted}</div>
        <input
          type="range"
          value={elapsedTimePercentage}
          onChange={handleSeek}
          min="0"
          max="100"
          step="1"
          className="w-full p-2 h-2 bg-white rounded-lg focus:outline-none appearance-none cursor-pointer accent-black "
        />
        <div>{audioDurationFormatted}</div>
      </div>
    </motion.div>
  );
};
