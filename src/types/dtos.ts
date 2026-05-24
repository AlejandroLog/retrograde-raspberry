export interface ReleaseDto {
  id: number;
  artistId: number;
  title: string;
  releaseDate?: string;
  releaseType: string;
}

export interface Response<T> {
  data: T;
  success: boolean;
  message: string;
}

export interface UserDto {
  id: number;
  username: string;
  role: string;
}

export interface UserLoginDto {
  username: string;
  password: string;
}

export interface UserCreateDto {
  username: string;
  passwordHash: string; 
  role: string;
}

export interface ArtistDto {
  id: number;
  userId?: number;
  musicalGenreId: number;
  bandName: string;
  contactEmail?: string;
}

export interface ArtistCreateDto {
  userId?: number;
  musicalGenreId: number;
  bandName: string;
  contactEmail?: string;
}

export interface MusicalGenreDto {
  id: number;
  name: string;
  description?: string;
}


export interface ReleaseDto {
  id: number;
  artistId: number;
  title: string;
  releaseDate?: string;
  releaseType: string;
  coverUrl?: string; 
}

export interface ReleaseCreateDto {
  artistId: number;
  title: string;
  releaseDate?: string;
  releaseType: string;
  coverUrl?: string; 
}


export interface TrackDto {
  id: number;
  releaseId: number;
  trackNumber: number;
  songTitle: string;
  duration?: string;
}

export interface TrackCreateDto {
  releaseId: number;
  trackNumber: number;
  songTitle: string;
  duration?: string;
}




export interface InventoryDto {
  id: number;
  releaseId: number;
  physicalFormatId: number;
  availableStock: number;
  salePrice: number;
  sku: string;
}

export interface SaleCreateDto {
  saleDate?: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
}

export interface SaleDetailCreateDto {
  saleId: number;
  inventoryId: number;
  quantity: number;
  unitPrice: number;
}


export interface PhysicalFormatDto {
  id: number;
  name: string;
  requiresPhysicalShipping: boolean;
}

export interface InventoryCreateDto {
  releaseId: number;
  physicalFormatId: number;
  availableStock: number;
  salePrice: number;
  sku: string;
}


export interface PhysicalFormatCreateDto {
  name: string;
  requiresPhysicalShipping: boolean;
}
export interface SaleDto {
  id: number;
  saleDate: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
}

export interface SaleDetailDto {
  id: number;
  saleId: number;
  inventoryId: number;
  quantity: number;
  unitPrice: number;
}