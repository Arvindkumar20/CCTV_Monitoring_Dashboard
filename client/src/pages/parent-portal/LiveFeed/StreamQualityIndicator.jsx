// frontend/src/components/LiveFeed/StreamQualityIndicator.jsx
import React from "react";

export const StreamQualityIndicator = ({ bitrate, latency, quality }) => {
  const formatBitrate = (bps) => {
    if (!bps) return '0 Kbps';
    if (bps > 1000) {
      return `${(bps / 1000).toFixed(1)} Mbps`;
    }
    return `${bps} Kbps`;
  };

  const getQualityColor = () => {
    if (latency < 2) return 'text-green-400';
    if (latency < 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-2">
      <span className="text-white/60">Quality</span>
      <span className="text-white/80">{quality}</span>
      {bitrate > 0 && (
        <>
          <span className="text-white/30">|</span>
          <span className="text-white/60">{formatBitrate(bitrate)}</span>
        </>
      )}
      {latency > 0 && (
        <>
          <span className="text-white/30">|</span>
          <span className={`${getQualityColor()}`}>
            {latency}s
          </span>
        </>
      )}
    </div>
  );
};