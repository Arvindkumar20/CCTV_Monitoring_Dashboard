// frontend/src/components/LiveFeed/VideoStatusOverlay.jsx
import React from "react";

export const VideoStatusOverlay = ({ type, message, subMessage, onRetry }) => {
  const variants = {
    loading: {
      icon: '🔄',
      color: 'text-blue-400',
      bgColor: 'bg-black/90'
    },
    error: {
      icon: '⚠️',
      color: 'text-red-400',
      bgColor: 'bg-black/90'
    },
    idle: {
      icon: '📹',
      color: 'text-white/50',
      bgColor: 'bg-black/70'
    }
  };

  const variant = variants[type] || variants.idle;

  return (
    <div className={`absolute inset-0 flex items-center justify-center ${variant.bgColor}`}>
      <div className="text-center max-w-sm p-6 bg-white/5 rounded-xl border border-white/10">
        <div className={`text-4xl mb-3 ${variant.color}`}>{variant.icon}</div>
        <p className="text-white font-bold mb-2">{message}</p>
        {subMessage && (
          <p className="text-white/70 text-sm">{subMessage}</p>
        )}
        {type === 'loading' && (
          <div className="mt-3 flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {type === 'error' && onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};