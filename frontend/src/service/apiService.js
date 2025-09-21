// src/services/apiService.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // ✅ point to your backend
});

// adjust endpoint path depending on your backend
export const sendPRMessage = (data) => api.post("/chat", data);

export default api;
