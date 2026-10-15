# # server/detector-ai/detector_server.py
# import asyncio
# import json
# import os
# import time
# import threading
# from pathlib import Path

# import websockets
# import cv2
# from ultralytics import YOLO

# # ═══ SAB ENV SE ═══
# HOST = os.getenv("DETECTOR_HOST", "0.0.0.0")
# PORT = int(os.getenv("DETECTOR_PORT", "8765"))

# PERSON_MODEL_PATH = os.getenv("DETECTOR_PERSON_MODEL", "yolo11s.pt")
# FIRE_MODEL_PATH = os.getenv("DETECTOR_FIRE_MODEL", "fire_smoke_yolo.pt")
# SNAPSHOT_DIR = Path(os.getenv("DETECTOR_SNAPSHOT_DIR", "./snapshots"))

# PERSON_CONF = float(os.getenv("DETECTOR_PERSON_CONF", "0.45"))
# FIRE_CONF = float(os.getenv("DETECTOR_FIRE_CONF", "0.70"))
# SAMPLE_RATE = int(os.getenv("DETECTOR_SAMPLE_RATE", "3"))
# COOLDOWN_S = float(os.getenv("DETECTOR_COOLDOWN_S", "10"))

# SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)

# # ═══ MODELS ═══
# print(f"[init] Person model: {PERSON_MODEL_PATH}", flush=True)
# person_model = YOLO(PERSON_MODEL_PATH)

# fire_model = None
# if Path(FIRE_MODEL_PATH).exists():
#     print(f"[init] Fire model: {FIRE_MODEL_PATH}", flush=True)
#     fire_model = YOLO(FIRE_MODEL_PATH)
# else:
#     print(f"[init] ⚠️ Fire model not found, disabled", flush=True)

# # ═══ STATE ═══
# CAMERAS = {}
# CLIENTS = set()
# LAST_ALERT = {}


# def cooldown_ok(camera_id, kind):
#     key = (camera_id, kind)
#     now = time.time()
#     if now - LAST_ALERT.get(key, 0) < COOLDOWN_S:
#         return False
#     LAST_ALERT[key] = now
#     return True


# # def save_snapshot(frame, camera_id, label):
# #     cam_dir = SNAPSHOT_DIR / camera_id
# #     cam_dir.mkdir(parents=True, exist_ok=True)
# #     ts = time.strftime("%Y%m%d_%H%M%S_%f")
# #     fp = cam_dir / f"{label}_{ts}.jpg"
# #     cv2.imwrite(str(fp), frame)
# #     return str(fp)

# def save_snapshot(frame, camera_id, label):
#     cam_dir = SNAPSHOT_DIR / str(camera_id)
#     cam_dir.mkdir(parents=True, exist_ok=True)

#     # Cross-platform filename with unique microseconds
#     from datetime import datetime

#     ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
#     fp = cam_dir / f"{label}_{ts}.jpg"

#     success = cv2.imwrite(str(fp), frame)
#     if not success:
#         raise RuntimeError(f"Failed to save snapshot: {fp}")

#     # Return a consistent path representation
#     return fp.resolve().as_posix()




# async def broadcast(event):
#     if not CLIENTS:
#         return
#     msg = json.dumps(event)
#     await asyncio.gather(*[c.send(msg) for c in CLIENTS], return_exceptions=True)


# def detection_loop(camera_id, rtsp_url, loop):
#     cap = cv2.VideoCapture(rtsp_url)
#     cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
#     frame_n = 0
#     fail_n = 0

#     while camera_id in CAMERAS:
#         ret, frame = cap.read()
#         if not ret:
#             fail_n += 1
#             if fail_n > 50:
#                 cap.release()
#                 time.sleep(2)
#                 cap = cv2.VideoCapture(rtsp_url)
#                 fail_n = 0
#             else:
#                 time.sleep(0.05)
#             continue

#         fail_n = 0
#         frame_n += 1
#         if frame_n % SAMPLE_RATE != 0:
#             continue

#         # PERSON
#         try:
#             results = person_model.predict(frame, verbose=False, conf=PERSON_CONF)
#         except Exception as e:
#             print(f"[{camera_id}] person err: {e}", flush=True)
#             results = []

