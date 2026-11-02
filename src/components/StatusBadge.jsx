import React from 'react';
import { ShieldCheck, AlertTriangle, ClockAlert } from 'lucide-react';

export const StatusBadge = ({ status, daysRemaining, showDays = false }) => {
  if (status === 'active') {
    return (
      <span className="badge-status active">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Active</span>
        {showDays && daysRemaining !== undefined && daysRemaining > 0 && (
          <span className="text-[11px] font-normal opacity-85">({daysRemaining}d left)</span>
        )}
      </span>
    );
  }

  if (status === 'expiring_soon') {
    return (
      <span className="badge-status expiring_soon">
        <ClockAlert className="w-3.5 h-3.5" />
        <span>Expiring Soon</span>
        {showDays && daysRemaining !== undefined && (
          <span className="text-[11px] font-bold">
            ({daysRemaining === 0 ? 'Today' : `${daysRemaining}d`})
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="badge-status expired">
      <AlertTriangle className="w-3.5 h-3.5" />
      <span>Expired</span>
    </span>
  );
};
