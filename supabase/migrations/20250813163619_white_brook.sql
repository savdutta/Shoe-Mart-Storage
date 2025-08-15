/*
  # Fix User Profiles and Products Foreign Key Issues

  1. Database Functions
    - Create function to handle new user registration
    - Create function to update timestamps
    - Create function to update product totals

  2. User Profiles Table Updates
    - Fix foreign key reference to auth.users
    - Add proper triggers for user creation
    - Update RLS policies

  3. Products Table Updates
    - Fix foreign key constraint
    - Add proper indexes
    - Update RLS policies

  4. Sales Table Updates
    - Fix foreign key constraints
    - Add proper indexes
    - Update RLS policies
*/

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'manager');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update product totals
CREATE OR REPLACE FUNCTION update_product_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total stock from variants
  NEW.total_stock = (
    SELECT COALESCE(SUM((value)::int), 0)
    FROM jsonb_each_text(NEW.variants)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing tables if they exist to recreate with proper structure
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  role text DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'staff')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_type text NOT NULL CHECK (product_type IN ('shoes', 'socks', 'bags', 'belts')),
  name text NOT NULL,
  article_number text,
  category text NOT NULL,
  color text NOT NULL,
  brand text NOT NULL,
  variants jsonb NOT NULL DEFAULT '{}',
  buying_price numeric(10,2) NOT NULL CHECK (buying_price >= 0),
  selling_price numeric(10,2) NOT NULL CHECK (selling_price >= 0),
  total_stock integer NOT NULL DEFAULT 0 CHECK (total_stock >= 0),
  times_sold integer NOT NULL DEFAULT 0 CHECK (times_sold >= 0),
  revenue_generated numeric(12,2) NOT NULL DEFAULT 0 CHECK (revenue_generated >= 0),
  last_sale timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products
CREATE POLICY "Users can read own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_type text NOT NULL,
  article_number text,
  variant text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  sale_price numeric(10,2) NOT NULL CHECK (sale_price >= 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  buying_price numeric(10,2) NOT NULL CHECK (buying_price >= 0),
  profit numeric(10,2) NOT NULL,
  customer_name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sales
CREATE POLICY "Users can read own sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales"
  ON sales
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales"
  ON sales
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_article_number ON products(article_number);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_user_date ON sales(user_id, created_at DESC);

-- Create triggers
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_totals
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_totals();

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();