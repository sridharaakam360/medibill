import { Medicine, Customer, SaleRecord } from './types';

export const MOCK_MEDICINES: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', batchNo: 'B-201', expiryDate: '2024-12', stock: 1500, price: 25.00, category: 'Analgesic' },
  { id: '2', name: 'Amoxicillin 250mg', batchNo: 'A-992', expiryDate: '2024-08', stock: 45, price: 85.50, category: 'Antibiotic' },
  { id: '3', name: 'Cetirizine 10mg', batchNo: 'C-112', expiryDate: '2025-03', stock: 800, price: 35.00, category: 'Antihistamine' },
  { id: '4', name: 'Ibuprofen 400mg', batchNo: 'I-883', expiryDate: '2024-10', stock: 320, price: 42.00, category: 'NSAID' },
  { id: '5', name: 'Vitamin C 500mg', batchNo: 'V-221', expiryDate: '2025-06', stock: 50, price: 120.00, category: 'Supplement' },
  { id: '6', name: 'Metformin 500mg', batchNo: 'M-554', expiryDate: '2024-11', stock: 600, price: 18.00, category: 'Antidiabetic' },
  { id: '7', name: 'Atorvastatin 10mg', batchNo: 'A-123', expiryDate: '2025-01', stock: 200, price: 145.00, category: 'Cardiovascular' },
  { id: '8', name: 'Pantoprazole 40mg', batchNo: 'P-998', expiryDate: '2024-09', stock: 1200, price: 95.00, category: 'Antacid' },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Sarah Connor', phone: '9876543210', lastVisit: '2023-10-25', totalSpent: 4500 },
  { id: '2', name: 'John Smith', phone: '8765432109', lastVisit: '2023-10-24', totalSpent: 1200 },
  { id: '3', name: 'Emily Blunt', phone: '7654321098', lastVisit: '2023-10-20', totalSpent: 8900 },
];

export const RECENT_SALES: SaleRecord[] = [
  { id: 'INV-001', date: '2023-10-26', customerName: 'Sarah Connor', totalAmount: 450.00, paymentMode: 'UPI', status: 'Completed' },
  { id: 'INV-002', date: '2023-10-26', customerName: 'Walk-in', totalAmount: 120.00, paymentMode: 'Cash', status: 'Completed' },
  { id: 'INV-003', date: '2023-10-25', customerName: 'John Smith', totalAmount: 850.50, paymentMode: 'Card', status: 'Completed' },
  { id: 'INV-004', date: '2023-10-25', customerName: 'David Rose', totalAmount: 2200.00, paymentMode: 'UPI', status: 'Pending' },
];

export const CHART_DATA = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 6890 },
  { name: 'Sat', revenue: 8390 },
  { name: 'Sun', revenue: 6490 },
];