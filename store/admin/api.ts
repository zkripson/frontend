import { axiosInstance } from "../../utils/axios";
import { HealthStatus, MetricsData } from "./types";

export const adminApi = {
  getHealth: async (): Promise<HealthStatus> => {
    const response = await axiosInstance.get("/admin/health");
    return response.data;
  },

  getMetrics: async (): Promise<MetricsData> => {
    const response = await axiosInstance.get("/admin/metrics");
    return response.data;
  },
};