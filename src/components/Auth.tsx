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
    <div className="flex flex-col items-center justify-center min-h-[80vh] font-mono p-4">
      <div className="w-full max-w-md border-4 border-black p-8 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-2">
          {isLoginView ? 'ACCESO' : 'NUEVO RECLUTA'}
        </h2>

        {error && (
          <div className="bg-black text-white p-3 mb-4 font-bold animate-pulse">
            [!] {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase text-black mb-1">Usuario</label>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              className="w-full border-2 border-black p-3 bg-white focus:outline-none focus:bg-black focus:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase text-black mb-1">Contraseña</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full border-2 border-black p-3 bg-white focus:outline-none focus:bg-black focus:text-white transition-colors"
            />
          </div>

          {!isLoginView && (
            <div>
              <label className="block text-sm font-bold uppercase text-black mb-1">Tipo de Cuenta</label>
              <select 
                value={role} 
                onChange={e => setRole(e.target.value)}
                className="w-full border-2 border-black p-3 bg-white focus:outline-none focus:bg-black focus:text-white transition-colors appearance-none"
              >
                <option value="cliente">Fan / Cliente</option>
                <option value="artista">Músico / Artista</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black border-4 border-black font-black uppercase py-4 hover:bg-black hover:text-white hover:translate-y-1 transition-all disabled:opacity-50"
          >
            {loading ? 'PROCESANDO...' : isLoginView ? '[ ENTRAR ]' : '[ CREAR CUENTA ]'}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t-2 border-black text-center">
          <p className="text-sm font-bold uppercase mb-2">
            {isLoginView ? '¿No tienes código de acceso?' : '¿Ya eres del crew?'}
          </p>
          <button 
            onClick={() => {
              setIsLoginView(!isLoginView);
              setError('');
            }}
            className="text-black underline hover:bg-black hover:text-white p-1 transition-colors uppercase font-bold"
          >
            {isLoginView ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </button>
        </div>

      </div>
    </div>
  );
}