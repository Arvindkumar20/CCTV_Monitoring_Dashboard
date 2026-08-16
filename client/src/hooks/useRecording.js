// // frontend/src/hooks/useRecording.js
// import { useState, useCallback } from 'react';
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { recordingService } from '@/services/api/recordingService';

// export const useRecording = () => {
//   const queryClient = useQueryClient();
//   const [currentRecording, setCurrentRecording] = useState(null);

//   const startMutation = useMutation({
//     mutationFn: recordingService.startRecording,
//     onSuccess: (data) => {
//       setCurrentRecording(data.recording);
//       queryClient.invalidateQueries(['recordings', 'active']);
//     }
//   });

//   const stopMutation = useMutation({
//     mutationFn: recordingService.stopRecording,
//     onSuccess: () => {
//       setCurrentRecording(null);
//       queryClient.invalidateQueries(['recordings', 'active']);
//       queryClient.invalidateQueries(['recordings', 'list']);
//     }
//   });

//   const startRecording = useCallback(async (params) => {
//     const result = await startMutation.mutateAsync(params);
//     return result;
//   }, [startMutation]);

//   const stopRecording = useCallback(async () => {
//     if (!currentRecording) return;
//     const result = await stopMutation.mutateAsync(currentRecording._id);
//     return result;
//   }, [currentRecording, stopMutation]);

//   const downloadRecording = useCallback(async (recordingId, format) => {
//     return await recordingService.downloadRecording(recordingId, format);
//   }, []);

//   const useRecordings = (filters) => {
//     return useQuery({
//       queryKey: ['recordings', 'list', filters],
//       queryFn: () => recordingService.getRecordings(filters),
//       staleTime: 5 * 60 * 1000
//     });
//   };

//   const useActiveRecordings = () => {
//     return useQuery({
//       queryKey: ['recordings', 'active'],
//       queryFn: recordingService.getActiveRecordings,
//       refetchInterval: 5000
//     });
//   };

//   return {
//     startRecording,
//     stopRecording,
//     downloadRecording,
//     useRecordings,
//     useActiveRecordings,
//     currentRecording,
//     isStarting: startMutation.isPending,
//     isStopping: stopMutation.isPending
//   };
// };


// frontend/src/hooks/useRecording.js
import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import recordingService from '@/services/api/recordingService';
// Fix the import path - remove /api/ since recordingService.js is directly in services folder


export const useRecording = () => {
  const queryClient = useQueryClient();
  const [currentRecording, setCurrentRecording] = useState(null);

  const startMutation = useMutation({
    mutationFn: recordingService.startRecording,
    onSuccess: (data) => {
      setCurrentRecording(data.recording);
      queryClient.invalidateQueries(['recordings', 'active']);
    },
    onError: (error) => {
      console.error('Start recording mutation error:', error);
    }
  });

  const stopMutation = useMutation({
    mutationFn: recordingService.stopRecording,
    onSuccess: () => {
      setCurrentRecording(null);
      queryClient.invalidateQueries(['recordings', 'active']);
      queryClient.invalidateQueries(['recordings', 'list']);
    },
    onError: (error) => {
      console.error('Stop recording mutation error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: recordingService.deleteRecording,
    onSuccess: () => {
      queryClient.invalidateQueries(['recordings', 'list']);
    },
    onError: (error) => {
      console.error('Delete recording mutation error:', error);
    }
  });

  const startRecording = useCallback(async (params) => {
    try {
      const result = await startMutation.mutateAsync(params);
      return result;
    } catch (error) {
      console.error('Start recording error:', error);
      throw error;
    }
  }, [startMutation]);

  const stopRecording = useCallback(async () => {
    if (!currentRecording) {
      console.warn('No active recording to stop');
      return;
    }
    try {
      const result = await stopMutation.mutateAsync(currentRecording._id);
      return result;
    } catch (error) {
      console.error('Stop recording error:', error);
      throw error;
    }
  }, [currentRecording, stopMutation]);

  const deleteRecording = useCallback(async (recordingId) => {
    try {
      const result = await deleteMutation.mutateAsync(recordingId);
      return result;
    } catch (error) {
      console.error('Delete recording error:', error);
      throw error;
    }
  }, [deleteMutation]);

  const downloadRecording = useCallback(async (recordingId, format) => {
    try {
      return await recordingService.downloadRecording(recordingId, format);
    } catch (error) {
      console.error('Download recording error:', error);
      throw error;
    }
  }, []);

  const useRecordings = (filters) => {
    return useQuery({
      queryKey: ['recordings', 'list', filters],
      queryFn: () => recordingService.getRecordings(filters),
      staleTime: 5 * 60 * 1000,
      retry: 1,
      onError: (error) => {
        console.error('Fetch recordings error:', error);
      }
    });
  };

  const useActiveRecordings = () => {
    return useQuery({
      queryKey: ['recordings', 'active'],
      queryFn: recordingService.getActiveRecordings,
      refetchInterval: 5000,
      retry: 1,
      onError: (error) => {
        console.error('Fetch active recordings error:', error);
      }
    });
  };

  return {
    startRecording,
    stopRecording,
    deleteRecording,
    downloadRecording,
    useRecordings,
    useActiveRecordings,
    currentRecording,
    isStarting: startMutation.isPending,
    isStopping: stopMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};