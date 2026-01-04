import React, { useState, useMemo } from 'react';
import { UserPlus, Search, Phone, Calendar, IndianRupee, MoreVertical, Mail, MapPin, ArrowLeft, Clock, FileText, CheckCircle, AlertCircle, X, Save, Plus, Trash2, Star } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { MOCK_CUSTOMERS, getMockPurchaseHistory, getMockInvoiceDetails } from '../constants';
import { Customer, PurchaseHistoryItem, InvoiceDetails } from '../types';

export const Customers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Customer | null>(null);

  // Add Customer State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phones: [''],
    email: '',
    address: '',
    outstandingBalance: 0
  });

  // Invoice View State
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceDetails | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.phones.some(p => p.includes(searchTerm))
    );
  }, [customers, searchTerm]);

  // --- Edit Customer Handlers ---

  const handleEditClick = () => {
    if (selectedCustomer) {
      setEditForm({ ...selectedCustomer });
      setIsEditing(true);
    }
  };

  const handleSaveCustomer = () => {
    if (editForm && selectedCustomer) {
      const updatedCustomers = customers.map(c => c.id === editForm.id ? editForm : c);
      setCustomers(updatedCustomers);
      setSelectedCustomer(editForm);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const handlePhoneChange = (index: number, value: string) => {
    if (editForm) {
      const newPhones = [...editForm.phones];
      newPhones[index] = value;
      setEditForm({ ...editForm, phones: newPhones });
    }
  };

  const addPhone = () => {
    if (editForm) {
      setEditForm({ ...editForm, phones: [...editForm.phones, ''] });
    }
  };

  const removePhone = (index: number) => {
    if (editForm && editForm.phones.length > 1) {
      const newPhones = editForm.phones.filter((_, i) => i !== index);
      setEditForm({ ...editForm, phones: newPhones });
    }
  };

  const setPrimaryPhoneEdit = (index: number) => {
    if (editForm && index > 0) {
      const newPhones = [...editForm.phones];
      const [selected] = newPhones.splice(index, 1);
      newPhones.unshift(selected);
      setEditForm({ ...editForm, phones: newPhones });
    }
  };

  // --- Add Customer Handlers ---

  const handleAddCustomerClick = () => {
    setNewCustomer({
        name: '',
        phones: [''],
        email: '',
        address: '',
        outstandingBalance: 0
    });
    setShowAddModal(true);
  };

  const handleNewPhoneChange = (index: number, value: string) => {
    const updatedPhones = [...newCustomer.phones];
    updatedPhones[index] = value;
    setNewCustomer(prev => ({ ...prev, phones: updatedPhones }));
  };

  const handleAddNewPhone = () => {
    setNewCustomer(prev => ({ ...prev, phones: [...prev.phones, ''] }));
  };

  const handleRemoveNewPhone = (index: number) => {
    setNewCustomer(prev => ({
      ...prev,
      phones: prev.phones.filter((_, i) => i !== index)
    }));
  };

  const setPrimaryPhoneNew = (index: number) => {
    if (index === 0) return;
    const phones = [...newCustomer.phones];
    const [selected] = phones.splice(index, 1);
    phones.unshift(selected);
    setNewCustomer(prev => ({ ...prev, phones }));
  };

  const handleSaveNewCustomer = () => {
     if (!newCustomer.name.trim()) {
        // Basic validation
        return;
     }

     const newId = (customers.length + 1).toString();
     const customerToAdd: Customer = {
        id: newId,
        name: newCustomer.name,
        phones: newCustomer.phones.filter(p => p.trim() !== ''),
        email: newCustomer.email,
        address: newCustomer.address,
        outstandingBalance: newCustomer.outstandingBalance,
        totalSpent: 0,
        lastVisit: 'N/A'
     };

     setCustomers([customerToAdd, ...customers]);
     setShowAddModal(false);
  };


  const handleViewBill = (invoiceId: string) => {
    if (selectedCustomer) {
        const details = getMockInvoiceDetails(invoiceId, selectedCustomer.name);
        setViewingInvoice(details);
    }
  };

  // If a customer is selected, render the detail view
  if (selectedCustomer) {
    const purchaseHistory = getMockPurchaseHistory(selectedCustomer.id);
    
    return (
      <div className="space-y-6 animate-fade-in relative">
        {/* Invoice Modal Overlay */}
        {viewingInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <GlassCard className="w-full max-w-2xl bg-[#0F172A] border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div>
                  <h3 className="text-xl font-bold text-white">Invoice Details</h3>
                  <p className="text-sm text-slate-400">ID: {viewingInvoice.id} • {viewingInvoice.date}</p>
                </div>
                <button 
                  onClick={() => setViewingInvoice(null)}
                  className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="flex justify-between mb-6 text-sm">
                   <div>
                      <p className="text-slate-400">Billed To:</p>
                      <p className="font-bold text-white text-lg">{viewingInvoice.customerName}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-slate-400">Status:</p>
                      <span className="inline-block px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold mt-1">PAID</span>
                   </div>
                </div>

                <table className="w-full text-left text-sm mb-6">
                  <thead className="bg-white/5 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="p-3">Item</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {viewingInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3">{item.name}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">₹{item.price.toFixed(2)}</td>
                        <td className="p-3 text-right">₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>₹{viewingInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax (18%)</span>
                    <span>₹{viewingInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10 mt-2">
                    <span>Total Amount</span>
                    <span>₹{viewingInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
                  <button 
                    onClick={() => setViewingInvoice(null)}
                    className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Close
                  </button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setSelectedCustomer(null);
              setIsEditing(false);
            }}
            className="p-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Customer Profile</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
               {isEditing ? 'Editing Profile' : `View details and history for ${selectedCustomer.name}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <GlassCard className="p-6 lg:col-span-1 h-fit">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-3xl shadow-xl mb-4">
                {selectedCustomer.name.charAt(0)}
              </div>
              {!isEditing && (
                 <>
                   <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedCustomer.name}</h3>
                   <span className="text-sm text-primary bg-primary/10 px-3 py-1 rounded-full mt-2">Customer #{selectedCustomer.id}</span>
                 </>
              )}
            </div>

            <div className="space-y-4">
              {isEditing && editForm ? (
                <>
                   <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Full Name</label>
                      <input 
                        type="text" 
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-2 text-slate-800 dark:text-white outline-none focus:border-primary" 
                      />
                   </div>
                   
                   <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-slate-500 dark:text-slate-400 block">Phone Numbers</label>
                        <button onClick={addPhone} type="button" className="text-primary text-xs flex items-center gap-1 hover:underline">
                          <Plus size={12} /> Add
                        </button>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                        {editForm.phones.map((phone, idx) => (
                           <div key={idx} className="flex gap-2 items-center">
                              <div className="relative flex-1">
                                <input 
                                  type="text" 
                                  value={phone}
                                  onChange={(e) => handlePhoneChange(idx, e.target.value)}
                                  placeholder={idx === 0 ? "Primary Phone" : "Secondary Phone"}
                                  className={`w-full bg-slate-100 dark:bg-white/5 border ${idx === 0 ? 'border-primary/50' : 'border-slate-300 dark:border-white/10'} rounded-lg p-2 pl-8 text-slate-800 dark:text-white outline-none focus:border-primary`} 
                                />
                                <div className="absolute left-2.5 top-2.5">
                                   <Star size={14} className={idx === 0 ? "text-primary fill-primary" : "text-slate-400"} />
                                </div>
                              </div>
                              
                              {idx !== 0 && (
                                <button 
                                  onClick={() => setPrimaryPhoneEdit(idx)}
                                  title="Set as Primary"
                                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                  <Star size={16} />
                                </button>
                              )}

                              {editForm.phones.length > 1 && (
                                <button 
                                  onClick={() => removePhone(idx)}
                                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                           </div>
                        ))}
                      </div>
                   </div>

                   <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Email</label>
                      <input 
                        type="email" 
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-2 text-slate-800 dark:text-white outline-none focus:border-primary" 
                      />
                   </div>

                   <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Address</label>
                      <textarea 
                        value={editForm.address}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        rows={2}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-2 text-slate-800 dark:text-white outline-none focus:border-primary resize-none" 
                      />
                   </div>

                   <div className="flex gap-2 pt-2">
                      <button onClick={handleSaveCustomer} className="flex-1 bg-primary hover:bg-blue-600 text-white py-2 rounded-lg font-medium flex items-center justify-center gap-2">
                        <Save size={16} /> Save
                      </button>
                      <button onClick={handleCancelEdit} className="flex-1 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white py-2 rounded-lg font-medium">
                        Cancel
                      </button>
                   </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                     {selectedCustomer.phones.map((phone, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-white/5">
                          <Phone className={`mt-0.5 ${idx === 0 ? 'text-primary' : 'text-slate-400'}`} size={18} />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                {idx === 0 ? (
                                    <>
                                        Primary Phone 
                                        <Star size={10} className="fill-primary text-primary"/>
                                    </>
                                ) : 'Secondary Phone'}
                            </p>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">{phone}</p>
                          </div>
                        </div>
                     ))}
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-white/5">
                    <Mail className="text-slate-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Email Address</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{selectedCustomer.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-white/5">
                    <MapPin className="text-slate-400 mt-0.5" size={18} />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Address</p>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{selectedCustomer.address || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleEditClick}
                    className="w-full py-2 mt-4 border border-primary/50 text-primary hover:bg-primary/10 rounded-xl transition-all text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </GlassCard>

          {/* Right Column: Stats & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <GlassCard className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                      <IndianRupee size={20} />
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Spent</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">₹{selectedCustomer.totalSpent.toLocaleString()}</p>
               </GlassCard>
               
               <GlassCard className="p-4 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${selectedCustomer.outstandingBalance > 0 ? 'from-red-500/20' : 'from-green-500/20'} rounded-bl-full -mr-4 -mt-4`} />
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${selectedCustomer.outstandingBalance > 0 ? 'bg-red-500/10 text-red-500' : 'bg-slate-500/10 text-slate-500'}`}>
                      <AlertCircle size={20} />
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Outstanding</span>
                  </div>
                  <p className={`text-xl font-bold ${selectedCustomer.outstandingBalance > 0 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                    ₹{selectedCustomer.outstandingBalance.toLocaleString()}
                  </p>
               </GlassCard>

               <GlassCard className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                      <Clock size={20} />
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Last Visit</span>
                  </div>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">{selectedCustomer.lastVisit}</p>
               </GlassCard>
            </div>

            {/* Purchase History */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <FileText size={20} className="text-primary" /> Purchase History
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-3 font-medium">Invoice ID</th>
                      <th className="p-3 font-medium">Date</th>
                      <th className="p-3 font-medium text-center">Items</th>
                      <th className="p-3 font-medium text-right">Amount</th>
                      <th className="p-3 font-medium text-right">Status</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                    {purchaseHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3 text-sm font-medium text-primary">{item.id}</td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-300">{item.date}</td>
                        <td className="p-3 text-sm text-center text-slate-600 dark:text-slate-300">{item.itemsCount}</td>
                        <td className="p-3 text-sm text-right font-mono font-medium text-slate-800 dark:text-white">₹{item.totalAmount.toFixed(2)}</td>
                        <td className="p-3 text-right">
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            item.status === 'Paid' 
                              ? 'border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10'
                              : item.status === 'Pending'
                                ? 'border-yellow-500/30 text-yellow-600 dark:text-yellow-400 bg-yellow-500/10'
                                : 'border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleViewBill(item.id)}
                            className="text-xs text-primary hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  // Default List View
  return (
    <div className="space-y-6 animate-fade-in relative">
        {/* Add Customer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
             <GlassCard className="w-full max-w-lg bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
                   <h3 className="text-xl font-bold text-slate-800 dark:text-white">Add New Customer</h3>
                   <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-800 dark:hover:text-white"><X size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                   {/* Name */}
                   <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Full Name *</label>
                      <input 
                        type="text"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-2 text-slate-800 dark:text-white outline-none focus:border-primary"
                        placeholder="e.g. John Doe"
                      />
                   </div>
                   
                   {/* Phones */}
                   <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Phone Numbers</label>
                      <div className="space-y-2">
                        {newCustomer.phones.map((phone, idx) => (
                           <div key={idx} className="flex gap-2 items-center">
                              <div className="flex-1 relative">
                                <input 
                                  type="text" 
                                  value={phone}
                                  onChange={(e) => handleNewPhoneChange(idx, e.target.value)}
                                  placeholder={idx === 0 ? "Primary Phone" : "Secondary Phone"}
                                  className={`w-full bg-slate-100 dark:bg-white/5 border ${idx === 0 ? 'border-primary/50' : 'border-slate-300 dark:border-white/10'} rounded-lg p-2 pl-8 text-slate-800 dark:text-white outline-none focus:border-primary`} 
                                />
                                <div className="absolute left-2.5 top-2.5">
                                   <Star size={14} className={idx === 0 ? "text-primary fill-primary" : "text-slate-400"} />
                                </div>
                              </div>
                              
                              {idx !== 0 && (
                                <button 
                                  onClick={() => setPrimaryPhoneNew(idx)}
                                  title="Set as Primary"
                                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                >
                                  <Star size={16} />
                                </button>
                              )}

                              {newCustomer.phones.length > 1 && (
                                <button 
                                  onClick={() => handleRemoveNewPhone(idx)}
                                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
                      <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Email Address</label>
                      <input 
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-2 text-slate-800 dark:text-white outline-none focus:border-primary"
                        placeholder="e.g. john@example.com"
                      />
                   </div>

                   {/* Address */}
                   <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Address</label>
                      <textarea 
                        value={newCustomer.address}
                        onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                        className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-2 text-slate-800 dark:text-white outline-none focus:border-primary resize-none"
                        rows={2}
                        placeholder="e.g. 123 Main St"
                      />
                   </div>

                   {/* Opening Balance */}
                   <div>
                      <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Initial Outstanding Balance</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                        <input 
                          type="number"
                          value={newCustomer.outstandingBalance}
                          onChange={(e) => setNewCustomer({...newCustomer, outstandingBalance: parseFloat(e.target.value) || 0})}
                          className="w-full bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg p-2 pl-7 text-slate-800 dark:text-white outline-none focus:border-primary"
                          placeholder="0.00"
                        />
                      </div>
                   </div>
                </div>
                <div className="p-6 pt-0 flex gap-3">
                   <button onClick={handleSaveNewCustomer} className="flex-1 bg-primary hover:bg-blue-600 text-white py-2 rounded-lg font-medium">Create Customer</button>
                </div>
             </GlassCard>
          </div>
        )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Customer Management</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage patient profiles and history</p>
        </div>
        <button 
          onClick={handleAddCustomerClick}
          className="px-4 py-2 bg-primary hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center gap-2 font-medium"
        >
          <UserPlus size={18} />
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats */}
        <GlassCard className="p-6 flex items-center justify-between">
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Total Customers</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{customers.length}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                <UserPlus size={24} />
            </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center justify-between">
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Active This Month</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">142</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-full text-green-500">
                <Calendar size={24} />
            </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center justify-between lg:col-span-2">
           <div className="flex items-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 w-full focus-within:border-primary transition-colors">
              <Search className="text-slate-400 mr-3" size={20} />
              <input 
                type="text"
                placeholder="Search by name or phone number..."
                className="bg-transparent border-none outline-none text-slate-800 dark:text-white w-full placeholder-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </GlassCard>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-medium">Customer Name</th>
                <th className="p-4 font-medium">Phone Number</th>
                <th className="p-4 font-medium">Last Visit</th>
                <th className="p-4 font-medium text-right">Total Spent</th>
                <th className="p-4 font-medium text-center">Balance</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  onClick={() => setSelectedCustomer(customer)}
                  className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-slate-800 dark:text-white font-medium group-hover:text-primary transition-colors">{customer.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                             ID: #{customer.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        {customer.phones[0]}
                        {customer.phones.length > 1 && (
                            <span className="text-xs text-slate-400 bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded-full">+{customer.phones.length - 1}</span>
                        )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                     <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {customer.lastVisit}
                     </div>
                  </td>
                  <td className="p-4 text-right font-mono font-medium text-slate-800 dark:text-white">
                    ₹{customer.totalSpent.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    {customer.outstandingBalance > 0 ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                        ₹{customer.outstandingBalance}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                        Settled
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                  <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                          No customers found matching "{searchTerm}"
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};