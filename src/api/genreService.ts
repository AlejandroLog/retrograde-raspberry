import type { MusicalGenreDto, Response } from '../types/dtos';

import { API_URL } from './config';

export const getMusicalGenres = async (): Promise<MusicalGenreDto[]> => {
  const response = await fetch(`${API_URL}/musicalgenres`); 
  const json: Response<MusicalGenreDto[]> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createMusicalGenre = async (genre: { name: string; description?: string }): Promise<MusicalGenreDto> => {
  const response = await fetch(`${API_URL}/musicalgenres`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(genre),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const updateMusicalGenre = async (id: number, genre: { name: string; description?: string }): Promise<MusicalGenreDto> => {
  const response = await fetch(`${API_URL}/musicalgenres/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(genre),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const deleteMusicalGenre = async (id: number, deletedBy: string): Promise<boolean> => {
  const response = await fetch(`${API_URL}/musicalgenres/${id}?deletedBy=${deletedBy}`, {
    method: 'DELETE',
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};