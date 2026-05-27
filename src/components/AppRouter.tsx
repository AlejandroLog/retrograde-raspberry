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

  const renderDashboard = () => {
    switch (currentUser.role.toLowerCase()) {
      case 'cliente':
        return <CustomerDashboard currentUser={currentUser} onLogout={handleLogout} />;
      case 'artista':
        return <ArtistDashboard currentUser={currentUser} onLogout={handleLogout} />; 
      case 'admin':
        return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
      default:
        return (
          <div className="p-8 text-red-400 font-medium animate-pulse">
            [ERROR] Rol desconocido: {currentUser.role}. Contacta soporte.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0a0a0f]">
      {/* Global Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full mix-blend-screen animate-[pulse-glow_8s_ease-in-out_infinite_alternate]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen animate-[pulse-glow_12s_ease-in-out_infinite_alternate-reverse]"></div>
        <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-fuchsia-600/5 blur-[100px] rounded-full mix-blend-screen animate-[pulse-glow_10s_ease-in-out_infinite_alternate]"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <nav className="bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
              </div>
              <span className="font-bold text-xl tracking-tight text-white drop-shadow-md whitespace-nowrap">
                Sonic Fock
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="bg-white/[0.08] text-slate-300 px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 truncate max-w-[150px] sm:max-w-none">
                {currentUser.username} <span className="hidden sm:inline">· <span className="text-violet-400">{currentUser.role}</span></span>
              </span>
              <button 
                onClick={handleLogout}
                className="text-slate-400 border border-white/10 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-300 cursor-pointer uppercase whitespace-nowrap"
              >
                Salir
              </button>
            </div>

          </div>
        </nav>

        <main className="flex-grow max-w-6xl mx-auto w-full p-4" style={{animation: 'fadeIn 0.4s ease-out'}}>
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}