#         for r in results:
#             for box in r.boxes:
#                 if int(box.cls[0]) == 0 and cooldown_ok(camera_id, "person"):
#                     snap = save_snapshot(frame, camera_id, "person")
#                     ev = {
#                         "cameraId": camera_id,
#                         "type": "person",
#                         "confidence": float(box.conf[0]),
#                         "bbox": [int(v) for v in box.xyxy[0].tolist()],
#                         "snapshot": snap,
#                         "timestamp": int(time.time() * 1000),
#                     }
#                     asyncio.run_coroutine_threadsafe(broadcast(ev), loop)

#         # FIRE / SMOKE
#         if fire_model is not None:
#             try:
#                 fresults = fire_model.predict(frame, verbose=False, conf=FIRE_CONF)
#             except Exception as e:
#                 print(f"[{camera_id}] fire err: {e}", flush=True)
#                 fresults = []

#             for r in fresults:
#                 for box in r.boxes:
#                     cname = fire_model.names.get(int(box.cls[0]), "").lower()
#                     kind = "fire" if "fire" in cname else ("smoke" if "smoke" in cname else None)
#                     if not kind or not cooldown_ok(camera_id, kind):
#                         continue
#                     snap = save_snapshot(frame, camera_id, kind)
#                     ev = {
#                         "cameraId": camera_id,
#                         "type": kind,
#                         "confidence": float(box.conf[0]),
#                         "bbox": [int(v) for v in box.xyxy[0].tolist()],
#                         "snapshot": snap,
#                         "timestamp": int(time.time() * 1000),
#                     }
#                     asyncio.run_coroutine_threadsafe(broadcast(ev), loop)

#     cap.release()
#     print(f"[{camera_id}] loop stopped", flush=True)


# async def handler(ws):
#     CLIENTS.add(ws)
#     print(f"[ws] client connected ({len(CLIENTS)} total)", flush=True)
#     try:
#         async for raw in ws:
#             try:
#                 data = json.loads(raw)
#             except json.JSONDecodeError:
#                 continue

#             action = data.get("action")

#             if action == "add_camera":
#                 cid, url = data["cameraId"], data["rtspUrl"]
#                 if cid not in CAMERAS:
#                     CAMERAS[cid] = url
#                     loop = asyncio.get_event_loop()
#                     threading.Thread(
#                         target=detection_loop,
#                         args=(cid, url, loop),
#                         daemon=True,
#                     ).start()
#                 await ws.send(json.dumps({"ok": True, "cameraId": cid}))

#             elif action == "remove_camera":
#                 CAMERAS.pop(data["cameraId"], None)
#                 await ws.send(json.dumps({"ok": True}))

#             elif action == "list":
#                 await ws.send(json.dumps({"cameras": list(CAMERAS.keys())}))

#             elif action == "ping":
#                 await ws.send(json.dumps({"pong": True}))

#     finally:
#         CLIENTS.discard(ws)
#         print(f"[ws] client disconnected ({len(CLIENTS)} total)", flush=True)


# async def main():
#     async with websockets.serve(handler, HOST, PORT):
#         print(f"🚀 Detector WS on ws://{HOST}:{PORT}", flush=True)
#         await asyncio.Future()


# if __name__ == "__main__":
#     asyncio.run(main())


















# server/detector-ai/detector_server.py
import asyncio
import json
import os
import time
import threading
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, field
from typing import Optional

import websockets
import cv2
from ultralytics import YOLO

# ═══════════════════════════════════════════
# ⚙️ ENV CONFIG
# ═══════════════════════════════════════════
HOST = os.getenv("DETECTOR_HOST", "0.0.0.0")
PORT = int(os.getenv("DETECTOR_PORT", "8765"))

PERSON_MODEL_PATH = os.getenv("DETECTOR_PERSON_MODEL", "yolo11s.pt")
FIRE_MODEL_PATH = os.getenv("DETECTOR_FIRE_MODEL", "fire_smoke_yolo.pt")
SNAPSHOT_DIR = Path(os.getenv("DETECTOR_SNAPSHOT_DIR", "./snapshots"))

# ✅ Defaults (per-camera overrides will come from Node)
PERSON_CONF = float(os.getenv("DETECTOR_PERSON_CONF", "0.45"))
FIRE_CONF = float(os.getenv("DETECTOR_FIRE_CONF", "0.70"))
SMOKE_CONF = float(os.getenv("DETECTOR_SMOKE_CONF", "0.70"))
SAMPLE_RATE = int(os.getenv("DETECTOR_SAMPLE_RATE", "3"))
COOLDOWN_S = float(os.getenv("DETECTOR_COOLDOWN_S", "10"))

