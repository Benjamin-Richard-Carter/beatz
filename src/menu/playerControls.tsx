import type { useAudioPlayerReturn } from '../hooks/useAudioPlayer';
import {
  TbPlayerPlayFilled,
  TbPlayerPauseFilled,
  TbPlayerTrackNextFilled,
} from 'react-icons/tb';
import { motion } from 'framer-motion';

export const PlayerControls = (player: useAudioPlayerReturn) => {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!player.seekToPositionFromPercentage) return;
    player.seekToPositionFromPercentage(Number(e.target.value));
  };

  return (
    <motion.div className="w-full flex flex-col justify-center p-3 gap-5 bg-white text-black rounded-2xl py-5">
      <div className="flex flex-row items-center justify-center gap-5 ">
        <button
          onClick={player.togglePlayPause}
          className="text-2xl bg-black rounded-full text-white p-3">
          {!player.isPlaying ? <TbPlayerPlayFilled /> : <TbPlayerPauseFilled />}
        </button>

        <div>{player.elapsedTimeFormatted}</div>
        <input
          type="range"
          value={player.elapsedTimePercentage}
          onChange={handleSeek}
          min="0"
          max="100"
          step="1"
          className="w-full p-2 h-2 bg-white rounded-lg focus:outline-none appearance-none cursor-pointer accent-black "
        />
        <div>{player.audioDurationFormatted}</div>

        <button
          onClick={player.playNextInQueue}
          className="text-2xl bg-black rounded-full text-white p-3">
          <TbPlayerTrackNextFilled />
        </button>
      </div>

      {player.fileQueue.length > 0 && (
        <div className="flex flex-col gap-3 w-full">
          {player.fileQueue.map((file, index) => (
            <div
              key={index}
              className="flex w-full bg-black text-white p-3 rounded-xl truncate text-sm">
              <div>{file.name}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
