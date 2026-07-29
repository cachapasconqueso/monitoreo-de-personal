import api from './client';

export const getUsers = (role?: string) =>
  api.get('/users', { params: { role } }).then((r) => r.data);

export const getMyEmployees = () => api.get('/users/my-employees').then((r) => r.data);

export const updateMyLocation = (lat: number, lng: number) =>
  api.patch('/users/my-location', { lat, lng }).then((r) => r.data);

export const getTeamLocations = (supervisorId?: string) =>
  api.get('/users/team-locations', { params: { supervisorId } }).then((r) => r.data);

export const createUser = (data: object) => api.post('/users', data).then((r) => r.data);

export const updateUser = (id: string, data: object) =>
  api.patch(`/users/${id}`, data).then((r) => r.data);

export const deactivateUser = (id: string) =>
  api.delete(`/users/${id}`).then((r) => r.data);

export const getSchedules = (employeeId: string) =>
  api.get(`/users/${employeeId}/schedules`).then((r) => r.data);

export const addSchedule = (employeeId: string, data: { daysOfWeek: number[]; startTime: string; endTime: string }) =>
  api.post(`/users/${employeeId}/schedules`, data).then((r) => r.data);

export const removeSchedule = (scheduleId: string) =>
  api.delete(`/users/schedules/${scheduleId}`).then((r) => r.data);
