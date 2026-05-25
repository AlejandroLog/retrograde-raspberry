import type { MerchandisingDto, MerchandisingCreateDto, Response } from '../types/dtos';

const API_URL = 'http://localhost:5021/api';

export const getMerch = async (): Promise<MerchandisingDto[]> => {
  const response = await fetch(`${API_URL}/merchandising`);
  const json: Response<MerchandisingDto[]> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createMerch = async (merch: MerchandisingCreateDto): Promise<MerchandisingDto> => {
  const response = await fetch(`${API_URL}/merchandising`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(merch),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const approveMerch = async (id: number, approval: { availableStock: number; sku: string }): Promise<MerchandisingDto> => {
  const response = await fetch(`${API_URL}/merchandising/${id}/approve`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(approval),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const updateMerch = async (id: number, merch: Partial<MerchandisingDto>): Promise<MerchandisingDto> => {
  const response = await fetch(`${API_URL}/merchandising/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(merch),
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const deleteMerch = async (id: number, deletedBy: string): Promise<boolean> => {
  const response = await fetch(`${API_URL}/merchandising/${id}?deletedBy=${deletedBy}`, {
    method: 'DELETE',
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};