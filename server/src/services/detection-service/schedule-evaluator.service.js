// services/schedule-evaluator.service.js


/**
 * ✅ Schedule Evaluator
 * Determines which detections should be ACTIVE right now for a camera
 */

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Convert "HH:mm" to minutes since midnight
 */
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Get current time in a specific timezone as { minutes, dayOfWeek }
 */
function getNowInTimezone(timezone = "Asia/Kolkata") {
  const now = new Date();

  // ✅ Use Intl to get correct local time in timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === "hour").value, 10);
  const minute = parseInt(parts.find((p) => p.type === "minute").value, 10);
  const weekdayShort = parts.find((p) => p.type === "weekday").value;

  const dayOfWeek = DAY_NAMES.indexOf(weekdayShort);

  return {
    minutes: hour * 60 + minute,
    dayOfWeek,
    hour,
    minute,
    weekday: weekdayShort,
    iso: now.toISOString(),
  };
}

/**
 * Check if a time window matches current time
 * Handles overnight windows (e.g., 22:00 - 06:00)
 */
function isTimeInWindow(nowMinutes, startStr, endStr) {
  const start = timeToMinutes(startStr);
  const end = timeToMinutes(endStr);

  // ✅ Overnight window (e.g., 22:00 - 06:00)
  if (start > end) {
    return nowMinutes >= start || nowMinutes < end;
  }

  // ✅ Same-day window
  return nowMinutes >= start && nowMinutes < end;
}

/**
 * Check if a slot is active right now
 */
function isSlotActive(slot, now) {
  if (!slot.enabled) return false;
  if (!slot.timeWindows || slot.timeWindows.length === 0) {
    // No time windows = always active (if enabled)
    return true;
  }

  // ✅ Day check
  if (slot.days && slot.days.length > 0 && !slot.days.includes(now.dayOfWeek)) {
    return false;
  }

  // ✅ Time window check (any window match = active)
  return slot.timeWindows.some((w) =>
    isTimeInWindow(now.minutes, w.startTime, w.endTime)
  );
}

/**
 * ✅ MAIN FUNCTION: Compute active detection rules for a camera
 * Returns object that Python detector can understand
 */
export function computeActiveRules(camera) {
  const settings = camera.detectionSettings || {};
  const schedule = settings.schedule || {};

  // ✅ Base rule set (from master toggles)
  const baseRules = {
    person: settings.detectPerson !== false,
    fire: settings.detectFire !== false,
    smoke: settings.detectSmoke !== false,
    vehicle: settings.detectVehicle === true,
  };

  // ✅ If schedule not enabled → return base rules (always-on behavior)
  if (!schedule.scheduleEnabled) {
    return {
      ...baseRules,
      _scheduleActive: false,
      _evaluatedAt: new Date().toISOString(),
    };
  }

  // ✅ Get current time in camera's timezone
  const now = getNowInTimezone(schedule.timezone || "Asia/Kolkata");

  // ✅ Start with all OFF
  const activeRules = {
    person: false,
    fire: false,
    smoke: false,
    vehicle: false,
  };

  // ✅ Override per slot
  for (const slot of schedule.slots || []) {
    if (!baseRules[slot.detectionType]) continue; // master toggle off
    if (isSlotActive(slot, now)) {
      activeRules[slot.detectionType] = true;
    }
  }

  // ✅ Night mode shortcut (agar enable hai)
  if (schedule.nightModeEnabled) {
    const isNight = isTimeInWindow(
      now.minutes,
      schedule.nightModeStart || "22:00",
      schedule.nightModeEnd || "06:00"
    );
    if (isNight) {
      // Night me sab kuch on kar do (jo master toggle me on hai)
      Object.keys(baseRules).forEach((k) => {
        if (baseRules[k]) activeRules[k] = true;
      });
    }
  }

  return {
    ...activeRules,
    _scheduleActive: true,
    _timezone: schedule.timezone,
    _now: now,
    _evaluatedAt: new Date().toISOString(),
  };
}

/**
 * ✅ Check if rules changed (to avoid unnecessary WS sends)
 */
export function rulesChanged(prevRules, newRules) {
  if (!prevRules) return true;
  const keys = ["person", "fire", "smoke", "vehicle"];
  return keys.some((k) => prevRules[k] !== newRules[k]);
}