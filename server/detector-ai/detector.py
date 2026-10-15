
# """
# RTSP + YOLO detection worker.
# Emits JSON lines on stdout: {"type": "person|fire|smoke", "confidence": 0.85, "bbox": [...], "snapshot": "/path/to.jpg"}
# """
# import argparse
# import json
# import os
# import sys
# import time
# import signal
# from datetime import datetime
# from pathlib import Path
# import cv2
# import numpy as np
# from ultralytics import YOLO

# # ═══════════════════════════════════════════════
# # ARGS
# # ═══════════════════════════════════════════════
# parser = argparse.ArgumentParser()
# parser.add_argument("--rtsp", required=True)
# parser.add_argument("--model", required=True)
# parser.add_argument("--fire-model", default="")
# parser.add_argument("--person-conf", type=float, default=0.45)
# parser.add_argument("--fire-conf", type=float, default=0.50)
# parser.add_argument("--sample-rate", type=int, default=5)
# parser.add_argument("--camera-id", required=True)
# parser.add_argument("--snapshot-dir", default="./snapshots")
# args = parser.parse_args()

# SNAPSHOT_DIR = Path(args.snapshot_dir) / args.camera_id
# SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)


# # ═══════════════════════════════════════════════
# # ✅ HELPERS — main loop se PEHLE define
# # ═══════════════════════════════════════════════
# def save_snapshot(frame, label):
#     """Save annotated snapshot, return path."""
#     ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
#     filename = f"{label}_{ts}.jpg"
#     full_path = SNAPSHOT_DIR / filename
#     try:
#         cv2.imwrite(str(full_path), frame)
#         return str(full_path)
#     except Exception as e:
#         print(f"[{args.camera_id}] Snapshot save failed: {e}", file=sys.stderr, flush=True)
#         return None


# def emit_event(event_type, confidence, bbox, snapshot_path):
#     """Emit JSON line on stdout."""
#     payload = {
#         "type": event_type,
#         "confidence": round(confidence, 3),
#         "bbox": bbox,
#         "snapshot": snapshot_path,
#         "ts": int(time.time() * 1000),
#     }
#     print(json.dumps(payload), flush=True)


# # ═══════════════════════════════════════════════
# # GRACEFUL SHUTDOWN
# # ═══════════════════════════════════════════════
# shutdown = {"flag": False}


# def _handle_sigterm(*_):
#     shutdown["flag"] = True
#     print(json.dumps({"type": "shutdown"}), flush=True)


# signal.signal(signal.SIGTERM, _handle_sigterm)
# signal.signal(signal.SIGINT, _handle_sigterm)


# # ═══════════════════════════════════════════════
# # LOAD MODELS
# # ═══════════════════════════════════════════════
# print(f"[{args.camera_id}] Loading person model: {args.model}", file=sys.stderr, flush=True)
# person_model = YOLO(args.model)

# fire_model = None
# if args.fire_model and os.path.exists(args.fire_model):
#     print(f"[{args.camera_id}] Loading fire model: {args.fire_model}", file=sys.stderr, flush=True)
#     try:
#         fire_model = YOLO(args.fire_model)
#         print(f"[{args.camera_id}] ✅ Fire model loaded. Classes: {fire_model.names}", file=sys.stderr, flush=True)
#     except Exception as e:
#         print(f"[{args.camera_id}] ❌ Fire model load failed: {e}", file=sys.stderr, flush=True)
#         fire_model = None
# else:
#     print(f"[{args.camera_id}] ⚠️ No fire model provided, fire detection disabled", file=sys.stderr, flush=True)


# # ═══════════════════════════════════════════════
# # RTSP CONNECT (with auto-reconnect)
# # ═══════════════════════════════════════════════
# def open_capture(url):
#     cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)
#     cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
#     return cap


