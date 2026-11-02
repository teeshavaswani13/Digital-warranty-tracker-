/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api, getStoredToken, getStoredUser, clearStoredAuth } from './services/api.js';
import { LoginPage } from './components/LoginPage.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Topbar } from './components/Topbar.jsx';
import { DashboardView } from './components/DashboardView.jsx';
import { MyProductsView } from './components/MyProductsView.jsx';
import { AddProductView } from './components/AddProductView.jsx';
import { ProductDetailModal } from './components/ProductDetailModal.jsx';
import { EditProductModal } from './components/EditProductModal.jsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.jsx';
import { NotificationToast } from './components/NotificationToast.jsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [initialStatusFilter, setInitialStatusFilter] = useState('All');

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Verify session on initial mount
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setCurrentUser(null);
      setIsVerifyingSession(false);
      return;
    }

    api
      .getMe()
      .then((res) => {
        setCurrentUser(res.user);
      })
      .catch(() => {
        clearStoredAuth();
        setCurrentUser(null);
      })
      .finally(() => {
        setIsVerifyingSession(false);
      });

    // Listen for 401 events
    const handleAuthExpired = () => {
      setCurrentUser(null);
    };
    window.addEventListener('dwt-auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('dwt-auth-expired', handleAuthExpired);
    };
  }, []);

  // Fetch all user products and dashboard metrics
  const refreshAllData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoadingData(true);
    try {
      const [fetchedStats, fetchedProducts] = await Promise.all([
        api.getDashboardStats(),
        api.getProducts(),
      ]);
      setStats(fetchedStats);
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Failed to load warranty data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      refreshAllData();
    }
  }, [currentUser, refreshAllData]);

  // Handler for login or sign up success
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  // Handler for logout
  const handleLogout = () => {
    clearStoredAuth();
    setCurrentUser(null);
    setStats(null);
    setProducts([]);
    setCurrentView('dashboard');
  };

  // Add Product
  const handleAddProduct = async (payload) => {
    await api.createProduct(payload);
    await refreshAllData();
  };

  // Update Product
  const handleUpdateProduct = async (id, payload) => {
    const updated = await api.updateProduct(id, payload);
    await refreshAllData();
    if (selectedProduct && selectedProduct._id === id) {
      setSelectedProduct(updated);
    }
  };

  // Delete Product
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    try {
      await api.deleteProduct(deletingProduct._id);
      await refreshAllData();
      setDeletingProduct(null);
      if (selectedProduct && selectedProduct._id === deletingProduct._id) {
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter click from dashboard summary cards
  const handleDashboardFilterStatus = (status) => {
    setInitialStatusFilter(status);
    setCurrentView('products');
  };

  // Open product detail by product ID from notifications
  const handleSelectProductById = (id) => {
    const found = products.find((p) => p._id === id);
    if (found) {
      setSelectedProduct(found);
    } else {
      api.getProductById(id).then((p) => setSelectedProduct(p)).catch(() => {});
    }
  };

  // Loading spinner during auth check
  if (isVerifyingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-700 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-purple-900 tracking-wide">
            Loading Digital Warranty Tracker...
          </span>
        </div>
      </div>
    );
  }

  // Not authenticated: Show Login & Sign Up Page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const upcomingAlerts = stats?.upcomingAlerts || [];

  // Authenticated Dashboard
  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'products') setInitialStatusFilter('All');
          setCurrentView(view);
        }}
        user={currentUser}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        totalProductsCount={products.length}
      />

      {/* Main Content Viewport */}
      <div className="dashboard-main">
        <Topbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          alerts={upcomingAlerts}
          onSelectProductById={handleSelectProductById}
        />

        <main className="flex-1">
          {currentView === 'dashboard' && (
            <DashboardView
              stats={stats}
              isLoading={isLoadingData}
              onNavigateProducts={() => {
                setInitialStatusFilter('All');
                setCurrentView('products');
              }}
              onNavigateAdd={() => setCurrentView('add')}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onFilterStatus={handleDashboardFilterStatus}
            />
          )}

          {currentView === 'products' && (
            <MyProductsView
              products={products}
              isLoading={isLoadingData}
              onNavigateAdd={() => setCurrentView('add')}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onEditProduct={(p) => setEditingProduct(p)}
              onDeleteProduct={(p) => setDeletingProduct(p)}
              initialStatusFilter={initialStatusFilter}
            />
          )}

          {currentView === 'add' && (
            <AddProductView
              onAddProduct={handleAddProduct}
              onBack={() => setCurrentView('dashboard')}
            />
          )}
        </main>
      </div>

      {/* Floating Expiry Alert Toast */}
      <NotificationToast
        alerts={upcomingAlerts}
        onSelectProductById={handleSelectProductById}
      />

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onEdit={(p) => setEditingProduct(p)}
        onDelete={(p) => setDeletingProduct(p)}
      />

      <EditProductModal
        product={editingProduct}
        isOpen={editingProduct !== null}
        onClose={() => setEditingProduct(null)}
        onUpdate={handleUpdateProduct}
      />

      <DeleteConfirmModal
        product={deletingProduct}
        isOpen={deletingProduct !== null}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
