import api from './client';

export const visitCheckIn = (data: { clientId: string; assignmentId?: string; lat?: number; lng?: number }) =>
  api.post('/visits/check-in', data).then((r) => r.data);

export const visitCheckOut = (data: { visitId: string; comment?: string; lat?: number; lng?: number }) =>
  api.post('/visits/check-out', data).then((r) => r.data);

export const getTodayVisits = () => api.get('/visits/today').then((r) => r.data);

export const getMyVisitHistory = (from?: string, to?: string) =>
  api.get('/visits/my-history', { params: { from, to } }).then((r) => r.data);

export const getAllVisits = (date?: string, employeeId?: string, from?: string, to?: string) =>
  api.get('/visits/all', { params: { date, employeeId, from, to } }).then((r) => r.data);

export const getVisitsByEmployeeRange = (employeeId: string, from?: string, to?: string) =>
  api.get(`/visits/by-employee/${employeeId}`, { params: { from, to } }).then((r) => r.data);

export const updateVisitComment = (visitId: string, comment: string) =>
  api.patch(`/visits/${visitId}/comment`, { comment }).then((r) => r.data);
