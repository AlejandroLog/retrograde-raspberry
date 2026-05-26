import { useState } from 'react';
import type { UserDto } from '../types/dtos';
import AdminSummary from './AdminSummary';
import AdminUsers from './AdminUsers';
import AdminInventory from './AdminInventory';
import AdminFormats from './AdminFormats';
import AdminGenres from './AdminGenres';
import AdminMerch from './AdminMerch';
import AdminOrders from './AdminOrders';

type AdminView = 'resumen' | 'usuarios' | 'inventario' | 'formatos' | 'generos' | 'merch' | 'ordenes';

export default function AdminDashboard({ currentUser }: { currentUser: UserDto }) {
  const [currentView, setCurrentView] = useState<AdminView>('resumen');

  const getNavClass = (viewName: AdminView) => {
    const base = "px-4 py-2.5 font-semibold text-sm rounded-lg transition-all duration-300 cursor-pointer whitespace-nowrap ";
    const active = "bg-white/[0.1] text-white shadow-lg shadow-violet-500/10 border border-white/10";
    const inactive = "text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent";
    return base + (currentView === viewName ? active : inactive);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'resumen': return <AdminSummary />;
      case 'usuarios': return <AdminUsers />;
      case 'inventario': return <AdminInventory />;
      case 'formatos': return <AdminFormats />;
      case 'generos': return <AdminGenres />;
      case 'merch': return <AdminMerch />;
      case 'ordenes': return <AdminOrders />;
      default: return null;
    }
  };

  return (
    <div className="pb-12" style={{animation: 'fadeIn 0.4s ease-out'}}>
      <div className="border-b border-white/[0.06] mb-8 sticky top-[68px] bg-[#0a0a0f]/90 backdrop-blur-xl z-40">
        <div className="max-w-6xl mx-auto flex overflow-x-auto gap-1 px-4 py-3 hide-scrollbar">
          <button onClick={() => setCurrentView('resumen')} className={getNavClass('resumen')}>Resumen</button>
          <button onClick={() => setCurrentView('usuarios')} className={getNavClass('usuarios')}>Usuarios</button>
          <button onClick={() => setCurrentView('inventario')} className={getNavClass('inventario')}>Inventario Mto.</button>
          <button onClick={() => setCurrentView('formatos')} className={getNavClass('formatos')}>Formatos</button>
          <button onClick={() => setCurrentView('generos')} className={getNavClass('generos')}>Géneros</button>
          <button onClick={() => setCurrentView('merch')} className={getNavClass('merch')}>Aprobación Merch</button>
          <button onClick={() => setCurrentView('ordenes')} className={getNavClass('ordenes')}>Gestión Órdenes</button>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4">
        {renderContent()}
      </div>
    </div>
  );
}