import { api } from './api';
import { BotFlow, CreateFlowRequest, UpdateFlowRequest } from '../types';

export const flowService = {
  async getFlows(botId: string): Promise<BotFlow[]> {
    const response = await api.get<BotFlow[]>(`/flows/bot/${botId}`);
    return response.data;
  },

  async getFlow(id: string): Promise<BotFlow> {
    const response = await api.get<BotFlow>(`/flows/${id}`);
    return response.data;
  },

  async createFlow(botId: string, flowData: CreateFlowRequest): Promise<BotFlow> {
    const response = await api.post<BotFlow>(`/flows/bot/${botId}`, flowData);
    return response.data;
  },

  async updateFlow(id: string, flowData: UpdateFlowRequest): Promise<BotFlow> {
    const response = await api.put<BotFlow>(`/flows/${id}`, flowData);
    return response.data;
  },

  async deleteFlow(id: string): Promise<void> {
    await api.delete(`/flows/${id}`);
  },
};