# def reconnect_loop():
#     backoff = 1
#     while not shutdown["flag"]:
#         cap = open_capture(args.rtsp)
#         if cap.isOpened():
#             print(f"[{args.camera_id}] ✅ RTSP connected", file=sys.stderr, flush=True)
#             return cap
#         print(f"[{args.camera_id}] ⚠️ RTSP open failed, retry in {backoff}s", file=sys.stderr, flush=True)
#         time.sleep(backoff)
#         backoff = min(backoff * 2, 30)
#     return None


# cap = reconnect_loop()
# if cap is None:
#     sys.exit(1)


# # ═══════════════════════════════════════════════
# # MAIN LOOP
# # ═══════════════════════════════════════════════
# frame_count = 0
# fail_count = 0
# MAX_FAILS = 50

# while not shutdown["flag"]:
#     ret, frame = cap.read()

#     if not ret:
#         fail_count += 1
#         if fail_count >= MAX_FAILS:
#             print(f"[{args.camera_id}] Too many read failures, reconnecting", file=sys.stderr, flush=True)
#             cap.release()
#             cap = reconnect_loop()
#             if cap is None:
#                 break
#             fail_count = 0
#         else:
#             time.sleep(0.05)
#         continue

#     fail_count = 0
#     frame_count += 1

#     # Sample frames
#     if frame_count % args.sample_rate != 0:
#         continue

#     # ───────── PERSON DETECTION ─────────
#     try:
#         person_results = person_model.predict(frame, verbose=False, conf=args.person_conf)
#     except Exception as e:
#         print(f"[{args.camera_id}] Person model error: {e}", file=sys.stderr, flush=True)
#         person_results = []

#     for result in person_results:
#         for box in result.boxes:
#             class_id = int(box.cls[0])
#             confidence = float(box.conf[0])

#             # YOLO class 0 = person
#             if class_id == 0 and confidence >= args.person_conf:
#                 x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
#                 snapshot_path = save_snapshot(frame, "person")
#                 emit_event("person", confidence, [x1, y1, x2, y2], snapshot_path)

#     # ───────── FIRE / SMOKE DETECTION ─────────
#     if fire_model is not None:
#         try:
#             fire_results = fire_model.predict(frame, verbose=False, conf=args.fire_conf)
#         except Exception as e:
#             print(f"[{args.camera_id}] Fire model error: {e}", file=sys.stderr, flush=True)
#             fire_results = []

#         for result in fire_results:
#             for box in result.boxes:
#                 class_id = int(box.cls[0])
#                 confidence = float(box.conf[0])
#                 class_name = fire_model.names.get(class_id, "unknown").lower()

#                 if "fire" in class_name and confidence >= args.fire_conf:
#                     x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
#                     snapshot_path = save_snapshot(frame, "fire")
#                     emit_event("fire", confidence, [x1, y1, x2, y2], snapshot_path)

#                 elif "smoke" in class_name and confidence >= args.fire_conf:
#                     x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
#                     snapshot_path = save_snapshot(frame, "smoke")
#                     emit_event("smoke", confidence, [x1, y1, x2, y2], snapshot_path)


# cap.release()
# print(json.dumps({"type": "exit"}), flush=True)






"""
RTSP + YOLO detection worker.

Emits JSON Lines on stdout:
{
    "type": "person|fire|smoke",
    "confidence": 0.85,
    "bbox": [x1, y1, x2, y2],
    "snapshot": "/absolute/path/to/image.jpg",
    "ts": 1234567890000
}

Cross-platform: Windows, macOS and Linux.
"""

import argparse
import json
import os
import re
import signal
import sys
import time
import threading
from datetime import datetime
from pathlib import Path

import cv2
from ultralytics import YOLO


# ============================================================
# ARGUMENTS
# ============================================================

parser = argparse.ArgumentParser(
    description="Cross-platform RTSP YOLO detection worker"
)

parser.add_argument("--rtsp", required=True)
parser.add_argument("--model", required=True)
parser.add_argument("--fire-model", default="")
parser.add_argument("--person-conf", type=float, default=0.45)
parser.add_argument("--fire-conf", type=float, default=0.50)
parser.add_argument("--sample-rate", type=int, default=5)
parser.add_argument("--camera-id", required=True)
parser.add_argument("--snapshot-dir", default="./snapshots")

