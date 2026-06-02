// hooks/useActivityLogs.js
import { useState, useEffect } from "react";

// Mock data
const mockStats = {
  successful: 1284,
  failed: 14,
  downtime: 2,
};

const mockGuardianLogs = [
  {
    time: "12:45:12 PM",
    date: "Feb 16, 2026",
    guardianName: "Mahesh Singh",
    studentInfo: "Rohan (10-A)",
    device: "iPhone 14",
    ipAddress: "192.168.1.104",
  },
  {
    time: "11:30:22 AM",
    date: "Feb 16, 2026",
    guardianName: "Anjali Kapoor",
    studentInfo: "Sana (12-B)",
    device: "Samsung Galaxy S23",
    ipAddress: "192.168.1.105",
  },
  {
    time: "10:15:45 AM",
    date: "Feb 16, 2026",
    guardianName: "Rajesh Kumar",
    studentInfo: "Priya (8-C)",
    device: "Windows PC",
    ipAddress: "192.168.1.106",
  },
];

const mockFailedLogs = [
  {
    time: "12:10:05 PM",
    date: "Feb 16, 2026",
    target: "+91 98765 43210",
    type: "Guardian Account",
    reason: "Invalid Password",
    location: "Delhi, India",
    ipAddress: "103.45.2.11",
  },
  {
    time: "11:45:32 AM",
    date: "Feb 16, 2026",
    target: "+91 91234 56789",
    type: "Guardian Account",
    reason: "Account Locked",
    location: "Mumbai, India",
    ipAddress: "203.34.5.22",
  },
  {
    time: "09:20:15 AM",
    date: "Feb 16, 2026",
    target: "admin@school.com",
    type: "Admin Login",
    reason: "Invalid Credentials",
    location: "Bangalore, India",
    ipAddress: "182.67.3.44",
  },
];

const mockCameraLogs = [
  {
    time: "09:00 AM",
    date: "Feb 16, 2026",
    cameraName: "Main Gate Entrance",
    cameraId: "CAM-7721",
    duration: "45 Minutes",
    errorType: "Connection Timeout",
    status: "RESOLVED",
  },
  {
    time: "02:30 PM",
    date: "Feb 15, 2026",
    cameraName: "Playground East",
    cameraId: "CAM-4423",
    duration: "2 Hours",
    errorType: "Power Failure",
    status: "RESOLVED",
  },
  {
    time: "08:15 PM",
    date: "Feb 15, 2026",
    cameraName: "Library Corridor",
    cameraId: "CAM-3356",
    duration: "15 Minutes",
    errorType: "Network Issue",
    status: "RESOLVED",
  },
];

// Mock API functions
const fetchStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockStats;
};

const fetchGuardianLogs = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockGuardianLogs;
};

const fetchFailedLogs = async () => {
  await new Promise(resolve => setTimeout(resolve, 900));
  return mockFailedLogs;
};

const fetchCameraLogs = async () => {
  await new Promise(resolve => setTimeout(resolve, 1100));
  return mockCameraLogs;
};

export const useActivityLogs = () => {
  const [stats, setStats] = useState(null);
  const [guardianLogs, setGuardianLogs] = useState([]);
  const [failedLogs, setFailedLogs] = useState([]);
  const [cameraLogs, setCameraLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, guardianData, failedData, cameraData] = await Promise.all([
          fetchStats(),
          fetchGuardianLogs(),
          fetchFailedLogs(),
          fetchCameraLogs(),
        ]);

        setStats(statsData);
        setGuardianLogs(guardianData);
        setFailedLogs(failedData);
        setCameraLogs(cameraData);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load activity logs");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const exportToCSV = () => {
    // Combine all logs for export
    const allLogs = [
      ...guardianLogs.map(log => ({ type: 'Guardian Login', ...log })),
      ...failedLogs.map(log => ({ type: 'Failed Attempt', ...log })),
      ...cameraLogs.map(log => ({ type: 'Camera Downtime', ...log })),
    ];

    // Convert to CSV
    const headers = Object.keys(allLogs[0] || {}).join(',');
    const rows = allLogs.map(log => Object.values(log).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const viewIPInfo = (log) => {
    // In a real app, this would open a modal with IP geolocation info
    console.log('View IP info for:', log);
  };

  return {
    stats,
    guardianLogs,
    failedLogs,
    cameraLogs,
    loading,
    error,
    exportToCSV,
    viewIPInfo,
  };
};