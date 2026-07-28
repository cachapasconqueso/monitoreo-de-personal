import api from './client';

export const getMyRoute = (date?: string) =>
  api.get('/assignments/my-route', { params: { date } }).then((r) => r.data);

export const getMyWeek = (date?: string) =>
  api.get('/assignments/my-week', { params: { date } }).then((r) => r.data);

export const getBySupervisor = (date?: string) =>
  api.get('/assignments/by-supervisor', { params: { date } }).then((r) => r.data);

export const getByEmployee = (employeeId: string, date?: string) =>
  api.get(`/assignments/employee/${employeeId}`, { params: { date } }).then((r) => r.data);

export const getAllAssignments = (date?: string) =>
  api.get('/assignments/all', { params: { date } }).then((r) => r.data);

export const createAssignment = (data: { employeeId: string; date: string; clients: { clientId: string; order?: number }[] }) =>
  api.post('/assignments', data).then((r) => r.data);

export const removeAssignment = (id: string) =>
  api.delete(`/assignments/${id}`).then((r) => r.data);

export const createRecurringRoute = (data: {
  employeeId: string;
  clients: { clientId: string; order?: number }[];
  daysOfWeek: number[];
  startDate: string;
  endDate?: string;
}) => api.post('/assignments/recurring', data).then((r) => r.data);

export const getRecurringByEmployee = (employeeId: string) =>
  api.get(`/assignments/recurring/employee/${employeeId}`).then((r) => r.data);

export const removeRecurringRoute = (id: string) =>
  api.delete(`/assignments/recurring/${id}`).then((r) => r.data);
