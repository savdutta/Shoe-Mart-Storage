/*
  # Create sales table

  1. New Tables
    - `sales`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `product_id` (uuid, references products)
      - `product_name` (text, denormalized for performance)
      - `product_type` (text)
      - `article_number` (text)
      - `variant` (text, size or variant sold)
      - `quantity` (integer)
      - `sale_price` (decimal, total sale amount)
      - `unit_price` (decimal, price per unit)
      - `buying_price` (decimal, cost per unit)
      - `profit` (decimal, total profit)
      - `customer_name` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `sales` table
    - Add policies for users to manage their own sales
*/

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  product_name text NOT NULL,
  product_type text NOT NULL,
  article_number text,
  variant text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  sale_price decimal(10,2) NOT NULL CHECK (sale_price >= 0),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price >= 0),
  buying_price decimal(10,2) NOT NULL CHECK (buying_price >= 0),
  profit decimal(10,2) NOT NULL,
  customer_name text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own sales
CREATE POLICY "Users can read own sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own sales
CREATE POLICY "Users can insert own sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own sales
CREATE POLICY "Users can update own sales"
  ON sales
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to delete their own sales
CREATE POLICY "Users can delete own sales"
  ON sales
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_user_date ON sales(user_id, created_at DESC);