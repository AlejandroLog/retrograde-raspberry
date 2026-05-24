import { useState } from 'react';
import type { UserDto } from '../types/dtos';
import AdminInventory from './AdminInventory';
import AdminFormats from './AdminFormats';
import AdminUsers from './AdminUsers';
import AdminSummary from './AdminSummary';
import AdminGenres from './AdminGenres';

// Agregamos 'formats' a las vistas posibles
type AdminView = 'dashboard' | 'inventory' | 'formats' | 'users' | 'genres';

export default function AdminDashboard({ currentUser }: { currentUser: UserDto }) {
  const [currentView, setCurrentView] = useState<AdminView>('inventory');

  const handleNavClick = (view: AdminView) => setCurrentView(view);

  const renderContent = () => {
    switch (currentView) {
      case 'inventory':
        return <AdminInventory currentUser={currentUser} />;
      case 'formats':
        return <AdminFormats currentUser={currentUser} />;
      case 'users':
        return <AdminUsers currentUser={currentUser} />;
      case 'genres':
return <AdminGenres currentUser={currentUser} />;      default:
        return (
           <AdminSummary />
        );
    }
  };

  return (
    <div>
      <div className="bg-white border-b-4 border-black font-mono">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          {['dashboard', 'inventory', 'formats', 'users', 'genres'].map((view) => (
            <button
              key={view}
              onClick={() => handleNavClick(view as AdminView)}
              className={`px-6 py-3 font-black uppercase text-sm border-r-4 border-black transition-colors ${
                currentView === view ? 'bg-black text-white' : 'hover:bg-gray-200'
              }`}
            >
              {view === 'dashboard' ? 'Resumen' : 
               view === 'inventory' ? 'Inventario' : 
               view === 'formats' ? 'Formatos' : 
               view === 'users' ? 'Usuarios' : 'Géneros Musicales'}
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