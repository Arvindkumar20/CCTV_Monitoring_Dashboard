import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { parentApi } from "@/services/api/parent.api";

export const useParentPortal = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [streams, setStreams] = useState({});

  // Check for existing session
  useEffect(() => {
    const token = localStorage.getItem("parentToken");
    const savedUser = localStorage.getItem("parentUser");
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await parentApi.login(credentials);

      if (response?.success) {
        const userData = response.data.guardian;
        const cameras = response.data.cameras;
        const streamsData = response.data.streams;

        // Store user data with children info
        const userWithChildren = {
          ...userData,
          children: cameras.map(camera => ({
            id: camera._id,
            name: camera.name,
            class: camera.category?.main || "Class",
            section: camera.category?.sub || "Section",
            school: "Spring Valley School",
            hasCamera: camera.streamStatus === "online",
            streamKey: streamsData.find(s => s.cameraId === camera._id)?.streamKey,
            streamUrl: streamsData.find(s => s.cameraId === camera._id)?.streamUrl,
            hlsUrl: streamsData.find(s => s.cameraId === camera._id)?.hlsUrl,
            webrtcUrl: streamsData.find(s => s.cameraId === camera._id)?.webrtcUrl
          }))
        };

        setUser(userWithChildren);
        setIsAuthenticated(true);
        
        // Store in localStorage
        localStorage.setItem("parentToken", response.data.token);
        localStorage.setItem("parentUser", JSON.stringify(userWithChildren));

        // Store streams
        const streamsMap = {};
        streamsData.forEach(stream => {
          streamsMap[stream.cameraId] = stream;
        });
        setStreams(streamsMap);

        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: `Welcome ${userData.guardianName}!`,
          timer: 2000,
          showConfirmButton: false
        });

        return true;
      }
      return false;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.response?.data?.message || err.message || "Invalid credentials"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API
      await parentApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear local storage and state
      localStorage.removeItem("parentToken");
      localStorage.removeItem("parentUser");
      setUser(null);
      setIsAuthenticated(false);
      setStreams({});
    }
  };

  // Get child by ID
  const getChildById = useCallback((childId) => {
    return user?.children?.find(child => child.id === childId) || null;
  }, [user]);

  // Start stream for a child
  const startStream = async (cameraId) => {
    try {
      setLoading(true);
      const response = await parentApi.startStream(cameraId);
      
      if (response?.success) {
        setStreams(prev => ({
          ...prev,
          [cameraId]: response.data
        }));

        // Update user's children with stream info
        setUser(prev => ({
          ...prev,
          children: prev.children.map(child => 
            child.id === cameraId 
              ? { 
                  ...child, 
                  streamKey: response.data.streamKey,
                  streamUrl: response.data.streamUrl,
                  hlsUrl: response.data.hlsUrl,
                  webrtcUrl: response.data.webrtcUrl,
                  hasCamera: true 
                }
              : child
          )
        }));

        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Start stream error:", err);
      Swal.fire({
        icon: "error",
        title: "Stream Error",
        text: err.message || "Failed to start stream"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Stop stream
  const stopStream = async (streamKey) => {
    try {
      await parentApi.stopStream(streamKey);
    } catch (err) {
      console.error("Stop stream error:", err);
    }
  };

  // Get stream status
  const getStreamStatus = async (streamKey) => {
    try {
      const response = await parentApi.getStreamStatus(streamKey);
      return response?.data;
    } catch (err) {
      console.error("Get stream status error:", err);
      return null;
    }
  };

  // Refresh streams
  const refreshStreams = async () => {
    try {
      const response = await parentApi.getStreams();
      
      if (response?.success) {
        const streamsMap = {};
        response.data.forEach(stream => {
          streamsMap[stream.cameraId] = stream;
        });
        setStreams(streamsMap);

        // Update user's children with stream status
        setUser(prev => ({
          ...prev,
          children: prev.children.map(child => ({
            ...child,
            hasCamera: streamsMap[child.id]?.isActive || false,
            streamKey: streamsMap[child.id]?.streamKey,
            streamUrl: streamsMap[child.id]?.streamUrl,
            hlsUrl: streamsMap[child.id]?.hlsUrl,
            webrtcUrl: streamsMap[child.id]?.webrtcUrl
          }))
        }));
      }
    } catch (err) {
      console.error("Refresh streams error:", err);
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    streams,
    login,
    logout,
    getChildById,
    startStream,
    stopStream,
    getStreamStatus,
    refreshStreams
  };
};