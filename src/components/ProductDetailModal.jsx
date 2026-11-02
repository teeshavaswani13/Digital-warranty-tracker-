import React, { useState } from 'react';
import {
  X,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Building2,
  DollarSign,
  Barcode,
  Store,
  FileText,
  Copy,
  Check,
  Shield,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';
import { formatDateDisplay, formatCurrency } from '../services/api.js';

export const ProductDetailModal = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [copiedSerial, setCopiedSerial] = useState(false);

  if (!isOpen || !product) return null;

  const handleCopySerial = () => {
    if (product.serialNumber) {
      navigator.clipboard.writeText(product.serialNumber);
      setCopiedSerial(true);
      setTimeout(() => setCopiedSerial(false), 2000);
    }
  };

  // Calculate percentage of warranty elapsed
  const pDate = new Date(product.purchaseDate).getTime();
  const eDate = new Date(product.warrantyExpiryDate).getTime();
  const now = new Date().getTime();
  const totalDurationMs = Math.max(1, eDate - pDate);
  const elapsedMs = Math.max(0, now - pDate);
  const percentElapsed = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-purple-100">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                {product.brandName} · {product.category}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5 leading-snug">
                {product.productName}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Timeline Banner */}
        <div className="my-5 p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Current Warranty Status</span>
            <StatusBadge
              status={product.warrantyStatus}
              daysRemaining={product.daysRemaining}
              showDays={true}
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Timeline progress</span>
              <span className="font-semibold tabular-nums">
                {product.warrantyStatus === 'expired' ? '100% Expired' : `${percentElapsed}% elapsed`}
              </span>
            </div>
            <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  product.warrantyStatus === 'expired'
                    ? 'bg-rose-500'
                    : product.warrantyStatus === 'expiring_soon'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${percentElapsed}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 font-medium text-slate-700">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Purchased</span>
              {formatDateDisplay(product.purchaseDate)}
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Expires</span>
              {formatDateDisplay(product.warrantyExpiryDate)}
            </div>
          </div>
        </div>

        {/* Detailed Grid Info */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>Duration</span>
            </div>
            <div className="font-bold text-slate-900 text-sm">
              {product.warrantyDurationMonths} Months{' '}
              <span className="text-xs font-normal text-slate-500">
                ({(product.warrantyDurationMonths / 12).toFixed(1).replace('.0', '')} yr)
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
              <span className="font-bold text-xs text-purple-600">₹</span>
              <span>Purchase Price</span>
            </div>
            <div className="font-bold text-slate-900 text-sm tabular-nums">
              {product.price !== undefined ? formatCurrency(product.price) : 'Not specified'}
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
              <Store className="w-3.5 h-3.5 text-purple-600" />
              <span>Store / Retailer</span>
            </div>
            <div className="font-bold text-slate-900 text-sm truncate">
              {product.storeName || 'Not specified'}
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-purple-600" />
                <span>Serial Number</span>
              </div>
              {product.serialNumber && (
                <button
                  type="button"
                  onClick={handleCopySerial}
                  className="text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
                  title="Copy serial number"
                >
                  {copiedSerial ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              )}
            </div>
            <div className="font-mono text-xs font-semibold text-slate-900 truncate">
              {product.serialNumber || 'Not specified'}
            </div>
          </div>
        </div>

        {/* Notes */}
        {product.notes && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Notes & Warranty Coverage</span>
            </div>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{product.notes}</p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-purple-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(product);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
