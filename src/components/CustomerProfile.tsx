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
    <div className="max-w-md mx-auto border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono mt-8">
      <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-2">Datos del Fan</h3>
      {message && <div className="bg-black text-white p-2 mb-4 font-bold">{message}</div>}
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-bold uppercase mb-1">Usuario</label>
          <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full border-2 border-black p-2 outline-none focus:bg-black focus:text-white" />
        </div>
        <div>
          <label className="block text-sm font-bold uppercase mb-1">Nueva Contraseña</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border-2 border-black p-2 outline-none focus:bg-black focus:text-white" />
        </div>
        <button type="submit" className="w-full bg-white text-black border-4 border-black font-black uppercase py-2 hover:bg-black hover:text-white cursor-pointer transition-colors">[ ACTUALIZAR ]</button>
      </form>
      <div className="mt-8 pt-4 border-t-4 border-black border-dashed text-center">
        <button onClick={handleDelete} className="text-red-600 font-bold underline hover:bg-red-600 hover:text-white px-2">Eliminar Cuenta</button>
      </div>
    </div>
  );
}