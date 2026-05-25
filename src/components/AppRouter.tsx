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
            <span className="px-3 hover:bg-white hover:text-black cursor-pointer transition-colors">Catálogo</span>
          </>
        );
      case 'artista':
        return null; 
      case 'admin':
        return (
          <>
            <span className="px-3 hover:bg-white hover:text-black cursor-pointer transition-colors">Dashboard</span>
            <span className="px-3 hover:bg-white hover:text-black cursor-pointer transition-colors">Inventario</span>
            <span className="px-3 hover:bg-white hover:text-black cursor-pointer transition-colors">Usuarios</span>
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
          <div className="p-8 font-mono text-red-600 font-bold animate-pulse">
            [ERROR] Rol desconocido: {currentUser.role}. Contacta soporte.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-black text-white font-mono border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          
          <div className="flex items-center space-x-6">
            <span className="font-black text-xl tracking-tighter uppercase border-r-2 border-white pr-4">
              Music Dist.
            </span>
            
            <div className="hidden md:flex space-x-2 font-bold text-sm uppercase">
              {renderNavLinks()}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs uppercase bg-white text-black px-2 py-1 font-bold">
              {currentUser.username} [{currentUser.role}]
            </span>
            <button 
              onClick={handleLogout}
              className="text-xs border-2 border-white px-3 py-1 font-bold uppercase hover:bg-white hover:text-black transition-colors"
            >
              SALIR
            </button>
          </div>

        </div>
      </nav>

      <main className="flex-grow max-w-6xl mx-auto w-full">
        {renderDashboard()}
      </main>
    </div>
  );
}