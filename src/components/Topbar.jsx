import React, { useState } from 'react';
import { Menu, Plus, Bell } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter.jsx';

export const Topbar = ({
  currentView,
  onNavigate,
  onOpenSidebar,
  alerts = [],
  onSelectProductById,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const getTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Warranty Overview';
      case 'products':
        return 'My Saved Products';
      case 'add':
        return 'Register New Product';
      default:
        return 'Dashboard';
    }
  };

  const getSubtitle = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Live status, statistics and upcoming expiry alerts';
      case 'products':
        return 'Browse, search, edit, and manage all your product warranties';
      case 'add':
        return 'Enter purchase information to automatically calculate warranty duration';
      default:
        return '';
    }
  };

  const hasTodayExpiry = alerts.some((a) => a.daysRemaining === 0 || a.isToday);

  return (
    <header className="dashboard-topbar">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {getTitle()}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 mt-0.5">{getSubtitle()}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
              isNotificationsOpen
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 border-purple-100'
            }`}
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span
                className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs ${
                  hasTodayExpiry ? 'bg-rose-600 animate-pulse ring-2 ring-rose-200' : 'bg-amber-500'
                }`}
              >
                {alerts.length}
              </span>
            )}
          </button>

          <NotificationCenter
            alerts={alerts}
            onSelectProductById={onSelectProductById}
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        {currentView !== 'add' && (
          <button
            onClick={() => onNavigate('add')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>
    </header>
  );
};
