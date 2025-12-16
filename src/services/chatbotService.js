import api from './api';

// Simple chatbot service
// Assumes backend exposes POST /chatbot/ask { question: string }
export const ask = async ({ question }) => {
  const response = await api.post('chatbot/ask', { question });
  // Interceptor unwraps response.data
  return response.data;
};

const chatbotService = { ask };
export default chatbotService;