# ✅ RTSP reconnect behavior
RTSP_FAIL_THRESHOLD = int(os.getenv("DETECTOR_RTSP_FAIL_THRESHOLD", "50"))
RTSP_RECONNECT_DELAY = float(os.getenv("DETECTOR_RTSP_RECONNECT_DELAY", "2"))

# ✅ WebSocket heartbeat
WS_PING_INTERVAL = int(os.getenv("DETECTOR_WS_PING_INTERVAL", "30"))
WS_PING_TIMEOUT = int(os.getenv("DETECTOR_WS_PING_TIMEOUT", "10"))

SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)

# ═══════════════════════════════════════════
# 🧠 MODELS
# ═══════════════════════════════════════════
print(f"[init] Person model: {PERSON_MODEL_PATH}", flush=True)
try:
    person_model = YOLO(PERSON_MODEL_PATH)
except Exception as e:
    print(f"[init] ❌ Failed to load person model: {e}", flush=True)
    person_model = None

fire_model = None
if Path(FIRE_MODEL_PATH).exists():
    print(f"[init] Fire/Smoke model: {FIRE_MODEL_PATH}", flush=True)
    try:
        fire_model = YOLO(FIRE_MODEL_PATH)
    except Exception as e:
        print(f"[init] ❌ Failed to load fire model: {e}", flush=True)
        fire_model = None
else:
    print(f"[init] ⚠️ Fire model not found ({FIRE_MODEL_PATH}), disabled", flush=True)

if person_model is None and fire_model is None:
    print("[init] ❌ No models loaded. Exiting.", flush=True)
    raise SystemExit(1)


# ═══════════════════════════════════════════
# 📦 CAMERA SESSION (thread-safe)
# ═══════════════════════════════════════════
@dataclass
class CameraSession:
    camera_id: str
    rtsp_url: str
    loop: asyncio.AbstractEventLoop

    # ✅ Rules: which detection types are ACTIVE right now
    rules: dict = field(
        default_factory=lambda: {
            "person": True,
            "fire": True,
            "smoke": True,
            "vehicle": False,
        }
    )

    # ✅ Per-camera settings (confidence overrides, etc.)
    settings: dict = field(default_factory=dict)

    # ✅ Lifecycle
    running: bool = True
    thread: Optional[threading.Thread] = None

    # ✅ Thread-safe lock
    _lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    # ───────────────────────────────────────
    def update(self, rules: Optional[dict] = None, settings: Optional[dict] = None):
        """Thread-safe rules/settings update"""
        with self._lock:
            if rules:
                # ✅ Preserve unknown keys but override known ones
                self.rules.update(rules)
            if settings:
                self.settings.update(settings)

        active = {k: v for k, v in self.rules.items() if v}
        print(
            f"[{self.camera_id}] 🔄 rules updated → active={list(active.keys())}",
            flush=True,
        )

    # ───────────────────────────────────────
    def should_detect(self, detection_type: str) -> bool:
        """Check if this detection type is currently allowed"""
        with self._lock:
            return bool(self.rules.get(detection_type, False))

    # ───────────────────────────────────────
    def get_conf(self, detection_type: str) -> float:
        """Get confidence threshold for a detection type (per-camera override)"""
        with self._lock:
            key = f"{detection_type}Confidence"
            if key in self.settings:
                try:
                    return float(self.settings[key])
                except (TypeError, ValueError):
                    pass

        # Fallback to global defaults
        return {
            "person": PERSON_CONF,
            "fire": FIRE_CONF,
            "smoke": SMOKE_CONF,
        }.get(detection_type, 0.5)

    # ───────────────────────────────────────
    def get_sample_rate(self) -> int:
        with self._lock:
            try:
                return max(1, int(self.settings.get("frameSampleRate", SAMPLE_RATE)))
            except (TypeError, ValueError):
                return SAMPLE_RATE

    # ───────────────────────────────────────
    def get_cooldown(self) -> float:
        with self._lock:
            ms = self.settings.get("cooldownMs")
            if ms is not None:
                try:
                    return max(0.0, float(ms) / 1000.0)
                except (TypeError, ValueError):
                    pass
        return COOLDOWN_S

    # ───────────────────────────────────────
    def stop(self):
        self.running = False


