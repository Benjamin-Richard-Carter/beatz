import { RGBA } from '../types';

export const getRandomColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = '100%';
  const lightness = '50%';

  return `hsl(${hue}, ${saturation}, ${lightness})`;
};

type mixColors = (ratio: number, color1: RGBA, color2: RGBA) => string;
