import React from 'react';
import { Product } from '../types';
import { formatCurrency, formatTime, formatVariants, getStockStatusColor, getStockStatusText } from '../utils/helpers';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !product) return null;

  const profitPerUnit = product.sellingPrice - product.buyingPrice;
  const profitMargin = product.sellingPrice > 0 ? (profitPerUnit / product.sellingPrice) * 100 : 0;
  const totalInventoryValue = product.totalStock * product.buyingPrice;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      onDelete(product.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">
              {product.productType === 'shoes' ? '👟' : 
               product.productType === 'socks' ? '🧦' : 
               product.productType === 'bags' ? '👜' : '👔'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
              <p className="text-gray-600">{product.articleNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Information */}
            <div className="space-y-6">
              {/* Basic Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Type:</span>
                    <span className="font-medium capitalize">{product.productType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand:</span>
                    <span className="font-medium">{product.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium">{product.color}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Article Number:</span>
                    <span className="font-medium">{product.articleNumber || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{formatTime(product.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Stock:</span>
                    <div className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStockStatusColor(product.totalStock)}`}>
                      {product.totalStock} {getStockStatusText(product.totalStock)}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available Variants:</span>
                    <span className="font-medium text-right max-w-xs">
                      {formatVariants(product.variants, product.productType)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inventory Value:</span>
                    <span className="font-medium">{formatCurrency(totalInventoryValue)}</span>
                  </div>
                </div>

                {/* Variant Breakdown */}
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Variant Breakdown:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(product.variants).map(([variant, quantity]) => (
                      <div key={variant} className={`text-center p-2 rounded ${quantity > 0 ? 'bg-white border' : 'bg-gray-100 text-gray-500'}`}>
                        <div className="text-sm font-medium">{variant}</div>
                        <div className="text-xs">{quantity} pcs</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-6">
              {/* Pricing */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Profitability</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Buying Price:</span>
                    <span className="font-medium">{formatCurrency(product.buyingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selling Price:</span>
                    <span className="font-medium">{formatCurrency(product.sellingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit per Unit:</span>
                    <span className="font-medium text-green-600">{formatCurrency(profitPerUnit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit Margin:</span>
                    <span className="font-medium text-green-600">{profitMargin.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potential Profit:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(profitPerUnit * product.totalStock)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sales Performance */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Times Sold:</span>
                    <span className="font-medium">{product.timesSold} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue Generated:</span>
                    <span className="font-medium text-purple-600">{formatCurrency(product.revenueGenerated)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Sale:</span>
                    <span className="font-medium">
                      {product.lastSale ? formatTime(product.lastSale) : 'Never sold'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Sale Price:</span>
                    <span className="font-medium">
                      {product.timesSold > 0 
                        ? formatCurrency(product.revenueGenerated / product.timesSold)
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{product.timesSold}</div>
                  <div className="text-sm text-orange-700">Units Sold</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{product.totalStock}</div>
                  <div className="text-sm text-blue-700">In Stock</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            Product ID: {product.id} • Created {formatTime(product.createdAt)}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-700 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 transition-colors"
            >
              Delete Product
            </button>
            <button
              onClick={() => {
                onEdit(product);
                onClose();
              }}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Edit Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;