# ═══════════════════════════════════════════
# 🌐 GLOBAL STATE
# ═══════════════════════════════════════════
CAMERAS: dict[str, CameraSession] = {}
CLIENTS: set = set()
LAST_ALERT: dict = {}
LAST_ALERT_LOCK = threading.Lock()


# ═══════════════════════════════════════════
# 🔔 COOLDOWN (thread-safe)
# ═══════════════════════════════════════════
def cooldown_ok(camera_id: str, kind: str, cooldown_s: float) -> bool:
    key = (camera_id, kind)
    now = time.time()
    with LAST_ALERT_LOCK:
        if now - LAST_ALERT.get(key, 0) < cooldown_s:
            return False
        LAST_ALERT[key] = now
        return True


# ═══════════════════════════════════════════
# 💾 SNAPSHOT
# ═══════════════════════════════════════════
# def save_snapshot(frame, camera_id: str, label: str) -> str:
#     cam_dir = SNAPSHOT_DIR / str(camera_id)
#     cam_dir.mkdir(parents=True, exist_ok=True)

#     ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
#     fp = cam_dir / f"{label}_{ts}.jpg"

#     success = cv2.imwrite(str(fp), frame)
#     if not success:
#         raise RuntimeError(f"Failed to save snapshot: {fp}")

#     return fp.resolve().as_posix()


def save_snapshot(frame, camera_id, label):
    cam_dir = SNAPSHOT_DIR / camera_id
    cam_dir.mkdir(parents=True, exist_ok=True)
    ts = time.strftime("%Y%m%d_%H%M%S_%f")
    fp = cam_dir / f"{label}_{ts}.jpg"
    cv2.imwrite(str(fp), frame)
    return str(fp)

# ═══════════════════════════════════════════
# 📡 BROADCAST
# ═══════════════════════════════════════════
async def broadcast(event: dict):
    if not CLIENTS:
        return
    msg = json.dumps(event)
    # ✅ Don't let one slow client block others
    await asyncio.gather(
        *[c.send(msg) for c in list(CLIENTS)],
        return_exceptions=True,
    )


def emit_event(session: CameraSession, event: dict):
    """Thread-safe: schedule broadcast on the asyncio loop"""
    try:
        asyncio.run_coroutine_threadsafe(broadcast(event), session.loop)
    except RuntimeError as e:
        # Loop closed (shutdown)
        print(f"[{session.camera_id}] broadcast skipped: {e}", flush=True)


