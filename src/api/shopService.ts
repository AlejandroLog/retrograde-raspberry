import type { 
  InventoryDto, 
  InventoryCreateDto, 
  SaleCreateDto, 
  SaleDetailCreateDto, 
  PhysicalFormatDto, 
  PhysicalFormatCreateDto,
  SaleDto,
  SaleDetailDto, 
  Response 
} from '../types/dtos';

import { API_URL } from './config';

export const getPhysicalFormats = async (): Promise<PhysicalFormatDto[]> => {
  const response = await fetch(`${API_URL}/physicalformats`);
  const json: Response<PhysicalFormatDto[]> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createPhysicalFormat = async (format: PhysicalFormatCreateDto): Promise<PhysicalFormatDto> => {
  const response = await fetch(`${API_URL}/physicalformats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(format)
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const deletePhysicalFormat = async (id: number, deletedBy: string): Promise<boolean> => {
  const response = await fetch(`${API_URL}/physicalformats/${id}?deletedBy=${deletedBy}`, {
    method: 'DELETE'
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const getAllInventory = async (): Promise<InventoryDto[]> => {
  const response = await fetch(`${API_URL}/inventory`);
  const json: Response<InventoryDto[]> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const getInventoryByRelease = async (releaseId: number): Promise<InventoryDto[]> => {
  const response = await fetch(`${API_URL}/inventory/release/${releaseId}`);
  const json: Response<InventoryDto[]> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createInventory = async (inventory: InventoryCreateDto): Promise<InventoryDto> => {
  const response = await fetch(`${API_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inventory)
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const deleteInventory = async (id: number, deletedBy: string): Promise<boolean> => {
  const response = await fetch(`${API_URL}/inventory/${id}?deletedBy=${deletedBy}`, {
    method: 'DELETE'
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createSale = async (sale: SaleCreateDto): Promise<any> => {
  const response = await fetch(`${API_URL}/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale)
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createSaleDetail = async (detail: SaleDetailCreateDto): Promise<any> => {
  const response = await fetch(`${API_URL}/saledetails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(detail)
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const getAllSales = async (): Promise<SaleDto[]> => {
  const response = await fetch(`${API_URL}/sales`);
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const getAllSaleDetails = async (): Promise<SaleDetailDto[]> => {
  const response = await fetch(`${API_URL}/saledetails`);
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};
export const deleteSale = async (id: number, deletedBy: string): Promise<boolean> => {
  const response = await fetch(`${API_URL}/sales/${id}?deletedBy=${deletedBy}`, {
    method: 'DELETE',
  });
  const json = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};