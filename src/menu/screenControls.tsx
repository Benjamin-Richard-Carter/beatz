import { useFullscreen } from 'ahooks';
import { motion } from 'framer-motion';
import { TbViewportNarrow, TbViewportWide, TbX } from 'react-icons/tb';

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
