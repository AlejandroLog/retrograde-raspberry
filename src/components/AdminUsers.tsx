import { useState, useEffect } from 'react';
import type { UserDto } from '../types/dtos';
import { getAllUsers, updateUser, deleteUser } from '../api/userService';

export default function AdminUsers({ currentUser }: { currentUser: UserDto }) {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      const filtered = data.filter(user => user.role.toLowerCase() != 'admin');
      setUsers(filtered);
    } catch (err: any) {
      console.error(err);
      setMessage('[!] Error al cargar usuarios: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    try {
      await updateUser(selectedUser.id, {
        username: selectedUser.username,
        passwordHash: newPassword,
        role: selectedUser.role
      });
      
      setMessage(`[OK] Contraseña de "${selectedUser.username}" restablecida con éxito.`);
      setSelectedUser(null);
      setNewPassword('');
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteUser = async (user: UserDto) => {
    const confirmDelete = window.confirm(`¿ESTÁS SEGURO? Se dará de baja al usuario "${user.username}" [${user.role}] y ya no podrá iniciar sesión.`);
    if (!confirmDelete) return;

    try {
      await deleteUser(user.id, currentUser.username);
      setMessage(`[OK] Usuario "${user.username}" eliminado correctamente.`);
      loadUsers(); 
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    }
  };

  if (loading) return <p className="animate-pulse font-mono p-8">Escaneando registros de usuarios...</p>;

  return (
    <div className="font-mono mt-8 max-w-4xl">
      
      {message && (
        <div className={`p-3 mb-6 font-bold text-white border-2 border-black ${message.includes('[OK]') ? 'bg-green-600' : 'bg-black animate-pulse'}`}>
          {message}
        </div>
      )}

      {selectedUser && (
        <form onSubmit={handlePasswordReset} className="border-4 border-black p-6 bg-yellow-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12 ring-4 ring-black">
          <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
            <h3 className="text-xl font-black uppercase">RESTABLECER CREDENCIALES</h3>
            <button type="button" onClick={() => setSelectedUser(null)} className="bg-black text-white px-2 py-0.5 font-bold text-xs uppercase">Cancelar</button>
          </div>
          <p className="text-sm mb-4">Ingresa la nueva contraseña para el usuario: <span className="font-bold underline">{selectedUser.username}</span></p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-grow">
              <label className="block text-xs font-bold uppercase mb-1">Nueva Contraseña</label>
              <input 
                type="password" required placeholder="Mínimo 6 caracteres" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full border-2 border-black p-2 bg-white outline-none focus:bg-black focus:text-white"
              />
            </div>
            <button type="submit" className="bg-black text-white font-black uppercase py-2 px-6 hover:bg-white hover:text-black border-2 border-black transition-colors cursor-pointer">
              [ APLICAR ]
            </button>
          </div>
        </form>
      )}

      <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 inline-block bg-black text-white px-2 py-1">
        CONTROL DE TRIPULACIÓN Y FANS
      </h2>

      {users.length === 0 ? (
        <p>No hay cuentas de artistas o clientes registradas en la plataforma.</p>
      ) : (
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-sm">
                <th className="p-3 border-r-2 border-white w-16 text-center">ID</th>
                <th className="p-3 border-r-2 border-white">Nombre de Usuario</th>
                <th className="p-3 border-r-2 border-white text-center">Rol de Sistema</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user.id} className={`border-b-2 border-black hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f4f4f0]'}`}>
                  <td className="p-3 border-r-2 border-black text-center font-bold">{user.id}</td>
                  <td className="p-3 border-r-2 border-black font-bold uppercase tracking-tight">{user.username}</td>
                  <td className="p-3 border-r-2 border-black text-center">
                    <span className={`px-2 py-0.5 text-xs font-black uppercase border-2 border-black ${user.role.toLowerCase() === 'artista' ? 'bg-purple-300' : 'bg-blue-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-4">
                    <button 
                      onClick={() => { setSelectedUser(user); setMessage(''); }}
                      className="text-xs font-bold uppercase underline hover:bg-black hover:text-white px-1 cursor-pointer"
                    >
                      Llave / Password
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="text-xs font-bold uppercase text-red-600 underline hover:bg-red-600 hover:text-white px-1 cursor-pointer"
                    >
                      Dar de baja
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}