import axios from 'axios';

type AudDSpotifyInfo = {
  album: {
    name: string;
    images: { url: string }[];
  };
  external_urls: {
    spotify: string;
  };
};

export type AudDAPIResult = {
  artist: string;
  title: string;
  album: string;
  release_date: string;
  label: string;
  timecode: string;
  song_link: string;
  spotify?: AudDSpotifyInfo;
};

export type AudDAPIResponse = {
  status: string;
  result: AudDAPIResult;
};

export const getTrackID = async (file: File): Promise<AudDAPIResponse> => {
  if (!file) throw new Error('No file provided.');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_token', import.meta.env.VITE_AUDD_API_KEY as string);
  formData.append('return', 'spotify,apple_music');

  try {
    const response = await axios.post('https://api.audd.io/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(`File upload failed: ${error.message}`);
  }
};
