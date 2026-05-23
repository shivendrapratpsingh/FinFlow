import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 30_000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const mobileApi = {
  getDashboard: (period: string) =>
    apiClient.get(`/dashboard/?period=${period}`).then((r) => r.data),
  getInvoices: (params?: object) =>
    apiClient.get("/billing/invoices", { params }).then((r) => r.data),
  getProducts: () =>
    apiClient.get("/inventory/products").then((r) => r.data),
  chat: (message: string, conversationId?: string) =>
    apiClient.post("/ai/chat", { message, conversation_id: conversationId }).then((r) => r.data),
};
