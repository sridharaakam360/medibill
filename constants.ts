import { Medicine, Customer, SaleRecord, PurchaseHistoryItem, InvoiceDetails, Supplier, StockHistoryItem } from './types';

export const MEDICINE_FORMS = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Spray', 'Drops', 'Ointment', 'Powder', 'Gel', 'Inhaler'];
export const MEDICINE_SCHEDULES = ['Schedule H', 'Schedule H1', 'Schedule X', 'Schedule G', 'Schedule C', 'Schedule C1', 'OTC', 'Narcotic'];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'HealthCorp India', contactPerson: 'Rajesh Kumar', phone: '9876543210', email: 'orders@healthcorp.in', address: 'Mumbai, MH' },
  { id: '2', name: 'MediLife Pharma', contactPerson: 'Suresh Patel', phone: '9898989898', email: 'sales@medilife.com', address: 'Ahmedabad, GJ' },
  { id: '3', name: 'Global Meds', contactPerson: 'Anita Desai', phone: '7776665554', email: 'contact@globalmeds.com', address: 'Bangalore, KA' },
  { id: '4', name: 'NutraWell', contactPerson: 'Vikram Singh', phone: '8887776665', email: 'info@nutrawell.com', address: 'Delhi, DL' },
  { id: '5', name: 'DiabetCare', contactPerson: 'Meera Reddy', phone: '9990001112', email: 'support@diabetcare.in', address: 'Hyderabad, TS' },
  { id: '6', name: 'HeartSafe', contactPerson: 'Arun Verma', phone: '7654321098', email: 'arun@heartsafe.org', address: 'Chennai, TN' },
  { id: '7', name: 'GastroCure', contactPerson: 'Priya Mehta', phone: '9870001234', email: 'sales@gastrocure.com', address: 'Pune, MH' },
];

export const MOCK_MEDICINES: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', batchNo: 'B-201', expiryDate: '2024-12', stock: 1500, price: 25.00, schedule: 'OTC', form: 'Tablet', supplier: 'HealthCorp India', minStockLevel: 500, location: 'Rack A-01' },
  { id: '2', name: 'Amoxicillin 250mg', batchNo: 'A-992', expiryDate: '2024-08', stock: 45, price: 85.50, schedule: 'Schedule H', form: 'Capsule', supplier: 'MediLife Pharma', minStockLevel: 100, location: 'Rack B-04' },
  { id: '3', name: 'Cetirizine 10mg', batchNo: 'C-112', expiryDate: '2025-03', stock: 800, price: 35.00, schedule: 'Schedule H', form: 'Tablet', supplier: 'Global Meds', minStockLevel: 200, location: 'Rack A-02' },
  { id: '4', name: 'Ibuprofen 400mg', batchNo: 'I-883', expiryDate: '2024-10', stock: 320, price: 42.00, schedule: 'Schedule H', form: 'Tablet', supplier: 'HealthCorp India', minStockLevel: 150, location: 'Rack A-03' },
  { id: '5', name: 'Vitamin C 500mg', batchNo: 'V-221', expiryDate: '2025-06', stock: 50, price: 120.00, schedule: 'OTC', form: 'Chewable', supplier: 'NutraWell', minStockLevel: 100, location: 'Rack C-01' },
  { id: '6', name: 'Metformin 500mg', batchNo: 'M-554', expiryDate: '2024-11', stock: 600, price: 18.00, schedule: 'Schedule G', form: 'Tablet', supplier: 'DiabetCare', minStockLevel: 300, location: 'Rack A-05' },
  { id: '7', name: 'Atorvastatin 10mg', batchNo: 'A-123', expiryDate: '2025-01', stock: 200, price: 145.00, schedule: 'Schedule H', form: 'Tablet', supplier: 'HeartSafe', minStockLevel: 100, location: 'Rack B-02' },
  { id: '8', name: 'Pantoprazole 40mg', batchNo: 'P-998', expiryDate: '2024-09', stock: 1200, price: 95.00, schedule: 'Schedule H', form: 'Tablet', supplier: 'GastroCure', minStockLevel: 400, location: 'Rack B-03' },
  { id: '9', name: 'Benadryl Cough Syrup', batchNo: 'S-452', expiryDate: '2025-02', stock: 150, price: 110.00, schedule: 'Schedule G', form: 'Syrup', supplier: 'Global Meds', minStockLevel: 50, location: 'Shelf S-01' },
  { id: '10', name: 'Volini Spray', batchNo: 'SP-112', expiryDate: '2025-08', stock: 85, price: 210.00, schedule: 'OTC', form: 'Spray', supplier: 'HealthCorp India', minStockLevel: 20, location: 'Shelf S-02' },
];

