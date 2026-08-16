// frontend/src/hooks/useNVR.js
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nvrService } from '@/services/api/nvrService';


export const useNVR = () => {
  const queryClient = useQueryClient();

  // Get all NVR devices
  const useDevices = () => {
    return useQuery({
      queryKey: ['nvr', 'devices'],
      queryFn: nvrService.getDevices,
      staleTime: 5 * 60 * 1000,
      refetchInterval: 30000 // Refresh every 30 seconds
    });
  };

  // Get single NVR device
  const useDevice = (deviceId) => {
    return useQuery({
      queryKey: ['nvr', 'device', deviceId],
      queryFn: () => nvrService.getDevice(deviceId),
      enabled: !!deviceId,
      staleTime: 5 * 60 * 1000
    });
  };

  // Add NVR device mutation
  const addMutation = useMutation({
    mutationFn: nvrService.addDevice,
    onSuccess: () => {
      queryClient.invalidateQueries(['nvr', 'devices']);
    }
  });

  // Update NVR device mutation
  const updateMutation = useMutation({
    mutationFn: ({ deviceId, data }) => nvrService.updateDevice(deviceId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['nvr', 'devices']);
      queryClient.invalidateQueries(['nvr', 'device', data._id]);
    }
  });

  // Delete NVR device mutation
  const deleteMutation = useMutation({
    mutationFn: nvrService.deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries(['nvr', 'devices']);
    }
  });

  // Test connection mutation
  const testMutation = useMutation({
    mutationFn: nvrService.testConnection,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['nvr', 'devices']);
      queryClient.invalidateQueries(['nvr', 'device', variables]);
    }
  });

  // Start NVR recording mutation
  const startRecordingMutation = useMutation({
    mutationFn: nvrService.startRecording,
    onSuccess: () => {
      queryClient.invalidateQueries(['recordings', 'active']);
      queryClient.invalidateQueries(['nvr', 'devices']);
    }
  });

  // Stop NVR recording mutation
  const stopRecordingMutation = useMutation({
    mutationFn: nvrService.stopRecording,
    onSuccess: () => {
      queryClient.invalidateQueries(['recordings', 'active']);
      queryClient.invalidateQueries(['nvr', 'devices']);
    }
  });

  // Get camera stream
  const useCameraStream = (deviceId, cameraId) => {
    return useQuery({
      queryKey: ['nvr', 'stream', deviceId, cameraId],
      queryFn: () => nvrService.getCameraStream(deviceId, cameraId),
      enabled: !!deviceId && !!cameraId,
      staleTime: 60 * 1000
    });
  };

  // Add device function
  const addDevice = useCallback(async (deviceData) => {
    const result = await addMutation.mutateAsync(deviceData);
    return result;
  }, [addMutation]);

  // Update device function
  const updateDevice = useCallback(async (deviceId, data) => {
    const result = await updateMutation.mutateAsync({ deviceId, data });
    return result;
  }, [updateMutation]);

  // Delete device function
  const deleteDevice = useCallback(async (deviceId) => {
    const result = await deleteMutation.mutateAsync(deviceId);
    return result;
  }, [deleteMutation]);

  // Test connection function
  const testConnection = useCallback(async (deviceId) => {
    const result = await testMutation.mutateAsync(deviceId);
    return result;
  }, [testMutation]);

  // Start recording function
  const startRecording = useCallback(async (params) => {
    const result = await startRecordingMutation.mutateAsync(params);
    return result;
  }, [startRecordingMutation]);

  // Stop recording function
  const stopRecording = useCallback(async (params) => {
    const result = await stopRecordingMutation.mutateAsync(params);
    return result;
  }, [stopRecordingMutation]);

  return {
    // Data
    devices: useDevices().data?.devices || [],
    isLoadingDevices: useDevices().isLoading,
    deviceError: useDevices().error,

    // Single device
    useDevice,
    useCameraStream,

    // Mutations
    addDevice,
    updateDevice,
    deleteDevice,
    testConnection,
    startRecording,
    stopRecording,

    // Loading states
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTesting: testMutation.isPending,
    isStartingRecording: startRecordingMutation.isPending,
    isStoppingRecording: stopRecordingMutation.isPending,

    // Error states
    addError: addMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    testError: testMutation.error
  };
};