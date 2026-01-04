import React from 'react';
import { Package, Filter, MoreVertical, AlertTriangle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { MOCK_MEDICINES } from '../constants';

export const Inventory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-colors">
            <Filter size={16} /> Filters
          </button>
          <button className="px-4 py-2 bg-primary hover:bg-blue-500 rounded-lg text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
            <Package size={16} /> Add New Stock
          </button>
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-300 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-medium">Medicine Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Batch No</th>
                <th className="p-4 font-medium text-center">Stock</th>
                <th className="p-4 font-medium text-center">Expiry</th>
                <th className="p-4 font-medium text-right">Price</th>
                <th className="p-4 font-medium text-right">Status</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_MEDICINES.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-white font-medium">{item.name}</td>
                  <td className="p-4 text-slate-400 text-sm">{item.category}</td>
                  <td className="p-4 text-slate-400 font-mono text-sm">{item.batchNo}</td>
                  <td className="p-4 text-center text-white">
                    {item.stock < 100 ? (
                      <span className="flex items-center justify-center gap-1 text-red-400 font-bold">
                        <AlertTriangle size={14} /> {item.stock}
                      </span>
                    ) : (
                      item.stock
                    )}
                  </td>
                  <td className="p-4 text-center text-slate-400 text-sm">{item.expiryDate}</td>
                  <td className="p-4 text-right text-white font-mono">${item.price.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <span className={`text-xs px-2 py-1 rounded-full border ${
                      item.stock < 100 
                        ? 'border-red-500/30 text-red-400 bg-red-500/10' 
                        : 'border-green-500/30 text-green-400 bg-green-500/10'
                    }`}>
                      {item.stock < 100 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};