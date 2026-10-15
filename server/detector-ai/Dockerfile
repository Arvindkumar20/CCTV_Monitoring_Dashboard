FROM python:3.11-slim

# system deps for opencv + ffmpeg
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 libxext6 libgl1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# requirements copy + install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir websockets

# code copy
COPY detector.py .

# models volume se mount honge, image me nahi
# (ya agar chhote hai to COPY kar do)

ENV DETECTOR_HOST=0.0.0.0
ENV DETECTOR_PORT=8765
ENV DETECTOR_SNAPSHOT_DIR=/snapshots

EXPOSE 8765

CMD ["python", "detector.py"]