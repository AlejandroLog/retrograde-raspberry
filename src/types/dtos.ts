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