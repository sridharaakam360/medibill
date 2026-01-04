import React from 'react';

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  BILLING = 'BILLING',
  INVENTORY = 'INVENTORY',
  CUSTOMERS = 'CUSTOMERS',
  REPORTS = 'REPORTS'
}

export interface Medicine {
  id: string;
  name: string;
  batchNo: string;
  expiryDate: string;
  stock: number;
  price: number;
  schedule: string; // Changed from category to schedule (e.g. Schedule H, OTC)
  form: string;     // Dosage form (Tablet, Syrup, etc.)
  supplier: string;
  minStockLevel: number;
  location: string; // Physical location (Rack, Shelf)
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export interface InvoiceItem extends Medicine {
  quantity: number;
  discount: number; // percentage
  total: number;
}

export interface StockHistoryItem {
  id: string;
  date: string;
  type: 'Sale' | 'Restock' | 'Adjustment' | 'Return';
  quantityChange: number;
  balance: number;
  reference: string;
  performedBy: string;
  documentUrl?: string; // For invoice proofs
  medicineName?: string; // Optional helper for aggregated views
}

export interface Customer {
  id: string;
  name: string;
  phones: string[]; // Changed to array for multiple numbers
  email: string;
  address: string;
  lastVisit: string;
  totalSpent: number;
  outstandingBalance: number;
}

export interface SaleRecord {
  id: string;
  date: string;
  customerName: string;
  totalAmount: number;
  paymentMode: 'Cash' | 'UPI' | 'Card';
  status: 'Completed' | 'Pending';
}

export interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

export interface PurchaseHistoryItem {
  id: string;
  date: string;
  itemsCount: number;
  totalAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface InvoiceDetails {
  id: string;
  date: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}