args = parser.parse_args()


# ============================================================
# VALIDATION
# ============================================================

if not 0.0 <= args.person_conf <= 1.0:
    parser.error("--person-conf must be between 0 and 1")

if not 0.0 <= args.fire_conf <= 1.0:
    parser.error("--fire-conf must be between 0 and 1")

if args.sample_rate < 1:
    parser.error("--sample-rate must be at least 1")

if not args.camera_id.strip():
    parser.error("--camera-id cannot be empty")


# ============================================================
# PATHS — WINDOWS / MACOS / LINUX
# ============================================================

def safe_path_component(value: str) -> str:
    """
    Prevent camera IDs from creating unintended directories.
    Typical UUIDs and alphanumeric IDs remain unchanged.
    """
    value = str(value).strip()

    if value in ("", ".", ".."):
        raise ValueError("Invalid camera ID")

    safe_value = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", value)

    if not safe_value:
        raise ValueError("Invalid camera ID")

    return safe_value


CAMERA_DIR_NAME = safe_path_component(args.camera_id)

# Absolute filesystem path. pathlib handles OS-specific separators.
SNAPSHOT_ROOT = Path(args.snapshot_dir).expanduser().resolve()
SNAPSHOT_DIR = SNAPSHOT_ROOT / CAMERA_DIR_NAME

try:
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
except OSError as exc:
    print(
        f"[{args.camera_id}] Snapshot directory error: {exc}",
        file=sys.stderr,
        flush=True,
    )
    sys.exit(1)


# ============================================================
# LOGGING
# stdout = JSON events only
# stderr = diagnostic logs
# ============================================================

def log(message: str) -> None:
    print(
        f"[{args.camera_id}] {message}",
        file=sys.stderr,
        flush=True,
    )


def emit_event(
    event_type: str,
    confidence: float = 0.0,
    bbox=None,
    snapshot_path=None,
) -> None:
    """Emit exactly one JSON object per stdout line."""

    payload = {
        "type": event_type,
        "confidence": round(float(confidence), 3),
        "bbox": bbox if bbox is not None else [],
        "snapshot": snapshot_path,
        "ts": int(time.time() * 1000),
    }

    print(
        json.dumps(payload, ensure_ascii=False),
        flush=True,
    )


# ============================================================
# SNAPSHOT SAVING
# ============================================================

def save_snapshot(frame, label: str):
    """
    Save a snapshot inside:
        snapshots/<camera-id>/<label>_<timestamp>.jpg

    Returns:
        Absolute path with forward slashes on every OS,
        or None if saving fails.

    Note:
        This is a filesystem path, not an HTTP URL.
    """

    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")

        filename = f"{label}_{timestamp}.jpg"
        file_path = SNAPSHOT_DIR / filename

        success = cv2.imwrite(str(file_path), frame)

        if not success:
            log(f"Failed to write snapshot: {file_path}")
            return None

        # Normalize returned path for cross-platform consumers.
        # Example Windows path: C:/app/snapshots/camera1/person.jpg
        return file_path.resolve().as_posix()

    except (OSError, ValueError, cv2.error) as exc:
        log(f"Snapshot save failed ({label}): {exc}")
        return None


# ============================================================
# GRACEFUL SHUTDOWN
# ============================================================

shutdown_event = threading.Event()


def _handle_signal(signum, _frame):
    # Keep signal handler simple and safe.
    shutdown_event.set()


signal.signal(signal.SIGTERM, _handle_signal)
signal.signal(signal.SIGINT, _handle_signal)


# ============================================================
# LOAD MODELS
# ============================================================

log(f"Loading person model: {args.model}")

try:
    person_model = YOLO(args.model)
except Exception as exc:
    log(f"Person model load failed: {exc}")
    sys.exit(1)


fire_model = None

