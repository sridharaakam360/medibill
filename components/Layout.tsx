import React from 'react';
import { LayoutDashboard, Receipt, Package, Users, PieChart, Settings, LogOut, Bell, Menu } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  children: React.ReactNode;
}

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void 
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
      ${active 
        ? 'bg-primary/20 text-white shadow-lg shadow-primary/10 border border-primary/20' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'}
    `}
  >
    {icon}
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentView, onViewChange, children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-[#0F172A]/50 backdrop-blur-xl border-r border-white/5">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              MediGlass
            </h1>
          </div>
          
          <nav className="space-y-2">
            <NavItem 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
              active={currentView === ViewState.DASHBOARD} 
              onClick={() => onViewChange(ViewState.DASHBOARD)} 
            />
            <NavItem 
              icon={<Receipt size={20} />} 
              label="Billing" 
              active={currentView === ViewState.BILLING} 
              onClick={() => onViewChange(ViewState.BILLING)} 
            />
            <NavItem 
              icon={<Package size={20} />} 
              label="Inventory" 
              active={currentView === ViewState.INVENTORY} 
              onClick={() => onViewChange(ViewState.INVENTORY)} 
            />
            <NavItem 
              icon={<Users size={20} />} 
              label="Customers" 
              active={currentView === ViewState.CUSTOMERS} 
              onClick={() => onViewChange(ViewState.CUSTOMERS)} 
            />
            <NavItem 
              icon={<PieChart size={20} />} 
              label="Reports" 
              active={currentView === ViewState.REPORTS} 
              onClick={() => onViewChange(ViewState.REPORTS)} 
            />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
          <NavItem 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={false} 
            onClick={() => {}} 
          />
          <button className="mt-2 w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0F172A]/50 backdrop-blur-md sticky top-0 z-20">
          <div className="md:hidden">
            <button className="p-2 text-slate-400 hover:text-white">
              <Menu size={24} />
            </button>
          </div>
          <div className="hidden md:block text-slate-400 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-[#0F172A]" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">Dr. Alex Morgan</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 border-2 border-[#0F172A] shadow-md" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};