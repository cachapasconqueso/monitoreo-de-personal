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
