// ✅ Simple beep sound using Web Audio API (no external files needed)

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * ✅ Play alert sound based on type
 */
export function playAlertSound(type = "person", muted = false) {
  if (muted) return;

  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    const typeConfig = {
      fire: { freqs: [880, 1100, 880, 1100], duration: 0.15, repeat: 3 },
      smoke: { freqs: [700, 900, 700], duration: 0.2, repeat: 2 },
      person: { freqs: [600, 800], duration: 0.15, repeat: 1 },
      info: { freqs: [500], duration: 0.1, repeat: 1 },
    };

    const config = typeConfig[type] || typeConfig.info;
    let startTime = ctx.currentTime;

    for (let r = 0; r < config.repeat; r++) {
      config.freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = freq;
        osc.type = "sine";

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gain.gain.linearRampToValueAtTime(0, startTime + config.duration);

        osc.start(startTime);
        osc.stop(startTime + config.duration);

        startTime += config.duration;
      });

      // Gap between repeats
      startTime += 0.1;
    }
  } catch (err) {
    console.warn("Sound play failed:", err);
  }
}

/**
 * ✅ Mute preference
 */
export function getSoundMuted() {
  return localStorage.getItem("alert_sound_muted") === "true";
}

export function setSoundMuted(muted) {
  localStorage.setItem("alert_sound_muted", String(muted));
}