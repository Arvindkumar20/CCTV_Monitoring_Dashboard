// adminDashboard/cameras/CameraDetectionSettings.jsx
import React, {
  useState,
  useMemo,
  useCallback,
  memo,
  useEffect,
} from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Loader2,
  Sun,
  Moon,
  Clock,
  Flame,
  User,
  Wind,
  Car,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  RotateCcw,
  Zap,
  Bell,
  CheckCircle2,
  XCircle,
  Info,
  Calendar,
  Globe,
} from "lucide-react";
import { useDetectionSettings } from "@/hooks/useDetectionSettings";

// ═══════════════════════════════════════════
// 📅 DAYS CONFIG
// ═══════════════════════════════════════════
const DAYS = [
  { value: 0, label: "Sun", short: "S" },
  { value: 1, label: "Mon", short: "M" },
  { value: 2, label: "Tue", short: "T" },
  { value: 3, label: "Wed", short: "W" },
  { value: 4, label: "Thu", short: "T" },
  { value: 5, label: "Fri", short: "F" },
  { value: 6, label: "Sat", short: "S" },
];

// ═══════════════════════════════════════════
// 🎯 DETECTION TYPES
// ═══════════════════════════════════════════
const DETECTION_TYPES = [
  {
    key: "person",
    label: "Person",
    icon: User,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    key: "fire",
    label: "Fire",
    icon: Flame,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  {
    key: "smoke",
    label: "Smoke",
    icon: Wind,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  {
    key: "vehicle",
    label: "Vehicle",
    icon: Car,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
];

const PRESETS = [
  {
    key: "24x7",
    label: "24×7",
    desc: "Always on",
    icon: Zap,
  },
  {
    key: "day-only",
    label: "Day Only",
    desc: "6 AM – 6 PM",
    icon: Sun,
  },
  {
    key: "night-only",
    label: "Night Only",
    desc: "10 PM – 6 AM",
    icon: Moon,
  },
  {
    key: "fire-24x7",
    label: "Fire 24×7",
    desc: "Fire always, person at night",
    icon: Flame,
  },
];

// ═══════════════════════════════════════════
// 🎨 SMALL UI PIECES
// ═══════════════════════════════════════════

const SectionTitle = memo(({ icon: Icon, title, subtitle, right }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      {Icon && (
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-slate-600" />
        </div>
      )}
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {subtitle && (
          <p className="text-[10px] text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
    {right}
  </div>
));
SectionTitle.displayName = "SectionTitle";

// ═══════════════════════════════════════════
// 🔴 LIVE STATUS CARD
// ═══════════════════════════════════════════
const LiveStatusCard = memo(({ rules }) => {
  if (!rules) return null;

  const active = DETECTION_TYPES.filter((d) => rules[d.key]);
  const inactive = DETECTION_TYPES.filter((d) => !rules[d.key]);

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-bold uppercase text-slate-600 tracking-wider">
          Live Now
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {active.length === 0 && (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-500 border-slate-200 text-[10px]"
          >
            <XCircle className="w-2.5 h-2.5 mr-1" />
            No detection active
          </Badge>
        )}
        {active.map((d) => {
          const Icon = d.icon;
          return (
            <Badge
              key={d.key}
              variant="outline"
              className={`${d.bg} ${d.color} ${d.border} text-[10px] font-bold inline-flex items-center gap-1`}
            >
              <Icon className="w-2.5 h-2.5" />
              {d.label}
            </Badge>
          );
        })}
      </div>

      {rules._scheduleActive === false && (
        <p className="text-[9px] text-slate-400 mt-2 flex items-center gap-1">
          <Info className="w-2.5 h-2.5" />
          Schedule disabled — always on
        </p>
      )}
    </div>
  );
});
LiveStatusCard.displayName = "LiveStatusCard";

// ═══════════════════════════════════════════
// 🎛️ MASTER TOGGLES
// ═══════════════════════════════════════════
const MasterToggles = memo(({ settings, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {DETECTION_TYPES.map((d) => {
        const Icon = d.icon;
        const key = `detect${d.key.charAt(0).toUpperCase() + d.key.slice(1)}`;
        const value = settings?.[key] ?? false;

        return (
          <label
            key={d.key}
            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
              value
                ? `${d.bg} ${d.border}`
                : "bg-white border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 ${
                value ? d.color : "text-slate-400"
              }`}
            />
            <span
              className={`text-xs font-semibold flex-1 ${
                value ? "text-slate-800" : "text-slate-500"
              }`}
            >
              {d.label}
            </span>
            <Switch
              checked={value}
              onCheckedChange={(checked) => onChange(key, checked)}
            />
          </label>
        );
      })}
    </div>
  );
});
MasterToggles.displayName = "MasterToggles";

// ═══════════════════════════════════════════
// 📅 DAY SELECTOR
// ═══════════════════════════════════════════
const DaySelector = memo(({ days, onChange }) => {
  const toggle = useCallback(
    (day) => {
      const set = new Set(days);
      if (set.has(day)) set.delete(day);
      else set.add(day);
      onChange([...set].sort());
    },
    [days, onChange]
  );

  const allSelected = days.length === 7;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(allSelected ? [] : [0, 1, 2, 3, 4, 5, 6])}
        className="text-[9px] font-bold text-slate-500 hover:text-slate-800 px-1.5 py-1 rounded hover:bg-slate-100 transition"
      >
        {allSelected ? "CLEAR" : "ALL"}
      </button>
      <div className="flex gap-0.5">
        {DAYS.map((d) => {
          const active = days.includes(d.value);
          return (
            <button
              key={d.value}
              type="button"
              onClick={() => toggle(d.value)}
              className={`w-6 h-6 text-[10px] font-bold rounded transition-all ${
                active
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-400 hover:bg-slate-200"
              }`}
              title={d.label}
            >
              {d.short}
            </button>
          );
        })}
      </div>
    </div>
  );
});
DaySelector.displayName = "DaySelector";

// ═══════════════════════════════════════════
// 🕐 TIME WINDOW ROW
// ═══════════════════════════════════════════
const TimeWindowRow = memo(({ window, onUpdate, onRemove, canRemove }) => {
  const isOvernight = useMemo(() => {
    if (!window.startTime || !window.endTime) return false;
    return window.startTime > window.endTime;
  }, [window.startTime, window.endTime]);

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
      <div className="flex-1 flex items-center gap-2">
        <Clock className="w-3 h-3 text-slate-400" />
        <Input
          type="time"
          value={window.startTime || "00:00"}
          onChange={(e) => onUpdate({ ...window, startTime: e.target.value })}
          className="h-7 text-xs w-[110px] font-mono"
        />
        <span className="text-[10px] text-slate-400">to</span>
        <Input
          type="time"
          value={window.endTime || "23:59"}
          onChange={(e) => onUpdate({ ...window, endTime: e.target.value })}
          className="h-7 text-xs w-[110px] font-mono"
        />
        {isOvernight && (
          <Badge
            variant="outline"
            className="bg-indigo-50 text-indigo-600 border-indigo-200 text-[9px] font-bold"
          >
            <Moon className="w-2 h-2 mr-0.5" />
            OVERNIGHT
          </Badge>
        )}
      </div>
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
});
TimeWindowRow.displayName = "TimeWindowRow";

// ═══════════════════════════════════════════
// 🎯 DETECTION SLOT CARD
// ═══════════════════════════════════════════
const DetectionSlotCard = memo(({ slot, type, onUpdate, onRemove }) => {
  const [open, setOpen] = useState(true);
  const Icon = type.icon;

  const updateWindow = useCallback(
    (idx, newWindow) => {
      const windows = [...(slot.timeWindows || [])];
      windows[idx] = newWindow;
      onUpdate({ ...slot, timeWindows: windows });
    },
    [slot, onUpdate]
  );

  const removeWindow = useCallback(
    (idx) => {
      const windows = (slot.timeWindows || []).filter((_, i) => i !== idx);
      onUpdate({ ...slot, timeWindows: windows });
    },
    [slot, onUpdate]
  );

  const addWindow = useCallback(() => {
    const windows = [
      ...(slot.timeWindows || []),
      { startTime: "22:00", endTime: "06:00" },
    ];
    onUpdate({ ...slot, timeWindows: windows });
  }, [slot, onUpdate]);

  const noWindows = !slot.timeWindows || slot.timeWindows.length === 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={`rounded-xl border-2 transition-all ${
          slot.enabled ? `${type.border} ${type.bg}` : "border-slate-200 bg-white"
        }`}
      >
        {/* Header */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-2 p-2.5 cursor-pointer">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((v) => !v);
              }}
              className="text-slate-400 hover:text-slate-700"
            >
              {open ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center ${
                slot.enabled ? "bg-white" : "bg-slate-100"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  slot.enabled ? type.color : "text-slate-400"
                }`}
              />
            </div>

            <div className="flex-1">
              <p
                className={`text-xs font-bold ${
                  slot.enabled ? "text-slate-800" : "text-slate-500"
                }`}
              >
                {type.label} Detection
              </p>
              <p className="text-[10px] text-slate-500">
                {noWindows
                  ? "Always active"
                  : `${slot.timeWindows.length} time window${
                      slot.timeWindows.length > 1 ? "s" : ""
                    } • ${slot.days.length} day${
                      slot.days.length > 1 ? "s" : ""
                    }`}
              </p>
            </div>

            <Switch
              checked={slot.enabled}
              onCheckedChange={(checked) => {
                onUpdate({ ...slot, enabled: checked });
              }}
              onClick={(e) => e.stopPropagation()}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CollapsibleTrigger>

        {/* Body */}
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-1 space-y-3 border-t border-slate-200/60">
            {/* Days */}
            <div>
              <Label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">
                Active Days
              </Label>
              <DaySelector
                days={slot.days || []}
                onChange={(days) => onUpdate({ ...slot, days })}
              />
            </div>

            {/* Time Windows */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Time Windows
                </Label>
                <button
                  type="button"
                  onClick={addWindow}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                >
                  <Plus className="w-2.5 h-2.5" />
                  Add Window
                </button>
              </div>

              {noWindows ? (
                <div className="text-[10px] text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-2.5 text-center">
                  <Info className="w-3 h-3 inline mr-1 text-slate-400" />
                  No time windows — detection will run 24×7 on selected days
                </div>
              ) : (
                <div className="space-y-1.5">
                  {slot.timeWindows.map((w, idx) => (
                    <TimeWindowRow
                      key={idx}
                      window={w}
                      canRemove={slot.timeWindows.length > 1}
                      onUpdate={(nw) => updateWindow(idx, nw)}
                      onRemove={() => removeWindow(idx)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confidence Override */}
            <div>
              <Label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">
                Confidence Threshold (optional)
              </Label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.05"
                placeholder="0.45"
                value={slot.confidenceOverride ?? ""}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? null : parseFloat(e.target.value);
                  onUpdate({ ...slot, confidenceOverride: val });
                }}
                className="h-7 text-xs w-28"
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
});
DetectionSlotCard.displayName = "DetectionSlotCard";

// ═══════════════════════════════════════════
// 🎯 MAIN COMPONENT
// ═══════════════════════════════════════════
export const CameraDetectionSettings = memo(({ camera, onClose }) => {
  const cameraId = camera?.cameraId || camera?._id;
  const {
    loading,
    saving,
    rules,
    schedule: fetchedSchedule,
    detectionSettings,
    saveSchedule,
    applyPreset,
    overrideRules,
    fireTestAlert,
    reload,
  } = useDetectionSettings(cameraId);

  const [localSettings, setLocalSettings] = useState(null);
  const [localSchedule, setLocalSchedule] = useState(null);
  const [activeTab, setActiveTab] = useState("schedule");
  const [overrideTtl, setOverrideTtl] = useState(60);

  // ✅ Sync from server
  useEffect(() => {
    if (detectionSettings) setLocalSettings({ ...detectionSettings });
    if (fetchedSchedule)
      setLocalSchedule({
        scheduleEnabled: false,
        timezone: "Asia/Kolkata",
        slots: [],
        ...fetchedSchedule,
      });
  }, [detectionSettings, fetchedSchedule]);

  // ═══════════════════════════════════════════
  // 🎛️ Handlers
  // ═══════════════════════════════════════════
  const handleMasterToggle = useCallback((key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleScheduleToggle = useCallback((enabled) => {
    setLocalSchedule((prev) => ({ ...prev, scheduleEnabled: enabled }));
  }, []);

  const addSlot = useCallback(
    (detectionType) => {
      setLocalSchedule((prev) => {
        const existing = prev.slots?.find(
          (s) => s.detectionType === detectionType
        );
        if (existing) return prev;
        return {
          ...prev,
          slots: [
            ...(prev.slots || []),
            {
              detectionType,
              enabled: true,
              days: [0, 1, 2, 3, 4, 5, 6],
              timeWindows: [{ startTime: "22:00", endTime: "06:00" }],
              confidenceOverride: null,
            },
          ],
        };
      });
    },
    []
  );

  const updateSlot = useCallback((detectionType, updated) => {
    setLocalSchedule((prev) => ({
      ...prev,
      slots: (prev.slots || []).map((s) =>
        s.detectionType === detectionType ? updated : s
      ),
    }));
  }, []);

  const removeSlot = useCallback((detectionType) => {
    setLocalSchedule((prev) => ({
      ...prev,
      slots: (prev.slots || []).filter(
        (s) => s.detectionType !== detectionType
      ),
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!localSchedule) return;
    const ok = await saveSchedule(localSchedule);
    if (ok) onClose?.();
  }, [localSchedule, saveSchedule, onClose]);

  const handlePreset = useCallback(
    async (preset) => {
      await applyPreset(preset);
      // Optionally close or stay
    },
    [applyPreset]
  );

  // ═══════════════════════════════════════════
  // 🧮 Derived
  // ═══════════════════════════════════════════
  const usedTypes = useMemo(
    () => new Set((localSchedule?.slots || []).map((s) => s.detectionType)),
    [localSchedule]
  );

  const availableTypes = useMemo(
    () => DETECTION_TYPES.filter((d) => !usedTypes.has(d.key)),
    [usedTypes]
  );

  if (loading && !localSchedule) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live Status */}
      <LiveStatusCard rules={rules} />

      {/* Camera name */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{camera?.name}</h2>
          <p className="text-[10px] text-slate-500">
            Detection & Schedule Settings
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={reload}
          className="h-7 text-[10px] gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Reload
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="schedule" className="text-xs">
            <Calendar className="w-3 h-3 mr-1.5" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="master" className="text-xs">
            <Bell className="w-3 h-3 mr-1.5" />
            Master
          </TabsTrigger>
          <TabsTrigger value="test" className="text-xs">
            <Zap className="w-3 h-3 mr-1.5" />
            Test
          </TabsTrigger>
        </TabsList>

        {/* ═══════════════════════════════════════ */}
        {/* TAB 1: SCHEDULE                          */}
        {/* ═══════════════════════════════════════ */}
        <TabsContent value="schedule" className="space-y-4 mt-4">
          {/* Presets */}
          <div>
            <SectionTitle
              icon={Zap}
              title="Quick Presets"
              subtitle="One-click schedules"
            />
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handlePreset(p.key)}
                    disabled={saving}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all text-left disabled:opacity-50"
                  >
                    <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800">
                        {p.label}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {p.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule Toggle */}
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Enable Time-Based Schedule
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  When off, detection runs 24×7 (based on master toggles)
                </p>
              </div>
              <Switch
                checked={localSchedule?.scheduleEnabled || false}
                onCheckedChange={handleScheduleToggle}
              />
            </div>
          </div>

          {localSchedule?.scheduleEnabled && (
            <>
              {/* Timezone */}
              <div>
                <Label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block">
                  <Globe className="w-3 h-3 inline mr-1" />
                  Timezone
                </Label>
                <Select
                  value={localSchedule?.timezone || "Asia/Kolkata"}
                  onValueChange={(v) =>
                    setLocalSchedule((prev) => ({ ...prev, timezone: v }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">
                      Asia/Kolkata (IST)
                    </SelectItem>
                    <SelectItem value="Asia/Dubai">
                      Asia/Dubai (GST)
                    </SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">
                      America/New_York (EST)
                    </SelectItem>
                    <SelectItem value="Europe/London">
                      Europe/London (GMT)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Slots */}
              <div>
                <SectionTitle
                  icon={Calendar}
                  title="Detection Slots"
                  subtitle="Configure per-type schedules"
                  right={
                    availableTypes.length > 0 && (
                      <Select
                        value=""
                        onValueChange={(v) => addSlot(v)}
                      >
                        <SelectTrigger className="h-7 text-[10px] w-auto gap-1">
                          <Plus className="w-3 h-3" />
                          Add Detection
                        </SelectTrigger>
                        <SelectContent>
                          {availableTypes.map((t) => {
                            const Icon = t.icon;
                            return (
                              <SelectItem key={t.key} value={t.key}>
                                <div className="flex items-center gap-2">
                                  <Icon
                                    className={`w-3 h-3 ${t.color}`}
                                  />
                                  <span>{t.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )
                  }
                />

                {(!localSchedule?.slots ||
                  localSchedule.slots.length === 0) && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs text-slate-500 font-medium">
                      No detection slots added
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Add a slot to schedule detections
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  {localSchedule?.slots?.map((slot) => {
                    const type = DETECTION_TYPES.find(
                      (t) => t.key === slot.detectionType
                    );
                    if (!type) return null;
                    return (
                      <DetectionSlotCard
                        key={slot.detectionType}
                        slot={slot}
                        type={type}
                        onUpdate={(u) => updateSlot(slot.detectionType, u)}
                        onRemove={() => removeSlot(slot.detectionType)}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-1.5"
            >
              {saving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              {saving ? "Saving..." : "Save Schedule"}
            </Button>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════ */}
        {/* TAB 2: MASTER                            */}
        {/* ═══════════════════════════════════════ */}
        <TabsContent value="master" className="space-y-4 mt-4">
          <div>
            <SectionTitle
              icon={Bell}
              title="Master Detection Toggles"
              subtitle="Enable/disable detection types globally"
            />
            <MasterToggles
              settings={localSettings}
              onChange={handleMasterToggle}
            />
            <p className="text-[10px] text-slate-500 mt-2 flex items-start gap-1">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>
                If a detection is OFF here, its schedule will be ignored.
                This is the master switch.
              </span>
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </TabsContent>

        {/* ═══════════════════════════════════════ */}
        {/* TAB 3: TEST                              */}
        {/* ═══════════════════════════════════════ */}
        <TabsContent value="test" className="space-y-4 mt-4">
          <div>
            <SectionTitle
              icon={Zap}
              title="Force Override"
              subtitle="Bypass schedule temporarily"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-[10px] font-bold uppercase text-slate-500">
                  Duration
                </Label>
                <Select
                  value={String(overrideTtl)}
                  onValueChange={(v) => setOverrideTtl(Number(v))}
                >
                  <SelectTrigger className="h-7 text-xs w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                    <SelectItem value="3600">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DETECTION_TYPES.map((d) => {
                  const Icon = d.icon;
                  return (
                    <Button
                      key={d.key}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        overrideRules(
                          {
                            person: d.key === "person",
                            fire: d.key === "fire",
                            smoke: d.key === "smoke",
                            vehicle: d.key === "vehicle",
                          },
                          overrideTtl
                        )
                      }
                      className="h-9 justify-start gap-2 text-xs"
                    >
                      <Icon className={`w-3.5 h-3.5 ${d.color}`} />
                      Force {d.label}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  overrideRules(
                    {
                      person: true,
                      fire: true,
                      smoke: true,
                      vehicle: false,
                    },
                    overrideTtl
                  )
                }
                className="w-full h-9 gap-2 text-xs bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Force ALL On ({overrideTtl}s)
              </Button>
            </div>
          </div>

          <div>
            <SectionTitle
              icon={Bell}
              title="Test Alert"
              subtitle="Fire a fake alert to test notification"
            />
            <div className="grid grid-cols-2 gap-2">
              {DETECTION_TYPES.slice(0, 3).map((d) => {
                const Icon = d.icon;
                return (
                  <Button
                    key={d.key}
                    variant="outline"
                    size="sm"
                    onClick={() => fireTestAlert(d.key, 0.95)}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Icon className={`w-3 h-3 ${d.color}`} />
                    {d.label} Alert
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});

CameraDetectionSettings.displayName = "CameraDetectionSettings";