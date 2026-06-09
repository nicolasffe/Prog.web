export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/_/backend/api' : 'http://localhost:3333/api');
