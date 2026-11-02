import React from 'react';
import {
  Shield,
  LayoutDashboard,
  Package,
  PlusCircle,
  LogOut,
  X,
  User as UserIcon,
} from 'lucide-react';

export const Sidebar = ({
  currentView,
  onNavigate,
  user,
  onLogout,
  isOpen,
  onClose,
  totalProductsCount = 0,
}) => {
  const handleItemClick = (view) => {
    onNavigate(view);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-35 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="dashboard-brand justify-between">
          <div className="flex items-center gap-3">
            <div className="dashboard-brand-icon">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 leading-tight">Warranty Tracker</div>
              <div className="text-[11px] font-medium text-purple-600">Digital Manager</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-6 space-y-1 overflow-y-auto px-2">
          <button
            onClick={() => handleItemClick('dashboard')}
            className={`w-full dashboard-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleItemClick('products')}
            className={`w-full dashboard-nav-item justify-between ${
              currentView === 'products' ? 'active' : ''
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Package className="w-4 h-4 shrink-0" />
              <span>My Products</span>
            </div>
            {totalProductsCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 tabular-nums">
                {totalProductsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleItemClick('add')}
            className={`w-full dashboard-nav-item ${currentView === 'add' ? 'active' : ''}`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Add Product</span>
          </button>
        </nav>

        {/* User Profile & Logout Bottom Section */}
        <div className="p-4 border-t border-purple-100/60 bg-purple-50/30">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-slate-900 truncate">{user?.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full dashboard-nav-item logout justify-center text-rose-600 hover:text-rose-700 bg-white border border-rose-100 hover:border-rose-200 shadow-2xs text-xs font-semibold py-2"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
