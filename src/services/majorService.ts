import api, { publicApi } from './axios'
import { authService } from './authService';

export interface Major {
  id: number;
  name: string;
  departmentId: number;
  departmentName?: string;
  createdAt: string;
  createdById: number;
  createdByName: string;
}

class MajorService {
  async getAllMajors() {
    const response = await publicApi.get('/majors/all')
    return response.data
  }

  async getMajorsByDepartment(departmentId: number): Promise<Major[]> {
    const response = await publicApi.get(`/majors/department/${departmentId}`);
    return response.data;
  }

  async getMajorById(id: number): Promise<Major> {
    const response = await publicApi.get(`/majors/find/${id}`);
    return response.data;
  }

  async createMajor(major: Omit<Major, 'id'>): Promise<Major> {
    const response = await api.post('/majors/create', major);
    return response.data;
  }

  async updateMajor(id: number, major: Partial<Major>): Promise<Major> {
    const response = await api.put(`/majors/update/${id}`, major);
    return response.data;
  }

  async deleteMajor(id: number): Promise<void> {
    await api.delete(`/majors/${id}`);
  }
}

export const majorService = new MajorService(); 