import api from './api';

export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 4000 });
    return response.data?.status === 'ok';
  } catch (error) {
    return false;
  }
};
