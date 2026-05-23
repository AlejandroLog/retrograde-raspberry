import type { UserDto, UserLoginDto, UserCreateDto, Response } from '../types/dtos';

const API_URL = 'http://localhost:5021/api'; 

export const loginUser = async (credentials: UserLoginDto): Promise<UserDto> => {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  const json: Response<UserDto> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const registerUser = async (user: UserCreateDto): Promise<UserDto> => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  
  const json: Response<UserDto> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};


export const updateUser = async (id: number, user: UserCreateDto): Promise<UserDto> => {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  const json: Response<UserDto> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const deleteUser = async (id: number, deletedBy: string): Promise<boolean> => {
  const response = await fetch(`${API_URL}/users/${id}?deletedBy=${deletedBy}`, {
    method: 'DELETE',
  });
  const json: Response<boolean> = await response.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};