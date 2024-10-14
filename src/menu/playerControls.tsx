import { AnimatePresence, LayoutGroup, Reorder, motion } from 'framer-motion';
import type { useAudioPlayerReturn } from '../hooks/useAudioPlayer';
import {
  TbPlayerPlayFilled,
  TbPlayerPauseFilled,
  TbPlayerTrackNextFilled,
  TbPlayerStopFilled,
} from 'react-icons/tb';

export const PlayerControls = (player: useAudioPlayerReturn) => {
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!player.seekToPositionFromPercentage) return;
    player.seekToPositionFromPercentage(Number(e.target.value));
  };

  const isLastTrack = player.fileQueue.length === 0;

  return (
    <motion.div className="w-full flex flex-col justify-center p-3 gap-5 bg-white text-black rounded-2xl">
      <div className="flex flex-row items-center justify-center gap-5 ">
        <button
          onClick={isLastTrack ? player.togglePlayPause : player.stopPlayback}
          className="text-2xl bg-black rounded-full text-white p-3">
          {isLastTrack ? <TbPlayerPlayFilled /> : <TbPlayerPauseFilled />}
        </button>

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

        <button
          onClick={player.playNextInQueue}
          className="text-2xl bg-black rounded-full text-white p-3">
          {isLastTrack ? <TbPlayerStopFilled /> : <TbPlayerTrackNextFilled />}
        </button>
      </div>
      <LayoutGroup>
        <AnimatePresence>
          {player.fileQueue.length > 0 && (
            <motion.div
              layout="position"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.1 }}
              className="w-full overflow-hidden ">
              <Reorder.Group
                axis="y"
                drag
                values={player.fileQueue.map((file) => file.name)}
                onReorder={player.reorderFileQueue}
                className="flex flex-col gap-2">
                <AnimatePresence>
                  {player.fileQueue.map((file) => (
                    <Reorder.Item
                      key={file.name}
                      value={file.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}>
                      <motion.div
                        className="flex w-full bg-black text-white p-3 rounded-xl truncate text-sm"
                        layout
                        layoutId={file.name}>
                        {file.name}
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </motion.div>
  );
};