# ═══════════════════════════════════════════
# 🎥 DETECTION LOOP (per camera, in thread)
# ═══════════════════════════════════════════
def detection_loop(session: CameraSession):
    camera_id = session.camera_id
    rtsp_url = session.rtsp_url

    cap = cv2.VideoCapture(rtsp_url)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    frame_n = 0
    fail_n = 0
    last_rules_log = None

    print(f"[{camera_id}] 🎥 detection loop started", flush=True)

    while session.running and CAMERAS.get(camera_id) is session:
        ret, frame = cap.read()
        if not ret:
            fail_n += 1
            if fail_n > RTSP_FAIL_THRESHOLD:
                print(f"[{camera_id}] 🔄 RTSP reconnect...", flush=True)
                cap.release()
                time.sleep(RTSP_RECONNECT_DELAY)
                cap = cv2.VideoCapture(rtsp_url)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                fail_n = 0
            else:
                time.sleep(0.05)
            continue

        fail_n = 0
        frame_n += 1

        # ✅ Per-camera sample rate
        if frame_n % session.get_sample_rate() != 0:
            continue

        # ✅ Log rules changes once per frame-cycle (for debugging)
        current_active = tuple(
            k for k in ("person", "fire", "smoke", "vehicle")
            if session.should_detect(k)
        )
        if current_active != last_rules_log:
            print(f"[{camera_id}] 🎯 active detections: {current_active}", flush=True)
            last_rules_log = current_active

        # ─────────────────────────────────
        # 🧍 PERSON DETECTION
        # ─────────────────────────────────
        if person_model is not None and session.should_detect("person"):
            try:
                results = person_model.predict(
                    frame,
                    verbose=False,
                    conf=session.get_conf("person"),
                )
            except Exception as e:
                print(f"[{camera_id}] person err: {e}", flush=True)
                results = []

            for r in results:
                for box in r.boxes:
                    if int(box.cls[0]) != 0:  # class 0 = person
                        continue

                    if not cooldown_ok(camera_id, "person", session.get_cooldown()):
                        continue

                    try:
                        snap = save_snapshot(frame, camera_id, "person")
                    except Exception as e:
                        print(f"[{camera_id}] snapshot err: {e}", flush=True)
                        continue

                    ev = {
                        "cameraId": camera_id,
                        "type": "person",
                        "confidence": float(box.conf[0]),
                        "bbox": [int(v) for v in box.xyxy[0].tolist()],
                        "snapshot": snap,
                        "timestamp": int(time.time() * 1000),
                    }
                    emit_event(session, ev)

        # ─────────────────────────────────
        # 🔥 FIRE / SMOKE DETECTION
        # ─────────────────────────────────
        fire_on = session.should_detect("fire")
        smoke_on = session.should_detect("smoke")

        if fire_model is not None and (fire_on or smoke_on):
            try:
                # ✅ Use the lowest confidence of the two (filter per-kind below)
                conf_threshold = min(
                    session.get_conf("fire") if fire_on else 1.0,
                    session.get_conf("smoke") if smoke_on else 1.0,
                )
                fresults = fire_model.predict(
                    frame,
                    verbose=False,
                    conf=conf_threshold,
                )
            except Exception as e:
                print(f"[{camera_id}] fire err: {e}", flush=True)
                fresults = []

            for r in fresults:
                for box in r.boxes:
                    cname = fire_model.names.get(int(box.cls[0]), "").lower()
                    kind = (
                        "fire" if "fire" in cname
                        else "smoke" if "smoke" in cname
                        else None
                    )
                    if not kind:
                        continue

                    # ✅ Respect per-kind schedule flag
                    if kind == "fire" and not fire_on:
                        continue
                    if kind == "smoke" and not smoke_on:
                        continue

                    # ✅ Respect per-kind confidence
                    if float(box.conf[0]) < session.get_conf(kind):
                        continue

                    if not cooldown_ok(camera_id, kind, session.get_cooldown()):
                        continue

                    try:
                        snap = save_snapshot(frame, camera_id, kind)
                    except Exception as e:
                        print(f"[{camera_id}] snapshot err: {e}", flush=True)
                        continue

                    ev = {
                        "cameraId": camera_id,
                        "type": kind,
                        "confidence": float(box.conf[0]),
                        "bbox": [int(v) for v in box.xyxy[0].tolist()],
                        "snapshot": snap,
                        "timestamp": int(time.time() * 1000),
                    }
                    emit_event(session, ev)

    cap.release()
    print(f"[{camera_id}] 🛑 detection loop stopped", flush=True)


