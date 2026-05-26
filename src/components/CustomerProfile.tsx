import { useState } from 'react';
import type { UserDto } from '../types/dtos';
import { updateUser, deleteUser } from '../api/userService';

export default function CustomerProfile({ currentUser, onLogout }: { currentUser: UserDto, onLogout: () => void }) {
  const [username, setUsername] = useState(currentUser.username);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return setMessage('[!] Ingresa una contraseña para actualizar.');
    try {
      await updateUser(currentUser.id, { username, passwordHash: password, role: currentUser.role });
      setMessage('[OK] Datos actualizados.');
      setPassword('');
    } catch (err: any) {
      setMessage('[!] Error: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que quieres eliminar tu cuenta? Perderás tu historial de compras.")) return;
    try {
      await deleteUser(currentUser.id, currentUser.username);
      onLogout();
    } catch (err: any) {
      setMessage('[!] Error al eliminar: ' + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/[0.04] border border-white/10 rounded-xl p-6 mt-8" style={{animation: 'fadeIn 0.4s ease-out'}}>
      <h3 className="text-xl font-bold text-slate-100 mb-6 pb-4 border-b border-white/[0.08]">Datos del Fan</h3>
      {message && <div className={`p-3 mb-4 font-medium text-sm rounded-lg ${message.includes('[OK]') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>{message}</div>}
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Usuario</label>
          <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Nueva Contraseña</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all text-sm" />
        </div>
        <button type="submit" className="w-full neo-btn-primary">Actualizar</button>
      </form>
      <div className="mt-8 pt-4 border-t border-white/[0.08] text-center">
        <button onClick={handleDelete} className="text-red-400 font-medium text-sm hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">Eliminar Cuenta</button>
      </div>
    </div>
  );
}