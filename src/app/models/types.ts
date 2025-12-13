export interface User {
  id: number;
  etsy_user_id: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  etsy_order_id: string;
  etsy_shop_id: string;
  buyer_email: string;
  buyer_name: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  filament_assigned: boolean;
  total_filament_used: number;
  items: OrderItem[];
  synced_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  etsy_listing_id: string;
  title: string;
  quantity: number;
  price: number;
}

export interface Filament {
  id: number;
  user_id: number;
  color: string;
  material: string;
  initial_amount: number;
  current_amount: number;
  unit: string;
  cost_per_gram: number | null;
  used_amount: number;
  created_at: string;
  updated_at: string;
}

export interface FilamentUsage {
  id: number;
  filament_id: number;
  order_id: number | null;
  amount_used: number;
  description: string | null;
  created_at: string;
}
