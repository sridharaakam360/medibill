import React, { useState, useMemo } from 'react';
import { Package, Filter, AlertTriangle, Search, Plus, Trash2, Edit2, X, Save, IndianRupee, Activity, Calendar, Truck, Layers, MapPin, Box, Phone, Mail, User, History, ArrowDown, ArrowUp, RefreshCcw, UploadCloud, FileText, ExternalLink, Copy, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { MOCK_MEDICINES, MOCK_SUPPLIERS, MEDICINE_FORMS, MEDICINE_SCHEDULES, getMockStockHistory } from '../constants';
import { Medicine, Supplier, StockHistoryItem, StatCardProps } from '../types';

type Tab = 'inventory' | 'suppliers' | 'categories';

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon }) => (
  <GlassCard hoverEffect className="p-6 relative overflow-hidden group h-full">
    <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 64 })}
    </div>
    <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-blue-500/10 dark:bg-white/10 text-primary backdrop-blur-md">
            {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${isPositive ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
            {change}
        </span>
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{value}</p>
    </div>
  </GlassCard>
);

export const Inventory: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(MOCK_MEDICINES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [categories, setCategories] = useState<string[]>(MEDICINE_FORMS);
  const [schedules, setSchedules] = useState<string[]>(MEDICINE_SCHEDULES);

  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');
  
  // Notification State
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Modals
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Custom Input States for Modal
  const [isCustomSchedule, setIsCustomSchedule] = useState(false);
  const [isCustomForm, setIsCustomForm] = useState(false);

  // History Modal State
  const [viewingHistory, setViewingHistory] = useState<Medicine | null>(null);
  const [historyData, setHistoryData] = useState<StockHistoryItem[]>([]);

  // Supplier History State
  const [viewingSupplierHistory, setViewingSupplierHistory] = useState<Supplier | null>(null);
  const [supplierHistoryData, setSupplierHistoryData] = useState<StockHistoryItem[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  
  // Forms Data
  const [currentMedicine, setCurrentMedicine] = useState<Partial<Medicine>>({
    name: '', schedule: '', form: '', batchNo: '', supplier: '', stock: 0, minStockLevel: 0, price: 0, expiryDate: '', location: ''
  });
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier>>({
    name: '', contactPerson: '', phone: '', email: '', address: ''
  });

  const [newCategoryName, setNewCategoryName] = useState('');

  // Derived Data for Suppliers and Categories Tab
  const supplierStats = useMemo(() => {
    return suppliers.map(s => {
        const supplierItems = medicines.filter(m => m.supplier === s.name);
        return {
            ...s,
            itemCount: supplierItems.length,
            totalValue: supplierItems.reduce((acc, curr) => acc + (curr.price * curr.stock), 0)
        };
    });
  }, [medicines, suppliers]);

  const categoryStats = useMemo(() => {
    return categories.map(cat => {
        const catItems = medicines.filter(m => m.form === cat);
        const minStock = catItems.length > 0 ? Math.min(...catItems.map(m => m.stock)) : 0;
        return {
            name: cat,
            count: catItems.length,
            minStock: catItems.length > 0 ? minStock : 0
        };
    });
  }, [medicines, categories]);

  // Unique product names for "Pre-fill" feature
  const uniqueProductNames = useMemo(() => {
      const names = new Set(medicines.map(m => m.name));
      return Array.from(names).sort();
  }, [medicines]);

  // Filter & Sort Logic
  const filteredMedicines = useMemo(() => {
    // 1. Filter
    const filtered = medicines.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterStatus === 'all' 
        ? true 
        : filterStatus === 'low' 
          ? item.stock <= item.minStockLevel && item.stock > 0
          : item.stock === 0;

      return matchesSearch && matchesFilter;
    });

    // 2. Sort: Name (A-Z) -> Expiry (Earliest First / FEFO)
    return filtered.sort((a, b) => {
        // Primary Sort: Name
        const nameCompare = a.name.localeCompare(b.name);
        if (nameCompare !== 0) return nameCompare;
        
        // Secondary Sort: Expiry Date (Ascending)
        // Handle potential empty dates safely
        const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
        const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
        
        return dateA - dateB;
    });
  }, [medicines, searchTerm, filterStatus]);

  // Stats Logic
  const stats = useMemo(() => {
    return {
      totalItems: medicines.length,
      totalValue: medicines.reduce((sum, item) => sum + (item.price * item.stock), 0),
      lowStock: medicines.filter(item => item.stock <= item.minStockLevel).length,
      outOfStock: medicines.filter(item => item.stock === 0).length
    };
  }, [medicines]);

  // --- Handlers: Inventory ---

  const showToast = (message: string, type: 'success' | 'error') => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
  };

  const handleAddNewMedicine = () => {
    setIsEditing(false);
    setCurrentMedicine({
      name: '', schedule: '', form: '', batchNo: '', supplier: '', stock: 0, minStockLevel: 10, price: 0, expiryDate: '', location: ''
    });
    setInvoiceFile(null);
    setIsCustomSchedule(false);
    setIsCustomForm(false);
    setShowInventoryModal(true);
  };

  const handlePrefillProduct = (productName: string) => {
      if(!productName) return;
      // Find the most recent entry for this product to copy details from
      const existing = medicines.find(m => m.name === productName);
      if(existing) {
          setCurrentMedicine(prev => ({
              ...prev,
              name: existing.name,
              schedule: existing.schedule,
              form: existing.form,
              minStockLevel: existing.minStockLevel,
              price: existing.price,
              location: existing.location,
              supplier: existing.supplier, // Pre-fill supplier, but allow change
              // Reset specific batch fields
              batchNo: '',
              expiryDate: '',
              stock: 0
          }));
          // Reset custom toggles as we are pulling from valid existing data
          setIsCustomSchedule(false);
          setIsCustomForm(false);
      }
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setIsEditing(true);
    setCurrentMedicine({ ...medicine });
    setInvoiceFile(null);
    // Check if current schedule/form is custom (not in default lists)
    setIsCustomSchedule(!schedules.includes(medicine.schedule));
    setIsCustomForm(!categories.includes(medicine.form));
    setShowInventoryModal(true);
  };

  const handleDeleteMedicine = (id: string) => {
    if (confirm('Are you sure you want to delete this medicine?')) {
      setMedicines(prev => prev.filter(m => m.id !== id));
      showToast('Medicine deleted successfully', 'success');
    }
  };

  const handleSaveMedicine = () => {
    // Validation
    if (!currentMedicine.name || !currentMedicine.batchNo) {
        showToast('Please fill in Medicine Name and Batch Number', 'error');
        return;
    }
    
    // In a real app, we would upload invoiceFile here
    if (invoiceFile) {
        console.log("Uploading invoice:", invoiceFile.name);
    }

    // Add new custom schedule if used
    if (isCustomSchedule && currentMedicine.schedule && !schedules.includes(currentMedicine.schedule)) {
      setSchedules(prev => [...prev, currentMedicine.schedule!].sort());
    }

    // Add new custom form if used
    if (isCustomForm && currentMedicine.form && !categories.includes(currentMedicine.form)) {
      setCategories(prev => [...prev, currentMedicine.form!].sort());
    }

    if (isEditing && currentMedicine.id) {
      setMedicines(prev => prev.map(m => m.id === currentMedicine.id ? currentMedicine as Medicine : m));
      showToast('Medicine details updated successfully', 'success');
    } else {
      const newId = (Math.max(...medicines.map(m => parseInt(m.id)), 0) + 1).toString();
      setMedicines(prev => [...prev, { ...currentMedicine, id: newId } as Medicine]);
      showToast('New stock added successfully', 'success');
    }

    // Reset filters to ensure the user sees the new item they just added
    setSearchTerm('');
    setFilterStatus('all');

    setShowInventoryModal(false);
  };

  const handleViewHistory = (medicine: Medicine) => {
      setViewingHistory(medicine);
      setHistoryData(getMockStockHistory(medicine.id, medicine.stock));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInvoiceFile(e.target.files[0]);
    }
  };

  // --- Handlers: Supplier ---
  
  const handleAddNewSupplier = () => {
      setCurrentSupplier({ name: '', contactPerson: '', phone: '', email: '', address: '' });
      setShowSupplierModal(true);
  };

  const handleSaveSupplier = () => {
      if (!currentSupplier.name) {
          showToast('Supplier Name is required', 'error');
          return;
      }
      const newId = (suppliers.length + 1).toString();
      const newSup = { ...currentSupplier, id: newId } as Supplier;
      setSuppliers([...suppliers, newSup]);
      setShowSupplierModal(false);
      showToast('Supplier registered successfully', 'success');
      
      // If adding from Inventory Modal context, auto-select it
      if (showInventoryModal) {
          setCurrentMedicine({ ...currentMedicine, supplier: newSup.name });
      }
  };

  const handleViewSupplierHistory = (supplier: any) => {
      const supplierItems = medicines.filter(m => m.supplier === supplier.name);
      let aggregatedHistory: StockHistoryItem[] = [];
      
      supplierItems.forEach(item => {
          const itemHistory = getMockStockHistory(item.id, item.stock);
          const restocks = itemHistory
            .filter(h => h.type === 'Restock')
            .map(h => ({ ...h, medicineName: item.name, documentUrl: 'invoice_demo.pdf' })); 
          aggregatedHistory = [...aggregatedHistory, ...restocks];
      });

      aggregatedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setViewingSupplierHistory(supplier);
      setSupplierHistoryData(aggregatedHistory);
  };

  // --- Handlers: Category ---

  const handleAddNewCategory = () => {
      setNewCategoryName('');
      setShowCategoryModal(true);
  };

  const handleSaveCategory = () => {
      if (!newCategoryName.trim()) return;
      if (!categories.includes(newCategoryName)) {
          setCategories([...categories, newCategoryName]);
          showToast('Category added successfully', 'success');
      }
      setShowCategoryModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">

      {/* --- Notification Toast --- */}
      {notification && (
          <div className="fixed top-24 right-6 z-[100] animate-slide-in-right">
              <GlassCard className={`p-4 flex items-center gap-3 border-l-4 ${notification.type === 'success' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  {notification.type === 'success' ? (
                      <CheckCircle className="text-green-500" size={24} />
                  ) : (
                      <AlertCircle className="text-red-500" size={24} />
                  )}
                  <div>
                      <p className={`font-bold ${notification.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                          {notification.type === 'success' ? 'Success' : 'Error'}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{notification.message}</p>
                  </div>
              </GlassCard>
          </div>
      )}
      
      {/* --- MODAL: Product History --- */}
      {viewingHistory && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <GlassCard className="w-full max-w-2xl bg-[#0F172A] border border-slate-700 shadow-2xl h-[80vh] flex flex-col">
              <div className="flex flex-col h-full">
               <div className="flex-shrink-0 p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <History size={24} className="text-primary"/> Product History
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{viewingHistory.name} • Batch: {viewingHistory.batchNo}</p>
                  </div>
                  <button onClick={() => setViewingHistory(null)} className="text-slate-400 hover:text-white"><X size={20}/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6">
                   <div className="flex gap-4 mb-6">
                       <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                           <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Stock</p>
                           <p className="text-2xl font-bold text-white">{viewingHistory.stock}</p>
                       </div>
                       <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                           <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Min Level</p>
                           <p className="text-2xl font-bold text-slate-300">{viewingHistory.minStockLevel}</p>
                       </div>
                       <div className="flex-1 p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                           <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Price</p>
                           <p className="text-2xl font-bold text-green-400">₹{viewingHistory.price}</p>
                       </div>
                   </div>

                   <table className="w-full text-left text-sm">
                       <thead className="bg-white/5 text-slate-400 uppercase text-xs">
                           <tr>
                               <th className="p-3">Date</th>
                               <th className="p-3">Type</th>
                               <th className="p-3">Reference</th>
                               <th className="p-3 text-right">Change</th>
                               <th className="p-3 text-right">Balance</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5 text-slate-300">
                           {historyData.map((item, idx) => (
                               <tr key={idx} className="hover:bg-white/5">
                                   <td className="p-3">{item.date}</td>
                                   <td className="p-3">
                                       <span className={`flex items-center gap-1.5 ${
                                            item.type === 'Restock' ? 'text-green-400' :
                                            item.type === 'Sale' ? 'text-blue-400' :
                                            item.type === 'Return' ? 'text-orange-400' : 'text-slate-400'
                                       }`}>
                                           {item.type === 'Restock' && <ArrowUp size={14} />}
                                           {item.type === 'Sale' && <ArrowDown size={14} />}
                                           {item.type === 'Adjustment' && <RefreshCcw size={14} />}
                                           {item.type}
                                       </span>
                                   </td>
                                   <td className="p-3 text-slate-400 font-mono text-xs">{item.reference}</td>
                                   <td className={`p-3 text-right font-medium ${item.quantityChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                       {item.quantityChange > 0 ? '+' : ''}{item.quantityChange}
                                   </td>
                                   <td className="p-3 text-right font-mono">{item.balance}</td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
              </div>
            </GlassCard>
         </div>
      )}

      {/* --- MODAL: Supplier History --- */}
      {viewingSupplierHistory && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <GlassCard className="w-full max-w-3xl bg-[#0F172A] border border-slate-700 shadow-2xl h-[80vh] flex flex-col">
              <div className="flex flex-col h-full">
               <div className="flex-shrink-0 p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Truck size={24} className="text-primary"/> Supplier History
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{viewingSupplierHistory.name} • {viewingSupplierHistory.contactPerson}</p>
                  </div>
                  <button onClick={() => setViewingSupplierHistory(null)} className="text-slate-400 hover:text-white"><X size={20}/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6">
                   {supplierHistoryData.length === 0 ? (
                       <div className="text-center py-8 text-slate-400">
                           <Package size={48} className="mx-auto mb-4 opacity-50" />
                           <p>No restock history found for this supplier.</p>
                       </div>
                   ) : (
                       <table className="w-full text-left text-sm">
                           <thead className="bg-white/5 text-slate-400 uppercase text-xs">
                               <tr>
                                   <th className="p-3">Date</th>
                                   <th className="p-3">Item</th>
                                   <th className="p-3">Ref ID</th>
                                   <th className="p-3 text-right">Quantity</th>
                                   <th className="p-3 text-center">Invoice</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5 text-slate-300">
                               {supplierHistoryData.map((item, idx) => (
                                   <tr key={idx} className="hover:bg-white/5">
                                       <td className="p-3">{item.date}</td>
                                       <td className="p-3 font-medium text-white">{item.medicineName}</td>
                                       <td className="p-3 text-slate-400 font-mono text-xs">{item.reference}</td>
                                       <td className="p-3 text-right font-medium text-green-400">
                                           +{item.quantityChange}
                                       </td>
                                       <td className="p-3 text-center">
                                           {item.documentUrl ? (
                                               <button className="text-xs flex items-center justify-center gap-1 text-primary hover:text-blue-300 transition-colors mx-auto">
                                                   <FileText size={14} /> View
                                               </button>
                                           ) : (
                                               <span className="text-slate-600">-</span>
                                           )}
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   )}
               </div>
               <div className="flex-shrink-0 p-4 border-t border-white/10 bg-white/5 flex justify-end">
                   <button onClick={() => setViewingSupplierHistory(null)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg">Close</button>
               </div>
              </div>
            </GlassCard>
         </div>
      )}

      {/* --- MODAL: Inventory Add/Edit --- */}
      {showInventoryModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <GlassCard className="w-full max-w-2xl bg-[#0F172A] border border-slate-700 shadow-2xl h-[80vh] flex flex-col">
           <div className="flex flex-col h-full">
            <div className="flex-shrink-0 p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-white">{isEditing ? 'Edit Medicine' : 'Add New Medicine'}</h3>
              <button onClick={() => setShowInventoryModal(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {/* Pre-fill Section - Only shown when adding new */}
               {!isEditing && (
                   <div className="bg-primary/10 border border-primary/20 p-3 rounded-xl mb-2">
                       <label className="text-xs font-bold text-primary mb-1 block flex items-center gap-2">
                           <Copy size={12} /> Pre-fill from Existing Product (Add New Batch)
                       </label>
                       <select 
                           className="w-full bg-white/10 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary text-sm"
                           onChange={(e) => handlePrefillProduct(e.target.value)}
                           defaultValue=""
                       >
                           <option value="" disabled>Select a product to copy details...</option>
                           {uniqueProductNames.map(name => (
                               <option key={name} value={name}>{name}</option>
                           ))}
                       </select>
                       <p className="text-[10px] text-slate-400 mt-1">
                           Select a medicine to auto-fill generic details. You can then change the supplier or keep it the same, and add a new batch number.
                       </p>
                   </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-xs text-slate-400 mb-1 block">Medicine Name</label>
                        <input type="text" value={currentMedicine.name} onChange={e => setCurrentMedicine({...currentMedicine, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary" placeholder="e.g. Paracetamol 500mg" />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Medicine Schedule</label>
                        <select 
                        value={isCustomSchedule ? 'Other' : currentMedicine.schedule} 
                        onChange={e => {
                            const val = e.target.value;
                            if(val === 'Other') {
                                setIsCustomSchedule(true);
                                setCurrentMedicine({...currentMedicine, schedule: ''});
                            } else {
                                setIsCustomSchedule(false);
                                setCurrentMedicine({...currentMedicine, schedule: val});
                            }
                        }} 
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary"
                        >
                            <option value="">Select Schedule</option>
                            {schedules.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="Other" className="text-primary font-bold">+ Other (Add New)</option>
                        </select>
                        {isCustomSchedule && (
                            <div className="mt-2 animate-fade-in">
                            <input 
                                type="text" 
                                autoFocus
                                placeholder="[ Enter New Schedule ]" 
                                value={currentMedicine.schedule} 
                                onChange={e => setCurrentMedicine({...currentMedicine, schedule: e.target.value})}
                                className="w-full bg-primary/10 border border-primary/50 rounded-lg p-2 text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-primary"
                            />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Form / Type</label>
                        <select 
                            value={isCustomForm ? 'Other' : currentMedicine.form} 
                            onChange={e => {
                                const val = e.target.value;
                                if(val === 'Other') {
                                setIsCustomForm(true);
                                setCurrentMedicine({...currentMedicine, form: ''});
                                } else {
                                setIsCustomForm(false);
                                setCurrentMedicine({...currentMedicine, form: val});
                                }
                            }} 
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary"
                        >
                            <option value="">Select Form</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="Other" className="text-primary font-bold">+ Other (Add New)</option>
                        </select>
                        {isCustomForm && (
                            <div className="mt-2 animate-fade-in">
                            <input 
                                type="text" 
                                autoFocus
                                placeholder="[ Enter New Form ]" 
                                value={currentMedicine.form} 
                                onChange={e => setCurrentMedicine({...currentMedicine, form: e.target.value})}
                                className="w-full bg-primary/10 border border-primary/50 rounded-lg p-2 text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-primary"
                            />
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-xs text-slate-400 mb-1 block">Supplier</label>
                        <div className="flex gap-2">
                            <select value={currentMedicine.supplier} onChange={e => setCurrentMedicine({...currentMedicine, supplier: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary">
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </select>
                            <button onClick={handleAddNewSupplier} className="p-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg" title="Add New Supplier"><Plus size={20}/></button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Batch Number</label>
                        <input type="text" value={currentMedicine.batchNo} onChange={e => setCurrentMedicine({...currentMedicine, batchNo: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary" placeholder="e.g. B-12345" />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Expiry Date</label>
                        <input type="month" value={currentMedicine.expiryDate} onChange={e => setCurrentMedicine({...currentMedicine, expiryDate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary" />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Stock Quantity</label>
                        <input type="number" value={currentMedicine.stock} onChange={e => setCurrentMedicine({...currentMedicine, stock: parseInt(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary" />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Min Stock Level</label>
                        <input type="number" value={currentMedicine.minStockLevel} onChange={e => setCurrentMedicine({...currentMedicine, minStockLevel: parseInt(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary" />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Price (₹)</label>
                        <input type="number" value={currentMedicine.price} onChange={e => setCurrentMedicine({...currentMedicine, price: parseFloat(e.target.value) || 0})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary" placeholder="0.00" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-xs text-slate-400 mb-1 block">Storage Location</label>
                        <input type="text" value={currentMedicine.location} onChange={e => setCurrentMedicine({...currentMedicine, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary" placeholder="e.g. Rack A-1, Tray 3" />
                    </div>
                    
                    {/* Invoice Upload Section */}
                    <div className="md:col-span-2 border-t border-white/10 pt-4 mt-2">
                        <label className="text-xs text-slate-400 mb-2 block">Invoice Proof (Required for Audit)</label>
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:bg-white/5 transition-colors relative">
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                accept=".pdf,.jpg,.png"
                            />
                            <div className="flex flex-col items-center justify-center gap-2">
                                {invoiceFile ? (
                                    <>
                                        <FileText className="text-green-400" size={24} />
                                        <p className="text-sm text-white font-medium">{invoiceFile.name}</p>
                                        <p className="text-xs text-slate-400">{(invoiceFile.size / 1024).toFixed(2)} KB</p>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="text-primary" size={24} />
                                        <p className="text-sm text-slate-300 font-medium">Click to upload invoice or drag and drop</p>
                                        <p className="text-xs text-slate-500">PDF, JPG or PNG (Max 5MB)</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
               </div>
            </div>

            <div className="flex-shrink-0 p-6 pt-4 border-t border-white/10 mt-auto flex justify-end gap-3 bg-[#0F172A] z-10">
               <button onClick={() => setShowInventoryModal(false)} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg">Cancel</button>
               <button onClick={handleSaveMedicine} className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg flex items-center gap-2">
                 <Save size={18} /> Save Medicine
               </button>
            </div>
           </div>
          </GlassCard>
        </div>
      )}

      {/* --- MODAL: Add Supplier --- */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
           <GlassCard className="w-full max-w-lg bg-[#0F172A] border border-slate-700 shadow-2xl h-[80vh] flex flex-col">
            <div className="flex flex-col h-full">
              <div className="flex-shrink-0 p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                 <h3 className="text-xl font-bold text-white">Register New Supplier</h3>
                 <button onClick={() => setShowSupplierModal(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div>
                      <label className="text-xs text-slate-400 mb-1 block">Supplier Name</label>
                      <input type="text" value={currentSupplier.name} onChange={e => setCurrentSupplier({...currentSupplier, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary" />
                  </div>
                  <div>
                      <label className="text-xs text-slate-400 mb-1 block">Contact Person</label>
                      <input type="text" value={currentSupplier.contactPerson} onChange={e => setCurrentSupplier({...currentSupplier, contactPerson: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-xs text-slate-400 mb-1 block">Phone</label>
                          <input type="text" value={currentSupplier.phone} onChange={e => setCurrentSupplier({...currentSupplier, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary" />
                      </div>
                      <div>
                          <label className="text-xs text-slate-400 mb-1 block">Email</label>
                          <input type="email" value={currentSupplier.email} onChange={e => setCurrentSupplier({...currentSupplier, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary" />
                      </div>
                  </div>
                  <div>
                      <label className="text-xs text-slate-400 mb-1 block">Address</label>
                      <textarea value={currentSupplier.address} onChange={e => setCurrentSupplier({...currentSupplier, address: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary resize-none" rows={2} />
                  </div>
              </div>
              <div className="flex-shrink-0 p-6 pt-0 flex justify-end gap-3 pt-4">
                 <button onClick={() => setShowSupplierModal(false)} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg">Cancel</button>
                 <button onClick={handleSaveSupplier} className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg">Register Supplier</button>
              </div>
            </div>
           </GlassCard>
        </div>
      )}

      {/* --- MODAL: Add Category --- */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
           <GlassCard className="w-full max-w-md bg-[#0F172A] border border-slate-700 shadow-2xl flex flex-col">
              <div className="flex-shrink-0 p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                 <h3 className="text-xl font-bold text-white">Add New Category</h3>
                 <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div>
                      <label className="text-xs text-slate-400 mb-1 block">Category Name (Form)</label>
                      <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-primary" placeholder="e.g. Ointment" />
                      <p className="text-xs text-slate-500 mt-2">This will be added to the list of available dosage forms (Tablet, Syrup, etc.)</p>
                  </div>
              </div>
              <div className="flex-shrink-0 p-6 pt-0 flex justify-end gap-3 pt-4">
                 <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-slate-300 hover:bg-white/5 rounded-lg">Cancel</button>
                 <button onClick={handleSaveCategory} className="px-6 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg">Add Category</button>
              </div>
           </GlassCard>
        </div>
      )}


      {/* --- Header & Tabs --- */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Inventory Management</h2>
               <p className="text-slate-500 dark:text-slate-400 text-sm">Track stock, suppliers, and locations</p>
            </div>
            <div className="flex gap-3">
               <button 
                  onClick={handleAddNewMedicine}
                  className="px-4 py-2 bg-primary hover:bg-blue-500 rounded-xl text-white font-medium flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
               >
                  <Plus size={18} /> Add New Stock
               </button>
            </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl w-full max-w-md">
            <button 
                onClick={() => setActiveTab('inventory')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'inventory' ? 'bg-white dark:bg-slate-800 shadow text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <Package size={16} /> Inventory
            </button>
            <button 
                onClick={() => setActiveTab('suppliers')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'suppliers' ? 'bg-white dark:bg-slate-800 shadow text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <Truck size={16} /> Suppliers
            </button>
            <button 
                onClick={() => setActiveTab('categories')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'categories' ? 'bg-white dark:bg-slate-800 shadow text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <Layers size={16} /> Categories
            </button>
        </div>
      </div>

      {activeTab === 'inventory' && (
        <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Items" 
                    value={stats.totalItems.toString()} 
                    change="+5.2%" 
                    isPositive={true} 
                    icon={<Package size={24} />} 
                />
                <StatCard 
                    title="Total Value" 
                    value={`₹${stats.totalValue.toLocaleString()}`} 
                    change="+12%" 
                    isPositive={true} 
                    icon={<IndianRupee size={24} />} 
                />
                <StatCard 
                    title="Low Stock" 
                    value={stats.lowStock.toString()} 
                    change="+2 items" 
                    isPositive={false} 
                    icon={<AlertTriangle size={24} />} 
                />
                <StatCard 
                    title="Out of Stock" 
                    value={stats.outOfStock.toString()} 
                    change="0%" 
                    isPositive={true} 
                    icon={<Activity size={24} />} 
                />
            </div>

            {/* Filter Toolbar */}
            <GlassCard className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                    type="text" 
                    placeholder="Search by medicine, supplier, batch..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2 text-slate-800 dark:text-white outline-none focus:border-primary"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-white outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                    >
                    <option value="all">All Items</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                    </select>
                </div>
            </GlassCard>

            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-300 text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-4 font-medium">Medicine Details</th>
                        <th className="p-4 font-medium">Location</th>
                        <th className="p-4 font-medium">Batch Info</th>
                        <th className="p-4 font-medium text-center">Stock Level</th>
                        <th className="p-4 font-medium text-right">Price</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                    {filteredMedicines.map((item) => (
                        <tr 
                          key={item.id} 
                          onClick={() => handleViewHistory(item)}
                          className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                        >
                        <td className="p-4">
                            <p className="text-slate-800 dark:text-white font-medium">{item.name}</p>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                    {item.schedule}
                                </span>
                                {item.form && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">
                                        {item.form}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supplier: {item.supplier}</p>
                        </td>
                        <td className="p-4">
                             <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                                <MapPin size={14} className="text-slate-400" />
                                {item.location || 'N/A'}
                             </div>
                        </td>
                        <td className="p-4">
                            <div className="text-sm text-slate-600 dark:text-slate-300 font-mono">{item.batchNo}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                <Calendar size={12} /> Exp: {item.expiryDate}
                            </div>
                        </td>
                        <td className="p-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                                <span className={`text-sm font-bold ${
                                    item.stock === 0 ? 'text-red-500' : 
                                    item.stock <= item.minStockLevel ? 'text-orange-500' : 
                                    'text-slate-800 dark:text-white'
                                }`}>
                                    {item.stock} units
                                </span>
                                {item.stock <= item.minStockLevel && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                        item.stock === 0 
                                        ? 'border-red-500/30 text-red-500 bg-red-500/10'
                                        : 'border-orange-500/30 text-orange-500 bg-orange-500/10'
                                    }`}>
                                        {item.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="p-4 text-right text-slate-800 dark:text-white font-mono font-medium">₹{item.price.toFixed(2)}</td>
                        <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button 
                                onClick={() => handleEditMedicine(item)}
                                className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button 
                                onClick={() => handleDeleteMedicine(item.id)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    {filteredMedicines.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-12 text-center text-slate-400">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-full">
                                        <Search size={24} className="opacity-50" />
                                    </div>
                                    <p>No medicines found matching your criteria.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </GlassCard>
        </>
      )}

      {activeTab === 'suppliers' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supplierStats.map((sup, idx) => (
                <GlassCard key={idx} className="p-6 relative group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
                           <Truck size={24} />
                        </div>
                        <span className="text-xs bg-indigo-500/10 text-indigo-500 px-2 py-1 rounded-full">{sup.itemCount} Items</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{sup.name}</h3>
                    <div className="space-y-2 mt-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <User size={14} /> {sup.contactPerson}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Phone size={14} /> {sup.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Mail size={14} /> {sup.email}
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Inventory Value</span>
                        <span className="font-bold text-slate-800 dark:text-white">₹{sup.totalValue.toLocaleString()}</span>
                    </div>
                    <button 
                        onClick={() => handleViewSupplierHistory(sup)}
                        className="w-full mt-4 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                    >
                        <History size={16} /> View Stock History
                    </button>
                </GlassCard>
            ))}
            <button 
                onClick={handleAddNewSupplier}
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-400 hover:text-primary min-h-[300px]"
            >
                <Plus size={32} className="mb-2" />
                <span className="font-medium">Register New Supplier</span>
            </button>
         </div>
      )}

      {activeTab === 'categories' && (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryStats.map((cat, idx) => (
                <GlassCard key={idx} className="p-5 hover:border-primary/50 cursor-pointer group transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 group-hover:scale-110 transition-transform">
                            <Box size={20} />
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                             {cat.count} Items
                        </span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">{cat.name}</h3>
                </GlassCard>
            ))}
             <button 
                onClick={handleAddNewCategory}
                className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-400 hover:text-primary min-h-[120px]"
            >
                <Plus size={24} className="mb-2" />
                <span className="font-medium text-sm">Add Category</span>
            </button>
         </div>
      )}
    </div>
  );
};