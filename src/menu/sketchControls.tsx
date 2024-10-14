import { TbCirclesFilled, TbGridDots } from 'react-icons/tb';
import { PiShapesFill, PiWavesBold } from 'react-icons/pi';
import { MenuCard, SketchButton } from './layout';
import { SketchNames } from '@/App';
import { IoMdPlanet } from 'react-icons/io';
import React from 'react';
import { LayoutGroup, motion } from 'framer-motion';

type Props = {
  currentSketch: SketchNames;
  setCurrentSketch: React.Dispatch<React.SetStateAction<SketchNames>>;
};

type SketchButton = {
  name: SketchNames;
  icon: JSX.Element;
};

const sketchButtons: SketchButton[] = [
  { name: 'dots', icon: <TbGridDots /> },
  { name: 'waves', icon: <PiWavesBold /> },
  { name: 'shapes', icon: <PiShapesFill /> },
  { name: 'sphere', icon: <IoMdPlanet /> },
  { name: 'hex', icon: <TbCirclesFilled /> },
];

export const SketchControls = ({ currentSketch, setCurrentSketch }: Props) => {
  return (
    <MenuCard>
      <LayoutGroup>
        <motion.div className="flex flex-row gap-3 justify-evenly">
          {sketchButtons.map(({ name, icon }) => (
            <SketchButton
              key={name}
              currentSketch={currentSketch}
              sketchName={name}
              onClick={() => setCurrentSketch(name)}>
              {icon}
            </SketchButton>
          ))}
        </motion.div>
      </LayoutGroup>
    </MenuCard>
  );
};
