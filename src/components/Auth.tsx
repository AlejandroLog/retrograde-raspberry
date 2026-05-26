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
    <div className="flex min-h-screen bg-[#0a0a0f] text-slate-200" style={{animation: 'fadeIn 0.5s ease-out'}}>
      {/* Left side: Image Banner */}
      <div className="hidden lg:flex w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0a0a0f]/50 to-[#0a0a0f] z-10 pointer-events-none"></div>
        <img src="/assets/turntable.png" alt="Vinyl Turntable" className="object-cover w-full h-full opacity-80" />
        <div className="absolute bottom-16 left-16 z-20 max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
            </div>
            <span className="font-bold text-2xl tracking-tight text-white drop-shadow-md">Sonic Fock</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            La Experiencia <br /><span className="gradient-text drop-shadow-none">Física</span> de la Música.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed drop-shadow-md font-medium">
            Plataforma premium para la distribución, manufactura y venta de vinilos, casetes y mercancía exclusiva para sellos y artistas independientes.
          </p>
        </div>
      </div>
      
      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-20">
        <div className="w-full max-w-md">
          
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Sonic Fock</span>
          </div>

          <div className="neo-card p-8 bg-white/[0.02]">
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-6 border-b border-white/10 pb-4 flex justify-between items-center text-slate-100">
              <span className="gradient-text">{isLoginView ? 'Acceso' : 'Nuevo Recluta'}</span>
              <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2.5 py-1 rounded-full font-medium tracking-normal normal-case border border-violet-500/20">v1.0.0</span>
            </h2>

            {error && (
              <div className="bg-red-500/10 text-red-400 border border-red-500/20 p-3 mb-6 font-medium rounded-lg flex items-center gap-2 text-sm">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Usuario / Proyecto</label>
                <input 
                  type="text" 
                  required 
                  value={username} 
                  onChange={e => setUsername(e.target.value)}
                  placeholder="nombre_proyecto"
                  className="neo-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Contraseña</label>
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
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Perfil</label>
                  <select 
                    value={role} 
                    onChange={e => setRole(e.target.value)}
                    className="neo-input appearance-none cursor-pointer"
                  >
                    <option value="cliente">Coleccionista / Fan</option>
                    <option value="artista">Músico / Sello</option>
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full neo-btn-primary mt-4"
              >
                {loading ? 'PROCESANDO...' : isLoginView ? 'ENTRAR AL PANEL →' : 'CREAR MI CUENTA +'}
              </button>
            </form>

            <div className="mt-8 pt-5 border-t border-white/10 text-center">
              <p className="text-xs font-medium text-slate-500 mb-3">
                {isLoginView ? '¿Aún no coleccionas con nosotros?' : '¿Ya eres parte de la distribuidora?'}
              </p>
              <button 
                type="button"
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setError('');
                }}
                className="inline-block bg-white/[0.06] text-slate-300 border border-white/10 font-semibold px-5 py-2 text-xs tracking-wider rounded-lg
                           hover:bg-white/[0.12] hover:text-white hover:border-white/20
                           transition-all duration-300 cursor-pointer uppercase"
              >
                {isLoginView ? 'Solicitar Ingreso' : 'Iniciar Sesión'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}