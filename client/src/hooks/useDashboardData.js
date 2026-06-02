import { useState, useEffect } from "react";
import { dashboardApi } from "@/services/api/dashboard.api";

export const useDashboardData = () => {
  const [data, setData] = useState({
    stats: [],
    cameras: {
      total: 0,
      active: 0,
      online: 0,
      offline: 0,
      byStatus: {},
      byStream: {}
    },
    guardians: {
      total: 0,
      active: 0,
      pending: 0,
      locked: 0,
      suspended: 0
    },
    categories: {
      total: 0,
      subCategories: 0,
      nestedSubCategories: 0
    },
    activeUsers: 0,
    storage: {
      total: 100,
      used: 0,
      free: 100,
      percentage: 0
    },
    activities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getDashboardData();
        console.log(response)
        if (response?.success) {
          setData(response.data);
        }
        
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { data, loading, error };
};