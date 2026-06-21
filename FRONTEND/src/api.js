import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ─── Auth ───────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/users/register', data),
  login:    (data) => api.post('/users/login', data),
  logout:   ()     => api.get('/users/logout'),
  getUser:  ()     => api.get('/users/user'),
};

// ─── Projects ───────────────────────────────────
export const projectAPI = {
  create: (data)  => api.post('/project/create', data),
  delete: (id)    => api.get(`/project/delete/${id}`),
};

// ─── Schemas ────────────────────────────────────
export const schemaAPI = {
  create:    (data)           => api.post('/schema/create', data),
  getById:   (id)             => api.get(`/schema/schemas/${id}`),
  update:    (id, data)       => api.put(`/schema/update/${id}`, data),
  delete:    (id)             => api.delete(`/schema/delete/${id}`),
};

// ─── Mock Data ──────────────────────────────────
export const mockAPI = {
  getData: (projectSlug, endpointName, params = {}) =>
    api.get(`/mock/${projectSlug}/${endpointName}`, { params }),
};

export default api;
