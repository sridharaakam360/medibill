import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Billing } from './components/Billing';
import { Inventory } from './components/Inventory';
import { Customers } from './components/Customers';
import { ViewState } from './types';
import { GlassCard } from './components/GlassCard';
import { ThemeProvider } from './components/ThemeContext';

// Placeholder components for views not fully implemented in this demo
const PlaceholderView: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <GlassCard className="p-12 max-w-md">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{title}</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">This module is currently under development. Please check back later.</p>
      <button className="px-6 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
        Return to Dashboard
      </button>
    </GlassCard>
  </div>
);

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard onNavigate={setCurrentView} />;
      case ViewState.BILLING:
        return <Billing />;
      case ViewState.INVENTORY:
        return <Inventory />;
      case ViewState.CUSTOMERS:
        return <Customers />;
      case ViewState.REPORTS:
        return <PlaceholderView title="Reports & Analytics" />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
       <div className="min-h-screen text-slate-800 dark:text-white bg-slate-50 dark:bg-[#0F172A] transition-colors duration-300
         bg-[radial-gradient(at_0%_0%,_rgba(79,157,222,0.1)_0px,_transparent_50%),_radial-gradient(at_100%_0%,_rgba(123,224,173,0.1)_0px,_transparent_50%)]
         dark:bg-[radial-gradient(at_0%_0%,_rgba(79,157,222,0.15)_0px,_transparent_50%),_radial-gradient(at_100%_0%,_rgba(123,224,173,0.15)_0px,_transparent_50%),_radial-gradient(at_100%_100%,_rgba(167,139,250,0.15)_0px,_transparent_50%)]
         bg-fixed">
        <AppContent />
      </div>
    </ThemeProvider>
  );
};

export default App;