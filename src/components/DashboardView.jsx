import React from 'react';
import {
  Package,
  ShieldCheck,
  ClockAlert,
  AlertTriangle,
  ArrowRight,
  Plus,
  Calendar,
  Building2,
  BellRing,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';
import { formatDateDisplay, formatCurrency } from '../services/api.js';

export const DashboardView = ({
  stats,
  isLoading,
  onNavigateProducts,
  onNavigateAdd,
  onSelectProduct,
  onFilterStatus,
}) => {
  if (isLoading && !stats) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-purple-100" />
          ))}
        </div>
        <div className="h-48 bg-white rounded-2xl animate-pulse border border-purple-100" />
        <div className="h-64 bg-white rounded-2xl animate-pulse border border-purple-100" />
      </div>
    );
  }

  const total = stats?.totalProducts ?? 0;
  const active = stats?.activeWarranties ?? 0;
  const expiring = stats?.expiringSoon ?? 0;
  const expired = stats?.expiredWarranties ?? 0;
  const alerts = stats?.upcomingAlerts ?? [];
  const recentProducts = stats?.recentProducts ?? [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* 4 Summary KPI Cards */}
      <section aria-label="Warranty summary statistics">
        <div className="summary-cards-grid">
          {/* Card 1: Total Products */}
          <div
            onClick={onNavigateProducts}
            className="stat-card cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Products
              </span>
              <div className="stat-card-icon-well bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="stat-card-val text-purple-950">{total}</div>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
              <span>Saved in your vault</span>
              <span className="text-purple-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                View all <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 2: Active Warranties */}
          <div
            onClick={() => onFilterStatus('active')}
            className="stat-card cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Active Warranties
              </span>
              <div className="stat-card-icon-well bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="stat-card-val text-emerald-900">{active}</div>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
              <span>Protected items</span>
              <span className="text-emerald-700 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Filter <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 3: Expiring Soon */}
          <div
            onClick={() => onFilterStatus('expiring_soon')}
            className={`stat-card cursor-pointer group ${
              expiring > 0 ? 'ring-2 ring-amber-400/40 bg-amber-50/20' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Expiring Soon
              </span>
              <div className="stat-card-icon-well bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                <ClockAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="stat-card-val text-amber-900">{expiring}</div>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
              <span>Next 30 days</span>
              <span className="text-amber-700 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Review <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 4: Expired Warranties */}
          <div
            onClick={() => onFilterStatus('expired')}
            className="stat-card cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                Expired Warranties
              </span>
              <div className="stat-card-icon-well bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="stat-card-val text-rose-950">{expired}</div>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
              <span>Warranty lapsed</span>
              <span className="text-rose-700 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                View <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Critical Expiry Alert Banner (Expiring Today) */}
      {alerts.some((a) => a.daysRemaining === 0 || a.isToday) && (
        <section aria-label="Critical expiry alert" className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
              <h2 className="text-sm sm:text-base font-bold text-rose-950 flex items-center gap-2">
                <span>🚨 Action Required: Warranty Expiring Today!</span>
              </h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-rose-200/80 text-rose-900 rounded-full self-start sm:self-auto">
              Lapses at Midnight
            </span>
          </div>

          <div className="space-y-2">
            {alerts
              .filter((a) => a.daysRemaining === 0 || a.isToday)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-white/80 rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {alert.brandName} - {alert.productName}
                    </div>
                    <div className="text-xs text-rose-800 font-medium mt-0.5">
                      {alert.message}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const match = recentProducts.find((p) => p._id === alert.id);
                      if (match) onSelectProduct(match);
                      else onFilterStatus('expiring_soon');
                    }}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1 shrink-0"
                  >
                    <span>View & Claim</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Upcoming Warranty Expiry Alerts (Expiring in Days) */}
      {alerts.some((a) => a.daysRemaining > 0) && (
        <section aria-label="Upcoming expiry notifications" className="alerts-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-900">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <BellRing className="w-4 h-4 text-amber-700" />
              </div>
              <h2 className="text-base font-bold">Upcoming Expiry Alerts (Expiring in Days)</h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-amber-200/70 text-amber-900 rounded-full tabular-nums">
                {alerts.filter((a) => a.daysRemaining > 0).length}
              </span>
            </div>
            <button
              onClick={() => onFilterStatus('expiring_soon')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
            >
              See all expiring
            </button>
          </div>
          <p className="text-xs text-amber-800/80 mb-3">
            The following product warranties will lapse within the next 30 days. Plan service requests or claims before expiration:
          </p>

          <div className="space-y-2.5">
            {alerts
              .filter((a) => a.daysRemaining > 0)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="alert-item group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div>
                      <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <span>{alert.message}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-amber-200/60 text-amber-900 rounded-md">
                          in {alert.daysRemaining}d
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Brand: {alert.brandName}</span>
                        <span>·</span>
                        <span>Expires on: {formatDateDisplay(alert.warrantyExpiryDate)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const match = recentProducts.find((p) => p._id === alert.id);
                      if (match) onSelectProduct(match);
                      else onFilterStatus('expiring_soon');
                    }}
                    className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Recently Added Products Section */}
      <section className="bg-white border border-purple-100 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-purple-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Recently Added Products
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest items registered to your digital warranty tracker
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={onNavigateAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
            <button
              onClick={onNavigateProducts}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <span>View All ({total})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {recentProducts.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-purple-100 rounded-xl bg-purple-50/30">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 mx-auto flex items-center justify-center mb-3">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No products recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Register your first appliance, electronics, or gadget to start automatically tracking its warranty status.
            </p>
            <button
              onClick={onNavigateAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Product</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => onSelectProduct(product)}
                className="p-4 rounded-xl border border-purple-100/80 bg-purple-50/20 hover:bg-purple-50/60 hover:border-purple-200 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide">
                        {product.brandName}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-800 transition-colors line-clamp-1">
                        {product.productName}
                      </h4>
                    </div>
                    <StatusBadge
                      status={product.warrantyStatus}
                      daysRemaining={product.daysRemaining}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3 pt-3 border-t border-purple-100/60">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Purchased: {formatDateDisplay(product.purchaseDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ClockAlert className="w-3.5 h-3.5 text-slate-400" />
                      <span>Expires: {formatDateDisplay(product.warrantyExpiryDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{product.category}</span>
                    {product.price !== undefined && (
                      <span className="font-medium text-slate-700 tabular-nums">· {formatCurrency(product.price)}</span>
                    )}
                  </div>
                  <span className="font-medium text-purple-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px]">
                    View <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
