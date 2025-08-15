import { Product, Sale, DashboardMetrics } from '../types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60);
    return `${minutes} minutes ago`;
  } else if (diffInHours < 24) {
    return date.toLocaleTimeString('en-IN', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-IN');
  }
};

export const calculateTotalStock = (variants: Record<string, number>): number => {
  return Object.values(variants).reduce((sum, count) => sum + count, 0);
};

export const formatVariants = (variants: Record<string, number>, productType: string): string => {
  const entries = Object.entries(variants).filter(([_, count]) => count > 0);
  if (entries.length === 0) return 'Out of Stock';
  
  if (productType === 'shoes') {
    return entries.map(([size, count]) => `${size}(${count})`).join(' ');
  }
  return entries.map(([variant, count]) => `${variant}: ${count}`).join(', ');
};

export const calculateDashboardMetrics = (products: Product[], sales: Sale[]): DashboardMetrics => {
  const totalInventoryValue = products.reduce((sum, product) => 
    sum + (product.totalStock * product.buyingPrice), 0);
  
  const today = new Date().toDateString();
  const todaysSales = sales
    .filter(sale => new Date(sale.timestamp).toDateString() === today)
    .reduce((sum, sale) => sum + sale.salePrice, 0);
  
  const todaysItemsSold = sales
    .filter(sale => new Date(sale.timestamp).toDateString() === today)
    .reduce((sum, sale) => sum + sale.quantity, 0);
  
  const todaysProfit = sales
    .filter(sale => new Date(sale.timestamp).toDateString() === today)
    .reduce((sum, sale) => sum + sale.profit, 0);
  
  const lowStockItems = products.filter(product => product.totalStock <= 3).length;
  const totalProducts = products.length;
  
  const categoryBreakdown = products.reduce((acc, product) => {
    const type = product.productType;
    if (!acc[type]) {
      acc[type] = { items: 0, value: 0 };
    }
    acc[type].items++;
    acc[type].value += product.totalStock * product.buyingPrice;
    return acc;
  }, {} as Record<string, { items: number; value: number }>);
  
  const profitMargin = todaysSales > 0 ? (todaysProfit / todaysSales) * 100 : 0;
  
  return {
    totalInventoryValue,
    todaysSales,
    todaysItemsSold,  
    lowStockItems,
    totalProducts,
    categoryBreakdown,
    todaysProfit,
    profitMargin
  };
};

export const getStockStatusColor = (stock: number): string => {
  if (stock === 0) return 'text-red-600 bg-red-50';
  if (stock <= 3) return 'text-orange-600 bg-orange-50';
  return 'text-green-600 bg-green-50';
};

export const getStockStatusText = (stock: number): string => {
  if (stock === 0) return 'Out of Stock';
  if (stock <= 3) return 'Low Stock';
  return 'In Stock';
};