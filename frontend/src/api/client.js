import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 10000,
});

const statsApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 15000,
});

export async function fireRequest(algorithm, config) {
  const start = performance.now();

  try {
    const res = await api.post('/api/request', { config }, {
      headers: {
        'X-Algorithm': algorithm,
        'X-User-Id': 'demo_user'
      }
    });
    const latency = performance.now() - start;
    return { ...res.data, status: res.status, latency };
  } catch (err) {
    if (err.response?.status === 429) {
      const latency = performance.now() - start;
      return { ...err.response.data, status: 429, latency };
    }
    throw err;
  }
}

export async function fetchStats() {
  const res = await statsApi.get('/api/stats/demo_user');
  return res.data;
}

export async function resetState() {
  await api.delete('/api/reset/demo_user');
}
