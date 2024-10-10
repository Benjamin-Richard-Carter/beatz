import { elapsedPercentage, secondsToHHMMSS } from '../utils/time';
import { useState, useRef, useEffect } from 'react';
import { useTrackID } from './useTrackID';

export function useAudioPlayer() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [analyzerNode, setAnalyzerNode] = useState<AnalyserNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { getTrackID, ...trackData } = useTrackID();

  const setupAudioPipeline = ({
    source,
  }: {
    source: HTMLAudioElement | null;
  }) => {
    if (!source) {
      console.error('No source provided');
      return;
    }
    const audioContext = new AudioContext();
    const analyzerNode = audioContext.createAnalyser();
    analyzerNode.fftSize = 512;
    const sourceNode = audioContext.createMediaElementSource(source);
    sourceNode.connect(analyzerNode);
    analyzerNode.connect(audioContext.destination);
    setAudioContext(audioContext);
    setAnalyzerNode(analyzerNode);
  };

  const loadAudioFile = async (file: File) => {
    if (file.type === 'audio/mpeg' || file.type === 'audio/mp3') {
      setAudioFile(file);

      if (!audioFile) {
        setupAudioPipeline({ source: audioRef.current });
      }

      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(file);

        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Autoplay failed:', error);
          setIsPlaying(false);
        }
      }

      try {
        //await getTrackID(file);
      } catch (error) {
        console.error('Track ID failed:', error);
      }
    } else {
      alert('Please drop an MP3 file.');
    }
  };

  const togglePlayPause = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Playback failed:', error);
        }
      }
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      loadAudioFile(files[0]);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      loadAudioFile(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', () => setIsPlaying(false));
    }
    return () => {
      if (audio) {
        audio.removeEventListener('ended', () => setIsPlaying(false));
      }

      if (analyzerNode) {
        analyzerNode.disconnect();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const updateElapsedTime = () => {
        if (audioRef.current) {
          setElapsedTime(audioRef.current.currentTime);
          requestAnimationFrame(updateElapsedTime);
        }
      };
      updateElapsedTime();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('ended', () => setIsPlaying(false));
    }
    return () => {
      if (audio) {
        audio.removeEventListener('ended', () => setIsPlaying(false));
      }

      if (analyzerNode) {
        analyzerNode.disconnect();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  const audioDurationFormatted = secondsToHHMMSS(audioRef.current?.duration);
  const elapsedTimeFormatted = secondsToHHMMSS(elapsedTime);
  const elapsedTimePercentage = elapsedPercentage(
    elapsedTime,
    audioRef.current?.duration
  );

  const seekToPositionfromPercentage = (percentage: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime =
        audioRef.current.duration * (percentage / 100);
    } else {
      console.log('No audioRef.current');
    }
  };

  return {
    audioFile,
    audioRef,
    analyzerNode,
    audioContext,
    handleFileDrop,
    handleFileSelect,
    handleDragOver,
    togglePlayPause,
    seekToPositionfromPercentage,
    isPlaying,
    audioDurationFormatted,
    elapsedTimeFormatted,
    elapsedTimePercentage,
    trackData,
  };
}

export type useAudioPlayerReturn = ReturnType<typeof useAudioPlayer>;
