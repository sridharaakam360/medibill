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
  category: string;
}

export interface InvoiceItem extends Medicine {
  quantity: number;
  discount: number; // percentage
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  lastVisit: string;
  totalSpent: number;
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