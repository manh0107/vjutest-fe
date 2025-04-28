import { axiosInstance } from './axiosInstance'
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
    const response = await axiosInstance.get('/departments/all')
    return response.data
  }

  async getDepartmentById(id: number): Promise<Department> {
    const response = await axiosInstance.get(`/departments/find/${id}`, {
      headers: authService.getAuthHeader()
    });
    return response.data;
  }

  async createDepartment(name: string) {
    const response = await axiosInstance.post('/departments/create', { name });
    return response.data;
  }

  async updateDepartment(id: number, name: string) {
    const response = await axiosInstance.put(`/departments/update/${id}`, { name });
    return response.data;
  }

  async deleteDepartment(id: number) {
    const response = await axiosInstance.delete(`/departments/delete/${id}`);
    return response.data;
  }
}

export const departmentService = new DepartmentService(); 