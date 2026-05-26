import { useState, useEffect } from 'react';
import type { UserDto } from '../types/dtos';
import { getAllUsers, deleteUser, updateUser } from '../api/userService';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPasswordId, setEditingPasswordId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const loadData = async () => {
    setLoading(true);
    try { const data = await getAllUsers(); setUsers(data); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id: number, username: string) => {
    if(!window.confirm(`¿Purgar cuenta de ${username} permanentemente del sistema?`)) return;
    try { await deleteUser(id, username); loadData(); alert("Usuario eliminado con éxito."); } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleUpdatePassword = async (id: number, username: string, role: string) => {
    if (!newPassword) return alert("Escribe una contraseña nueva.");
    try {
      await updateUser(id, { username, passwordHash: newPassword, role });
      setEditingPasswordId(null); setNewPassword(''); alert("Credenciales sobreescritas correctamente.");
    } catch (err: any) { alert("Error: " + err.message); }
  };

  if (loading) return (<div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div></div>);

  return (
    <div style={{animation: 'fadeIn 0.4s ease-out'}}>
      <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
        Directorio de Cuentas
      </h2>

      <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.08]">
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">ID / Username</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center">Tipo (Rol)</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center">Credenciales</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-right">Administración</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.id} className={`border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors ${idx % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="p-4 text-sm">
                    <div className="font-bold text-slate-100">{u.username}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">UID: {u.id}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${u.role === 'Admin' ? 'bg-red-500/15 text-red-400 border-red-500/20' : u.role.toLowerCase() === 'artista' ? 'bg-violet-500/15 text-violet-400 border-violet-500/20' : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {editingPasswordId === u.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <input type="password" placeholder="Nueva..." value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-24 bg-white/[0.06] border border-white/10 rounded-lg px-2 py-1.5 text-slate-100 text-xs outline-none focus:border-violet-500/50 transition-all" />
                        <button onClick={() => handleUpdatePassword(u.id, u.username, u.role)} className="bg-emerald-500/20 text-emerald-400 px-2 py-1.5 text-xs font-bold rounded-lg cursor-pointer hover:bg-emerald-500/30 transition-colors">✔</button>
                        <button onClick={() => setEditingPasswordId(null)} className="bg-white/10 text-slate-300 px-2 py-1.5 text-xs font-bold rounded-lg cursor-pointer hover:bg-white/20 transition-colors">✖</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingPasswordId(u.id); setNewPassword(''); }} className="text-xs font-medium text-slate-400 hover:text-white underline decoration-dashed underline-offset-4 cursor-pointer">Reemplazar Password</button>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'Admin' && (
                      <button onClick={() => handleDelete(u.id, u.username)} className="text-xs font-medium text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors cursor-pointer">
                        Purgar Cuenta
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}