import api from './api';

export const sendChatMessage = async (message) => {
  const response = await api.post('/api/chat', { message });
  return response.data; // { answer: string, ai_available: boolean }
};
