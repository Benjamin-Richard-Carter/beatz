import React, { PropsWithChildren } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TbCirclesFilled, TbGridDots } from 'react-icons/tb';
import { PiShapesFill, PiWavesBold } from 'react-icons/pi';
import { MenuCard } from './layout';
import { SketchNames } from '@/App';
import { IoMdPlanet } from 'react-icons/io';

type SketchButtonProps = {
  currentSketch: SketchNames;
  sketchName: SketchNames;
  onClick: () => void;
};

const SketchButton: React.FC<PropsWithChildren<SketchButtonProps>> = ({
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
      <AnimatePresence>
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
      </AnimatePresence>
      {children}
    </motion.div>
  );
};

type Props = {
  currentSketch: SketchNames;
  setCurrentSketch: React.Dispatch<React.SetStateAction<SketchNames>>;
};

export const SketchControls: React.FC<Props> = ({
  currentSketch,
  setCurrentSketch,
}) => {
  return (
    <MenuCard>
      <div className="flex flex-row gap-3 justify-evenly">
        <SketchButton
          currentSketch={currentSketch}
          sketchName="dots"
          onClick={() => setCurrentSketch('dots')}>
          <TbGridDots />
        </SketchButton>
        <SketchButton
          currentSketch={currentSketch}
          sketchName="waves"
          onClick={() => setCurrentSketch('waves')}>
          <PiWavesBold />
        </SketchButton>
        <SketchButton
          currentSketch={currentSketch}
          sketchName="shapes"
          onClick={() => setCurrentSketch('shapes')}>
          <PiShapesFill />
        </SketchButton>
        <SketchButton
          currentSketch={currentSketch}
          sketchName="sphere"
          onClick={() => setCurrentSketch('sphere')}>
          <IoMdPlanet />
        </SketchButton>
        <SketchButton
          currentSketch={currentSketch}
          sketchName="hex"
          onClick={() => setCurrentSketch('hex')}>
          <TbCirclesFilled />
        </SketchButton>
      </div>
    </MenuCard>
  );
};
