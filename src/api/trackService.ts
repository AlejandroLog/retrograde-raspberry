import type { TrackDto, TrackCreateDto, Response } from '../types/dtos';

const API_URL = 'http://localhost:5021/api';

export const getTracks = async (): Promise<TrackDto[]> => {
  const response = await fetch(`${API_URL}/tracks`);
  const json: Response<TrackDto[]> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createTrack = async (track: TrackCreateDto): Promise<TrackDto> => {
  const response = await fetch(`${API_URL}/tracks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(track),
  });
  const json: Response<TrackDto> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const updateTrack = async (id: number, track: TrackCreateDto): Promise<TrackDto> => {
  const response = await fetch(`${API_URL}/tracks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(track),
  });
  const json: Response<TrackDto> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const deleteTrack = async (id: number, deletedBy: string): Promise<boolean> => {
  const response = await fetch(`${API_URL}/tracks/${id}?deletedBy=${deletedBy}`, {
    method: 'DELETE',
  });
  const json: Response<boolean> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};
export const getTracksByRelease = async (releaseId: number): Promise<TrackDto[]> => {
  const response = await fetch(`${API_URL}/tracks/release/${releaseId}`);
  const json: Response<TrackDto[]> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};