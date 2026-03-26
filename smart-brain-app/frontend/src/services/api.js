import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';

const http = axios.create({ baseURL: BASE, timeout: 15000 });

// ── Items ──────────────────────────────────────────────────────────────────────
export const getItems       = (params)      => http.get('/items', { params }).then(r => r.data);
export const getItem        = (id)          => http.get(`/items/${id}`).then(r => r.data);
export const createItem     = (data)        => http.post('/items', data).then(r => r.data);
export const updateItem     = (id, data)    => http.put(`/items/${id}`, data).then(r => r.data);
export const deleteItem     = (id)          => http.delete(`/items/${id}`).then(r => r.data);
export const getRelated     = (id)          => http.get(`/items/${id}/related`).then(r => r.data);
export const addHighlight   = (id, data)    => http.post(`/items/${id}/highlight`, data).then(r => r.data);

export const uploadFile = (formData) =>
  http.post('/items/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);

// ── Special endpoints ──────────────────────────────────────────────────────────
export const getStats     = ()  => http.get('/items/stats').then(r => r.data);
export const getResurface = ()  => http.get('/items/resurface').then(r => r.data);
export const getGraphData = ()  => http.get('/items/graph').then(r => r.data);

// ── Collections ────────────────────────────────────────────────────────────────
export const getCollections    = ()          => http.get('/collections').then(r => r.data);
export const createCollection  = (data)      => http.post('/collections', data).then(r => r.data);
export const updateCollection  = (id, data)  => http.put(`/collections/${id}`, data).then(r => r.data);
export const deleteCollection  = (id)        => http.delete(`/collections/${id}`).then(r => r.data);

export default http;
