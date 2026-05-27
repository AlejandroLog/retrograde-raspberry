import { useState } from 'react';
import type { UserDto } from '../types/dtos';
import ReleasesList from './ReleasesList';
import ArtistProfile from './ArtistProfile';
import TracksManager from './TracksManager';
import ArtistSales from './ArtistSales';
import ArtistMerch from './ArtistMerch';

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
    const base = "px-4 py-2.5 font-medium text-left rounded-lg transition-all duration-300 cursor-pointer text-sm border ";
    const active = "bg-white/[0.1] text-white shadow-lg shadow-violet-500/5 border-white/10";
    const inactive = "text-slate-400 hover:text-white hover:bg-white/[0.06] border-transparent";
    
    return base + (currentView === viewName ? active : inactive);
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
    <div className="flex flex-col md:flex-row gap-8 pt-8 pb-12 px-4" style={{animation: 'fadeIn 0.4s ease-out'}}>
      
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="flex flex-col gap-3 sticky top-20">
          <div className="mb-4">
            <h2 className="text-2xl font-bold gradient-text">
              Panel de Artista
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 truncate">Bienvenido, {currentUser.username}</p>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button onClick={() => setCurrentView('perfil')} className={getNavClass('perfil')}>Mi Perfil</button>
            <button onClick={() => setCurrentView('merch')} className={getNavClass('merch')}>Mi Merch</button>
            <button onClick={() => setCurrentView('lanzamientos')} className={getNavClass('lanzamientos')}>Lanzamientos</button>
            <button onClick={() => setCurrentView('pistas')} className={getNavClass('pistas')}>Pistas (Tracks)</button>
            <button onClick={() => setCurrentView('ventas')} className={getNavClass('ventas')}>Mis Ventas</button>
          </nav>
        </div>
      </aside>

      <main className="flex-grow max-w-3xl">
        {renderContent()}
      </main>

    </div>
  );
}