import { LayoutGroup, Reorder, motion } from 'framer-motion';
import type { useAudioPlayerReturn } from '../hooks/useAudioPlayer';
import {
  TbPlayerPlayFilled,
  TbPlayerPauseFilled,
  TbPlayerTrackNextFilled,
  TbPlayerStopFilled,
} from 'react-icons/tb';
import { PlayerButton } from './layout';

export const PlayerControls = (player: useAudioPlayerReturn) => {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!player.seekToPositionFromPercentage) return;
    player.seekToPositionFromPercentage(Number(e.target.value));
  };

  const isLastTrack = player.fileQueue.length === 0;

  return (
    <motion.div className="w-full flex flex-col justify-between p-3 gap-3 bg-white text-black rounded-2xl min-h-0">
      <div className="flex flex-row items-center justify-center gap-5 text-xl">
        <PlayerButton onClick={player.togglePlayPause}>
          {player.isPlaying ? <TbPlayerPauseFilled /> : <TbPlayerPlayFilled />}
        </PlayerButton>

        <div>{player.elapsedTimeFormatted}</div>
        <input
          type="range"
          value={player.elapsedTimePercentage || 0}
          onChange={handleSeek}
          min="0"
          max="100"
          step="1"
          className="w-full p-2 h-2 bg-white rounded-lg focus:outline-none appearance-none cursor-pointer accent-black "
        />
        <div>{player.audioDurationFormatted}</div>

        {!isLastTrack && (
          <PlayerButton onClick={player.playNextInQueue}>
            <TbPlayerTrackNextFilled />
          </PlayerButton>
        )}

        {isLastTrack && (
          <PlayerButton onClick={player.stopPlayback}>
            <TbPlayerStopFilled />
          </PlayerButton>
        )}
      </div>
      <div className="flex-1 overflow-y-hidden">
        <LayoutGroup>
          {player.fileQueue.length > 0 && (
            <Reorder.Group
              axis="y"
              values={player.fileQueue.map((file) => file.UUID)}
              onReorder={player.reorderFileQueue}
              className="flex flex-col gap-2 w-full max-h-full">
              {player.fileQueue.map((track) => (
                <Reorder.Item
                  layout
                  key={track.UUID}
                  value={track.UUID}
                  transition={{ duration: 0.1 }}
                  className="flex w-full bg-black text-white p-3 rounded-xl truncate text-lg"
                  layoutId={track.UUID}>
                  {track.file.name}
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </LayoutGroup>
      </div>
    </motion.div>
  );
};
