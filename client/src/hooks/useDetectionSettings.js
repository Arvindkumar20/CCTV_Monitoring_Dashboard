// hooks/useDetectionSettings.js
import api from "@/services/api";
import { useState, useCallback, useRef, useEffect } from "react";
 // aapka axios instance
import { toast } from "sonner"; // ya aapka toast lib

const BASE = "/api/detection";
const SCHEDULE_BASE = "/api/cameras-settings";

export const useDetectionSettings = (cameraId) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [detectionSettings, setDetectionSettings] = useState(null);
  const [status, setStatus] = useState(null);
  const abortRef = useRef(null);

  // ═══════════════════════════════════════════
  // ✅ Fetch schedule + current active rules
  // ═══════════════════════════════════════════
  const fetchSchedule = useCallback(async () => {
    if (!cameraId) return;
    setLoading(true);
    try {
      const { data } = await api.get(
        `${SCHEDULE_BASE}/${cameraId}/schedule`
      );
      setSchedule(data.schedule || {});
      setDetectionSettings(data.detectionSettings || {});
      setRules(data.currentActiveRules || null);
      return data;
    } catch (err) {
      toast.error("Failed to load detection settings");
      console.error("fetchSchedule:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cameraId]);

  // ═══════════════════════════════════════════
  // ✅ Fetch live rules (lightweight, for polling)
  // ═══════════════════════════════════════════
  const fetchLiveRules = useCallback(async () => {
    if (!cameraId) return;
    try {
      const { data } = await api.get(`${BASE}/camera/${cameraId}/rules`);
      setRules(data.workerRules || data.computedRules || null);
      return data;
    } catch (err) {
      // Silent — worker might not be running
      return null;
    }
  }, [cameraId]);

  // ═══════════════════════════════════════════
  // ✅ Save full schedule
  // ═══════════════════════════════════════════
  const saveSchedule = useCallback(
    async (newSchedule) => {
      if (!cameraId) return false;
      setSaving(true);
      try {
        const { data } = await api.put(
          `${SCHEDULE_BASE}/${cameraId}/schedule`,
          { schedule: newSchedule }
        );
        setSchedule(data.schedule || newSchedule);
        setRules(data.currentActiveRules || null);
        toast.success("Schedule saved & applied");
        return true;
      } catch (err) {
        toast.error(err?.response?.data?.error || "Failed to save schedule");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [cameraId]
  );

  // ═══════════════════════════════════════════
  // ✅ Apply preset (24x7 / day-only / night-only / fire-24x7)
  // ═══════════════════════════════════════════
  const applyPreset = useCallback(
    async (preset) => {
      if (!cameraId) return false;
      setSaving(true);
      try {
        const { data } = await api.post(
          `${SCHEDULE_BASE}/${cameraId}/schedule/preset`,
          { preset }
        );
        setSchedule(data.schedule || {});
        setRules(data.currentActiveRules || null);
        toast.success(`Preset "${preset}" applied`);
        return true;
      } catch (err) {
        toast.error(err?.response?.data?.error || "Failed to apply preset");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [cameraId]
  );

  // ═══════════════════════════════════════════
  // ✅ 🧪 Test: Override rules for N seconds
  // ═══════════════════════════════════════════
  const overrideRules = useCallback(
    async (overrideRules, ttlSeconds = 60) => {
      if (!cameraId) return false;
      try {
        const { data } = await api.post(
          `${BASE}/camera/${cameraId}/rules/override`,
          { rules: overrideRules, ttlSeconds }
        );
        setRules(data.appliedRules);
        toast.success(`Override applied for ${ttlSeconds}s`);
        return true;
      } catch (err) {
        toast.error(err?.response?.data?.error || "Override failed");
        return false;
      }
    },
    [cameraId]
  );

  // ═══════════════════════════════════════════
  // ✅ 🧪 Test: Fire fake alert
  // ═══════════════════════════════════════════
  const fireTestAlert = useCallback(
    async (type = "person", confidence = 0.95) => {
      if (!cameraId) return false;
      try {
        await api.post(`${BASE}/camera/${cameraId}/test-alert`, {
          type,
          confidence,
        });
        toast.success(`Test ${type} alert fired`);
        return true;
      } catch (err) {
        toast.error("Test alert failed");
        return false;
      }
    },
    [cameraId]
  );

  // ═══════════════════════════════════════════
  // ✅ Force reload from DB
  // ═══════════════════════════════════════════
  const reload = useCallback(async () => {
    if (!cameraId) return false;
    try {
      await api.post(`${BASE}/camera/${cameraId}/reload`);
      await fetchSchedule();
      toast.success("Reloaded");
      return true;
    } catch (err) {
      toast.error("Reload failed");
      return false;
    }
  }, [cameraId, fetchSchedule]);

  // ═══════════════════════════════════════════
  // ✅ Auto-fetch on mount
  // ═══════════════════════════════════════════
  useEffect(() => {
    if (cameraId) fetchSchedule();
  }, [cameraId, fetchSchedule]);

  return {
    loading,
    saving,
    rules,
    schedule,
    detectionSettings,
    status,
    fetchSchedule,
    fetchLiveRules,
    saveSchedule,
    applyPreset,
    overrideRules,
    fireTestAlert,
    reload,
  };
};