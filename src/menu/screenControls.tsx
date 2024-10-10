import { useFullscreen } from 'ahooks';
import {
  TbFidgetSpinner,
  TbViewportNarrow,
  TbViewportWide,
  TbX,
} from 'react-icons/tb';
import { useAudioPlayerReturn } from '@/hooks/useAudioPlayer';
import { FlexCard, SmartMarquee } from './layout';

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

export const TrackInfo = (player: useAudioPlayerReturn) => {
  const isAudioFile = player.audioFile ? true : false;
  const { trackID, isLoading, error } = player.trackData;

  if (!isAudioFile) {
    return (
      <FlexCard>
        <p className="font-bold">Drop in an audio file to get started</p>
        <p className="text-sm">Click anywhere to open the menu again</p>
      </FlexCard>
    );
  }

  if (error) {
    return (
      <FlexCard>
        <p className="font-bold">No Track Data</p>
        <p className="text-sm">{error}</p>
      </FlexCard>
    );
  }

  if (isLoading || !trackID) {
    return (
      <FlexCard>
        <span>
          <TbFidgetSpinner className="animate-spin text-4xl" />
        </span>
      </FlexCard>
    );
  }

  const result = trackID.result;
  const albumArt = result.spotify?.album.images[0].url || '/notfound.png';

  return (
    <FlexCard>
      <div className="flex flex-row items-center w-full">
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
    </FlexCard>
  );
};
