import { useState, useEffect } from 'react';
import { Product, Sale, DashboardMetrics } from '../types';
import { calculateTotalStock, calculateDashboardMetrics } from '../utils/helpers';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Load products from Supabase
  const loadProducts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedProducts: Product[] = data.map(product => ({
        id: parseInt(product.id.replace(/-/g, '').substring(0, 8), 16), // Convert UUID to number for compatibility
        productType: product.product_type as Product['productType'],
        name: product.name,
        articleNumber: product.article_number || '',
        category: product.category,
        color: product.color,
        brand: product.brand,
        variants: product.variants as Record<string, number>,
        buyingPrice: parseFloat(product.buying_price),
        sellingPrice: parseFloat(product.selling_price),
        totalStock: product.total_stock,
        timesSold: product.times_sold,
        revenueGenerated: parseFloat(product.revenue_generated),
        lastSale: product.last_sale,
        createdAt: product.created_at,
        supabaseId: product.id // Store original UUID for database operations
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  // Load sales from Supabase
  const loadSales = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedSales: Sale[] = data.map(sale => ({
        id: parseInt(sale.id.replace(/-/g, '').substring(0, 8), 16), // Convert UUID to number for compatibility
        productId: parseInt(sale.product_id.replace(/-/g, '').substring(0, 8), 16),
        productName: sale.product_name,
        productType: sale.product_type,
        articleNumber: sale.article_number || '',
        variant: sale.variant,
        quantity: sale.quantity,
        salePrice: parseFloat(sale.sale_price),
        customerName: sale.customer_name || '',
        profit: parseFloat(sale.profit),
        timestamp: sale.created_at,
        supabaseId: sale.id // Store original UUID for database operations
      }));

      setSales(formattedSales);
    } catch (error) {
      console.error('Failed to load sales:', error);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      Promise.all([loadProducts(), loadSales()]).finally(() => {
        setLoading(false);
      });
    } else {
      setProducts([]);
      setSales([]);
      setLoading(false);
    }
  }, [user]);

  // Calculate metrics when products or sales change
  useEffect(() => {
    if (products.length > 0 || sales.length > 0) {
      const calculatedMetrics = calculateDashboardMetrics(products, sales);
      setMetrics(calculatedMetrics);
    } else {
      setMetrics(null);
    }
  }, [products, sales]);

  const addProduct = async (productData: Omit<Product, 'id' | 'totalStock' | 'timesSold' | 'revenueGenerated' | 'lastSale' | 'createdAt'>) => {
    if (!user) return;

    // First, ensure user profile exists
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    
    if (profileError || !profile) {
      const { error: createProfileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email || '',
          full_name: '',
          role: 'manager'
        }, {
          onConflict: 'id'
        });
      
      if (createProfileError) {
        console.error('Failed to create user profile:', createProfileError);
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          product_type: productData.productType,
          name: productData.name,
          article_number: productData.articleNumber || null,
          category: productData.category,
          color: productData.color,
          brand: productData.brand,
          variants: productData.variants,
          buying_price: productData.buyingPrice,
          selling_price: productData.sellingPrice,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Reload products to get the updated list
      await loadProducts();
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    if (!user) return;

    const product = products.find(p => p.id === id);
    if (!product?.supabaseId) return;

    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.articleNumber !== undefined) updateData.article_number = updates.articleNumber || null;
      if (updates.category) updateData.category = updates.category;
      if (updates.color) updateData.color = updates.color;
      if (updates.brand) updateData.brand = updates.brand;
      if (updates.variants) updateData.variants = updates.variants;
      if (updates.buyingPrice !== undefined) updateData.buying_price = updates.buyingPrice;
      if (updates.sellingPrice !== undefined) updateData.selling_price = updates.sellingPrice;
      if (updates.timesSold !== undefined) updateData.times_sold = updates.timesSold;
      if (updates.revenueGenerated !== undefined) updateData.revenue_generated = updates.revenueGenerated;
      if (updates.lastSale !== undefined) updateData.last_sale = updates.lastSale;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', product.supabaseId);

      if (error) throw error;

      // Reload products to get the updated list
      await loadProducts();
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!user) return;

    const product = products.find(p => p.id === id);
    if (!product?.supabaseId) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.supabaseId);

      if (error) throw error;

      // Reload products to get the updated list
      await loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const processSale = async (saleData: {
    productId: number;
    variant: string;
    quantity: number;
    customerName: string;
    salePrice?: number;
  }) => {
    if (!user) return false;

    const product = products.find(p => p.id === saleData.productId);
    if (!product?.supabaseId) return false;

    const availableQuantity = product.variants[saleData.variant] || 0;
    if (availableQuantity < saleData.quantity) return false;

    const finalSalePrice = saleData.salePrice || product.sellingPrice;
    const unitPrice = finalSalePrice;
    const totalSalePrice = unitPrice * saleData.quantity;
    const profit = (unitPrice - product.buyingPrice) * saleData.quantity;

    try {
      // Start a transaction-like operation
      // 1. Insert sale record
      const { error: saleError } = await supabase
        .from('sales')
        .insert({
          user_id: user.id,
          product_id: product.supabaseId,
          product_name: product.name,
          product_type: product.productType,
          article_number: product.articleNumber || null,
          variant: saleData.variant,
          quantity: saleData.quantity,
          sale_price: totalSalePrice,
          unit_price: unitPrice,
          buying_price: product.buyingPrice,
          profit: profit,
          customer_name: saleData.customerName || ''
        });

      if (saleError) throw saleError;

      // 2. Update product inventory
      const updatedVariants = {
        ...product.variants,
        [saleData.variant]: availableQuantity - saleData.quantity
      };

      const { error: productError } = await supabase
        .from('products')
        .update({
          variants: updatedVariants,
          times_sold: product.timesSold + saleData.quantity,
          revenue_generated: product.revenueGenerated + totalSalePrice,
          last_sale: new Date().toISOString()
        })
        .eq('id', product.supabaseId);

      if (productError) throw productError;

      // Reload data to reflect changes
      await Promise.all([loadProducts(), loadSales()]);
      
      return true;
    } catch (error) {
      console.error('Failed to process sale:', error);
      return false;
    }
  };

  return {
    products,
    sales,
    metrics,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    processSale,
    refreshData: () => Promise.all([loadProducts(), loadSales()])
  };
};