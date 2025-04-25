import axios from 'axios';
import { authService } from './authService';

export interface Department {
  id: number;
  name: string;
  createdAt: string;
  createdById: number;
  createdByName: string;
}

class DepartmentService {
  private readonly API_URL = `${process.env.NEXT_PUBLIC_API_URL}/departments`;

  async getAllDepartments(): Promise<Department[]> {
    const response = await axios.get(`${this.API_URL}/all`, {
      headers: authService.getAuthHeader()
    });
    return response.data;
  }

  async getDepartmentById(id: number): Promise<Department> {
    const response = await axios.get(`${this.API_URL}/find/${id}`, {
      headers: authService.getAuthHeader()
    });
    return response.data;
  }
}

export const departmentService = new DepartmentService(); 