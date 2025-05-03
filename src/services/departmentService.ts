import api from './axios'
import { authService } from './authService';

export interface Department {
  id: number;
  name: string;
  createdAt: string;
  createdById: number;
  createdByName: string;
}

class DepartmentService {
  async getAllDepartments() {
    const response = await api.get('/departments/all')
    return response.data
  }

  async getDepartmentById(id: number): Promise<Department> {
    const response = await api.get(`/departments/find/${id}`);
    return response.data;
  }

  async createDepartment(name: string) {
    const response = await api.post('/departments/create', { name });
    return response.data;
  }

  async updateDepartment(id: number, name: string) {
    const response = await api.put(`/departments/update/${id}`, { name });
    return response.data;
  }

  async deleteDepartment(id: number) {
    const response = await api.delete(`/departments/delete/${id}`);
    return response.data;
  }
}

export const departmentService = new DepartmentService(); 