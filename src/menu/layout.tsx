import { SketchNames } from '@/App';
import { motion } from 'framer-motion';
import { PropsWithChildren, useState } from 'react';
import DetectableOverflow from 'react-detectable-overflow';
import Marquee from 'react-fast-marquee';

export const MenuBackdrop = ({ children }: PropsWithChildren) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-5 w-full h-full flex items-center justify-center z-50 backdrop-blur bg-black/30"
      onClick={(e) => e.stopPropagation()}>
      {children}
    </motion.div>
  );
};

export const MenuContainer = ({ children }: PropsWithChildren) => {
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
      className="w-full m-5 rounded-3xl p-3 gap-3 flex flex-col z-50 items-center md:w-[35rem] max-h-full">
      {children}
    </motion.div>
  );
};

export const MenuCard = ({ children }: PropsWithChildren) => {
  return (
    <motion.div className="w-full p-3 flex flex-col justify-center gap-3 bg-white text-black rounded-2xl">
      {children}
    </motion.div>
  );
};

export const FlexCard = ({ children }: PropsWithChildren<{}>) => {
  return (
    <motion.div className="flex-1 min-w-0 flex flex-col items-center justify-center bg-white text-black rounded-2xl">
      {children}
    </motion.div>
  );
};

export const SmartMarquee = ({ children }: PropsWithChildren) => {
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

type playerButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
};

export const PlayerButton = ({ children, onClick }: playerButtonProps) => (
  <button
    className="text-3xl bg-black rounded-full text-white p-3"
    onClick={onClick}>
    {children}
  </button>
);

type SketchButtonProps = {
  currentSketch: SketchNames;
  sketchName: SketchNames;
  onClick: () => void;
};

export const SketchButton: React.FC<PropsWithChildren<SketchButtonProps>> = ({
  children,
  currentSketch,
  sketchName,
  onClick,
}) => {
  const isCurrentSketch = currentSketch === sketchName;

  return (
    <motion.div
      className="relative aspect-square w-16 rounded-2xl items-center flex justify-center text-3xl"
      onClick={onClick}>
      {isCurrentSketch && (
        <motion.div
          layoutId="overlay"
          layout="position"
          style={{ backdropFilter: 'invert(1)' }}
          className="absolute inset-0 rounded-full"
          transition={{ duration: 0.15 }}
          key="overlay"
        />
      )}
      {children}
    </motion.div>
  );
};
