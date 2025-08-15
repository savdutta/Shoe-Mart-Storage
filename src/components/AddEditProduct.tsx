import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { PRODUCT_CATEGORIES, VARIANT_OPTIONS } from '../utils/constants';
import { calculateTotalStock, formatCurrency } from '../utils/helpers';

interface AddEditProductProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id' | 'totalStock' | 'timesSold' | 'revenueGenerated' | 'lastSale' | 'createdAt'>) => void;
  onUpdate: (id: number, updates: Partial<Product>) => void;
}

const AddEditProduct: React.FC<AddEditProductProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onSave, 
  onUpdate 
}) => {
  const [activeSection, setActiveSection] = useState('basic');
  const [formData, setFormData] = useState({
    productType: 'shoes' as Product['productType'],
    name: '',
    articleNumber: '',
    category: '',
    color: '',
    brand: '',
    variants: {} as Record<string, number>,
    buyingPrice: 0,
    sellingPrice: 0,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        productType: product.productType,
        name: product.name,
        articleNumber: product.articleNumber,
        category: product.category,
        color: product.color,
        brand: product.brand,
        variants: { ...product.variants },
        buyingPrice: product.buyingPrice,
        sellingPrice: product.sellingPrice,
      });
    } else {
      setFormData({
        productType: 'shoes',
        name: '',
        articleNumber: '',
        category: PRODUCT_CATEGORIES.shoes[0],
        color: '',
        brand: '',
        variants: {},
        buyingPrice: 0,
        sellingPrice: 0,
      });
    }
    setActiveSection('basic');
  }, [product, isOpen]);

  // Update category when product type changes
  useEffect(() => {
    if (!product) {
      const categories = PRODUCT_CATEGORIES[formData.productType];
      setFormData(prev => ({
        ...prev,
        category: categories[0],
        variants: {}
      }));
    }
  }, [formData.productType, product]);

  const handleVariantChange = (variant: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      variants: {
        ...prev.variants,
        [variant]: Math.max(0, quantity)
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (product) {
      onUpdate(product.id, formData);
    } else {
      onSave(formData);
    }
    onClose();
  };

  const totalStock = calculateTotalStock(formData.variants);
  const profitPerUnit = formData.sellingPrice - formData.buyingPrice;
  const profitMargin = formData.sellingPrice > 0 ? (profitPerUnit / formData.sellingPrice) * 100 : 0;

  // Form validation logic
  const isBasicDetailsComplete = formData.name && 
    (formData.productType !== 'shoes' || formData.articleNumber) && // Article number only required for shoes
    formData.color && 
    formData.brand;
  
  const isVariantsComplete = totalStock > 0;
  
  const isPricingComplete = formData.buyingPrice > 0 && formData.sellingPrice > 0;
  
  const isFormValid = isBasicDetailsComplete && isVariantsComplete && isPricingComplete;
  
  if (!isOpen) return null;

  const sections = [
    { id: 'basic', label: 'Basic Details', icon: '📝', completed: isBasicDetailsComplete },
    { id: 'variants', label: 'Stock & Variants', icon: '📦', completed: isVariantsComplete },
    { id: 'pricing', label: 'Pricing', icon: '💰', completed: isPricingComplete },
  ];

  const renderBasicDetails = () => (
    <div className="space-y-4">
      {!product && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(PRODUCT_CATEGORIES).map((type) => (
              <label
                key={type}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.productType === type
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="productType"
                  value={type}
                  checked={formData.productType === type}
                  onChange={(e) => setFormData(prev => ({ ...prev, productType: e.target.value as Product['productType'] }))}
                  className="sr-only"
                />
                <span className="mr-2 text-xl">
                  {type === 'shoes' ? '👟' : type === 'socks' ? '🧦' : type === 'bags' ? '👜' : '👔'}
                </span>
                <span className="font-medium capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Paragon Sport Shoes"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Article Number {formData.productType === 'shoes' ? '*' : '(Optional)'}
          </label>
          <input
            type="text"
            value={formData.articleNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, articleNumber: e.target.value }))}
            placeholder="e.g., PGN-9230"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required={formData.productType === 'shoes'}
          />
          {formData.productType !== 'shoes' && (
            <p className="text-xs text-gray-500 mt-1">Article number is optional for this product type</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
            required
          >
            {PRODUCT_CATEGORIES[formData.productType].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
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
            placeholder="e.g., Black, White, Blue"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            placeholder="e.g., Nike, Adidas, Paragon"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderVariants = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {formData.productType === 'shoes' ? 'Size Inventory' : 'Variant Inventory'}
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {(formData.productType === 'shoes' 
            ? VARIANT_OPTIONS.shoes[formData.category] || []
            : VARIANT_OPTIONS[formData.productType]
          ).map((variant) => (
            <div key={variant}>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {variant}
              </label>
              <input
                type="number"
                min="0"
                value={formData.variants[variant] || 0}
                onChange={(e) => handleVariantChange(variant, parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      {totalStock > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Stock Summary</h4>
          <p className="text-green-700">
            <span className="font-semibold">Total Stock: {totalStock} pieces</span>
          </p>
          <div className="text-sm text-green-600 mt-1">
            {Object.entries(formData.variants)
              .filter(([_, quantity]) => quantity > 0)
              .map(([variant, quantity]) => `${variant}(${quantity})`)
              .join(', ')}
          </div>
        </div>
      )}
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buying Price (₹) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.buyingPrice || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, buyingPrice: parseFloat(e.target.value) || 0 }))}
            placeholder="800"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selling Price (₹) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.sellingPrice || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
            placeholder="1200"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {formData.buyingPrice > 0 && formData.sellingPrice > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-800 mb-2">Profit Analysis</h4>
          <div className="space-y-1 text-purple-700">
            <p>
              <span className="font-medium">Profit per Unit:</span> {formatCurrency(profitPerUnit)}
            </p>
            <p>
              <span className="font-medium">Profit Margin:</span> {profitMargin.toFixed(1)}%
            </p>
            {totalStock > 0 && (
              <p>
                <span className="font-medium">Potential Total Profit:</span> {formatCurrency(profitPerUnit * totalStock)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 p-4 border-r">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-md transition-colors ${
                    activeSection === section.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{section.icon}</span>
                    {section.label}
                  </div>
                  {section.completed && (
                    <span className="text-green-500 text-sm">✓</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {activeSection === 'basic' && renderBasicDetails()}
              {activeSection === 'variants' && renderVariants()}
              {activeSection === 'pricing' && renderPricing()}

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {product ? 'Update Product' : 'Add Product'}
                </button>
                {!isFormValid && (
                  <p className="text-sm text-red-600 mt-2">
                    Please complete all sections: 
                    {!isBasicDetailsComplete && ' Basic Details'}
                    {!isVariantsComplete && ' Stock & Variants'}
                    {!isPricingComplete && ' Pricing'}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditProduct;