import type { MusicalGenreDto, Response } from '../types/dtos';

const API_URL = 'http://localhost:5021/api';

export const getMusicalGenres = async (): Promise<MusicalGenreDto[]> => {
  const response = await fetch(`${API_URL}/musicalgenres`);
  const json: Response<MusicalGenreDto[]> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};