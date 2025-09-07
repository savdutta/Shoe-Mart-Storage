export const PRODUCT_CATEGORIES = {
  shoes: ['Gents Shoes', 'Ladies Shoes', 'Kids Shoes'],
  socks: ['Gents Socks', 'Ladies Socks', 'Kids Socks'],
  bags: ['Handbags', 'Backpacks', 'Travel Bags', 'School Bags'],
  belts: ['Gents Belts', 'Ladies Belts', 'Kids Belts']
};

export const VARIANT_OPTIONS = {
  shoes: {
    'Ladies Shoes': ['4', '5', '6', '7', '8', '9'],
    'Gents Shoes': ['5', '6', '7', '8', '9', '10', '11'],
    'Kids Shoes': ['06', '07', '08', '09', '10', '11', '12', '13', '01', '02', '03', '04', '05']
  },
  socks: ['Small', 'Medium', 'Large'],
  bags: ['Single Item'],
  belts: ['28', '30', '32', '34', '36', '38']
};

export const PRODUCT_TYPES = [
  { value: 'shoes', label: 'Shoes', icon: '👟' },
  { value: 'socks', label: 'Socks', icon: '🧦' },
  { value: 'bags', label: 'Bags', icon: '👜' },
  { value: 'belts', label: 'Belts', icon: '👔' }
];

export const SHOE_SIZES = [
  ...VARIANT_OPTIONS.shoes['Ladies Shoes'],
  ...VARIANT_OPTIONS.shoes['Gents Shoes'],
  ...VARIANT_OPTIONS.shoes['Kids Shoes']
].filter((size, index, array) => array.indexOf(size) === index).sort((a, b) => {
  const numA = parseInt(a);
  const numB = parseInt(b);
  return numA - numB;
});

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'dashboard' },
  { id: 'all-products', label: 'All Products', icon: '📦', href: 'all-products' },
  { id: 'shoes', label: 'Shoes', icon: '👟', href: 'shoes' },
  { id: 'socks', label: 'Socks', icon: '🧦', href: 'socks', placeholder: true },
  { id: 'bags', label: 'Bags', icon: '👜', href: 'bags', placeholder: true },
  { id: 'belts', label: 'Belts', icon: '👔', href: 'belts', placeholder: true },
  { id: 'sales-entry', label: 'Sales Entry', icon: '💰', href: 'sales-entry' },
  { id: 'total-sales', label: 'Total Sales', icon: '📊', href: 'total-sales' },
  { id: 'reports', label: 'Reports', icon: '📈', href: 'reports', placeholder: true },
  { id: 'settings', label: 'Settings', icon: '⚙️', href: 'settings', placeholder: true }
];

export const SAMPLE_PRODUCTS = [
  {
    id: 1,
    productType: 'shoes' as const,
    name: 'Paragon Sport Shoes',
    articleNumber: 'PGN-9230',
    category: 'Gents Shoes',
    color: 'Black',
    brand: 'Paragon',
    variants: { '5': 1, '6': 0, '7': 1, '8': 1 },
    buyingPrice: 800,
    sellingPrice: 1200,
    totalStock: 3,
    timesSold: 3,
    revenueGenerated: 3600,
    lastSale: '2024-01-15T14:30:00Z',
    createdAt: '2024-01-10T10:00:00Z'
  },
  {
    id: 2,
    productType: 'shoes' as const,
    name: 'Nike Ladies Sneakers',
    articleNumber: 'NK-270-WHT',
    category: 'Ladies Shoes',
    color: 'White',
    brand: 'Nike',
    variants: { '6': 2, '7': 3, '8': 2, '9': 1 },
    buyingPrice: 4500,
    sellingPrice: 6999,
    totalStock: 8,
    timesSold: 2,
    revenueGenerated: 13998,
    lastSale: '2024-01-15T11:15:00Z',
    createdAt: '2024-01-08T15:30:00Z'
  },
  {
    id: 3,
    productType: 'shoes' as const,
    name: 'Adidas Kids Shoes',
    articleNumber: 'AD-KD-001',
    category: 'Kids Shoes',
    color: 'Blue',
    brand: 'Adidas',
    variants: { '1': 2, '2': 3, '3': 1, '4': 2 },
    buyingPrice: 2000,
    sellingPrice: 3500,
    totalStock: 8,
    timesSold: 1,
    revenueGenerated: 3500,
    lastSale: '2024-01-14T16:20:00Z',
    createdAt: '2024-01-05T12:00:00Z'
  },
  {
    id: 4,
    productType: 'socks' as const,
    name: 'Cotton Gents Socks',
    articleNumber: 'CTN-GNT-001',
    category: 'Gents Socks',
    color: 'Black',
    brand: 'Cotton Plus',
    variants: { 'Free Size': 15, 'Large': 5 },
    buyingPrice: 50,
    sellingPrice: 120,
    totalStock: 20,
    timesSold: 8,
    revenueGenerated: 960,
    lastSale: '2024-01-15T09:45:00Z',
    createdAt: '2024-01-12T14:00:00Z'
  },
  {
    id: 5,
    productType: 'bags' as const,
    name: 'Ladies Handbag',
    articleNumber: 'LHB-001',
    category: 'Handbags',
    color: 'Brown',
    brand: 'Stylish',
    variants: { 'Single Item': 2 },
    buyingPrice: 1500,
    sellingPrice: 2800,
    totalStock: 2,
    timesSold: 1,
    revenueGenerated: 2800,
    lastSale: '2024-01-14T16:15:00Z',
    createdAt: '2024-01-09T11:30:00Z'
  }
];