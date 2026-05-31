import axios from 'axios';
import garageClient from './garageClient';

// Plain instance with no redirect interceptor — safe for login calls
const baseClient = axios.create({ baseURL: '/api' });

export const garageApi = {
  login: (phone, password) =>
    baseClient.post('/auth/login', { phone, password }).then(r => r.data),

  setInvitePassword: (phone, token, new_password) =>
    baseClient.post('/auth/set-invite-password', { phone, token, new_password }).then(r => r.data),

  getMe: () =>
    garageClient.get('/auth/me').then(r => r.data),

  updateGarage: (data) =>
    garageClient.patch('/auth/garage', data).then(r => r.data),

  // Dashboard
  getDashboardSummary: (params) =>
    garageClient.get('/dashboard/summary', { params }).then(r => r.data),

  getDashboardMonthly: (params) =>
    garageClient.get('/dashboard/monthly', { params }).then(r => r.data),

  getDashboardAlerts: () =>
    garageClient.get('/dashboard/alerts').then(r => r.data),

  getDashboardPayments: (params) =>
    garageClient.get('/dashboard/payments', { params }).then(r => r.data),

  // Jobs
  listJobs: (params) =>
    garageClient.get('/jobs', { params }).then(r => r.data),

  getJob: (id) =>
    garageClient.get(`/jobs/${id}`).then(r => r.data),

  deleteJob: (id) =>
    garageClient.delete(`/jobs/${id}`).then(r => r.data),

  remitPayment: (id) =>
    garageClient.patch(`/jobs/${id}/remit`).then(r => r.data),

  // Employees
  listEmployees: () =>
    garageClient.get('/employees').then(r => r.data),

  inviteEmployee: (data) =>
    garageClient.post('/employees/invite', data).then(r => r.data),

  updatePermissions: (id, permissions) =>
    garageClient.patch(`/employees/${id}/permissions`, { permissions }).then(r => r.data),

  deactivateEmployee: (id) =>
    garageClient.patch(`/employees/${id}/deactivate`).then(r => r.data),

  getPerformance: (id, params) =>
    garageClient.get(`/employees/${id}/performance`, { params }).then(r => r.data),

  // Parts / Inventory
  listParts: () =>
    garageClient.get('/parts').then(r => r.data),

  getLowStock: () =>
    garageClient.get('/parts/low-stock').then(r => r.data),

  createPart: (data) =>
    garageClient.post('/parts', data).then(r => r.data),

  updatePart: (id, data) =>
    garageClient.patch(`/parts/${id}`, data).then(r => r.data),

  adjustStock: (id, data) =>
    garageClient.patch(`/parts/${id}/stock`, data).then(r => r.data),

  // Services
  listServices: () =>
    garageClient.get('/services').then(r => r.data),

  createService: (data) =>
    garageClient.post('/services', data).then(r => r.data),

  updateService: (id, data) =>
    garageClient.patch(`/services/${id}`, data).then(r => r.data),
};
