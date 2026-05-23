import { api } from "@/lib/api";

export const dashboardApi = {
  getDashboard: (period: string) => api.get(`/dashboard/?period=${period}`),
  getKPIs: (period: string) => api.get(`/dashboard/kpis?period=${period}`),
  getAlerts: () => api.get("/dashboard/alerts"),
};
