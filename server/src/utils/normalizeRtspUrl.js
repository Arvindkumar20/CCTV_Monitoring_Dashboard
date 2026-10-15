  normalizeRTSPUrl(url) {
    if (!url) return url;

    // Remove spaces
    url = url.trim();

    // If URL doesn't have protocol, add rtsp://
    if (!url.startsWith('rtsp://') && !url.startsWith('rtsps://')) {
      url = 'rtsp://' + url;
    }

    // Handle URLs with query parameters - escape them properly
    if (url.includes('?')) {
      // Some FFmpeg versions have issues with ? in URL
      // We'll keep it as is, FFmpeg handles it
    }

    // Handle IP without port
    const parts = url.replace('rtsp://', '').split('/');
    const hostPart = parts[0];
    if (!hostPart.includes(':')) {
      // No port specified, add default 554
      const newHost = hostPart + ':554';
      url = url.replace(hostPart, newHost);
    }

    console.log('🔗 Normalized RTSP URL:', url);
    return url;
  }