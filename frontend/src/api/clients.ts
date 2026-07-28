import api from './client';

export const getClients = (search?: string) =>
  api.get('/clients', { params: { search } }).then((r) => r.data);

export const createClient = (data: { name: string; address: string; lat: number; lng: number; phone?: string; email?: string; notes?: string }) =>
  api.post('/clients', data).then((r) => r.data);

export const updateClient = (id: string, data: object) =>
  api.patch(`/clients/${id}`, data).then((r) => r.data);

export const deleteClient = (id: string) =>
  api.delete(`/clients/${id}`).then((r) => r.data);
