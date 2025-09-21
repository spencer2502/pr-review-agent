const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const apiClient = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  },

  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok)
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    return response.json();
  },
};
