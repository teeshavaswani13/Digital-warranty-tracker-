import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Tag,
  DollarSign,
  Barcode,
  Store,
  FileText,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { calculateExpiryDate, calculateWarrantyStatus, formatDateDisplay } from '../services/api.js';
import { StatusBadge } from './StatusBadge.jsx';

export const CATEGORIES = [
  'Electronics',
  'Home Appliances',
  'Mobile & Gadgets',
  'Computing',
  'Audio',
  'Wearables & Smartwatches',
  'Gaming & VR',
  'Cameras & Optics',
  'Automotive & Tools',
  'Office & Furniture',
  'Other',
];

const DURATION_PRESETS = [
  { label: '6 Mo', value: 6 },
  { label: '1 Yr', value: 12 },
  { label: '2 Yrs', value: 24 },
  { label: '3 Yrs', value: 36 },
  { label: '5 Yrs', value: 60 },
];

export const ProductForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitButtonText = 'Save Product Warranty',
  isEditMode = false,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [productName, setProductName] = useState(initialData?.productName || '');
  const [brandName, setBrandName] = useState(initialData?.brandName || '');
  const [category, setCategory] = useState(initialData?.category || 'Electronics');
  const [purchaseDate, setPurchaseDate] = useState(initialData?.purchaseDate || todayStr);
  const [durationMonths, setDurationMonths] = useState(
    initialData?.warrantyDurationMonths || 12
  );
  const [price, setPrice] = useState(
    initialData?.price !== undefined ? String(initialData.price) : ''
  );
  const [serialNumber, setSerialNumber] = useState(initialData?.serialNumber || '');
  const [storeName, setStoreName] = useState(initialData?.storeName || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [formError, setFormError] = useState(null);

  // Live auto-calculated expiry date & status
  const calculatedExpiry = calculateExpiryDate(purchaseDate, durationMonths);
  const projectedStatus = calculateWarrantyStatus(calculatedExpiry);

  useEffect(() => {
    if (initialData) {
      setProductName(initialData.productName || '');
      setBrandName(initialData.brandName || '');
      setCategory(initialData.category || 'Electronics');
      setPurchaseDate(initialData.purchaseDate || todayStr);
      setDurationMonths(initialData.warrantyDurationMonths || 12);
      setPrice(initialData.price !== undefined ? String(initialData.price) : '');
      setSerialNumber(initialData.serialNumber || '');
      setStoreName(initialData.storeName || '');
      setNotes(initialData.notes || '');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!productName.trim()) {
      setFormError('Please enter a product name.');
      return;
    }
    if (!brandName.trim()) {
      setFormError('Please enter a brand name.');
      return;
    }
    if (!purchaseDate) {
      setFormError('Please select a valid purchase date.');
      return;
    }
    if (!durationMonths || durationMonths <= 0) {
      setFormError('Warranty duration must be at least 1 month.');
      return;
    }

    try {
      await onSubmit({
        productName: productName.trim(),
        brandName: brandName.trim(),
        category,
        purchaseDate,
        warrantyDurationMonths: durationMonths,
        price: price ? parseFloat(price) : '',
        serialNumber: serialNumber.trim() || undefined,
        storeName: storeName.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } catch (err) {
      setFormError(err.message || 'Failed to save product details.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl">
          {formError}
        </div>
      )}

      {/* Row 1: Product Name & Brand */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-name">
            Product Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="prod-name"
            type="text"
            required
            placeholder="e.g. MacBook Pro 16, OLED TV, Cordless Vacuum"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="form-input-control"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-brand">
            Brand Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="prod-brand"
            type="text"
            required
            placeholder="e.g. Apple, Sony, Samsung, Dyson, LG"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="form-input-control"
          />
        </div>
      </div>

      {/* Row 2: Category & Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-cat">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            id="prod-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input-control bg-white cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-price">
            Product Price (₹ INR) <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
            <input
              id="prod-price"
              type="number"
              step="1"
              min="0"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="form-input-control pl-7"
            />
          </div>
        </div>
      </div>

      {/* Row 3: Purchase Date & Warranty Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-pdate">
            Purchase Date <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="prod-pdate"
              type="date"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="form-input-control"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700" htmlFor="prod-duration">
              Warranty Duration (Months) <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-purple-700 font-medium">
              {durationMonths >= 12
                ? `${(durationMonths / 12).toFixed(1).replace('.0', '')} Year(s)`
                : `${durationMonths} Month(s)`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="prod-duration"
              type="number"
              min="1"
              max="240"
              required
              value={durationMonths || ''}
              onChange={(e) => setDurationMonths(parseInt(e.target.value, 10) || 0)}
              className="form-input-control w-28 tabular-nums"
            />
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setDurationMonths(preset.value)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    durationMonths === preset.value
                      ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                      : 'bg-purple-50/50 text-purple-700 border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Auto-Calculated Expiry Preview Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50/80 via-purple-50/40 to-white border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
              Automatic Expiry Calculation
            </div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">
              Expires: <span className="text-purple-950 font-bold">{formatDateDisplay(calculatedExpiry)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-500">Calculated Status:</span>
          <StatusBadge
            status={projectedStatus.status}
            daysRemaining={projectedStatus.daysRemaining}
            showDays={true}
          />
        </div>
      </div>

      {/* Row 4: Optional Fields - Serial Number & Store Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-serial">
            Serial Number <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id="prod-serial"
            type="text"
            placeholder="e.g. SN-8942-0199 or IMEI"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            className="form-input-control"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-store">
            Store / Retailer Name <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            id="prod-store"
            type="text"
            placeholder="e.g. Amazon, Apple Store, Best Buy, Walmart"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="form-input-control"
          />
        </div>
      </div>

      {/* Notes / Receipt details */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="prod-notes">
          Notes / Warranty Terms <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          id="prod-notes"
          rows={3}
          placeholder="e.g. Accidental damage not included. Receipt saved in email invoice folder #2026."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="form-input-control"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{submitButtonText}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
