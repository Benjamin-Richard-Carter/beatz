type BeatDetectorConfig = {
  energyHistoryLength?: number;
  minTimeBetweenBeats?: number;
  beatsPerBar?: number;
  onBeatDetected?: () => void;
  onBarCompleted?: () => void;
};

type BeatDetector = {
  calculateTotalEnergy: (frequencyData: Uint8Array) => number;
  spectralEnergyFlux: (currentEnergy: number) => number;
  detectBeat: (currentTime: number, energyFlux: number) => void;
  getBeatCount: () => number;
};

export const createBeatDetector = ({
  energyHistoryLength = 100,
  minTimeBetweenBeats = 200,
  beatsPerBar = 8,
  onBeatDetected = () => {},
  onBarCompleted = () => {},
}: BeatDetectorConfig = {}): BeatDetector => {
  let energyHistory: number[] = [];
  let lastBeatTime = 0;
  let beatAccumulator = 0;

  const calculateTotalEnergy = (frequencyData: Uint8Array): number => {
    return frequencyData.reduce((sum, value) => sum + value * value, 0);
  };

  const spectralEnergyFlux = (currentEnergy: number): number => {
    if (energyHistory.length >= energyHistoryLength) {
      energyHistory.shift();
    }
    energyHistory.push(currentEnergy);

    if (energyHistory.length < 2) return 0;

    const previousEnergy = energyHistory[energyHistory.length - 2];
    return Math.max(0, currentEnergy - previousEnergy);
  };

  const detectBeat = (currentTime: number, energyFlux: number): void => {
    const threshold = 100000;

    if (
      energyFlux > threshold &&
      currentTime - lastBeatTime > minTimeBetweenBeats
    ) {
      const beatStrength = energyFlux / threshold;

      if (beatStrength > 1) {
        beatAccumulator++;
        onBeatDetected();

        if (beatAccumulator === beatsPerBar) {
          onBarCompleted();
          beatAccumulator = 0;
        }
      }
      lastBeatTime = currentTime;
    }
  };

  const getBeatCount = (): number => beatAccumulator + 1;

  return {
    calculateTotalEnergy,
    spectralEnergyFlux,
    detectBeat,
    getBeatCount,
  };
};
