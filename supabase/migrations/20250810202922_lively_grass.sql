/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `product_type` (text, enum: shoes, socks, bags, belts)
      - `name` (text)
      - `article_number` (text, optional)
      - `category` (text)
      - `color` (text)
      - `brand` (text)
      - `variants` (jsonb, stores size/variant quantities)
      - `buying_price` (decimal)
      - `selling_price` (decimal)
      - `total_stock` (integer, calculated from variants)
      - `times_sold` (integer, default 0)
      - `revenue_generated` (decimal, default 0)
      - `last_sale` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policies for users to manage their own products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('shoes', 'socks', 'bags', 'belts')),
  name text NOT NULL,
  article_number text,
  category text NOT NULL,
  color text NOT NULL,
  brand text NOT NULL,
  variants jsonb NOT NULL DEFAULT '{}',
  buying_price decimal(10,2) NOT NULL CHECK (buying_price >= 0),
  selling_price decimal(10,2) NOT NULL CHECK (selling_price >= 0),
  total_stock integer NOT NULL DEFAULT 0 CHECK (total_stock >= 0),
  times_sold integer NOT NULL DEFAULT 0 CHECK (times_sold >= 0),
  revenue_generated decimal(12,2) NOT NULL DEFAULT 0 CHECK (revenue_generated >= 0),
  last_sale timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own products
CREATE POLICY "Users can read own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own products
CREATE POLICY "Users can insert own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own products
CREATE POLICY "Users can update own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to delete their own products
CREATE POLICY "Users can delete own products"
  ON products
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to calculate total stock from variants
CREATE OR REPLACE FUNCTION calculate_total_stock(variants_json jsonb)
RETURNS integer AS $$
DECLARE
  total integer := 0;
  variant_key text;
  variant_value jsonb;
BEGIN
  FOR variant_key, variant_value IN SELECT * FROM jsonb_each(variants_json)
  LOOP
    total := total + (variant_value::text)::integer;
  END LOOP;
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update total_stock and updated_at
CREATE OR REPLACE FUNCTION update_product_totals()
RETURNS trigger AS $$
BEGIN
  NEW.total_stock = calculate_total_stock(NEW.variants);
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_totals
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_totals();

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_article_number ON products(article_number);