import React, { useState, useEffect } from 'react';
import { X, Package, BarChart3, DollarSign } from 'lucide-react';
import { Product, ProductFormData } from '../types';
import { PRODUCT_TYPES, VARIANT_OPTIONS, PRODUCT_CATEGORIES } from '../utils/constants';

interface AddEditProductProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductFormData) => void;
  product?: Product | null;
}

export default function AddEditProduct({ isOpen, onClose, onSave, product }: AddEditProductProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<ProductFormData>({
    productType: 'shoes',
    name: '',
    articleNumber: '',
    category: '',
    color: '',
    brand: '',
    variants: {},
    buyingPrice: 0,
    sellingPrice: 0,
    totalStock: 0
  });

  useEffect(() => {
    if (product) {
      setFormData({
        productType: product.productType,
        name: product.name,
        articleNumber: product.articleNumber || '',
        category: product.category,
        color: product.color,
        brand: product.brand,
        variants: product.variants,
        buyingPrice: Number(product.buyingPrice),
        sellingPrice: Number(product.sellingPrice),
        totalStock: product.totalStock
      });
    } else {
      setFormData({
        productType: 'shoes',
        name: '',
        articleNumber: '',
        category: '',
        color: '',
        brand: '',
        variants: {},
        buyingPrice: 0,
        sellingPrice: 0,
        totalStock: 0
      });
    }
  }, [product, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleVariantChange = (size: string, stock: number) => {
    setFormData(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        [size]: stock
      }
    }));
  };

  const calculateTotalStock = () => {
    const total = Object.values(formData.variants).reduce((sum, stock) => sum + (Number(stock) || 0), 0);
    setFormData(prev => ({ ...prev, totalStock: total }));
  };

  useEffect(() => {
    calculateTotalStock();
  }, [formData.variants]);

  // Validation functions
  const isBasicDetailsValid = () => {
    return formData.productType && 
           formData.name.trim() && 
           formData.category && 
           formData.color.trim() && 
           formData.brand.trim();
  };

  const isStockVariantsValid = () => {
    if (formData.productType === 'bags') {
      return formData.totalStock > 0;
    }
    return formData.totalStock > 0 && Object.keys(formData.variants).length > 0;
  };

  const isPricingValid = () => {
    return formData.buyingPrice > 0 && formData.sellingPrice > 0;
  };

  const isFormValid = () => {
    return isBasicDetailsValid() && isStockVariantsValid() && isPricingValid();
  };

  const getVariantLabel = () => {
    if (formData.productType === 'shoes') return 'Size';
    if (formData.productType === 'belts') return 'Size';
    if (formData.productType === 'socks') return 'Size';
    return 'Variant';
  };

  const getSizeOptions = () => {
    if (formData.productType === 'shoes') {
      switch (formData.category) {
        case 'Ladies Shoes':
          return VARIANT_OPTIONS.shoes['Ladies Shoes'] || [];
        case 'Gents Shoes':
          return VARIANT_OPTIONS.shoes['Gents Shoes'] || [];
        case 'Kids Shoes':
          return VARIANT_OPTIONS.shoes['Kids Shoes'] || [];
        default:
          return [];
      }
    } else if (formData.productType === 'socks') {
      return VARIANT_OPTIONS.socks || [];
    } else if (formData.productType === 'belts') {
      return VARIANT_OPTIONS.belts || [];
    } else if (formData.productType === 'bags') {
      return VARIANT_OPTIONS.bags || [];
    }
    
    return [];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-80px)]">
          {/* Navigation Tabs */}
          <div className="lg:w-64 border-b lg:border-b-0 lg:border-r bg-gray-50">
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible">
              <button
                onClick={() => setActiveTab('basic')}
                className={`flex items-center gap-3 px-4 py-3 text-left whitespace-nowrap lg:whitespace-normal transition-colors ${
                  activeTab === 'basic'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5 flex-shrink-0" />
                <span className="hidden sm:inline">Basic Details</span>
                {isBasicDetailsValid() && <span className="text-green-400">✓</span>}
              </button>
              <button
                onClick={() => setActiveTab('variants')}
                className={`flex items-center gap-3 px-4 py-3 text-left whitespace-nowrap lg:whitespace-normal transition-colors ${
                  activeTab === 'variants'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5 flex-shrink-0" />
                <span className="hidden sm:inline">Stock & Variants</span>
                {isStockVariantsValid() && <span className="text-green-400">✓</span>}
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`flex items-center gap-3 px-4 py-3 text-left whitespace-nowrap lg:whitespace-normal transition-colors ${
                  activeTab === 'pricing'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <DollarSign className="w-5 h-5 flex-shrink-0" />
                <span className="hidden sm:inline">Pricing</span>
                {isPricingValid() && <span className="text-green-400">✓</span>}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Type *
                      </label>
                      <select
                        value={formData.productType}
                        onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        {PRODUCT_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Article Number
                      </label>
                      <input
                        type="text"
                        value={formData.articleNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, articleNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="">Select Category</option>
                        {formData.productType === 'shoes' && (
                          <>
                            <option value="Ladies Shoes">Ladies Shoes</option>
                            <option value="Gents Shoes">Gents Shoes</option>
                            <option value="Kids Shoes">Kids Shoes</option>
                          </>
                        )}
                        {formData.productType === 'socks' && (
                          <>
                            <option value="Gents Socks">Gents Socks</option>
                            <option value="Ladies Socks">Ladies Socks</option>
                            <option value="Kids Socks">Kids Socks</option>
                          </>
                        )}
                        {formData.productType === 'bags' && (
                          <>
                            <option value="Handbags">Handbags</option>
                            <option value="Backpacks">Backpacks</option>
                            <option value="Travel Bags">Travel Bags</option>
                            <option value="School Bags">School Bags</option>
                          </>
                        )}
                        {formData.productType === 'belts' && (
                          <>
                            <option value="Gents Belts">Gents Belts</option>
                            <option value="Ladies Belts">Ladies Belts</option>
                            <option value="Kids Belts">Kids Belts</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color *
                      </label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand *
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'variants' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Stock & Variants</h3>
                    
                    {(formData.productType === 'shoes' || formData.productType === 'socks' || formData.productType === 'belts') && formData.category && (
                      <div>
                        <h4 className="text-md font-medium text-gray-700 mb-3">
                          {getVariantLabel()} Stock for {formData.category}
                        </h4>
                        <div className="space-y-3">
                          {getSizeOptions().map(size => (
                            <div key={size} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                              <div className="flex items-center space-x-3">
                                <span className="font-medium text-gray-700 min-w-[60px]">
                                  {getVariantLabel()} {size}
                                </span>
                                <span className="text-gray-400">→</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={formData.variants[size] || 0}
                                  onChange={(e) => handleVariantChange(size, parseInt(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                                  placeholder="0"
                                />
                                <span className="text-sm text-gray-500">
                                  {(formData.variants[size] || 0) === 1 ? 'unit' : 'units'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.productType === 'bags' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Stock *
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.totalStock}
                          onChange={(e) => {
                            const stock = parseInt(e.target.value) || 0;
                            setFormData(prev => ({ 
                              ...prev, 
                              totalStock: stock,
                              variants: { 'Single Item': stock }
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                          <strong>Total Stock:</strong> {formData.totalStock} units
                        </p>
                        {formData.productType !== 'bags' && (
                          <p className="text-xs text-gray-500">
                            {Object.entries(formData.variants).filter(([_, qty]) => qty > 0).length} variants with stock
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buying Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.buyingPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, buyingPrice: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selling Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.sellingPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Profit per unit:</p>
                        <p className="font-semibold text-green-600">
                          ${(formData.sellingPrice - formData.buyingPrice).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Profit margin:</p>
                        <p className="font-semibold text-blue-600">
                          {formData.sellingPrice > 0 
                            ? (((formData.sellingPrice - formData.buyingPrice) / formData.sellingPrice) * 100).toFixed(1)
                            : 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total potential profit:</p>
                        <p className="font-semibold text-purple-600">
                          ${((formData.sellingPrice - formData.buyingPrice) * formData.totalStock).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid()}
                  className={`w-full sm:w-auto px-6 py-2 rounded-md transition-colors ${
                    isFormValid()
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}