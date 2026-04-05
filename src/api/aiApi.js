import axiosInstance from './axiosInstance';

/**
 * Sends a chat message to the AI assistant.
 * POST /api/ai/chat  →  { reply: string }
 */
export const sendAiMessage = (message) =>
  axiosInstance.post('/ai/chat', { message }).then((r) => r.data);
