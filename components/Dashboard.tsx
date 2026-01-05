import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Users, Activity, IndianRupee, Package, Plus, ArrowRight, Clock, AlertTriangle, FileText, ChevronRight, Calendar } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { StatCardProps, ViewState } from '../types';
import { RECENT_SALES, CHART_DATA, MOCK_MEDICINES } from '../constants';

interface DashboardProps {
    onNavigate: (view: ViewState) => void;
}

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

const MOCK_TOP_SELLING = [
    { name: 'Paracetamol 500mg', sold: 1240, revenue: 31000 },
    { name: 'Amoxicillin 250mg', sold: 850, revenue: 72675 },
    { name: 'Cetirizine 10mg', sold: 620, revenue: 21700 },
    { name: 'Vitamin C 500mg', sold: 450, revenue: 54000 },
    { name: 'Volini Spray', sold: 210, revenue: 44100 },
];

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [activeAlertTab, setActiveAlertTab] = useState<'stock' | 'expiry'>('stock');

  // Low Stock Logic
  const lowStockItems = useMemo(() => {
    return MOCK_MEDICINES
        .filter(m => m.stock <= m.minStockLevel)
        .sort((a,b) => a.stock - b.stock); // Critical items first
  }, []);

  // Expiry Logic (Items expiring within 6 months)
  const expiringItems = useMemo(() => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(today.getMonth() + 6);

    return MOCK_MEDICINES
        .filter(m => {
            const exp = new Date(m.expiryDate);
            return exp <= futureDate;
        })
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, []);

  // Pending Bills Logic
  const pendingBills = useMemo(() => {
    return RECENT_SALES.filter(s => s.status === 'Pending');
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
        {/* --- Header Stats --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                title="Total Revenue" 
                value="₹42,450" 
                change="+12.5%" 
                isPositive={true} 
                icon={<IndianRupee size={24} />} 
            />
            <StatCard 
                title="Transactions" 
                value="152" 
                change="+8.2%" 
                isPositive={true} 
                icon={<FileText size={24} />} 
            />
            <StatCard 
                title="Low Stock" 
                value={lowStockItems.length.toString()} 
                change="-2.4%" 
                isPositive={false} 
                icon={<AlertCircle size={24} />} 
            />
            <StatCard 
                title="Active Patients" 
                value="1,203" 
                change="+5.1%" 
                isPositive={true} 
                icon={<Users size={24} />} 
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* --- Main Chart Section (Left 2/3) --- */}
            <div className="lg:col-span-2 space-y-6">
                <GlassCard className="p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Revenue Analytics</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Monthly revenue performance</p>
                        </div>
                        <select className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-primary cursor-pointer transition-colors hover:bg-slate-200 dark:hover:bg-white/10">
                            <option>This Week</option>
                            <option>This Month</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    {/* Fixed Height Container for Chart - Solves 'Empty Chart' issue */}
                    <div className="w-full h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4F9DDE" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#4F9DDE" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                tickFormatter={(value) => `₹${value}`}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                                    border: '1px solid rgba(255,255,255,0.1)', 
                                    borderRadius: '12px',
                                    color: '#fff',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                }}
                                itemStyle={{ color: '#E5E7EB' }}
                                formatter={(value: number) => [`₹${value}`, 'Revenue']}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#4F9DDE" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorRevenue)" 
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Top Selling Products Table */}
                <GlassCard className="p-6 h-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                             <Activity size={20} className="text-secondary" /> Top Selling Medicines
                        </h2>
                        <button className="text-sm text-primary hover:text-blue-400 transition-colors flex items-center gap-1">
                            View Report <ArrowRight size={16} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                                <tr>
                                    <th className="pb-3 font-medium">Medicine Name</th>
                                    <th className="pb-3 font-medium text-center">Units Sold</th>
                                    <th className="pb-3 font-medium text-right">Revenue</th>
                                    <th className="pb-3 font-medium w-1/4 pl-4">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                {MOCK_TOP_SELLING.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="py-4 text-sm font-medium text-slate-800 dark:text-white">
                                            {item.name}
                                        </td>
                                        <td className="py-4 text-sm text-center text-slate-600 dark:text-slate-300">
                                            {item.sold}
                                        </td>
                                        <td className="py-4 text-sm text-right font-mono font-medium text-slate-800 dark:text-white">
                                            ₹{item.revenue.toLocaleString()}
                                        </td>
                                        <td className="py-4 pl-4">
                                            <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" 
                                                    style={{ width: `${(item.revenue / 75000) * 100}%` }} 
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>
            </div>

            {/* --- Right Column (Widgets) --- */}
            <div className="space-y-6 flex flex-col h-full">
                
                {/* Quick Actions */}
                <GlassCard className="p-6">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => onNavigate(ViewState.BILLING)}
                            className="p-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl flex flex-col items-center justify-center gap-2 text-primary transition-all group"
                        >
                            <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                                <Plus size={20} />
                            </div>
                            <span className="text-xs font-bold">New Bill</span>
                        </button>
                        <button 
                             onClick={() => onNavigate(ViewState.INVENTORY)}
                             className="p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl flex flex-col items-center justify-center gap-2 text-purple-500 transition-all group"
                        >
                            <div className="p-2 bg-purple-500 text-white rounded-lg shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                                <Package size={20} />
                            </div>
                            <span className="text-xs font-bold">Add Stock</span>
                        </button>
                        <button 
                             onClick={() => onNavigate(ViewState.CUSTOMERS)}
                             className="p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-xl flex flex-col items-center justify-center gap-2 text-green-500 transition-all group"
                        >
                            <div className="p-2 bg-green-500 text-white rounded-lg shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                                <Users size={20} />
                            </div>
                            <span className="text-xs font-bold">Add Patient</span>
                        </button>
                        <button 
                             onClick={() => onNavigate(ViewState.REPORTS)}
                             className="p-4 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-xl flex flex-col items-center justify-center gap-2 text-orange-500 transition-all group"
                        >
                            <div className="p-2 bg-orange-500 text-white rounded-lg shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                                <FileText size={20} />
                            </div>
                            <span className="text-xs font-bold">Reports</span>
                        </button>
                    </div>
                </GlassCard>

                {/* Inventory Alerts (Dual Value: Low Stock & Expiry) */}
                <GlassCard className="p-0 overflow-hidden h-auto flex flex-col">
                    <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-white/5">
                         <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                             <AlertTriangle size={20} className="text-red-500" /> Inventory Alerts
                         </h2>
                    </div>
                    
                    {/* Toggle/Stats Section */}
                    <div className="grid grid-cols-2 gap-3 p-4 pb-2">
                        <div 
                            onClick={() => setActiveAlertTab('stock')}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                activeAlertTab === 'stock' 
                                ? 'bg-red-500/10 border-red-500/20' 
                                : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                        >
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${activeAlertTab === 'stock' ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`}>Low Stock</span>
                                <div className="flex items-center gap-2">
                                    <AlertCircle size={20} className={activeAlertTab === 'stock' ? "text-red-500" : "text-slate-300"} />
                                    <span className={`text-2xl font-bold ${activeAlertTab === 'stock' ? "text-slate-800 dark:text-white" : "text-slate-400"}`}>
                                        {lowStockItems.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div 
                            onClick={() => setActiveAlertTab('expiry')}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                activeAlertTab === 'expiry' 
                                ? 'bg-orange-500/10 border-orange-500/20' 
                                : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                        >
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${activeAlertTab === 'expiry' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400'}`}>Expiring</span>
                                <div className="flex items-center gap-2">
                                    <Calendar size={20} className={activeAlertTab === 'expiry' ? "text-orange-500" : "text-slate-300"} />
                                    <span className={`text-2xl font-bold ${activeAlertTab === 'expiry' ? "text-slate-800 dark:text-white" : "text-slate-400"}`}>
                                        {expiringItems.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List Content */}
                    <div className="p-2">
                        {activeAlertTab === 'stock' ? (
                             // Low Stock List
                             lowStockItems.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">All stock levels healthy</div>
                             ) : (
                                lowStockItems.map(item => (
                                    <div key={item.id} onClick={() => onNavigate(ViewState.INVENTORY)} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg flex items-center justify-between group transition-colors cursor-pointer">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Batch: {item.batchNo}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${item.stock === 0 ? 'text-red-500' : 'text-red-400'}`}>
                                                {item.stock} Left
                                            </p>
                                            <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Restock</span>
                                        </div>
                                    </div>
                                ))
                             )
                        ) : (
                             // Expiry List
                             expiringItems.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">No upcoming expiries</div>
                             ) : (
                                expiringItems.map(item => (
                                    <div key={item.id} onClick={() => onNavigate(ViewState.INVENTORY)} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg flex items-center justify-between group transition-colors cursor-pointer">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Batch: {item.batchNo}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-orange-500">
                                                {item.expiryDate}
                                            </p>
                                            <span className="text-[10px] text-slate-400">Expiry</span>
                                        </div>
                                    </div>
                                ))
                             )
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-200 dark:border-white/10 text-center mt-auto">
                        <button onClick={() => onNavigate(ViewState.INVENTORY)} className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                            {activeAlertTab === 'stock' ? 'Manage Inventory' : 'View All Expiries'}
                        </button>
                    </div>
                </GlassCard>

                {/* Pending Invoices */}
                <GlassCard className="p-0 overflow-hidden h-auto">
                    <div className="p-5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                         <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                             <Clock size={20} className="text-yellow-500" /> Pending Bills
                         </h2>
                         {pendingBills.length > 0 && (
                            <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingBills.length}</span>
                         )}
                    </div>
                    <div className="p-2">
                        {pendingBills.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">No pending bills.</div>
                        ) : (
                            pendingBills.map(bill => (
                                <div key={bill.id} onClick={() => onNavigate(ViewState.BILLING)} className="p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg flex items-center justify-between group transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 flex items-center justify-center font-bold text-xs">
                                            {bill.customerName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{bill.customerName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{bill.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">₹{bill.totalAmount}</p>
                                        <span className="text-[10px] bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/20">
                                            Pending
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-3 border-t border-slate-200 dark:border-white/10 text-center mt-auto">
                        <button onClick={() => onNavigate(ViewState.BILLING)} className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                            View All Bills
                        </button>
                    </div>
                </GlassCard>

            </div>
        </div>
    </div>
  );
};