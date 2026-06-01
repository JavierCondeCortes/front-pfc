import React from 'react';

const typeStyles = {
  error: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
};

const iconMap = {
  error: 'error',
  success: 'check_circle',
  warning: 'warning',
  info: 'info',
};

const AlertItem = ({ type = 'info', message }) => (
  <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 border shadow animate-fade-in ${typeStyles[type] || typeStyles.info}`}>
    <span className="material-symbols-outlined text-base" style={{ color: type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : type === 'warning' ? '#eab308' : '#3b82f6' }}>
      {iconMap[type] || iconMap.info}
    </span>
    <span>{message}</span>
  </div>
);

export default AlertItem;
