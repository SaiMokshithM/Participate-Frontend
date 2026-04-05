import axiosInstance from './axiosInstance';

export const getDashboardStats = () =>
  axiosInstance.get('/admin/dashboard').then((r) => r.data);

export const getAllStudents = (page = 0, size = 50) =>
  axiosInstance.get('/admin/users', { params: { page, size } }).then((r) => r.data);
