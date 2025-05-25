export interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: number;
  services: {
    durableObjects: "operational" | "degraded" | "down";
    database: "operational" | "degraded" | "down";
    blockchain: "operational" | "degraded" | "down";
  };
}

export interface MetricsData {
  activeSessions: number;
  totalGames: number;
  playersOnline: number;
  performance: {
    avgResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
  };
}

export interface AdminState {
  health: HealthStatus | null;
  metrics: MetricsData | null;
  loading: {
    health: boolean;
    metrics: boolean;
  };
  error: {
    health: string | null;
    metrics: string | null;
  };
  lastUpdated: {
    health: number | null;
    metrics: number | null;
  };
}

export const initialAdminState: AdminState = {
  health: null,
  metrics: null,
  loading: {
    health: false,
    metrics: false,
  },
  error: {
    health: null,
    metrics: null,
  },
  lastUpdated: {
    health: null,
    metrics: null,
  },
};