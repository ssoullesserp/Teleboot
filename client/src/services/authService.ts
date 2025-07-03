import { api } from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  async verifyToken(token: string): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/auth/verify', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};