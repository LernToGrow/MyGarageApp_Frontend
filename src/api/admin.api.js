import client from './client';

export const login = (phone, password) =>
  client.post('/auth/login', { phone, password }).then(r => r.data);

export const getStats = () => client.get('/admin/stats').then(r => r.data);

export const listGarages = (params) => client.get('/admin/garages', { params }).then(r => r.data);
export const getGarage = (id) => client.get(`/admin/garages/${id}`).then(r => r.data);
export const getGarageUsers = (id) => client.get(`/admin/garages/${id}/users`).then(r => r.data);
export const getGarageJobs = (id, params) => client.get(`/admin/garages/${id}/jobs`, { params }).then(r => r.data);
export const getGarageCustomers = (id) => client.get(`/admin/garages/${id}/customers`).then(r => r.data);
export const getGarageParts = (id) => client.get(`/admin/garages/${id}/parts`).then(r => r.data);
export const getGarageServices = (id) => client.get(`/admin/garages/${id}/services`).then(r => r.data);
export const toggleGarageActive = (id) => client.patch(`/admin/garages/${id}/activate`).then(r => r.data);
export const updateGaragePlan = (id, body) => client.patch(`/admin/garages/${id}/plan`, body).then(r => r.data);

export const listUsers = (params) => client.get('/admin/users', { params }).then(r => r.data);
export const toggleUserActive = (id) => client.patch(`/admin/users/${id}/activate`).then(r => r.data);
export const resetUserPassword = (id, new_password) =>
  client.post(`/admin/users/${id}/reset-password`, { new_password }).then(r => r.data);

export const getRevenueAnalytics = (params) => client.get('/admin/analytics/revenue', { params }).then(r => r.data);
export const getJobAnalytics = () => client.get('/admin/analytics/jobs').then(r => r.data);
export const getInventoryAnalytics = () => client.get('/admin/analytics/inventory').then(r => r.data);

export const getLogs = (params) => client.get('/admin/logs', { params }).then(r => r.data);