export const MOCK_CUSTOMERS: Customer[] = [
  { 
    id: '1', 
    name: 'Sarah Connor', 
    phones: ['9876543210'], 
    email: 'sarah.c@example.com',
    address: '12 Cyberdyne Systems Way, Tech Park',
    lastVisit: '2023-10-25', 
    totalSpent: 4500,
    outstandingBalance: 0
  },
  { 
    id: '2', 
    name: 'John Smith', 
    phones: ['8765432109', '9988001122'], 
    email: 'john.smith@example.com',
    address: '45 Maple Street, Downtown',
    lastVisit: '2023-10-24', 
    totalSpent: 1200,
    outstandingBalance: 500
  },
  { 
    id: '3', 
    name: 'Emily Blunt', 
    phones: ['7654321098'], 
    email: 'emily.b@example.com',
    address: '88 Quiet Place, Suburbia',
    lastVisit: '2023-10-20', 
    totalSpent: 8900,
    outstandingBalance: 0
  },
  { 
    id: '4', 
    name: 'Rajesh Koothrappali', 
    phones: ['9988776655'], 
    email: 'rajesh.k@caltech.edu',
    address: 'Apt 4B, 2311 N Los Robles Ave',
    lastVisit: '2023-10-22', 
    totalSpent: 15400,
    outstandingBalance: 250
  },
  { 
    id: '5', 
    name: 'Walter White', 
    phones: ['9123456780'], 
    email: 'heisenberg@cook.com',
    address: '308 Negra Arroyo Lane, Albuquerque',
    lastVisit: '2023-10-18', 
    totalSpent: 250000,
    outstandingBalance: 12000
  },
  { 
    id: '6', 
    name: 'Jesse Pinkman', 
    phones: ['9876543212'], 
    email: 'jesse@capncook.com',
    address: '9832 Margo St, Albuquerque',
    lastVisit: '2023-10-19', 
    totalSpent: 3400,
    outstandingBalance: 0
  },
  { 
    id: '7', 
    name: 'Sheldon Cooper', 
    phones: ['8877665544'], 
    email: 'sheldon@caltech.edu',
    address: 'Apt 4A, 2311 N Los Robles Ave',
    lastVisit: '2023-10-26', 
    totalSpent: 150,
    outstandingBalance: 0
  },
  { 
    id: '8', 
    name: 'Penny Hofstadter', 
    phones: ['7766554433'], 
    email: 'penny@cheesecakefactory.com',
    address: 'Apt 4B, 2311 N Los Robles Ave',
    lastVisit: '2023-10-15', 
    totalSpent: 5600,
    outstandingBalance: 1500
  },
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

export const getMockPurchaseHistory = (customerId: string): PurchaseHistoryItem[] => {
  // Generate deterministic mock history based on ID
  const count = (customerId.charCodeAt(0) % 5) + 2; // 2 to 6 items
  return Array.from({ length: count }).map((_, i) => ({
    id: `INV-${customerId}-${1000 + i}`,
    date: `2023-10-${25 - i}`,
    itemsCount: (i % 3) + 1,
    totalAmount: (i + 1) * 450.50,
    status: i === 0 && parseInt(customerId) % 2 === 0 ? 'Pending' : 'Paid'
  }));
};

export const getMockInvoiceDetails = (invoiceId: string, customerName: string): InvoiceDetails => {
  // Mock items for the invoice
  const numItems = Math.floor(Math.random() * 4) + 1;
  const items = Array.from({ length: numItems }).map((_, i) => {
    const medicine = MOCK_MEDICINES[i % MOCK_MEDICINES.length];
    const qty = Math.floor(Math.random() * 2) + 1;
    return {
      ...medicine,
      quantity: qty,
      discount: 0,
      total: medicine.price * qty
    };
  });

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return {
    id: invoiceId,
    date: '2023-10-25',
    customerName,
    items,
    subtotal,
    tax,
    total
  };
};

export const getMockStockHistory = (medicineId: string, currentStock: number): StockHistoryItem[] => {
  const history: StockHistoryItem[] = [];
  let balance = currentStock;

  // Add initial stock
  history.push({
    id: 'HIST-000',
    date: '2023-10-01',
    type: 'Restock',
    quantityChange: balance + 50, // Pretend we started lower
    balance: balance + 50,
    reference: 'PO-2023-001',
    performedBy: 'Admin'
  });

  balance += 50;

  // Simulate some sales and adjustments
  for (let i = 1; i <= 5; i++) {
    const isSale = Math.random() > 0.3;
    const qty = Math.floor(Math.random() * 20) + 1;
    
    if (isSale) {
        if (balance >= qty) {
            balance -= qty;
            history.unshift({
                id: `HIST-${i}`,
                date: `2023-10-${i + 1}`,
                type: 'Sale',
                quantityChange: -qty,
                balance: balance,
                reference: `INV-2023-${100+i}`,
                performedBy: 'System'
            });
        }
    } else {
        balance += qty;
        history.unshift({
            id: `HIST-${i}`,
            date: `2023-10-${i + 1}`,
            type: 'Restock',
            quantityChange: qty,
            balance: balance,
            reference: `PO-2023-${500+i}`,
            performedBy: 'Manager'
        });
    }
  }

  // Ensure the latest balance matches currentStock by adding a final adjustment if needed
  if (balance !== currentStock) {
      const diff = currentStock - balance;
      history.unshift({
          id: 'HIST-FINAL',
          date: '2023-10-27',
          type: 'Adjustment',
          quantityChange: diff,
          balance: currentStock,
          reference: 'Stock Audit',
          performedBy: 'Admin'
      });
  }

  return history;
};