# hmdc_status_only.py  (drop-in replacement for Option A status server)
import time
import numpy as np
from flask import Flask, jsonify, Response
from threading import Thread

# ----------------- CONFIG -----------------
# This file intentionally DOES NOT open the camera or run YOLO.
# Browser (dashboard) will handle camera and uploads (MediaRecorder).
STATUS_POLL_INTERVAL = 1.0

# ----------------- SHARED STATE FOR SERVER -----------------
app = Flask(__name__)
status_obj = {"status": "idle"}   # "idle" or "recording"
latest_frame = None

# Allow dashboard to fetch status
@app.after_request
def add_cors(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    return resp

@app.get("/status")
def get_status():
    # return a small JSON with status (browser sets recording state locally)
    return jsonify(status_obj)

# lightweight mjpeg stub (returns a placeholder image so previous UI using /video_feed won't break)
def gen_mjpeg():
    while True:
        # return a tiny black jpeg repeatedly
        img = np.zeros((240, 320, 3), dtype=np.uint8)
        import cv2
        ok, jpeg = cv2.imencode(".jpg", img)
        if ok:
            yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpeg.tobytes() + b"\r\n")
        time.sleep(0.1)

@app.get("/video_feed")
def video_feed():
    # optional: keeps your old UI using /video_feed working (shows black frames)
    return Response(gen_mjpeg(), mimetype="multipart/x-mixed-replace; boundary=frame")

def run_status_server():
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)

if __name__ == "__main__":
    Thread(target=run_status_server, daemon=True).start()
    print("[HMDC status-only] Running on port 5000. Camera capture disabled (Option A).")
    try:
        while True:
            # keep alive so user can poll /status; you may update status_obj from elsewhere if desired
            time.sleep(STATUS_POLL_INTERVAL)
    except KeyboardInterrupt:
        print("Stopping status-only server.")
