import axios from 'axios';

// In production (Vercel), use /api prefix so Vercel rewrites proxy to Railway.
// In local dev, Vite proxy handles forwarding to the backend (no prefix needed).
// If VITE_API_URL is set, use it directly (e.g. for direct backend connection).
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.detail ?? err.message ?? 'Request failed';
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
  }
);
