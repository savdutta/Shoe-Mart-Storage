export interface Product {
  id: number;
  supabaseId?: string; // Store original UUID for database operations
  productType: 'shoes' | 'socks' | 'bags' | 'belts';
  name: string;
  articleNumber: string;
  category: string;
  color: string;
  brand: string;
  variants: Record<string, number>; // size/variant -> quantity
  buyingPrice: number;
  sellingPrice: number;
  totalStock: number;
  timesSold: number;
  revenueGenerated: number;
  lastSale: string | null;
  createdAt: string;
}

export interface Sale {
  id: number;
  supabaseId?: string; // Store original UUID for database operations
  productId: number;
  productName: string;
  productType: string;
  articleNumber: string;
  variant: string;
  quantity: number;
  salePrice: number;
  customerName: string;
  profit: number;
  timestamp: string;
}

export interface DashboardMetrics {
  totalInventoryValue: number;
  todaysSales: number;
  todaysItemsSold: number;
  lowStockItems: number;
  totalProducts: number;
  categoryBreakdown: Record<string, { items: number; value: number }>;
  todaysProfit: number;
  profitMargin: number;
}

export type PageType = 'dashboard' | 'all-products' | 'shoes' | 'socks' | 'bags' | 'belts' | 'sales-entry' | 'reports' | 'settings';