if args.fire_model:
    if os.path.isfile(args.fire_model):
        log(f"Loading fire model: {args.fire_model}")

        try:
            fire_model = YOLO(args.fire_model)
            log(f"Fire model loaded. Classes: {fire_model.names}")
        except Exception as exc:
            log(f"Fire model load failed; fire detection disabled: {exc}")
    else:
        log(
            f"Fire model not found; fire detection disabled: "
            f"{args.fire_model}"
        )
else:
    log("No fire model provided; fire detection disabled")


# ============================================================
# RTSP CONNECTION / AUTO-RECONNECT
# ============================================================

def open_capture(url: str):
    cap = cv2.VideoCapture(url, cv2.CAP_FFMPEG)

    if not cap.isOpened():
        cap.release()
        return None

    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    return cap


def reconnect_loop():
    backoff = 1

    while not shutdown_event.is_set():
        cap = open_capture(args.rtsp)

        if cap is not None:
            log("RTSP connected")
            return cap

        log(f"RTSP open failed; retrying in {backoff}s")

        if shutdown_event.wait(backoff):
            break

        backoff = min(backoff * 2, 30)

    return None


# ============================================================
# DETECTION HELPERS
# ============================================================

def get_class_name(model, class_id: int) -> str:
    """Support dict and list-style model.names."""

    names = model.names

    if isinstance(names, dict):
        name = names.get(class_id, "unknown")
    elif isinstance(names, (list, tuple)) and 0 <= class_id < len(names):
        name = names[class_id]
    else:
        name = "unknown"

    return str(name).lower()


def process_person_detections(frame):
    try:
        results = person_model.predict(
            frame,
            verbose=False,
            conf=args.person_conf,
        )
    except Exception as exc:
        log(f"Person model error: {exc}")
        return

    for result in results:
        if result.boxes is None:
            continue

        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            # Standard YOLO COCO class 0 = person.
            if class_id != 0 or confidence < args.person_conf:
                continue

            x1, y1, x2, y2 = [
                int(value) for value in box.xyxy[0].tolist()
            ]

            snapshot_path = save_snapshot(frame, "person")

            emit_event(
                event_type="person",
                confidence=confidence,
                bbox=[x1, y1, x2, y2],
                snapshot_path=snapshot_path,
            )


def process_fire_detections(frame):
    if fire_model is None:
        return

    try:
        results = fire_model.predict(
            frame,
            verbose=False,
            conf=args.fire_conf,
        )
    except Exception as exc:
        log(f"Fire model error: {exc}")
        return

    for result in results:
        if result.boxes is None:
            continue

        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            if confidence < args.fire_conf:
                continue

            class_name = get_class_name(fire_model, class_id)

            if "fire" in class_name:
                event_type = "fire"
            elif "smoke" in class_name:
                event_type = "smoke"
            else:
                continue

            x1, y1, x2, y2 = [
                int(value) for value in box.xyxy[0].tolist()
            ]

            snapshot_path = save_snapshot(frame, event_type)

            emit_event(
                event_type=event_type,
                confidence=confidence,
                bbox=[x1, y1, x2, y2],
                snapshot_path=snapshot_path,
            )


# ============================================================
# MAIN LOOP
# ============================================================

def main():
    cap = None

    frame_count = 0
    fail_count = 0
    max_failures = 50

    try:
        cap = reconnect_loop()

        if cap is None:
            return 1

        while not shutdown_event.is_set():
            ret, frame = cap.read()

            if not ret:
                fail_count += 1

                if fail_count >= max_failures:
                    log("Too many frame read failures; reconnecting")

                    cap.release()
                    cap = None

                    if shutdown_event.is_set():
                        break

                    cap = reconnect_loop()

                    if cap is None:
                        break

                    fail_count = 0

                else:
                    shutdown_event.wait(0.05)

                continue

            fail_count = 0
            frame_count += 1

            # Process every Nth frame.
            if frame_count % args.sample_rate != 0:
                continue

            process_person_detections(frame)
            process_fire_detections(frame)

        return 0

    except Exception as exc:
        log(f"Worker error: {exc}")
        return 1

    finally:
        if cap is not None:
            cap.release()

        log("Worker stopped")
        emit_event("exit")


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)

