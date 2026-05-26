import type { ReleaseDto, ReleaseCreateDto, Response } from '../types/dtos';

import { API_URL } from './config'; 

export const getReleases = async (): Promise<ReleaseDto[]> => {
  const response = await fetch(`${API_URL}/releases`);
  const json: Response<ReleaseDto[]> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createRelease = async (release: ReleaseCreateDto): Promise<ReleaseDto> => {
  const response = await fetch(`${API_URL}/releases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(release),
  });
  
  const json: Response<ReleaseDto> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};


export const updateRelease = async (id: number, release: ReleaseCreateDto): Promise<ReleaseDto> => {
  const response = await fetch(`${API_URL}/releases/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(release),
  });
  
  const json: Response<ReleaseDto> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const deleteRelease = async (id: number, deletedBy: string): Promise<boolean> => {
  const response = await fetch(`${API_URL}/releases/${id}?deletedBy=${deletedBy}`, {
    method: 'DELETE',
  });
  
  const json: Response<boolean> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};