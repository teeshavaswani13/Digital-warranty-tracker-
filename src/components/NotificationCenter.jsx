import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  AlertTriangle,
  ClockAlert,
  X,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';
import { notificationService } from '../services/notifications.js';
import { formatDateDisplay } from '../services/api.js';

export const NotificationCenter = ({
  alerts = [],
  onSelectProductById,
  isOpen,
  onClose,
}) => {
  const [browserPermission, setBrowserPermission] = useState(notificationService.getPermission());
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    setBrowserPermission(notificationService.getPermission());
  }, [isOpen]);

  const handleEnableBrowserNotifications = async () => {
    const perm = await notificationService.requestPermission();
    setBrowserPermission(perm);
    setHasRequested(true);
    if (perm === 'granted' && alerts.length > 0) {
      notificationService.notifyAllUpcoming(alerts);
    }
  };

  if (!isOpen) return null;

  const todayAlerts = alerts.filter((a) => a.daysRemaining === 0 || a.isToday);
  const upcomingAlerts = alerts.filter((a) => a.daysRemaining > 0);

  return (
    <>
      {/* Click outside backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className="absolute right-0 top-12 w-80 sm:w-96 bg-white border border-purple-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-white border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Warranty Notifications</div>
              <div className="text-[11px] text-slate-500">
                {alerts.length === 0
                  ? 'No pending expiry alerts'
                  : `${alerts.length} item${alerts.length > 1 ? 's' : ''} expiring soon`}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Browser Push Notification Permission Banner */}
        {notificationService.isSupported() && browserPermission !== 'granted' && (
          <div className="p-3 bg-purple-50/70 border-b border-purple-100 flex items-center justify-between gap-2 text-xs">
            <div className="text-purple-900 text-[11px] leading-tight">
              Get desktop alerts when warranties are about to expire.
            </div>
            <button
              type="button"
              onClick={handleEnableBrowserNotifications}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-[11px] shrink-0 transition-colors cursor-pointer"
            >
              Enable
            </button>
          </div>
        )}

        {/* Alerts List */}
        <div className="max-h-80 overflow-y-auto p-3 space-y-2.5">
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <div className="font-semibold text-slate-700">All warranties are in good standing!</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                No items are expiring in the next 30 days.
              </div>
            </div>
          ) : (
            <>
              {/* TODAY ALERTS */}
              {todayAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => {
                    onSelectProductById(alert.id);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100/70 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-rose-600 mt-1.5 shrink-0 animate-ping" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-200/60 px-2 py-0.5 rounded-full">
                          Expires Today
                        </span>
                        <span className="text-[10px] font-mono text-rose-600 font-semibold">
                          0d left
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-rose-950 transition-colors">
                        {alert.productName} ({alert.brandName})
                      </div>
                      <p className="text-[11px] text-rose-800 mt-1 leading-snug">
                        {alert.message}
                      </p>
                      <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
                        <span>Expiry Date: {formatDateDisplay(alert.warrantyExpiryDate)}</span>
                        <span className="text-rose-700 font-semibold flex items-center gap-0.5 group-hover:underline">
                          View Details <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* UPCOMING ALERTS (in days) */}
              {upcomingAlerts.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => {
                    onSelectProductById(alert.id);
                    onClose();
                  }}
                  className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-200/50 px-2 py-0.5 rounded-full">
                          Expires in {alert.daysRemaining} {alert.daysRemaining === 1 ? 'day' : 'days'}
                        </span>
                        <span className="text-[10px] font-mono text-amber-700 font-semibold">
                          {alert.daysRemaining}d left
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-amber-950 transition-colors">
                        {alert.productName} ({alert.brandName})
                      </div>
                      <p className="text-[11px] text-amber-900 mt-1 leading-snug">
                        {alert.message}
                      </p>
                      <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
                        <span>Expiry Date: {formatDateDisplay(alert.warrantyExpiryDate)}</span>
                        <span className="text-amber-800 font-semibold flex items-center gap-0.5 group-hover:underline">
                          View Details <ExternalLink className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
};
