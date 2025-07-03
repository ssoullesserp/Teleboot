import { api } from './api';
import { Template } from '../types';

export const templateService = {
  async getTemplates(): Promise<Template[]> {
    const response = await api.get<Template[]>('/templates');
    return response.data;
  },

  async getTemplate(id: string): Promise<Template> {
    const response = await api.get<Template>(`/templates/${id}`);
    return response.data;
  },
};