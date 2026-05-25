import type { ArtistDto, ArtistCreateDto, Response } from '../types/dtos';

import { API_URL } from './config';

export const getArtists = async (): Promise<ArtistDto[]> => {
  const response = await fetch(`${API_URL}/artists`);
  const json: Response<ArtistDto[]> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createArtist = async (artist: ArtistCreateDto): Promise<ArtistDto> => {
  const response = await fetch(`${API_URL}/artists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(artist),
  });
  const json: Response<ArtistDto> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const updateArtist = async (id: number, artist: ArtistCreateDto): Promise<ArtistDto> => {
  const response = await fetch(`${API_URL}/artists/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(artist),
  });
  const json: Response<ArtistDto> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};