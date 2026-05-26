import { useState, useEffect } from 'react';
import Auth from './Auth';
import CustomerDashboard from './CustomerDashboard';
import ArtistDashboard from './ArtistDashboard';
import AdminDashboard from './AdminDashboard';
import type { UserDto } from '../types/dtos';

export default function AppRouter() {
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('music_dist_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (user: UserDto) => {
    localStorage.setItem('music_dist_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('music_dist_user');
    setCurrentUser(null);
  };

  if (isInitializing) return null;

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderNavLinks = () => {
    switch (currentUser.role.toLowerCase()) {
      case 'cliente':
        return (
          <>
            <span className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.06] cursor-pointer transition-all duration-300 text-sm font-medium">Catálogo</span>
          </>
        );
      case 'artista':
        return null; 
      case 'admin':
        return (
          <>
            <span className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.06] cursor-pointer transition-all duration-300 text-sm font-medium">Dashboard</span>
            <span className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.06] cursor-pointer transition-all duration-300 text-sm font-medium">Inventario</span>
            <span className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/[0.06] cursor-pointer transition-all duration-300 text-sm font-medium">Usuarios</span>
          </>
        );
      default:
        return null;
    }
  };

  const renderDashboard = () => {
    switch (currentUser.role.toLowerCase()) {
      case 'cliente':
        return <CustomerDashboard currentUser={currentUser} onLogout={handleLogout} />;
      case 'artista':
        return <ArtistDashboard currentUser={currentUser} onLogout={handleLogout} />; 
      case 'admin':
        return <AdminDashboard currentUser={currentUser} />;
      default:
        return (
          <div className="p-8 text-red-400 font-medium animate-pulse">
            [ERROR] Rol desconocido: {currentUser.role}. Contacta soporte.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
              </div>
              <span className="font-bold text-xl tracking-tight text-white drop-shadow-md">
                Sonic Fock
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              {renderNavLinks()}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-white/[0.08] text-slate-300 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10">
              {currentUser.username} · <span className="text-violet-400">{currentUser.role}</span>
            </span>
            <button 
              onClick={handleLogout}
              className="text-slate-400 border border-white/10 px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-300 cursor-pointer uppercase"
            >
              Salir
            </button>
          </div>

        </div>
      </nav>

      <main className="flex-grow max-w-6xl mx-auto w-full" style={{animation: 'fadeIn 0.4s ease-out'}}>
        {renderDashboard()}
      </main>
    </div>
  );
}