// Tipos para la aplicación El Mercadito

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  imageUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  sellerId: number;
}

export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY';
  label: string;
}

export interface VendorRequest {
  id: number;
  vendorName: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestDate: string;
  documents?: string[];
}

export interface DashboardStats {
  activeProducts: number;
  totalSales: number;
  totalUsers: number;
}