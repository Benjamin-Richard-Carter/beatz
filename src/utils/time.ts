type SecondsToHHMMSS = (seconds: number | undefined) => string;

export const secondsToHHMMSS: SecondsToHHMMSS = (seconds) => {
  if (seconds === undefined) {
    return '00:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const pad = (num: number): string => num.toString().padStart(2, '0');

  if (hours === 0) {
    return `${pad(minutes)}:${pad(remainingSeconds)}`;
  }

  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
};

type elapsedPercentage = (
  elapsed: number | undefined,
  duration: number | undefined
) => number;

export const elapsedPercentage: elapsedPercentage = (elapsed, duration) => {
  if (elapsed === undefined || duration === undefined) {
    return 0;
  }

  return (elapsed / duration) * 100;
};
