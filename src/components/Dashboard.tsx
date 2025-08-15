import React from 'react';
import { Product, Sale, DashboardMetrics } from '../types';
import { formatCurrency, formatTime } from '../utils/helpers';

interface DashboardProps {
  metrics: DashboardMetrics | null;
  products: Product[];
  sales: Sale[];
}

const Dashboard: React.FC<DashboardProps> = ({ metrics, products, sales }) => {
  if (!metrics) return <div>Loading...</div>;

  const recentSales = sales.slice(0, 10);
  const lowStockProducts = products.filter(p => p.totalStock <= 3).slice(0, 5);
  const topSellingProducts = products
    .sort((a, b) => b.timesSold - a.timesSold)
    .slice(0, 5);

  const MetricCard: React.FC<{
    title: string;
    value: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: string;
  }> = ({ title, value, change, changeType = 'neutral', icon }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {changeType === 'positive' && '↗'}
              {changeType === 'negative' && '↘'}
              {change}
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your inventory.</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAddProduct'))}
            className="flex items-center justify-center p-4 bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg hover:bg-purple-100 hover:border-purple-400 transition-colors group"
          >
            <div className="text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📦</div>
              <p className="font-medium text-purple-700">Add New Product</p>
              <p className="text-sm text-purple-600">Create a new inventory item</p>
            </div>
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openSalesEntry'))}
            className="flex items-center justify-center p-4 bg-green-50 border-2 border-dashed border-green-300 rounded-lg hover:bg-green-100 hover:border-green-400 transition-colors group"
          >
            <div className="text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💰</div>
              <p className="font-medium text-green-700">Process Sale</p>
              <p className="text-sm text-green-600">Record a new transaction</p>
            </div>
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('viewAllProducts'))}
            className="flex items-center justify-center p-4 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 hover:border-blue-400 transition-colors group"
          >
            <div className="text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</div>
              <p className="font-medium text-blue-700">View All Products</p>
              <p className="text-sm text-blue-600">Browse complete inventory</p>
            </div>
          </button>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Inventory Value"
          value={formatCurrency(metrics.totalInventoryValue)}
          change="+5.2% from last month"
          changeType="positive"
          icon="💰"
        />
        <MetricCard
          title="Today's Sales"
          value={formatCurrency(metrics.todaysSales)}
          change={`${metrics.todaysItemsSold} items sold`}
          changeType="positive"
          icon="📈"
        />
        <MetricCard
          title="Low Stock Alerts"
          value={metrics.lowStockItems.toString()}
          change={metrics.lowStockItems > 0 ? "Requires attention" : "All good"}
          changeType={metrics.lowStockItems > 0 ? "negative" : "positive"}
          icon="⚠️"
        />
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts.toString()}
          change="Across all categories"
          changeType="neutral"
          icon="📦"
        />
      </div>

      {/* Category Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Category Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(metrics.categoryBreakdown).map(([category, data]) => (
            <div key={category} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 capitalize">{category}</h3>
                <span className="text-2xl">
                  {category === 'shoes' ? '👟' : 
                   category === 'socks' ? '🧦' : 
                   category === 'bags' ? '👜' : '👔'}
                </span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{data.items}</p>
              <p className="text-sm text-gray-600">items</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {formatCurrency(data.value)} value
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
              className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View All Sales
            </button>
          </div>
          <div className="space-y-3">
            {recentSales.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No sales yet today</p>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {sale.productName} {sale.articleNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sale.variant} • {sale.customerName} • {formatTime(sale.timestamp)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(sale.salePrice)}
                    </p>
                    <p className="text-xs text-green-600">
                      +{formatCurrency(sale.profit)} profit
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stock Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Overview</h2>
          
          {/* Profit Summary */}
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Today's Profit</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(metrics.todaysProfit)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-700">Profit Margin</p>
                <p className="text-lg font-semibold text-green-800">{metrics.profitMargin.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Low Stock Items */}
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Low Stock Items</h3>
            {lowStockProducts.length === 0 ? (
              <p className="text-green-600 text-sm">All products are well stocked! 🎉</p>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-gray-500">{product.articleNumber}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.totalStock === 0 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {product.totalStock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Selling Products */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="font-medium text-gray-900 mb-2">Top Selling Products</h3>
            <div className="space-y-2">
              {topSellingProducts.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{product.timesSold} sold</p>
                    <p className="text-xs text-gray-500">{formatCurrency(product.revenueGenerated)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;