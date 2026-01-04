import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Printer, Search, CreditCard, User } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Medicine, InvoiceItem } from '../types';
import { MOCK_MEDICINES } from '../constants';

export const Billing: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Filter medicines based on search
  const filteredMedicines = useMemo(() => {
    if (!searchTerm) return [];
    return MOCK_MEDICINES.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const addToCart = (medicine: Medicine) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      if (existing) {
        return prev.map(item => 
          item.id === medicine.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, { ...medicine, quantity: 1, discount: 0, total: medicine.price }];
    });
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, newQty: number) => {
    if (newQty < 1) return;
    setCart(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: newQty, total: newQty * item.price }
        : item
    ));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.18; // 18% GST Mock
  const total = subtotal + tax;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Column: Item Selection */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <GlassCard className="p-6 flex-1 overflow-hidden flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <CreditCard className="text-secondary" /> New Invoice
          </h2>
          
          {/* Search Box */}
          <div className="relative mb-6 z-20">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-3 focus-within:border-primary focus-within:bg-white/10 transition-all">
              <Search className="text-slate-400 mr-3" size={20} />
              <input 
                type="text"
                placeholder="Search medicine by name or batch no..."
                className="bg-transparent border-none outline-none text-white w-full placeholder-slate-500"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
            </div>
            
            {/* Autocomplete Dropdown */}
            {showSuggestions && searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50">
                {filteredMedicines.length > 0 ? (
                  filteredMedicines.map(medicine => (
                    <div 
                      key={medicine.id}
                      className="p-3 hover:bg-white/5 cursor-pointer flex justify-between items-center border-b border-white/5 last:border-0"
                      onClick={() => addToCart(medicine)}
                    >
                      <div>
                        <p className="text-white font-medium">{medicine.name}</p>
                        <p className="text-xs text-slate-400">Batch: {medicine.batchNo} • Stock: {medicine.stock}</p>
                      </div>
                      <span className="text-secondary font-bold">${medicine.price}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400">No medicines found</div>
                )}
              </div>
            )}
          </div>

          {/* Cart Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#0F172A]/80 backdrop-blur-sm z-10 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="pb-3">Medicine</th>
                  <th className="pb-3 text-center">Batch</th>
                  <th className="pb-3 text-center">Price</th>
                  <th className="pb-3 text-center">Qty</th>
                  <th className="pb-3 text-right">Total</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="text-white text-sm">
                {cart.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      Cart is empty. Search to add items.
                    </td>
                  </tr>
                ) : (
                  cart.map(item => (
                    <tr key={item.id} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                      <td className="py-4 font-medium">{item.name}</td>
                      <td className="py-4 text-center text-slate-400">{item.batchNo}</td>
                      <td className="py-4 text-center">${item.price}</td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          > - </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button 
                            className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          > + </button>
                        </div>
                      </td>
                      <td className="py-4 text-right font-mono">${item.total.toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <button 
                          className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded-lg"
                          onClick={() => removeFromCart(item.id)}
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
        </GlassCard>
      </div>

      {/* Right Column: Customer & Totals */}
      <div className="flex flex-col gap-6">
        <GlassCard className="p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <User size={20} className="text-primary" /> Patient Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Patient Name</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-primary" placeholder="Enter Name" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Phone Number</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-primary" placeholder="Enter Phone" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Doctor Name</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-primary" placeholder="Referral Doctor" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Payment Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>GST (18%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between text-xl font-bold text-white">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-3">
             <button className="col-span-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <Printer size={18} /> Print
             </button>
             <button className="col-span-1 bg-primary hover:bg-blue-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
                Pay Now
             </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};