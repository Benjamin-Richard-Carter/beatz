import type { useAudioPlayerReturn } from '../hooks/useAudioPlayer';
import { TbPlayerPlayFilled, TbPlayerPauseFilled } from 'react-icons/tb';
import { motion } from 'framer-motion';

export const PlayerControls = (player: useAudioPlayerReturn) => {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!player.seekToPositionfromPercentage) return;
    player.seekToPositionfromPercentage(Number(e.target.value));
  };

  return (
    <motion.div className="w-full flex flex-col justify-center p-3 gap-3 bg-white text-black rounded-2xl py-5">
      <div className="flex flex-row items-center justify-center gap-3 ">
        <button
          onClick={player.togglePlayPause}
          className="text-2xl">
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
      </div>
    </motion.div>
  );
};
