import axiosInstance from './axios';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  }
}; 