import axiosInstance from './axiosInstance';

export const getActivities = (params) =>
  axiosInstance.get('/activities', { params }).then((r) => r.data);

export const getActivityById = (id) =>
  axiosInstance.get(`/activities/${id}`).then((r) => r.data);

export const createActivity = (data) =>
  axiosInstance.post('/activities', data).then((r) => r.data);

export const updateActivity = (id, data) =>
  axiosInstance.put(`/activities/${id}`, data).then((r) => r.data);

export const deleteActivity = (id) =>
  axiosInstance.delete(`/activities/${id}`);

export const getAllActivitiesAdmin = () =>
  axiosInstance.get('/activities/all').then((r) => r.data);
