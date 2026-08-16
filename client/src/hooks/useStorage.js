// frontend/src/hooks/useStorage.js
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { storageService } from '@/services/api/storageService';

export const useStorage = () => {
  const queryClient = useQueryClient();

  // Get storage config
  const useConfig = () => {
    return useQuery({
      queryKey: ['storage', 'config'],
      queryFn: storageService.getConfig,
      staleTime: 5 * 60 * 1000
    });
  };

  // Get storage usage
  const useUsage = () => {
    return useQuery({
      queryKey: ['storage', 'usage'],
      queryFn: storageService.getUsage,
      staleTime: 60 * 1000,
      refetchInterval: 30000 // Refresh every 30 seconds
    });
  };

  // Get storage metrics
  const useMetrics = () => {
    return useQuery({
      queryKey: ['storage', 'metrics'],
      queryFn: storageService.getMetrics,
      staleTime: 60 * 1000,
      refetchInterval: 60000 // Refresh every minute
    });
  };

  // Update config mutation
  const updateConfigMutation = useMutation({
    mutationFn: storageService.updateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries(['storage', 'config']);
      queryClient.invalidateQueries(['storage', 'usage']);
      queryClient.invalidateQueries(['storage', 'metrics']);
    }
  });

  // Connect external storage mutation
  const connectExternalMutation = useMutation({
    mutationFn: storageService.connectExternal,
    onSuccess: () => {
      queryClient.invalidateQueries(['storage', 'config']);
      queryClient.invalidateQueries(['storage', 'usage']);
    }
  });

  // Disconnect external storage mutation
  const disconnectExternalMutation = useMutation({
    mutationFn: storageService.disconnectExternal,
    onSuccess: () => {
      queryClient.invalidateQueries(['storage', 'config']);
      queryClient.invalidateQueries(['storage', 'usage']);
    }
  });

  // Check availability function
  const checkAvailability = useCallback(async (storageType) => {
    return await storageService.checkAvailability(storageType);
  }, []);

  // Update config function
  const updateConfig = useCallback(async (config) => {
    const result = await updateConfigMutation.mutateAsync(config);
    return result;
  }, [updateConfigMutation]);

  // Connect external function
  const connectExternal = useCallback(async (deviceData) => {
    const result = await connectExternalMutation.mutateAsync(deviceData);
    return result;
  }, [connectExternalMutation]);

  // Disconnect external function
  const disconnectExternal = useCallback(async (deviceId) => {
    const result = await disconnectExternalMutation.mutateAsync(deviceId);
    return result;
  }, [disconnectExternalMutation]);

  const config = useConfig().data?.config || null;
  const usage = useUsage().data?.usage || null;
  const metrics = useMetrics().data?.metrics || null;

  return {
    // Data
    config,
    usage,
    metrics,
    isLoading: useConfig().isLoading || useUsage().isLoading,
    error: useConfig().error || useUsage().error,

    // Functions
    updateConfig,
    connectExternal,
    disconnectExternal,
    checkAvailability,

    // Loading states
    isUpdating: updateConfigMutation.isPending,
    isConnecting: connectExternalMutation.isPending,
    isDisconnecting: disconnectExternalMutation.isPending,

    // Error states
    updateError: updateConfigMutation.error,
    connectError: connectExternalMutation.error,
    disconnectError: disconnectExternalMutation.error
  };
};