# ═══════════════════════════════════════════
# 🌐 WEBSOCKET HANDLER
# ═══════════════════════════════════════════
async def handler(ws):
    CLIENTS.add(ws)
    peer = getattr(ws, "remote_address", None)
    print(f"[ws] ✅ client connected {peer} ({len(CLIENTS)} total)", flush=True)

    try:
        async for raw in ws:
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                print(f"[ws] ⚠️ invalid JSON: {raw[:200]}", flush=True)
                continue

            action = data.get("action")

            # ─────────────────────────────
            # ➕ ADD CAMERA
            # ─────────────────────────────
            if action == "add_camera":
                cid = data.get("cameraId")
                url = data.get("rtspUrl")
                rules = data.get("rules") or {}
                settings = data.get("settings") or {}

                if not cid or not url:
                    await ws.send(json.dumps({
                        "ok": False,
                        "error": "cameraId and rtspUrl required",
                    }))
                    continue

                if cid in CAMERAS:
                    # ✅ Already exists → just update rules/settings
                    existing = CAMERAS[cid]
                    existing.update(rules=rules, settings=settings)
                    print(f"[{cid}] ♻️ camera already exists, rules updated", flush=True)
                else:
                    loop = asyncio.get_event_loop()
                    session = CameraSession(
                        camera_id=cid,
                        rtsp_url=url,
                        loop=loop,
                        rules={
                            # ✅ Default all-off if not specified (safer)
                            "person": False,
                            "fire": False,
                            "smoke": False,
                            "vehicle": False,
                            **(rules or {}),
                        },
                        settings=settings,
                    )
                    CAMERAS[cid] = session

                    thread = threading.Thread(
                        target=detection_loop,
                        args=(session,),
                        daemon=True,
                        name=f"det-{cid}",
                    )
                    session.thread = thread
                    thread.start()
                    print(
                        f"[{cid}] ➕ camera added, rules={rules}",
                        flush=True,
                    )

                await ws.send(json.dumps({
                    "ok": True,
                    "action": "add_camera",
                    "cameraId": cid,
                }))

            # ─────────────────────────────
            # 🔄 UPDATE RULES (hot reload)
            # ─────────────────────────────
            elif action == "update_rules":
                cid = data.get("cameraId")
                rules = data.get("rules") or {}
                settings = data.get("settings") or {}

                session = CAMERAS.get(cid)
                if not session:
                    await ws.send(json.dumps({
                        "ok": False,
                        "action": "update_rules",
                        "cameraId": cid,
                        "error": "camera not found",
                    }))
                    continue

                session.update(rules=rules, settings=settings)

                await ws.send(json.dumps({
                    "ok": True,
                    "action": "update_rules",
                    "cameraId": cid,
                    "rules": session.rules,
                }))

            # ─────────────────────────────
            # ➖ REMOVE CAMERA
            # ─────────────────────────────
            elif action == "remove_camera":
                cid = data.get("cameraId")
                session = CAMERAS.pop(cid, None)
                if session:
                    session.stop()
                    print(f"[{cid}] ➖ camera removed", flush=True)

                # ✅ Cleanup cooldown entries
                with LAST_ALERT_LOCK:
                    for key in list(LAST_ALERT.keys()):
                        if key[0] == cid:
                            LAST_ALERT.pop(key, None)

                await ws.send(json.dumps({
                    "ok": True,
                    "action": "remove_camera",
                    "cameraId": cid,
                }))

            # ─────────────────────────────
            # 📋 LIST
            # ─────────────────────────────
            elif action == "list":
                await ws.send(json.dumps({
                    "cameras": [
                        {
                            "cameraId": s.camera_id,
                            "rules": s.rules,
                            "settings": s.settings,
                        }
                        for s in CAMERAS.values()
                    ],
                }))

            # ─────────────────────────────
            # 💓 PING
            # ─────────────────────────────
            elif action == "ping":
                await ws.send(json.dumps({"pong": True}))

            # ─────────────────────────────
            # ❓ UNKNOWN
            # ─────────────────────────────
            else:
                print(f"[ws] ⚠️ unknown action: {action}", flush=True)
                await ws.send(json.dumps({
                    "ok": False,
                    "error": f"unknown action: {action}",
                }))

    except websockets.exceptions.ConnectionClosed:
        pass
    except Exception as e:
        print(f"[ws] ❌ handler error: {e}", flush=True)
    finally:
        CLIENTS.discard(ws)
        print(f"[ws] ❌ client disconnected ({len(CLIENTS)} total)", flush=True)


# ═══════════════════════════════════════════
# 🛑 GRACEFUL SHUTDOWN
# ═══════════════════════════════════════════
async def shutdown():
    print("[shutdown] stopping all cameras...", flush=True)
    for cid, session in list(CAMERAS.items()):
        session.stop()
    CAMERAS.clear()

    # Give threads a moment to exit
    await asyncio.sleep(0.5)
    print("[shutdown] done", flush=True)


# ═══════════════════════════════════════════
# 🚀 MAIN
# ═══════════════════════════════════════════
async def main():
    print(f"🚀 Detector WS starting on ws://{HOST}:{PORT}", flush=True)

    async with websockets.serve(
        handler,
        HOST,
        PORT,
        ping_interval=WS_PING_INTERVAL,
        ping_timeout=WS_PING_TIMEOUT,
        max_size=10 * 1024 * 1024,  # 10MB (for large frames if needed)
    ):
        print(f"✅ Detector WS ready", flush=True)
        try:
            await asyncio.Future()  # run forever
        except asyncio.CancelledError:
            pass
        finally:
            await shutdown()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[main] 👋 KeyboardInterrupt, exiting", flush=True)