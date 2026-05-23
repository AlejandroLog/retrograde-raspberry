import type { ReleaseDto, Response } from '../types/dtos';

const API_URL = 'http://localhost:5021/api'; 

export const getReleases = async (): Promise<ReleaseDto[]> => {
  const response = await fetch(`${API_URL}/releases`);
  const json: Response<ReleaseDto[]> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

// --- AGREGA ESTA NUEVA FUNCIÓN ---
// Usamos Omit para no pedir el 'id' ya que la base de datos lo genera
export const createRelease = async (release: Omit<ReleaseDto, 'id'>): Promise<ReleaseDto> => {
  const response = await fetch(`${API_URL}/releases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(release),
  });
  
  const json: Response<ReleaseDto> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};