import { elapsedPercentage, secondsToHHMMSS } from '../utils/time';
import { useState, useRef, useEffect } from 'react';
import { useTrackID } from './useTrackID';
import { v4 as uuid } from 'uuid';

type PlayerTrack = {
  file: File;
  UUID: string;
};

export function useAudioPlayer() {
  const [audioFile, setAudioFile] = useState<PlayerTrack | null>(null);
  const [fileQueue, setFileQueue] = useState<PlayerTrack[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [analyzerNode, setAnalyzerNode] = useState<AnalyserNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { getTrackID, ...trackData } = useTrackID();

  const acceptedFileTypes = ['audio/mpeg', 'audio/mp3'];

  function setupAudioPipeline() {
    if (audioRef.current && !audioContext) {
      const newAudioContext = new AudioContext();
      const newAnalyzerNode = newAudioContext.createAnalyser();
      newAnalyzerNode.fftSize = 512;
      const sourceNode = newAudioContext.createMediaElementSource(
        audioRef.current
      );
      sourceNode.connect(newAnalyzerNode);
      newAnalyzerNode.connect(newAudioContext.destination);
      setAudioContext(newAudioContext);
      setAnalyzerNode(newAnalyzerNode);
    }
  }

  async function loadAudioFile(track: PlayerTrack) {
    if (acceptedFileTypes.includes(track.file.type)) {
      setAudioFile(track);

      if (audioRef.current) {
        setupAudioPipeline();
        audioRef.current.src = URL.createObjectURL(track.file);

        try {
          await audioRef.current.play();

          setIsPlaying(true);
          setFileQueue((prevQueue) => {
            const newQueue = prevQueue.filter(
              (queuedFile) => queuedFile !== track
            );
            return newQueue;
          });
        } catch (error) {
          console.error('Autoplay failed:', error);
          setIsPlaying(false);
        }
      }

      try {
        getTrackID(track.file);
      } catch (error) {
        console.error('Track ID failed:', error);
      }
    } else {
      alert('Please drop an MP3 file.');
    }
  }

  function queueAudioFiles(files: File[]) {
    const newFiles = files.filter((file) =>
      acceptedFileTypes.includes(file.type)
    );

    const newTracks = newFiles.map((file) => ({
      file,
      UUID: uuid(),
    }));

    if (newFiles.length === 0) {
      return;
    }

    if (!audioFile) {
      loadAudioFile(newTracks[0]);
      const nextTracks = newTracks.slice(1);
      setFileQueue(nextTracks);
    }

    if (audioFile) {
      setFileQueue((prevQueue) => {
        const updatedQueue = [...prevQueue, ...newTracks];
        return updatedQueue;
      });
    }
  }

  function reorderFileQueue(newOrder: string[]) {
    const newQueue = newOrder.map(
      (UUID) => fileQueue.find((track) => track.UUID === UUID)!
    );
    setFileQueue(newQueue);
  }

  function playNextInQueue() {
    if (fileQueue.length > 0) {
      loadAudioFile(fileQueue[0]);
    } else {
      setAudioFile(null);
      setIsPlaying(false);
    }
  }

  async function togglePlayPause() {
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
  }

  function stopPlayback() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setFileQueue([]);
    setAudioFile(null);
    setIsPlaying(false);
    setElapsedTime(0);
  }

  function handleFileDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      queueAudioFiles(Array.from(files));
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log(
        'Files selected:',
        Array.from(files).map((f) => f.name)
      );
      queueAudioFiles(Array.from(files));
    }
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function seekToPositionFromPercentage(percentage: number) {
    if (audioRef.current) {
      audioRef.current.currentTime =
        audioRef.current.duration * (percentage / 100);
    } else {
      console.log('No audioRef.current');
    }
  }

  useEffect(() => {
    if (fileQueue.length > 0 && !audioFile) {
      loadAudioFile(fileQueue[0]);
    }
  }, [fileQueue, audioFile]);

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => {
      setIsPlaying(false);
      playNextInQueue();
    };

    if (audio) {
      audio.addEventListener('ended', handleEnded);
    }

    return () => {
      if (audio) {
        audio.removeEventListener('ended', handleEnded);
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
    let animationFrameId: number;

    const updateElapsedTime = () => {
      if (audioRef.current && isPlaying) {
        setElapsedTime(audioRef.current.currentTime);
        animationFrameId = requestAnimationFrame(updateElapsedTime);
      }
    };

    if (isPlaying) {
      updateElapsedTime();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying]);

  const audioDurationFormatted = secondsToHHMMSS(
    audioRef.current?.duration || 0
  );
  const elapsedTimeFormatted = secondsToHHMMSS(elapsedTime);
  const elapsedTimePercentage = elapsedPercentage(
    elapsedTime,
    audioRef.current?.duration || 0
  );

  return {
    audioFile,
    audioRef,
    analyzerNode,
    audioContext,
    fileQueue,
    isPlaying,
    audioDurationFormatted,
    elapsedTimeFormatted,
    elapsedTimePercentage,
    trackData,
    handleFileDrop,
    handleFileSelect,
    handleDragOver,
    togglePlayPause,
    seekToPositionFromPercentage,
    playNextInQueue,
    reorderFileQueue,
    stopPlayback,
  };
}

export type useAudioPlayerReturn = ReturnType<typeof useAudioPlayer>;
