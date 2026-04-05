import axiosInstance from './axiosInstance';

export const enrollActivity = (activityId) =>
  axiosInstance.post(`/participation/enroll/${activityId}`).then((r) => r.data);

export const unenrollActivity = (activityId) =>
  axiosInstance.delete(`/participation/unenroll/${activityId}`);

export const getMyParticipations = () =>
  axiosInstance.get('/participation/my').then((r) => r.data);

export const getMyStats = () =>
  axiosInstance.get('/participation/stats').then((r) => r.data);

export const getParticipantsByActivity = (activityId) =>
  axiosInstance.get(`/participation/activity/${activityId}`).then((r) => r.data);
