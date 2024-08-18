import { useState, useRef, useEffect } from 'react';

export function useAudio() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [analyzerNode, setAnalyzerNode] = useState<AnalyserNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const setupAudioNodes = () => {
    if (audioRef.current && !audioContext) {
      const newContext = new AudioContext();
      const newSource = newContext.createMediaElementSource(audioRef.current);
      const newAnalyzer = newContext.createAnalyser();
      newAnalyzer.fftSize = 1024;
      newSource.connect(newAnalyzer);
      newAnalyzer.connect(newContext.destination);

      setAudioContext(newContext);
      setAnalyzerNode(newAnalyzer);
      sourceRef.current = newSource;
    }
  };

  const loadAudioFile = (file: File) => {
    if (file.type === 'audio/mpeg' || file.type === 'audio/mp3') {
      setAudioFile(file);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = URL.createObjectURL(file);

        setupAudioNodes();

        audioRef.current
          .play()
          .catch((e) => console.error('Audio playback failed', e));
      }
    } else {
      alert('Unsupported file type - please provide an MP3 file');
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      loadAudioFile(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (analyzerNode) {
        analyzerNode.disconnect();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  return {
    audioFile,
    audioRef,
    analyzerNode,
    audioContext,
    handleFileDrop,
    handleDragOver,
  };
}
