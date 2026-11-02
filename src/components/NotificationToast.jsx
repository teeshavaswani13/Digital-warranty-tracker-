import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, X, ArrowRight, BellRing } from 'lucide-react';
import { notificationService } from '../services/notifications.js';

export const NotificationToast = ({ alerts = [], onSelectProductById }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Find the most urgent alert (e.g. expiring today, or soonest days)
  const urgentAlert = alerts[0];

  useEffect(() => {
    if (urgentAlert && !dismissed) {
      setIsVisible(true);
      // Also attempt desktop notification if permission was already granted
      notificationService.notifyExpiry(urgentAlert);
    }
  }, [urgentAlert, dismissed]);

  if (!isVisible || !urgentAlert || dismissed) return null;

  const isToday = urgentAlert.daysRemaining === 0 || urgentAlert.isToday;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`p-4 rounded-2xl shadow-xl border backdrop-blur-md ${
          isToday
            ? 'bg-rose-50/95 border-rose-300 text-rose-950'
            : 'bg-amber-50/95 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isToday ? 'bg-rose-200/80 text-rose-700 animate-pulse' : 'bg-amber-200/80 text-amber-800'
              }`}
            >
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isToday ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                  }`}
                >
                  {isToday ? '🚨 Expiring Today' : `⚠️ Expiring in ${urgentAlert.daysRemaining} days`}
                </span>
              </div>
              <h4 className="text-xs font-bold leading-tight mt-1">
                {urgentAlert.productName} ({urgentAlert.brandName})
              </h4>
              <p className="text-[11px] opacity-90 mt-1 leading-snug">
                {urgentAlert.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 opacity-60 hover:opacity-100 rounded-lg cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between">
          <span className="text-[10px] opacity-75">
            {alerts.length > 1 ? `+${alerts.length - 1} more warranty alerts` : 'Take action now'}
          </span>
          <button
            onClick={() => {
              onSelectProductById(urgentAlert.id);
              setDismissed(true);
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs ${
              isToday
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-amber-600 hover:bg-amber-700 text-white'
            }`}
          >
            <span>View Product</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
