export type AudioMode = 'file' | 'mic' | 'tap';

export type AudioSource =
  | MediaElementAudioSourceNode
  | MediaStreamAudioSourceNode;
