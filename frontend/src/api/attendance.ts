import api from './client';

export const getToday = () => api.get('/attendance/today').then((r) => r.data);
export const checkIn = (timestamp?: string) => api.post('/attendance/check-in', { timestamp }).then((r) => r.data);
export const checkOut = (timestamp?: string) => api.post('/attendance/check-out', { timestamp }).then((r) => r.data);
export const lunchStart = (timestamp?: string) => api.post('/attendance/lunch-start', { timestamp }).then((r) => r.data);
export const lunchEnd = (timestamp?: string) => api.post('/attendance/lunch-end', { timestamp }).then((r) => r.data);
export const getMyHistory = (from?: string, to?: string) =>
  api.get('/attendance/my-history', { params: { from, to } }).then((r) => r.data);
export const getTeamAttendance = (date?: string) =>
  api.get('/attendance/team', { params: { date } }).then((r) => r.data);
export const getEarlyDepartures = (date?: string) =>
  api.get('/attendance/early-departures', { params: { date } }).then((r) => r.data);
export const getIncompleteRoutes = (date?: string) =>
  api.get('/attendance/incomplete-routes', { params: { date } }).then((r) => r.data);

export const getAllAttendance = (userId?: string, from?: string, to?: string) =>
  api.get('/attendance/all', { params: { userId, from, to } }).then((r) => r.data);
