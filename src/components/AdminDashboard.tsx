import { useState } from 'react';
import type { UserDto } from '../types/dtos';
import AdminInventory from './AdminInventory';
import AdminFormats from './AdminFormats';
import AdminUsers from './AdminUsers';
import AdminSummary from './AdminSummary';
import AdminGenres from './AdminGenres';
import AdminMerch from './AdminMerch';
import AdminOrders from './AdminOrders'; // <--- Importamos el nuevo componente

// Agregamos 'orders' a las vistas posibles
type AdminView = 'dashboard' | 'inventory' | 'formats' | 'merch' | 'users' | 'genres' | 'orders';

export default function AdminDashboard({ currentUser }: { currentUser: UserDto }) {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  const handleNavClick = (view: AdminView) => setCurrentView(view);

  const renderContent = () => {
    switch (currentView) {
      case 'inventory':
        return <AdminInventory currentUser={currentUser} />;
      case 'formats':
        return <AdminFormats currentUser={currentUser} />;
      case 'merch':
        return <AdminMerch currentUser={currentUser} />;
      case 'users':
        return <AdminUsers currentUser={currentUser} />;
      case 'genres':
        return <AdminGenres currentUser={currentUser} />;
      case 'orders': 
        return <AdminOrders currentUser={currentUser} />;
      default:
        return <AdminSummary />;
    }
  };

  return (
    <div>
      <div className="bg-white border-b-4 border-black font-mono">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          {['dashboard', 'orders', 'inventory', 'formats', 'merch', 'users', 'genres'].map((view) => (
            <button
              key={view}
              onClick={() => handleNavClick(view as AdminView)}
              className={`px-4 py-3 font-black uppercase text-xs sm:text-sm border-r-4 border-black transition-colors cursor-pointer ${
                currentView === view ? 'bg-black text-white shadow-[inset_0px_-4px_0px_0px_rgba(255,255,255,1)]' : 'hover:bg-gray-200'
              }`}
            >
              {view === 'dashboard' ? 'Resumen' : 
               view === 'orders' ? 'Pedidos' : 
               view === 'inventory' ? 'Inventario' : 
               view === 'formats' ? 'Formatos' : 
               view === 'merch' ? 'Aprobación Merch' : 
               view === 'users' ? 'Usuarios' : 'Géneros'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {renderContent()}
      </div>
    </div>
  );
}