import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { PageType, Product } from './types';
import { useProducts } from './hooks/useProducts';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SalesEntry from './components/SalesEntry';
import AllProducts from './components/AllProducts';
import TotalSales from './components/TotalSales';
import AddEditProduct from './components/AddEditProduct';
import ProductDetailsModal from './components/ProductDetailsModal';
import AuthModal from './components/AuthModal';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { products, sales, metrics, loading: dataLoading, addProduct, updateProduct, deleteProduct, processSale } = useProducts();

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddEditModal(true);
  };

  // Show auth modal if user is not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      setShowAuthModal(true);
    } else if (user) {
      setShowAuthModal(false);
    }
  }, [user, loading]);

  // Event listeners for dashboard quick actions
  React.useEffect(() => {
    const handleOpenAddProduct = () => handleAddProduct();
    const handleOpenSalesEntry = () => setCurrentPage('sales-entry');
    const handleViewAllProducts = () => setCurrentPage('all-products');

    window.addEventListener('openAddProduct', handleOpenAddProduct);
    window.addEventListener('openSalesEntry', handleOpenSalesEntry);
    window.addEventListener('viewAllProducts', handleViewAllProducts);

    return () => {
      window.removeEventListener('openAddProduct', handleOpenAddProduct);
      window.removeEventListener('openSalesEntry', handleOpenSalesEntry);
      window.removeEventListener('viewAllProducts', handleViewAllProducts);
    };
  }, []);

  // Show loading screen while checking authentication
  if (loading || (user && dataLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-white font-bold text-xl">RP</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Loading Retail Inventory Pro...' : 'Loading your inventory data...'}
          </p>
        </div>
      </div>
    );
  }

  // Show auth modal if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-purple-600 rounded-lg flex items-center justify-center mb-6 mx-auto">
            <span className="text-white font-bold text-2xl">RP</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Retail Inventory Pro</h1>
          <p className="text-gray-600 mb-8">Professional inventory management system</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            Sign In to Continue
          </button>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  const handlePageChange = (page: PageType) => {
    setCurrentPage(page);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddEditModal(true);
  };

  const handleViewDetails = (product: Product) => {
    setViewingProduct(product);
    setShowDetailsModal(true);
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  const handleCloseModal = () => {
    setShowAddEditModal(false);
    setEditingProduct(null);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setViewingProduct(null);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard metrics={metrics} products={products} sales={sales} />;
      
      case 'sales-entry':
        return <SalesEntry products={products} onProcessSale={processSale} />;
      
      case 'total-sales':
        return <TotalSales sales={sales} />;
      
      case 'all-products':
      case 'shoes':
      case 'socks':
      case 'bags':
      case 'belts':
        return (
          <AllProducts
            products={products}
            currentPage={currentPage}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onAddProduct={handleAddProduct}
            onViewDetails={handleViewDetails}
          />
        );
      
      case 'reports':
      case 'settings':
        return (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
            <p className="text-gray-600">This feature is under development</p>
          </div>
        );
      
      default:
        return <Dashboard metrics={metrics} products={products} sales={sales} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-purple-600 text-white p-2 rounded-md shadow-lg"
      >
        ☰
      </button>

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Page Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="lg:hidden w-8"></div> {/* Spacer for mobile menu button */}
              <div>
                <h1 className="text-lg font-semibold text-gray-900 capitalize">
                  {currentPage === 'total-sales' ? 'Total Sales' : currentPage.replace('-', ' ')}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentPage === 'dashboard' && 'Overview of your inventory and sales'}
                  {currentPage === 'all-products' && 'Complete product catalog'}
                  {currentPage === 'shoes' && 'Shoe inventory management'}
                  {currentPage === 'socks' && 'Sock inventory management'}
                  {currentPage === 'bags' && 'Bag inventory management'}
                  {currentPage === 'belts' && 'Belt inventory management'}
                  {currentPage === 'sales-entry' && 'Process new sales transactions'}
                  {currentPage === 'total-sales' && 'Complete sales history and analytics'}
                  {currentPage === 'reports' && 'Analytics and reports'}
                  {currentPage === 'settings' && 'Application settings'}
                </p>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                {metrics && (
                  <span>
                    {metrics.totalProducts} products • {metrics.todaysItemsSold} sold today
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {renderCurrentPage()}
        </div>
      </main>

      {/* Add/Edit Product Modal */}
      <AddEditProduct
        product={editingProduct}
        isOpen={showAddEditModal}
        onClose={handleCloseModal}
        onSave={addProduct}
        onUpdate={updateProduct}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={viewingProduct}
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}

export default App;