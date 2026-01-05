import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Printer, Search, CreditCard, User, Calendar, Save, Calculator, X, Check, ArrowRight, IndianRupee, ChevronDown, ChevronUp, Percent, History, UserPlus, FileText, RefreshCw, Copy, ShoppingCart, Star, PauseCircle, RotateCcw, Clock } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Medicine, InvoiceItem, Customer, PurchaseHistoryItem, InvoiceDetails } from '../types';
import { MOCK_MEDICINES, MOCK_CUSTOMERS, getMockPurchaseHistory, getMockInvoiceDetails } from '../constants';

// Interface for Held Bill
interface HeldBill {
  id: string;
  customer: Partial<Customer> | null;
  items: InvoiceItem[];
  date: Date;
  total: number;
}

export const Billing: React.FC = () => {
  // --- State Management ---
  const [invoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNumber] = useState(`INV-${Math.floor(100000 + Math.random() * 900000)}`);
  
  // Cart Tabs State
  const [activeCartTab, setActiveCartTab] = useState<'current' | 'hold'>('current');
  const [heldBills, setHeldBills] = useState<HeldBill[]>([
    {
        id: 'HOLD-101',
        customer: { name: 'Rajesh Koothrappali', phones: ['9988776655'] },
        items: [
            { ...MOCK_MEDICINES[0], quantity: 2, discount: 0, total: 50 },
            { ...MOCK_MEDICINES[5], quantity: 1, discount: 5, total: 17.1 }
        ],
        date: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        total: 75.15 // Approx w/ tax
    }
  ]);

  // Customer State
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Partial<Customer> | null>(null);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  
  // Enhanced New Customer Data State
  const [newCustomerData, setNewCustomerData] = useState({ 
    name: '', 
    phones: [''], 
    email: '',
    address: '',
    outstandingBalance: 0
  });

  // Customer History State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [customerHistory, setCustomerHistory] = useState<PurchaseHistoryItem[]>([]);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [expandedInvoiceDetails, setExpandedInvoiceDetails] = useState<InvoiceDetails | null>(null);

  // Medicine Search State
  const [medicineSearch, setMedicineSearch] = useState('');
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
  
  // Cart State
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card'>('Cash');
  const [amountReceived, setAmountReceived] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [billSuccess, setBillSuccess] = useState(false);

  // --- Derived Data & Calculations ---

  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return [];
    return MOCK_CUSTOMERS.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.phones.some(p => p.includes(customerSearch))
    );
  }, [customerSearch]);

  const filteredMedicines = useMemo(() => {
    if (!medicineSearch) return [];
    
    const term = medicineSearch.toLowerCase();
    
    return MOCK_MEDICINES.filter(m => 
      m.name.toLowerCase().includes(term) ||
      m.batchNo.toLowerCase().includes(term) ||
      (m.supplier && m.supplier.toLowerCase().includes(term))
    ).sort((a, b) => {
        // 1. Sort by Name matches first (Exact matches or starts with)
        // This is implicit if we sort by name alphabetically
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;

        // 2. Sort by Expiry Date (Ascending) - FEFO logic
        const dateA = new Date(a.expiryDate).getTime();
        const dateB = new Date(b.expiryDate).getTime();
        return dateA - dateB;
    });
  }, [medicineSearch]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalDiscount = cart.reduce((acc, item) => {
      const itemTotal = item.price * item.quantity;
      return acc + (itemTotal * (item.discount / 100));
    }, 0);
    
    const taxableAmount = subtotal - totalDiscount;
    const tax = taxableAmount * 0.12; // Assuming flat 12% GST for demo
    const grandTotal = taxableAmount + tax;

    return { subtotal, totalDiscount, taxableAmount, tax, grandTotal };
  }, [cart]);

  // --- Handlers ---

  const calculateItemTotal = (price: number, qty: number, discountPercent: number) => {
    const base = price * qty;
    return base - (base * (discountPercent / 100));
  };

  // Held Bill Handlers
  const handleHoldBill = () => {
    if (cart.length === 0) {
        alert("Cannot hold an empty bill.");
        return;
    }

    const newHold: HeldBill = {
        id: `HOLD-${Math.floor(100 + Math.random() * 900)}`,
        customer: selectedCustomer,
        items: [...cart],
        date: new Date(),
        total: totals.grandTotal
    };

    setHeldBills(prev => [newHold, ...prev]);
    setCart([]);
    setSelectedCustomer(null);
    setActiveCartTab('hold'); // Switch to hold tab to show user
  };

  const handleRecallBill = (bill: HeldBill) => {
    if (cart.length > 0) {
        if (!confirm("Current cart items will be replaced. Continue?")) return;
    }
    
    setCart(bill.items);
    setSelectedCustomer(bill.customer);
    
    // Remove from held list
    setHeldBills(prev => prev.filter(b => b.id !== bill.id));
    setActiveCartTab('current');
  };

  const handleDeleteHeldBill = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(confirm("Discard this held bill?")) {
        setHeldBills(prev => prev.filter(b => b.id !== id));
      }
  };

  // Customer Handlers
  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch('');
    setShowCustomerSuggestions(false);
  };

  const handleWalkIn = () => {
    setSelectedCustomer({ name: 'Walk-in Customer', phones: [''], address: '' });
    setCustomerSearch('');
    setShowCustomerSuggestions(false);
  };

  const handleNewPhoneChange = (index: number, value: string) => {
    const updatedPhones = [...newCustomerData.phones];
    updatedPhones[index] = value;
    setNewCustomerData(prev => ({ ...prev, phones: updatedPhones }));
  };

  const handleAddNewPhone = () => {
    setNewCustomerData(prev => ({ ...prev, phones: [...prev.phones, ''] }));
  };

  const handleRemoveNewPhone = (index: number) => {
    setNewCustomerData(prev => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index)
    }));
  };

  const setPrimaryPhoneNew = (index: number) => {
    if (index === 0) return;
    const phones = [...newCustomerData.phones];
    const [selected] = phones.splice(index, 1);
    phones.unshift(selected);
    setNewCustomerData(prev => ({ ...prev, phones }));
  };

  const handleCreateCustomer = () => {
      if(!newCustomerData.name.trim()) return;
      
      const newCus: Partial<Customer> = {
          name: newCustomerData.name,
          phones: newCustomerData.phones.filter(p => p.trim() !== ''),
          email: newCustomerData.email,
          address: newCustomerData.address,
          outstandingBalance: newCustomerData.outstandingBalance,
          id: `NEW-${Date.now()}` // Temporary ID
      };

      setSelectedCustomer(newCus);
      setShowAddCustomerModal(false);
      setCustomerSearch('');
      setShowCustomerSuggestions(false);
      // Reset Form
      setNewCustomerData({ name: '', phones: [''], email: '', address: '', outstandingBalance: 0 });
  };

  // History Handlers
  const handleViewHistory = () => {
      if(selectedCustomer?.id && !selectedCustomer.id.startsWith('NEW')) {
          setCustomerHistory(getMockPurchaseHistory(selectedCustomer.id));
          setShowHistoryModal(true);
          setExpandedHistoryId(null);
          setExpandedInvoiceDetails(null);
      }
  };

  const toggleHistoryRow = (id: string) => {
      if (expandedHistoryId === id) {
          setExpandedHistoryId(null);
          setExpandedInvoiceDetails(null);
      } else {
          setExpandedHistoryId(id);
          // Simulate fetching full details including items
          const details = getMockInvoiceDetails(id, selectedCustomer?.name || 'Customer');
          setExpandedInvoiceDetails(details);
      }
  };

  const handleCopyBillToCart = () => {
      if (!expandedInvoiceDetails) return;
      
      if(cart.length > 0) {
          if(!confirm("This will replace items currently in your cart. Continue?")) return;
      }

      // Map old items to current stock items to ensure up-to-date pricing/stock
      const newCartItems = expandedInvoiceDetails.items.map(oldItem => {
          const currentStockItem = MOCK_MEDICINES.find(m => m.id === oldItem.id);
          
          if(currentStockItem) {
              return {
                  ...currentStockItem,
                  quantity: oldItem.quantity,
                  discount: oldItem.discount,
                  total: calculateItemTotal(currentStockItem.price, oldItem.quantity, oldItem.discount)
              };
          }
          return oldItem;
      });

      setCart(newCartItems);
      setShowHistoryModal(false);
  };

  // Medicine/Cart Handlers
  const addToCart = (medicine: Medicine) => {
    if (medicine.stock <= 0) {
        alert("Item is out of stock!");
        return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      if (existing) {
        // Don't add if exceeds stock
        if (existing.quantity >= medicine.stock) return prev;
        
        return prev.map(item => 
          item.id === medicine.id 
            ? { ...item, quantity: item.quantity + 1, total: calculateItemTotal(item.price, item.quantity + 1, item.discount) }
            : item
        );
      }
      return [...prev, { 
          ...medicine, 
          quantity: 1, 
          discount: 0, 
          total: calculateItemTotal(medicine.price, 1, 0) 
      }];
    });
    setMedicineSearch('');
    setShowMedicineSuggestions(false);
  };

  const updateItem = (id: string, field: 'quantity' | 'discount', value: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        let newValue = value;
        if (field === 'quantity') {
            // Stock check
            if (newValue > item.stock) newValue = item.stock;
            if (newValue < 1) newValue = 1;
        }
        if (field === 'discount') {
            if (newValue > 100) newValue = 100;
            if (newValue < 0) newValue = 0;
        }

        const newQty = field === 'quantity' ? newValue : item.quantity;
        const newDisc = field === 'discount' ? newValue : item.discount;

        return {
          ...item,
          quantity: newQty,
          discount: newDisc,
          total: calculateItemTotal(item.price, newQty, newDisc)
        };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Payment Handlers
  const handleProcessPayment = () => {
      if(cart.length === 0) return;
      setAmountReceived(Math.ceil(totals.grandTotal).toString());
      setShowPaymentModal(true);
  };

  const finalizeBill = () => {
      setIsProcessing(true);
      setTimeout(() => {
          setIsProcessing(false);
          setBillSuccess(true);
          // Here you would normally API call to save sale
      }, 1500);
  };

  const resetBilling = () => {
      setCart([]);
      setSelectedCustomer(null);
      setShowPaymentModal(false);
      setBillSuccess(false);
      setPaymentMode('Cash');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)] animate-fade-in relative">
        
      {/* --- LEFT SIDE: Medicine Cart (Full Height) --- */}
      <GlassCard className="flex-[2] flex flex-col overflow-hidden relative min-w-0 p-0">
         {/* Inner Wrapper for Flex Layout to ensure scrolling works */}
         <div className="flex flex-col h-full">
            
            {/* Cart Header with Tabs */}
            <div className="p-5 border-b border-slate-200 dark:border-white/10 z-20 flex justify-between items-center bg-white/50 dark:bg-[#0F172A]/40 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${activeCartTab === 'current' ? 'bg-primary/20 text-primary' : 'bg-orange-500/20 text-orange-500'}`}>
                        {activeCartTab === 'current' ? <ShoppingCart size={24} /> : <PauseCircle size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                            {activeCartTab === 'current' ? 'Current Bill' : 'On Hold'}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                             {activeCartTab === 'current' ? `${cart.length} Items` : `${heldBills.length} Invoices`}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-200 dark:bg-black/40 p-1.5 rounded-xl">
                    <button 
                        onClick={() => setActiveCartTab('current')}
                        className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                            activeCartTab === 'current' 
                            ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        Current Bill
                    </button>
                    <button 
                         onClick={() => setActiveCartTab('hold')}
                         className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
                            activeCartTab === 'hold' 
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                    >
                        On Hold
                        {heldBills.length > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                activeCartTab === 'hold' ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'
                            }`}>
                                {heldBills.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>
            
            {/* CONTENT AREA: Depends on Active Tab */}
            
            {activeCartTab === 'current' ? (
                <>
                    {/* Search Bar */}
                    <div className="p-4 z-20 bg-white/30 dark:bg-white/5 backdrop-blur-md border-b border-slate-200 dark:border-white/5">
                        <div className="relative">
                            <div className="flex items-center bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-sm">
                                <Search className="text-slate-400 mr-3" size={20} />
                                <input 
                                    type="text"
                                    placeholder="Search medicine by name, batch, or generic..."
                                    className="bg-transparent border-none outline-none text-slate-800 dark:text-white w-full placeholder-slate-400 font-medium"
                                    value={medicineSearch}
                                    onChange={(e) => {
                                        setMedicineSearch(e.target.value);
                                        setShowMedicineSuggestions(true);
                                    }}
                                    autoFocus
                                />
                            </div>

                            {showMedicineSuggestions && medicineSearch && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-[400px] overflow-y-auto z-50">
                                    {filteredMedicines.length > 0 ? (
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 dark:bg-black/20 text-slate-500 sticky top-0 backdrop-blur-sm">
                                                <tr>
                                                    <th className="p-3 font-medium">Product Name</th>
                                                    <th className="p-3 font-medium">Batch</th>
                                                    <th className="p-3 font-medium">Expiry</th>
                                                    <th className="p-3 font-medium text-center">Stock</th>
                                                    <th className="p-3 font-medium text-right">MRP</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                {filteredMedicines.map(medicine => (
                                                    <tr 
                                                        key={medicine.id}
                                                        onClick={() => addToCart(medicine)}
                                                        className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${medicine.stock === 0 ? 'opacity-50 pointer-events-none bg-slate-100 dark:bg-white/5' : ''}`}
                                                    >
                                                        <td className="p-3">
                                                            <p className="font-semibold text-slate-800 dark:text-white">{medicine.name}</p>
                                                            <p className="text-xs text-slate-500">{medicine.form} • {medicine.schedule}</p>
                                                        </td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300 font-mono text-xs">{medicine.batchNo}</td>
                                                        <td className="p-3 text-slate-600 dark:text-slate-300 text-xs">
                                                            <span className={`${new Date(medicine.expiryDate) < new Date() ? 'text-red-500 font-bold' : ''}`}>
                                                                {medicine.expiryDate}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${medicine.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                                {medicine.stock}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-right font-bold text-slate-800 dark:text-white">₹{medicine.price}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-8 text-center text-slate-500">
                                            No medicines found.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart Table */}
                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/80 dark:bg-white/5 backdrop-blur sticky top-0 z-10 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="p-4 font-medium w-12">#</th>
                                    <th className="p-4 font-medium">Item Description</th>
                                    <th className="p-4 font-medium text-center">Batch / Exp</th>
                                    <th className="p-4 font-medium text-right">Price</th>
                                    <th className="p-4 font-medium text-center w-32">Qty</th>
                                    <th className="p-4 font-medium text-center w-24">Disc %</th>
                                    <th className="p-4 font-medium text-right">Total</th>
                                    <th className="p-4 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {cart.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-32 text-slate-400">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-full">
                                                    <ShoppingCart size={40} className="opacity-30" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium">Cart is empty</p>
                                                    <p className="text-sm opacity-60">Search and add medicines to create a bill</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    cart.map((item, idx) => (
                                        <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-slate-400 text-sm">{idx + 1}</td>
                                            <td className="p-4">
                                                <p className="font-semibold text-slate-800 dark:text-white">{item.name}</p>
                                                <p className="text-xs text-slate-400">{item.form}</p>
                                            </td>
                                            <td className="p-4 text-center text-xs">
                                                <p className="text-slate-600 dark:text-slate-300 font-mono">{item.batchNo}</p>
                                                <p className="text-slate-400">{item.expiryDate}</p>
                                            </td>
                                            <td className="p-4 text-right text-sm text-slate-600 dark:text-slate-300">₹{item.price}</td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center">
                                                    <input 
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                                                        className="w-16 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg py-1 px-2 text-center text-sm font-bold outline-none focus:border-primary"
                                                        min="1"
                                                        max={item.stock}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center relative">
                                                    <input 
                                                        type="number"
                                                        value={item.discount}
                                                        onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value))}
                                                        className="w-14 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg py-1 px-2 text-center text-sm outline-none focus:border-primary pr-4"
                                                        min="0"
                                                        max="100"
                                                    />
                                                    <Percent size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-bold text-slate-800 dark:text-white">
                                                ₹{item.total.toFixed(2)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="p-1.5 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                /* --- HELD BILLS LIST --- */
                <div className="flex-1 overflow-auto custom-scrollbar p-4 bg-slate-50/50 dark:bg-black/20">
                    {heldBills.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                             <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-full mb-4">
                                <PauseCircle size={40} className="opacity-30" />
                             </div>
                             <p className="text-lg font-medium">No bills on hold</p>
                             <p className="text-sm opacity-60">You can hold a current bill to resume it later.</p>
                             <button 
                                onClick={() => setActiveCartTab('current')} 
                                className="mt-4 text-primary font-medium hover:underline"
                             >
                                Back to Cart
                             </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {heldBills.map((bill) => (
                                <div key={bill.id} className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white">
                                                    {bill.customer?.name || 'Walk-in Customer'}
                                                </h4>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Clock size={12} /> Held at {bill.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="bg-slate-100 dark:bg-white/5 text-slate-500 px-2 py-1 rounded text-xs font-mono">
                                            {bill.id}
                                        </span>
                                    </div>
                                    
                                    {/* Preview Items */}
                                    <div className="mb-4 bg-slate-50 dark:bg-black/20 rounded-lg p-3">
                                        <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-bold">Items ({bill.items.length})</p>
                                        <div className="space-y-1">
                                            {bill.items.slice(0, 3).map((item, i) => (
                                                <div key={i} className="flex justify-between text-sm text-slate-700 dark:text-slate-300">
                                                    <span>{item.name}</span>
                                                    <span className="text-slate-500">x{item.quantity}</span>
                                                </div>
                                            ))}
                                            {bill.items.length > 3 && (
                                                <p className="text-xs text-slate-400 italic pt-1">+ {bill.items.length - 3} more items</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                                        <div>
                                            <p className="text-xs text-slate-400">Total Amount</p>
                                            <p className="text-lg font-bold text-slate-800 dark:text-white">₹{bill.total.toFixed(2)}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => handleDeleteHeldBill(bill.id, e)}
                                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Discard"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleRecallBill(bill)}
                                                className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                                            >
                                                <RotateCcw size={16} /> Recall Bill
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
         </div>
      </GlassCard>

      {/* --- RIGHT SIDE: Customer & Summary --- */}
      <div className="w-full md:w-[380px] flex flex-col gap-6 shrink-0 h-full">
          
          {/* Top: Customer Card */}
          <GlassCard className="p-0 overflow-visible z-30">
             <div className="p-5 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 rounded-t-2xl">
                 <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                     <User size={18} className="text-primary" /> Patient Details
                 </h3>
             </div>
             <div className="p-5">
                <div className="relative w-full mb-4">
                {!selectedCustomer ? (
                    <>
                        <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                            <Search className="text-slate-400 mr-2" size={18} />
                            <input 
                                type="text"
                                placeholder="Search Name / Phone..."
                                className="bg-transparent border-none outline-none text-slate-800 dark:text-white w-full placeholder-slate-400 text-sm"
                                value={customerSearch}
                                onChange={(e) => {
                                    setCustomerSearch(e.target.value);
                                    setShowCustomerSuggestions(true);
                                }}
                                onFocus={() => setShowCustomerSuggestions(true)}
                            />
                        </div>
                        {showCustomerSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                                {filteredCustomers.map(c => (
                                    <div 
                                        key={c.id} 
                                        onClick={() => selectCustomer(c)}
                                        className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer border-b border-slate-100 dark:border-white/5 last:border-0"
                                    >
                                        <p className="font-medium text-slate-800 dark:text-white text-sm">{c.name}</p>
                                        <p className="text-xs text-slate-500">{c.phones[0]}</p>
                                    </div>
                                ))}
                                <div 
                                    onClick={() => setShowAddCustomerModal(true)}
                                    className="p-3 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer text-primary text-sm font-medium flex items-center gap-2"
                                >
                                    <UserPlus size={16} /> Add New Customer
                                </div>
                                <div 
                                    onClick={handleWalkIn}
                                    className="p-3 bg-primary/5 hover:bg-primary/10 cursor-pointer text-primary text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <User size={16} /> Continue as Walk-in Customer
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between bg-primary/10 border border-primary/20 rounded-xl p-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                                    {selectedCustomer.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-white">{selectedCustomer.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedCustomer.phones?.[0] || 'No Phone'}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCustomer(null)} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-slate-500">
                                <X size={16} />
                            </button>
                        </div>
                        
                        {/* History Button - Visible if ID exists and not temp */}
                        {selectedCustomer.id && !selectedCustomer.id.startsWith('NEW') && (
                            <button 
                                onClick={handleViewHistory}
                                className="w-full py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <History size={16} /> View Purchase History
                            </button>
                        )}
                    </div>
                )}
                </div>
                <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-200 dark:border-white/10">
                    <span>Invoice #: {invoiceNumber}</span>
                    <span>{invoiceDate}</span>
                </div>
             </div>
          </GlassCard>

          {/* Bottom: Bill Summary (Flex-1 to fill remaining space if needed) */}
          <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden">
              <div className="p-5 bg-gradient-to-br from-slate-50 to-white dark:from-white/5 dark:to-white/0 border-b border-slate-200 dark:border-white/5">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                     <Calculator size={18} className="text-primary" /> Bill Summary
                  </h3>
              </div>
              
              <div className="p-6 flex-1 space-y-3 overflow-y-auto">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>Subtotal ({cart.length} items)</span>
                      <span className="font-mono">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>Total Discount</span>
                      <span className="font-mono text-green-500">-₹{totals.totalDiscount.toFixed(2)}</span>
                  </div>
                  
                  <div className="my-2 border-t border-dashed border-slate-200 dark:border-white/10"></div>
                  
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>Taxable Amount</span>
                      <span className="font-mono">₹{totals.taxableAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                      <span>GST (12%)</span>
                      <span className="font-mono">₹{totals.tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 italic">
                      <span>Round off</span>
                      <span className="font-mono">
                          {(Math.round(totals.grandTotal) - totals.grandTotal).toFixed(2)}
                      </span>
                  </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 mt-auto">
                  <div className="flex justify-between items-end mb-6">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Grand Total</span>
                      <span className="text-3xl font-bold text-slate-800 dark:text-white leading-none">
                          ₹{Math.round(totals.grandTotal).toLocaleString()}
                      </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={handleHoldBill}
                        disabled={cart.length === 0}
                        className={`py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 font-medium flex items-center justify-center gap-2 transition-colors ${cart.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-white/10'}`}
                      >
                          <PauseCircle size={18} /> Hold
                      </button>
                      <button 
                        onClick={handleProcessPayment}
                        disabled={cart.length === 0}
                        className={`py-3 px-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all ${cart.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500 hover:scale-[1.02]'}`}
                      >
                          Pay Now <ArrowRight size={18} />
                      </button>
                  </div>
              </div>
          </GlassCard>
      </div>

      {/* --- MODAL: Add New Customer (Detailed) --- */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
           <GlassCard className="w-full max-w-lg bg-[#0F172A] border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                 <h3 className="text-xl font-bold text-white">Add New Customer</h3>
                 <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                  {/* Name */}
                  <div>
                      <label className="text-xs text-slate-400 mb-1 block">Full Name *</label>
                      <input 
                        type="text" 
                        value={newCustomerData.name} 
                        onChange={e => setNewCustomerData({...newCustomerData, name: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary"
                        placeholder="e.g. Rahul Sharma"
                        autoFocus
                      />
                  </div>

                  {/* Phones */}
                  <div>
                      <label className="text-xs text-slate-400 mb-1 block">Phone Numbers</label>
                      <div className="space-y-2">
                        {newCustomerData.phones.map((phone, idx) => (
                           <div key={idx} className="flex gap-2 items-center">
                              <div className="flex-1 relative">
                                <input 
                                  type="text" 
                                  value={phone}
                                  onChange={(e) => handleNewPhoneChange(idx, e.target.value)}
                                  placeholder={idx === 0 ? "Primary Phone" : "Secondary Phone"}
                                  className={`w-full bg-white/5 border ${idx === 0 ? 'border-primary/50' : 'border-white/10'} rounded-lg p-3 pl-9 text-white outline-none focus:border-primary`} 
                                />
                                <div className="absolute left-3 top-3.5">
                                   <Star size={14} className={idx === 0 ? "text-primary fill-primary" : "text-slate-400"} />
                                </div>
                              </div>
                              
                              {idx !== 0 && (
                                <button 
                                  onClick={() => setPrimaryPhoneNew(idx)}
                                  title="Set as Primary"
                                  className="p-3 text-slate-400 hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
                                >
                                  <Star size={16} />
                                </button>
                              )}

                              {newCustomerData.phones.length > 1 && (
                                <button 
                                  onClick={() => handleRemoveNewPhone(idx)}
                                  className="p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                           </div>
                        ))}
                      </div>
                      <button onClick={handleAddNewPhone} className="mt-2 text-primary text-sm flex items-center gap-1 hover:underline">
                          <Plus size={14} /> Add Another Number
                      </button>
                  </div>

                  {/* Email */}
                  <div>
                      <label className="text-xs text-slate-400 mb-1 block">Email Address</label>
                      <input 
                        type="email"
                        value={newCustomerData.email}
                        onChange={(e) => setNewCustomerData({...newCustomerData, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary"
                        placeholder="e.g. rahul@example.com"
                      />
                  </div>

                  {/* Address */}
                  <div>
                      <label className="text-xs text-slate-400 mb-1 block">Address</label>
                      <textarea 
                        value={newCustomerData.address}
                        onChange={(e) => setNewCustomerData({...newCustomerData, address: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-primary resize-none"
                        rows={2}
                        placeholder="e.g. 123 Main St"
                      />
                  </div>

                  {/* Opening Balance */}
                  <div>
                      <label className="text-xs text-slate-400 mb-1 block">Initial Outstanding Balance</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-slate-500">₹</span>
                        <input 
                          type="number"
                          value={newCustomerData.outstandingBalance}
                          onChange={(e) => setNewCustomerData({...newCustomerData, outstandingBalance: parseFloat(e.target.value) || 0})}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-7 text-white outline-none focus:border-primary"
                          placeholder="0.00"
                        />
                      </div>
                  </div>
              </div>
              <div className="p-6 pt-0 flex justify-end gap-3 pt-4">
                 <button onClick={() => setShowAddCustomerModal(false)} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg">Cancel</button>
                 <button onClick={handleCreateCustomer} className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg flex items-center gap-2">
                     <Check size={18} /> Create & Select
                 </button>
              </div>
           </GlassCard>
        </div>
      )}

      {/* --- MODAL: Customer History --- */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
           <GlassCard className="w-full max-w-2xl bg-[#0F172A] border border-slate-700 shadow-2xl flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                 <div>
                     <h3 className="text-xl font-bold text-white">Purchase History</h3>
                     <p className="text-sm text-slate-400">{selectedCustomer?.name}</p>
                 </div>
                 <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
              </div>
              <div className="p-6 overflow-y-auto">
                  <table className="w-full text-left text-sm">
                       <thead className="bg-white/5 text-slate-400 uppercase text-xs">
                           <tr>
                               <th className="p-3">Date</th>
                               <th className="p-3">Invoice ID</th>
                               <th className="p-3 text-center">Items</th>
                               <th className="p-3 text-right">Amount</th>
                               <th className="p-3 text-right">View</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5 text-slate-300">
                           {customerHistory.map((history) => (
                               <React.Fragment key={history.id}>
                                   <tr className={`hover:bg-white/5 transition-colors ${expandedHistoryId === history.id ? 'bg-white/5' : ''}`}>
                                       <td className="p-3 text-slate-400">{history.date}</td>
                                       <td className="p-3 font-medium text-white">{history.id}</td>
                                       <td className="p-3 text-center">{history.itemsCount}</td>
                                       <td className="p-3 text-right font-bold text-green-400">₹{history.totalAmount.toFixed(2)}</td>
                                       <td className="p-3 text-right">
                                           <button 
                                              onClick={() => toggleHistoryRow(history.id)}
                                              className="p-2 bg-slate-700 hover:bg-primary hover:text-white rounded-full transition-colors ml-auto"
                                           >
                                               {expandedHistoryId === history.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                           </button>
                                       </td>
                                   </tr>
                                   {/* Expanded Row Details */}
                                   {expandedHistoryId === history.id && expandedInvoiceDetails && (
                                       <tr>
                                           <td colSpan={5} className="p-0">
                                               <div className="bg-black/20 p-4 border-y border-white/5 animate-fade-in">
                                                   <div className="flex justify-between items-center mb-3">
                                                       <p className="text-xs font-bold text-slate-400 uppercase">Items in Bill</p>
                                                       <button 
                                                            onClick={handleCopyBillToCart}
                                                            className="text-xs bg-primary hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
                                                       >
                                                            <Copy size={14} /> Copy All to Cart
                                                       </button>
                                                   </div>
                                                   <table className="w-full text-xs text-left mb-2">
                                                       <thead className="text-slate-500">
                                                           <tr>
                                                               <th className="pb-2">Medicine</th>
                                                               <th className="pb-2 text-center">Qty</th>
                                                               <th className="pb-2 text-right">Price</th>
                                                           </tr>
                                                       </thead>
                                                       <tbody className="text-slate-300">
                                                           {expandedInvoiceDetails.items.map((item, i) => (
                                                               <tr key={i} className="border-t border-white/5">
                                                                   <td className="py-2">{item.name} <span className="text-slate-500">({item.form})</span></td>
                                                                   <td className="py-2 text-center">{item.quantity}</td>
                                                                   <td className="py-2 text-right">₹{item.total.toFixed(2)}</td>
                                                               </tr>
                                                           ))}
                                                       </tbody>
                                                   </table>
                                               </div>
                                           </td>
                                       </tr>
                                   )}
                               </React.Fragment>
                           ))}
                       </tbody>
                   </table>
                   {customerHistory.length === 0 && (
                       <div className="text-center py-10 text-slate-500">
                           No previous bills found for this customer.
                       </div>
                   )}
              </div>
              <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
                   <button onClick={() => setShowHistoryModal(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Close</button>
              </div>
           </GlassCard>
        </div>
      )}

      {/* --- Payment Modal --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            {billSuccess ? (
                <GlassCard className="w-full max-w-sm p-8 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-green-500/30 animate-scale-in">
                        <Check size={40} strokeWidth={3} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Payment Successful!</h3>
                    <p className="text-slate-500 mb-8">Invoice #{invoiceNumber} has been generated.</p>
                    <div className="flex flex-col w-full gap-3">
                        <button className="w-full py-3 bg-slate-200 dark:bg-white/10 rounded-xl font-medium text-slate-800 dark:text-white flex items-center justify-center gap-2 hover:bg-slate-300 dark:hover:bg-white/20 transition-colors">
                            <Printer size={18} /> Print Invoice
                        </button>
                        <button 
                            onClick={resetBilling}
                            className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-blue-600 transition-colors"
                        >
                            New Sale
                        </button>
                    </div>
                </GlassCard>
            ) : (
                <GlassCard className="w-full max-w-md bg-[#0F172A] border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="text-xl font-bold text-white">Collect Payment</h3>
                        <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="text-center">
                            <p className="text-slate-400 text-sm mb-1">Total Payable Amount</p>
                            <p className="text-4xl font-bold text-white">₹{Math.round(totals.grandTotal).toLocaleString()}</p>
                        </div>

                        {/* Payment Modes */}
                        <div className="grid grid-cols-3 gap-3">
                            {['Cash', 'UPI', 'Card'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setPaymentMode(mode as any)}
                                    className={`py-3 rounded-xl border font-medium transition-all ${paymentMode === mode ? 'bg-primary border-primary text-white' : 'bg-transparent border-white/10 text-slate-400 hover:bg-white/5'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        {/* Amount Input */}
                        <div>
                            <label className="text-xs text-slate-400 mb-2 block">Amount Received</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input 
                                    type="number"
                                    value={amountReceived}
                                    onChange={(e) => setAmountReceived(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-lg font-bold outline-none focus:border-primary"
                                />
                            </div>
                            {paymentMode === 'Cash' && parseFloat(amountReceived) > totals.grandTotal && (
                                <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20 flex justify-between items-center">
                                    <span className="text-sm text-green-400">Change to return:</span>
                                    <span className="font-bold text-green-400">₹{(parseFloat(amountReceived) - Math.round(totals.grandTotal)).toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 pt-0">
                        <button 
                            onClick={finalizeBill}
                            disabled={!amountReceived || parseFloat(amountReceived) < Math.round(totals.grandTotal) || isProcessing}
                            className={`w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                                !amountReceived || parseFloat(amountReceived) < Math.round(totals.grandTotal) || isProcessing
                                ? 'bg-slate-700 cursor-not-allowed text-slate-500' 
                                : 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20'
                            }`}
                        >
                            {isProcessing ? (
                                <span className="animate-pulse">Processing...</span>
                            ) : (
                                <>
                                    <Check size={20} /> Complete Sale
                                </>
                            )}
                        </button>
                    </div>
                </GlassCard>
            )}
        </div>
      )}
    </div>
  );
};