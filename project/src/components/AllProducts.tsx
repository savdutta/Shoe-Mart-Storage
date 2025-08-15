import React, { useState } from 'react';
import { Product } from '../types';
import { PRODUCT_CATEGORIES } from '../utils/constants';
import ProductTable from './ProductTable';

interface AllProductsProps {
  products: Product[];
  currentPage: string;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onAddProduct: () => void;
  onViewDetails: (product: Product) => void;
}

const AllProducts: React.FC<AllProductsProps> = ({ 
  products, 
  currentPage, 
  onEdit, 
  onDelete, 
  onAddProduct,
  onViewDetails
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);

  // Filter products based on current page and filters
  const filteredProducts = products.filter(product => {
    // Page-based filtering
    if (currentPage !== 'all-products' && product.productType !== currentPage) {
      return false;
    }

    // Search filtering
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.articleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.color.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filtering
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

    // Low stock filtering
    const matchesLowStock = !showLowStock || product.totalStock <= 3;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Get available categories for the current page
  const availableCategories = currentPage === 'all-products' 
    ? Object.values(PRODUCT_CATEGORIES).flat()
    : PRODUCT_CATEGORIES[currentPage as keyof typeof PRODUCT_CATEGORIES] || [];

  const getPageTitle = () => {
    switch (currentPage) {
      case 'all-products': return 'All Products';
      case 'shoes': return 'Shoes Inventory';
      case 'socks': return 'Socks Inventory';
      case 'bags': return 'Bags Inventory';
      case 'belts': return 'Belts Inventory';
      default: return 'Products';
    }
  };

  const getPageIcon = () => {
    switch (currentPage) {
      case 'shoes': return '👟';
      case 'socks': return '🧦';
      case 'bags': return '👜';
      case 'belts': return '👔';
      default: return '📦';
    }
  };

  // Get product counts by type for tabs
  const productCounts = {
    all: products.length,
    shoes: products.filter(p => p.productType === 'shoes').length,
    socks: products.filter(p => p.productType === 'socks').length,
    bags: products.filter(p => p.productType === 'bags').length,
    belts: products.filter(p => p.productType === 'belts').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-2 text-3xl">{getPageIcon()}</span>
            {getPageTitle()}
          </h1>
          <p className="text-gray-600">
            Manage your {currentPage === 'all-products' ? 'complete' : currentPage} inventory
          </p>
        </div>
        <button
          onClick={onAddProduct}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-medium flex items-center space-x-2 transition-colors"
        >
          <span>+</span>
          <span>Add New Product</span>
        </button>
      </div>

      {/* Product Type Tabs (only for all-products page) */}
      {currentPage === 'all-products' && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all-products', label: 'All Products', count: productCounts.all },
              { key: 'shoes', label: 'Shoes', count: productCounts.shoes },
              { key: 'socks', label: 'Socks', count: productCounts.socks },
              { key: 'bags', label: 'Bags', count: productCounts.bags },
              { key: 'belts', label: 'Belts', count: productCounts.belts },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentPage === tab.key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name, article number, brand, or color..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Low Stock Toggle */}
          <div className="flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Low Stock Only</span>
            </label>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredProducts.length} of {products.length} products
          </span>
          {(searchTerm || categoryFilter !== 'all' || showLowStock) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setShowLowStock(false);
              }}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <ProductTable
        products={filteredProducts}
        onEdit={onEdit}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
      />
    </div>
  );
};

export default AllProducts;