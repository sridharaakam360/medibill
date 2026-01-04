import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Billing } from './components/Billing';
import { Inventory } from './components/Inventory';
import { ViewState } from './types';
import { GlassCard } from './components/GlassCard';

// Placeholder components for views not fully implemented in this demo
const PlaceholderView: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <GlassCard className="p-12 max-w-md">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <p className="text-slate-400 mb-6">This module is currently under development. Please check back later.</p>
      <button className="px-6 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
        Return to Dashboard
      </button>
    </GlassCard>
  </div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard />;
      case ViewState.BILLING:
        return <Billing />;
      case ViewState.INVENTORY:
        return <Inventory />;
      case ViewState.CUSTOMERS:
        return <PlaceholderView title="Customer Management" />;
      case ViewState.REPORTS:
        return <PlaceholderView title="Reports & Analytics" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;