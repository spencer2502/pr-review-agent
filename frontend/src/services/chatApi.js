import { apiClient } from "./api";

export const chatApi = {
  sendMessage: async (prId, message, mentorMode) => {
    return await apiClient.post(`/api/chat/${prId}`, {
      content: message,
      mentor_mode: mentorMode,
    });
  },

  getChatHistory: async (prId) => {
    return await apiClient.get(`/api/chat/history/${prId}`);
  },

  // helper mentor list for UI
  mentorPersonas: [
    { persona_id: "balanced", name: "AI Reviewer" },
    { persona_id: "sarah_lead", name: "Sarah (Team Lead)" },
    { persona_id: "alex_security", name: "Alex (Security Expert)" },
    { persona_id: "jordan_perf", name: "Jordan (Performance Guru)" },
  ],
};
