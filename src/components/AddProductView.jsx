import React, { useState } from 'react';
import { PackagePlus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ProductForm } from './ProductForm.jsx';

export const AddProductView = ({ onAddProduct, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      await onAddProduct(payload);
      setShowSuccessToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Top navigation row */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {showSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-sm font-bold">Product Added Successfully!</div>
              <div className="text-xs text-emerald-700 mt-0.5">
                The warranty record was created and expiry calculations have been saved.
              </div>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            View Products
          </button>
        </div>
      )}

      {/* Main Form Card */}
      <div className="form-card">
        <div className="flex items-center gap-3 pb-5 mb-6 border-b border-purple-100">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <PackagePlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Add New Warranty Record</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in product and purchase info to track warranty lifecycle automatically
            </p>
          </div>
        </div>

        <ProductForm
          onSubmit={handleSubmit}
          onCancel={onBack}
          isSubmitting={isSubmitting}
          submitButtonText="Register Warranty"
        />
      </div>
    </div>
  );
};
