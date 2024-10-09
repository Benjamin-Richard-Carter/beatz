import axios from 'axios';
import { useState } from 'react';

type AudDSpotifyInfo = {
  album: {
    name: string;
    images: { url: string }[];
  };
  external_urls: {
    spotify: string;
  };
};

export type AudDAPIResponse = {
  status: string;
  result: {
    artist: string;
    title: string;
    album: string;
    release_date: string;
    label: string;
    timecode: string;
    song_link: string;
    spotify?: AudDSpotifyInfo;
  };
};

type UseTrackID = {
  getTrackID: (file: File) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  trackID: AudDAPIResponse | null;
};

export const useTrackID = (): UseTrackID => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trackID, setTrackID] = useState<AudDAPIResponse | null>(null);

  const getTrackID = async (file: File): Promise<void> => {
    if (!file) throw new Error('No file provided.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_token', import.meta.env.VITE_AUDD_API_KEY as string);
    formData.append('return', 'spotify,apple_music');

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post<AudDAPIResponse>(
        'https://api.audd.io/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setTrackID(response.data);
    } catch (error: any) {
      const errorMessage = `File upload failed: ${error.message}`;
      setError(errorMessage);
      setTrackID(null);
    } finally {
      setIsLoading(false);
    }
  };

  return { getTrackID, isLoading, error, trackID };
};
