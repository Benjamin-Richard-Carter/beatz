import { useFullscreen } from 'ahooks';
import { motion } from 'framer-motion';
import { PropsWithChildren, useState } from 'react';
import DetectableOverflow from 'react-detectable-overflow';
import {
  TbFidgetSpinner,
  TbViewportNarrow,
  TbViewportWide,
  TbX,
} from 'react-icons/tb';
import Marquee from 'react-fast-marquee';
import { useAudioPlayerReturn } from '@/hooks/useAudioPlayer';

type ScreenControls = {
  screenRef: React.RefObject<HTMLDivElement>;
};

export const ScreenControls = ({ screenRef }: ScreenControls) => {
  const [isFullScreen, { enterFullscreen, exitFullscreen }] =
    useFullscreen(screenRef);

  const handleFullscreen = () => {
    if (isFullScreen) {
      exitFullscreen();
    }
    if (!isFullScreen) {
      enterFullscreen();
    }
  };

  return (
    <button
      className="rounded-2xl flex flex-row items-center justify-center gap-5 bg-white aspect-square w-20 flex-shrink-0 text-2xl"
      onClick={handleFullscreen}>
      {isFullScreen ? <TbViewportNarrow /> : <TbViewportWide />}
    </button>
  );
};

type Exit = {
  onClick?: () => void;
};

export const Exit = ({ onClick }: Exit) => {
  return (
    <button
      className="rounded-2xl flex flex-row items-center justify-center gap-5 bg-white aspect-square w-20 flex-shrink-0 text-2xl"
      onClick={onClick}>
      <TbX />
    </button>
  );
};

const SmartMarquee = ({ children }: PropsWithChildren) => {
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);

  if (isOverflowing) {
    return (
      <Marquee
        onCycleComplete={() => setIsOverflowing(false)}
        pauseOnHover={true}
        speed={50}>
        {children}
      </Marquee>
    );
  }

  return (
    <DetectableOverflow onChange={(status) => setIsOverflowing(status)}>
      {children}
    </DetectableOverflow>
  );
};

export const TrackInfo = ({
  trackID,
  isLoading,
  error,
}: useAudioPlayerReturn['trackData']) => {
  if (isLoading || !trackID) {
    return (
      <motion.div className="flex-1 min-w-0 flex flex-col items-center justify-center bg-white text-black rounded-2xl">
        <span>
          <TbFidgetSpinner className="animate-spin text-4xl" />
        </span>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div className="flex-1 min-w-0 flex flex-col items-center justify-center bg-white text-black rounded-2xl">
        <span>{error}</span>
      </motion.div>
    );
  }

  const result = trackID.result;
  const albumArt = result.spotify?.album.images[0].url || '/notfound.png';

  return (
    <motion.div className="flex-1 min-w-0 flex flex-col justify-center bg-white text-black rounded-2xl">
      <div className="flex flex-row items-center">
        <img
          src={albumArt}
          alt="Album Art"
          className="w-20 h-20 p-2 rounded-2xl flex-shrink-0"
        />
        <div className="flex flex-col justify-center ml-2 min-w-0 flex-grow">
          <SmartMarquee>
            <p className="font-bold text-lg ">{result.title}</p>
          </SmartMarquee>

          <SmartMarquee>
            <p className="text-sm">{result.artist}</p>
          </SmartMarquee>
        </div>
      </div>
    </motion.div>
  );
};
