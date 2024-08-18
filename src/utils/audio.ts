type BeatDetectorConfig = {
  energyHistoryLength?: number;
  minTimeBetweenBeats?: number;
  beatsPerBar?: number;
  threshold?: number;
  onBeatDetected?: () => void;
  onBarCompleted?: () => void;
};

type BeatDetector = {
  detectBeat: (currentTime: number) => BeatDetectionResult;
  getBeatCount: () => number;
  initializeAnalyzerNode: (analyzerNode: AnalyserNode) => void;
};

type BeatDetectionResult = {
  spectralEnergyFlux: number;
  frequencyDataArray: Uint8Array;
  energyHistory: number[];
  lastBeatTime: number;
  beatAccumulator: number;
  totalEnergy: number;
};

export const createBeatDetector = ({
  energyHistoryLength = 100,
  minTimeBetweenBeats = 200,
  beatsPerBar = 8,
  threshold = 100000,
  onBeatDetected = () => {},
  onBarCompleted = () => {},
}: BeatDetectorConfig = {}): BeatDetector => {
  let analyserNode: AnalyserNode | null = null;
  let frequencyDataArray: Uint8Array = new Uint8Array(0);
  let totalEnergy = 0;
  let energyHistory: number[] = [];
  let lastBeatTime = 0;
  let beatAccumulator = 0;
  let spectralEnergyFlux = 0;

  const calculateTotalEnergy = (frequencyData: Uint8Array): number => {
    return frequencyData.reduce((sum, value) => sum + value * value, 0);
  };

  const initializeAnalyzerNode = (analyzerNode: AnalyserNode): void => {
    analyserNode = analyzerNode;
    frequencyDataArray = new Uint8Array(analyzerNode.frequencyBinCount);
  };

  const calculateSpectralEnergyFlux = (currentEnergy: number): number => {
    if (energyHistory.length >= energyHistoryLength) {
      energyHistory.shift();
    }
    energyHistory.push(currentEnergy);

    if (energyHistory.length < 2) return 0;

    const previousEnergy = energyHistory[energyHistory.length - 2];
    return Math.max(0, currentEnergy - previousEnergy);
  };

  const detectBeat = (currentTime: number): BeatDetectionResult => {
    const result: BeatDetectionResult = {
      spectralEnergyFlux,
      frequencyDataArray,
      energyHistory,
      lastBeatTime,
      beatAccumulator,
      totalEnergy,
    };

    if (!analyserNode) {
      console.error('AnalyserNode is not initialized');
      return result;
    }

    analyserNode.getByteFrequencyData(frequencyDataArray);
    result.totalEnergy = calculateTotalEnergy(frequencyDataArray);
    result.spectralEnergyFlux = calculateSpectralEnergyFlux(result.totalEnergy);

    if (
      result.spectralEnergyFlux > threshold &&
      currentTime - result.lastBeatTime > minTimeBetweenBeats
    ) {
      const beatStrength = result.spectralEnergyFlux / threshold;

      if (beatStrength > 1) {
        beatAccumulator++;
        onBeatDetected();

        if (result.beatAccumulator === beatsPerBar) {
          onBarCompleted();
          beatAccumulator = 0;
        }
      }
      lastBeatTime = currentTime;
    }

    return result;
  };

  const getBeatCount = (): number => beatAccumulator + 1;

  return {
    detectBeat,
    getBeatCount,
    initializeAnalyzerNode,
  };
};
