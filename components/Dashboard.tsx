import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, ShoppingBag, DollarSign, Activity, IndianRupee } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { StatCardProps } from '../types';
import { RECENT_SALES, CHART_DATA } from '../constants';

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon }) => (
  <GlassCard hoverEffect className="p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-blue-500/10 dark:bg-white/10 text-primary">
        {icon}
      </div>
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
        {change}
      </span>
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{value}</p>
  </GlassCard>
);

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="₹12,450" 
          change="+12.5%" 
          isPositive={true} 
          icon={<IndianRupee size={24} />} 
        />
        <StatCard 
          title="Total Orders" 
          value="452" 
          change="+8.2%" 
          isPositive={true} 
          icon={<ShoppingBag size={24} />} 
        />
        <StatCard 
          title="Low Stock Items" 
          value="12" 
          change="-2.4%" 
          isPositive={false} 
          icon={<AlertCircle size={24} />} 
        />
        <StatCard 
          title="Active Patients" 
          value="1,203" 
          change="+5.1%" 
          isPositive={true} 
          icon={<Activity size={24} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <GlassCard className="lg:col-span-2 p-6 min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Revenue Analytics</h2>
            <select className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-600 dark:text-slate-300 rounded-lg px-3 py-1 outline-none focus:border-primary">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CHART_DATA}>
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
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#E5E7EB' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4F9DDE" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Recent Transactions */}
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Recent Sales</h2>
            <button className="text-sm text-primary hover:text-blue-400 transition-colors">View All</button>
          </div>
          <div className="space-y-4">
            {RECENT_SALES.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <IndianRupee size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{sale.customerName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{sale.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">₹{sale.totalAmount.toFixed(2)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${sale.status === 'Completed' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'}`}>
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};