import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  Edit,
  Trash2,
  Calendar,
  ClockAlert,
  Plus,
  Building2,
  X,
  Package,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';
import { formatDateDisplay, formatCurrency } from '../services/api.js';
import { CATEGORIES } from './ProductForm.jsx';

export const MyProductsView = ({
  products,
  isLoading,
  onNavigateAdd,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
  initialStatusFilter = 'All',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState(initialStatusFilter);
  const [sortBy, setSortBy] = useState('expiry_asc');
  const [viewMode, setViewMode] = useState('grid');

  // Filter & Sort client-side for ultra-fast, smooth responsiveness
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.productName.toLowerCase().includes(q) ||
          p.brandName.toLowerCase().includes(q) ||
          (p.serialNumber && p.serialNumber.toLowerCase().includes(q)) ||
          (p.storeName && p.storeName.toLowerCase().includes(q))
      );
    }

    // Category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Status
    if (selectedStatus !== 'All') {
      result = result.filter((p) => p.warrantyStatus === selectedStatus);
    }

    // Sort
    if (sortBy === 'expiry_asc') {
      result.sort(
        (a, b) => new Date(a.warrantyExpiryDate).getTime() - new Date(b.warrantyExpiryDate).getTime()
      );
    } else if (sortBy === 'expiry_desc') {
      result.sort(
        (a, b) => new Date(b.warrantyExpiryDate).getTime() - new Date(a.warrantyExpiryDate).getTime()
      );
    } else if (sortBy === 'newest') {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sortBy === 'name_asc') {
      result.sort((a, b) => a.productName.localeCompare(b.productName));
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy]);

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedStatus !== 'All';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Search, Filter, Sort, and View Controls */}
      <div className="bg-white border border-purple-100 rounded-2xl p-4 md:p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by product name, brand, or serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs md:text-sm bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs md:text-sm bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:border-purple-600 text-slate-700 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs md:text-sm bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:border-purple-600 text-slate-700 cursor-pointer font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="expiring_soon">Expiring Soon (30d)</option>
              <option value="expired">Expired Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs md:text-sm bg-purple-50/30 border border-purple-100 rounded-xl focus:outline-none focus:border-purple-600 text-slate-700 cursor-pointer"
            >
              <option value="expiry_asc">Expiry: Soonest First</option>
              <option value="expiry_desc">Expiry: Furthest First</option>
              <option value="newest">Recently Added</option>
              <option value="name_asc">Product Name (A-Z)</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="md:col-span-1 flex items-center justify-end gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600 border-transparent hover:bg-slate-100'
              }`}
              title="Card Grid View"
              aria-label="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600 border-transparent hover:bg-slate-100'
              }`}
              title="Table View"
              aria-label="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results summary & Active filter badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-slate-900 font-semibold">{filteredProducts.length}</strong> of {products.length} products
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-purple-600 hover:text-purple-800 font-medium underline ml-2 cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && products.length === 0 ? (
        <div className="products-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-white rounded-2xl animate-pulse border border-purple-100" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-purple-100 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 mx-auto flex items-center justify-center mb-4">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No matching products found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            {hasActiveFilters
              ? 'Try modifying your search query or clear your category/status filters.'
              : 'Start your warranty tracking by registering your first product.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          ) : (
            <button
              onClick={onNavigateAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Product</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="product-card"
            >
              <div>
                {/* Header: Brand & Status badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                      {product.brandName}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5 line-clamp-1">
                      {product.productName}
                    </h3>
                  </div>
                  <StatusBadge
                    status={product.warrantyStatus}
                    daysRemaining={product.daysRemaining}
                    showDays={true}
                  />
                </div>

                <div className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700">{product.category}</span>
                  {product.price !== undefined && (
                    <span className="tabular-nums font-semibold text-slate-900">
                      · {formatCurrency(product.price)}
                    </span>
                  )}
                </div>

                {/* Dates breakdown */}
                <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-100/70 space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Purchased:</span>
                    </span>
                    <span className="font-medium text-slate-800">
                      {formatDateDisplay(product.purchaseDate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <ClockAlert className="w-3.5 h-3.5 text-slate-400" />
                      <span>Warranty Expiry:</span>
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatDateDisplay(product.warrantyExpiryDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-purple-100/60 mt-auto">
                <button
                  type="button"
                  onClick={() => onSelectProduct(product)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onEditProduct(product)}
                    className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Product"
                    aria-label="Edit Product"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteProduct(product)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Product"
                    aria-label="Delete Product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="products-table-wrapper overflow-x-auto">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Purchase Date</th>
                <th>Warranty Expiry</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="font-bold text-slate-900 leading-tight">
                      {product.productName}
                    </div>
                    <div className="text-xs text-purple-600 font-medium">{product.brandName}</div>
                  </td>
                  <td>
                    <span className="text-xs font-medium text-slate-600">{product.category}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-700">
                      {formatDateDisplay(product.purchaseDate)}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-bold text-slate-900">
                      {formatDateDisplay(product.warrantyExpiryDate)}
                    </span>
                  </td>
                  <td>
                    <StatusBadge
                      status={product.warrantyStatus}
                      daysRemaining={product.daysRemaining}
                      showDays={true}
                    />
                  </td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        title="View Details"
                        aria-label="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditProduct(product)}
                        className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Product"
                        aria-label="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(product)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Product"
                        aria-label="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
