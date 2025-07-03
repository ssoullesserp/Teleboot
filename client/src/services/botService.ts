import { api } from './api';
import { Bot, CreateBotRequest, UpdateBotRequest } from '../types';

export const botService = {
  async getBots(): Promise<Bot[]> {
    const response = await api.get<Bot[]>('/bots');
    return response.data;
  },

  async getBot(id: string): Promise<Bot> {
    const response = await api.get<Bot>(`/bots/${id}`);
    return response.data;
  },

  async createBot(botData: CreateBotRequest): Promise<Bot> {
    const response = await api.post<Bot>('/bots', botData);
    return response.data;
  },

  async updateBot(id: string, botData: UpdateBotRequest): Promise<Bot> {
    const response = await api.put<Bot>(`/bots/${id}`, botData);
    return response.data;
  },

  async deleteBot(id: string): Promise<void> {
    await api.delete(`/bots/${id}`);
  },
};