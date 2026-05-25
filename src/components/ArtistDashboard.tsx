import { useState } from 'react';
import type { UserDto } from '../types/dtos';
import ReleasesList from './ReleasesList';
import ArtistProfile from './ArtistProfile';
import TracksManager from './TracksManager';
import ArtistSales from './ArtistSales';
import ArtistMerch from './ArtistMerch';

// Agregamos 'merch' a los tipos válidos
type ArtistView = 'perfil' | 'merch' | 'lanzamientos' | 'pistas' | 'ventas';

export default function ArtistDashboard({ 
  currentUser, 
  onLogout 
}: { 
  currentUser: UserDto;
  onLogout: () => void;
}) {
  const [currentView, setCurrentView] = useState<ArtistView>('perfil');

  const getNavClass = (viewName: ArtistView) => {
    const baseClass = "px-4 py-2 font-bold uppercase transition-all cursor-pointer border-2 border-transparent text-left ";
    const activeClass = "bg-black text-white border-black translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
    const inactiveClass = "text-black hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
    
    return baseClass + (currentView === viewName ? activeClass : inactiveClass);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'perfil':
        return <ArtistProfile currentUser={currentUser} onLogout={onLogout} />;
      case 'merch':
        return <ArtistMerch currentUser={currentUser} />;
      case 'lanzamientos':
        return <ReleasesList currentUser={currentUser} />; 
      case 'pistas':
        return <TracksManager currentUser={currentUser} />;
      case 'ventas':
        return <ArtistSales currentUser={currentUser} />;
      default:
        return null;
    }
  };

  return (
    <div className="font-mono flex flex-col md:flex-row gap-8 pt-8 pb-12">
      
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="flex flex-col gap-4 sticky top-8">
          <div className="mb-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter bg-black text-white px-2 py-1 inline-block">
              PANEL
            </h2>
            <p className="text-sm font-bold mt-2 truncate">Bienvenido, {currentUser.username}</p>
          </div>

          <nav className="flex flex-col gap-3">
            <button 
              onClick={() => setCurrentView('perfil')}
              className={getNavClass('perfil')}
            >
              Mi Perfil
            </button>
            <button 
              onClick={() => setCurrentView('merch')} 
              className={getNavClass('merch')}
            >
              Mi Merch
            </button>
            <button 
              onClick={() => setCurrentView('lanzamientos')}
              className={getNavClass('lanzamientos')}
            >
              Lanzamientos
            </button>
            <button 
              onClick={() => setCurrentView('pistas')}
              className={getNavClass('pistas')}
            >
              Pistas (Tracks)
            </button>
            <button 
              onClick={() => setCurrentView('ventas')}
              className={getNavClass('ventas')}
            >
              Mis Ventas
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-grow max-w-3xl">
        {renderContent()}
      </main>

    </div>
  );
}