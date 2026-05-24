import { useState } from 'react';
import { loginUser, registerUser } from '../api/userService';
import type { UserDto } from '../types/dtos';

export default function Auth({ onLogin }: { onLogin: (user: UserDto) => void }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('cliente'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginView) {
        const user = await loginUser({ username, password });
        onLogin(user);
      } else {
        const newUser = await registerUser({ 
          username, 
          passwordHash: password, 
          role: role 
        });
        onLogin(newUser);
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Fondo de pantalla adaptado al Dark Mode ciberpunk (#0d0e12) */
    <div className="flex flex-col items-center justify-center min-h-[90vh] font-mono p-4 bg-[#0d0e12]">
      
      {/* neo-card ahora renderiza automáticamente el fondo #161920 definido en tu global.css */}
      <div className="w-full max-w-md neo-card p-8">
        
        {/* Encabezado con bordes y textos optimizados para contraste oscuro */}
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-3 flex justify-between items-center text-white">
          <span>{isLoginView ? '✨ ACCESO' : '🔥 NUEVO RECLUTA'}</span>
          <span className="text-xs bg-[#CCFF00] text-black px-2 py-0.5 font-bold tracking-normal normal-case">v1.0.0</span>
        </h2>

        {error && (
          <div className="bg-[#FF6B6B] text-black border-2 border-black p-3 mb-6 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
            <span>⚠️</span>
            <span className="text-sm uppercase tracking-wide">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            {/* Etiquetas cambiadas a texto blanco para legibilidad */}
            <label className="block text-sm font-black uppercase text-white mb-1.5 tracking-wide">[ USUARIO ]</label>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              placeholder="tu_nombre_de_artista"
              className="neo-input"
            />
          </div>

          <div>
            <label className="block text-sm font-black uppercase text-white mb-1.5 tracking-wide">[ CONTRASEÑA ]</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="neo-input"
            />
          </div>

          {!isLoginView && (
            <div>
              <label className="block text-sm font-black uppercase text-white mb-1.5 tracking-wide">[ TIPO DE CUENTA ]</label>
              <div className="relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {/* Select oscuro adaptado para que coincida con las cajas de input */}
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value)}
                  className="w-full border-[3px] border-black p-3 bg-[#1f232b] text-white font-black uppercase appearance-none cursor-pointer focus:outline-none focus:bg-[#CCFF00] focus:text-black"
                >
                  <option value="cliente" className="bg-[#1f232b] text-white">Fan / Cliente</option>
                  <option value="artista" className="bg-[#1f232b] text-white">Músico / Artista</option>
                </select>
                {/* Flecha lateral adaptada visualmente al nuevo fondo del select */}
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none border-l-[3px] border-black bg-[#1f232b] text-white font-black text-sm peer-focus:bg-[#CCFF00] peer-focus:text-black">
                  ▼
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full neo-btn-primary"
          >
            {loading ? 'PROCESANDO...' : isLoginView ? 'ENTRAR AL PANEL →' : 'CREAR MI CUENTA +'}
          </button>
        </form>

        {/* Footer con divisor discontinuo negro y textos secundarios suavizados en gris */}
        <div className="mt-8 pt-5 border-t-[3px] border-dashed border-black text-center">
          <p className="text-xs font-bold uppercase text-gray-400 mb-2">
            {isLoginView ? '¿No tienes código de acceso?' : '¿Ya eres del crew?'}
          </p>
          {/* Botón secundario con inversión de colores ideal para el modo oscuro */}
          <button 
            type="button"
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError('');
            }}
            className="inline-block bg-[#1f232b] text-white border-2 border-black font-black uppercase px-4 py-1.5 text-xs tracking-wider
                       shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                       hover:bg-white hover:text-black hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                       active:translate-x-[3px] active:translate-y-[3px] active:shadow-none
                       transition-all cursor-pointer"
          >
            {isLoginView ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </button>
        </div>

      </div>
    </div>
  );
}