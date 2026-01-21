export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  token: string;
  username: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
