import React, { useState } from 'react';
import { Sale } from '../types';
import { formatCurrency, formatTime } from '../utils/helpers';

interface TotalSalesProps {
  sales: Sale[];
}

const TotalSales: React.FC<TotalSalesProps> = ({ sales }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [productTypeFilter, setProductTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'profit'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter sales based on search and filters
  const filteredSales = sales.filter(sale => {
    const matchesSearch = !searchTerm || 
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.articleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.variant.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProductType = productTypeFilter === 'all' || sale.productType === productTypeFilter;

    // Date filtering
    const saleDate = new Date(sale.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    let matchesDate = true;
    switch (dateFilter) {
      case 'today':
        matchesDate = saleDate.toDateString() === today.toDateString();
        break;
      case 'yesterday':
        matchesDate = saleDate.toDateString() === yesterday.toDateString();
        break;
      case 'week':
        matchesDate = saleDate >= weekAgo;
        break;
      case 'month':
        matchesDate = saleDate >= monthAgo;
        break;
      default:
        matchesDate = true;
    }

    return matchesSearch && matchesProductType && matchesDate;
  });

  // Sort sales
  const sortedSales = [...filteredSales].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case 'amount':
        comparison = a.salePrice - b.salePrice;
        break;
      case 'profit':
        comparison = a.profit - b.profit;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Calculate summary statistics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.salePrice, 0);
  const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.profit, 0);
  const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
  const averageSaleValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Group sales by date for daily breakdown
  const salesByDate = filteredSales.reduce((acc, sale) => {
    const date = new Date(sale.timestamp).toDateString();
    if (!acc[date]) {
      acc[date] = { count: 0, revenue: 0, profit: 0 };
    }
    acc[date].count += sale.quantity;
    acc[date].revenue += sale.salePrice;
    acc[date].profit += sale.profit;
    return acc;
  }, {} as Record<string, { count: number; revenue: number; profit: number }>);

  const dailyBreakdown = Object.entries(salesByDate)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <span className="mr-2 text-3xl">📊</span>
          Total Sales
        </h1>
        <p className="text-gray-600">Complete sales history and analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{filteredSales.length}</p>
            </div>
            <div className="text-2xl">🛍️</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Profit</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalProfit)}</p>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Items Sold</p>
              <p className="text-2xl font-bold text-blue-600">{totalQuantity}</p>
            </div>
            <div className="text-2xl">📦</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Sale Value</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(averageSaleValue)}</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>
      </div>

      {/* Daily Breakdown */}
      {dailyBreakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dailyBreakdown.map(([date, data]) => (
              <div key={date} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">
                  {new Date(date).toLocaleDateString('en-IN', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">{data.count} items sold</p>
                  <p className="font-medium text-green-600">{formatCurrency(data.revenue)} revenue</p>
                  <p className="font-medium text-purple-600">{formatCurrency(data.profit)} profit</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product, customer, or article number..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Date Filter */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          {/* Product Type Filter */}
          <div>
            <select
              value={productTypeFilter}
              onChange={(e) => setProductTypeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Products</option>
              <option value="shoes">Shoes</option>
              <option value="socks">Socks</option>
              <option value="bags">Bags</option>
              <option value="belts">Belts</option>
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'profit')}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="profit">Sort by Profit</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Results Count and Clear Filters */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {sortedSales.length} of {sales.length} sales
            {filteredSales.length !== sales.length && (
              <span className="ml-2 text-purple-600">
                • Profit Margin: {profitMargin.toFixed(1)}%
              </span>
            )}
          </span>
          {(searchTerm || dateFilter !== 'all' || productTypeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('all');
                setProductTypeFilter('all');
              }}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {sortedSales.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
            <p className="text-gray-600">
              {sales.length === 0 
                ? "No sales have been recorded yet" 
                : "Try adjusting your filters to see more results"
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer & Variant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity & Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit & Margin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedSales.map((sale) => {
                  const saleMargin = sale.salePrice > 0 ? (sale.profit / sale.salePrice) * 100 : 0;
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{sale.productName}</div>
                          <div className="text-sm text-gray-500">{sale.articleNumber}</div>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 capitalize">
                            {sale.productType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{sale.customerName || 'Walk-in Customer'}</div>
                          <div className="text-sm text-gray-500">Variant: {sale.variant}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {sale.quantity} × {formatCurrency(sale.salePrice / sale.quantity)}
                          </div>
                          <div className="text-sm font-semibold text-green-600">
                            Total: {formatCurrency(sale.salePrice)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-purple-600">
                            {formatCurrency(sale.profit)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {saleMargin.toFixed(1)}% margin
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(sale.timestamp).toLocaleDateString('en-IN')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(sale.timestamp).toLocaleTimeString('en-IN', { 
                              hour: 'numeric', 
                              minute: '2-digit', 
                              hour12: true 
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalSales;