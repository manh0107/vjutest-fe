import axios from 'axios';
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
  private readonly API_URL = `${process.env.NEXT_PUBLIC_API_URL}/majors`;

  async getAllMajors(): Promise<Major[]> {
    const response = await axios.get(`${this.API_URL}/all`, {
      headers: authService.getAuthHeader()
    });
    return response.data;
  }

  async getMajorsByDepartment(departmentId: number): Promise<Major[]> {
    const response = await axios.get(`${this.API_URL}/department/${departmentId}`, {
      headers: authService.getAuthHeader()
    });
    return response.data;
  }

  async getMajorById(id: number): Promise<Major> {
    const response = await axios.get(`${this.API_URL}/find/${id}`, {
      headers: authService.getAuthHeader()
    });
    return response.data;
  }

  async createMajor(major: Omit<Major, 'id'>): Promise<Major> {
    const response = await axios.post(`${this.API_URL}/create`, major, {
      headers: authService.getAuthHeader()
    });
    return response.data;
  }

  async updateMajor(id: number, major: Partial<Major>): Promise<Major> {
    const response = await axios.put(`${this.API_URL}/update/${id}`, major, {
      headers: authService.getAuthHeader()
    });
    return response.data;
  }

  async deleteMajor(id: number): Promise<void> {
    await axios.delete(`${this.API_URL}/${id}`, {
      headers: authService.getAuthHeader()
    });
  }
}

export const majorService = new MajorService(); 