import React, { useState } from 'react';
import { Product } from '../types';
import { formatCurrency } from '../utils/helpers';

interface SalesEntryProps {
  products: Product[];
  onProcessSale: (saleData: {
    productId: number;
    variant: string;
    quantity: number;
    customerName: string;
    salePrice?: number;
  }) => boolean;
}

const SalesEntry: React.FC<SalesEntryProps> = ({ products, onProcessSale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [salePrice, setSalePrice] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [productTypeFilter, setProductTypeFilter] = useState<string>('all');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.articleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = productTypeFilter === 'all' || product.productType === productTypeFilter;
    return matchesSearch && matchesType && product.totalStock > 0;
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSalePrice(product.sellingPrice);
    setSelectedVariant('');
    setSearchTerm(`${product.name} ${product.articleNumber}`);
  };

  const availableVariants = selectedProduct 
    ? Object.entries(selectedProduct.variants).filter(([_, count]) => count > 0)
    : [];

  const maxQuantity = selectedProduct && selectedVariant 
    ? selectedProduct.variants[selectedVariant] || 0
    : 0;

  const handleProcessSale = () => {
    if (!selectedProduct || !selectedVariant) return;

    const success = onProcessSale({
      productId: selectedProduct.id,
      variant: selectedVariant,
      quantity,
      customerName,
      salePrice: salePrice !== selectedProduct.sellingPrice ? salePrice : undefined
    });

    if (success) {
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        resetForm();
      }, 3000);
    }
  };

  const resetForm = () => {
    setSearchTerm('');
    setSelectedProduct(null);
    setSelectedVariant('');
    setQuantity(1);
    setCustomerName('');
    setSalePrice(0);
  };

  const profit = selectedProduct ? (salePrice - selectedProduct.buyingPrice) * quantity : 0;
  const profitMargin = salePrice > 0 ? ((profit / (salePrice * quantity)) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Entry</h1>
        <p className="text-gray-600">Process new sales across all product categories</p>
      </div>

      {/* Success Notification */}
      {showConfirmation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600 text-xl mr-3">✅</div>
            <div>
              <h3 className="text-lg font-medium text-green-800">Sale Processed Successfully!</h3>
              <p className="text-green-700">
                Sold {quantity}x {selectedProduct?.name} {selectedVariant} for {formatCurrency(salePrice * quantity)}
              </p>
              <p className="text-sm text-green-600">Profit: {formatCurrency(profit)} ({profitMargin.toFixed(1)}% margin)</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sale Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Sale</h2>
          
          {/* Product Search */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Search
              </label>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, article number, or brand..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {searchTerm && !selectedProduct && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                      {filteredProducts.length === 0 ? (
                        <div className="p-3 text-gray-500">No products found</div>
                      ) : (
                        filteredProducts.slice(0, 10).map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductSelect(product)}
                            className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">
                              {product.name} - {product.articleNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.category} • {product.color} • {product.brand}
                            </div>
                            <div className="text-sm text-purple-600">
                              {formatCurrency(product.sellingPrice)} • {product.totalStock} in stock
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <select
                  value={productTypeFilter}
                  onChange={(e) => setProductTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="shoes">Shoes</option>
                  <option value="socks">Socks</option>
                  <option value="bags">Bags</option>
                  <option value="belts">Belts</option>
                </select>
              </div>
            </div>

            {/* Product Details */}
            {selectedProduct && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-600">
                  {selectedProduct.articleNumber} • {selectedProduct.category} • {selectedProduct.color}
                </p>
                <p className="text-sm text-purple-600 font-medium">
                  {formatCurrency(selectedProduct.sellingPrice)} (Buying: {formatCurrency(selectedProduct.buyingPrice)})
                </p>
              </div>
            )}

            {/* Variant Selection */}
            {selectedProduct && availableVariants.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedProduct.productType === 'shoes' ? 'Size' : 'Variant'} Selection
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableVariants.map(([variant, count]) => (
                    <button
                      key={variant}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-2 text-sm rounded-md border transition-colors ${
                        selectedVariant === variant
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {variant}
                      <div className="text-xs opacity-75">({count} avl)</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
                  min="1"
                  max={maxQuantity}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {maxQuantity > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Max: {maxQuantity} available</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Price
                </label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Sale Button */}
            <button
              onClick={handleProcessSale}
              disabled={!selectedProduct || !selectedVariant || quantity <= 0}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Process Sale
            </button>
          </div>
        </div>

        {/* Sale Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Sale Summary</h2>
          
          {selectedProduct ? (
            <div className="space-y-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-medium text-purple-900">Selected Product</h3>
                <p className="text-purple-800">{selectedProduct.name}</p>
                <p className="text-sm text-purple-600">
                  {selectedProduct.articleNumber} • {selectedProduct.category}
                </p>
              </div>

              {selectedVariant && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Variant:</span>
                    <span className="font-medium">{selectedVariant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="font-medium">{formatCurrency(salePrice)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Total Sale:</span>
                      <span className="font-bold text-purple-600">
                        {formatCurrency(salePrice * quantity)}
                      </span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Profit:</span>
                      <span className="font-medium">
                        {formatCurrency(profit)} ({profitMargin.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-2">🛍️</div>
              <p>Select a product to see sale summary</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesEntry;