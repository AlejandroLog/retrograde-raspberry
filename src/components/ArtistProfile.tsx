import { useState, useEffect } from 'react';
import type { UserDto, ArtistDto, MusicalGenreDto } from '../types/dtos';
import { updateUser, deleteUser } from '../api/userService';
import { getArtists, createArtist, updateArtist } from '../api/artistService';
import { getMusicalGenres } from '../api/genreService';

export default function ArtistProfile({ currentUser, onLogout }: { currentUser: UserDto; onLogout: () => void; }) {
  const [username, setUsername] = useState(currentUser.username);
  const [password, setPassword] = useState('');
  const [artistProfile, setArtistProfile] = useState<ArtistDto | null>(null);
  const [bandName, setBandName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [genreId, setGenreId] = useState(''); 
  const [genres, setGenres] = useState<MusicalGenreDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([getMusicalGenres(), getArtists()])
    .then(([fetchedGenres, artists]) => {
      setGenres(fetchedGenres);
      if (fetchedGenres.length > 0 && !genreId) setGenreId(fetchedGenres[0].id.toString());
      const foundArtist = artists.find(a => a.userId === currentUser.id);
      if (foundArtist) {
        setArtistProfile(foundArtist);
        setBandName(foundArtist.bandName);
        setContactEmail(foundArtist.contactEmail || '');
        setGenreId(foundArtist.musicalGenreId.toString());
      }
      setLoading(false);
    })
    .catch(err => { console.error(err); setMessage('[!] Error al cargar datos: ' + err.message); setLoading(false); });
  }, [currentUser.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!genreId) { setMessage('[!] Debes seleccionar un género musical.'); return; }
    try {
      if (password) { await updateUser(currentUser.id, { username, passwordHash: password, role: currentUser.role }); }
      const artistData = { userId: currentUser.id, musicalGenreId: parseInt(genreId), bandName, contactEmail };
      if (artistProfile) { await updateArtist(artistProfile.id, artistData); } 
      else { const newArtist = await createArtist(artistData); setArtistProfile(newArtist); }
      setMessage('[OK] Perfil actualizado correctamente.');
      setPassword(''); 
    } catch (err: any) { setMessage('[!] Error: ' + err.message); }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("¿ESTÁS SEGURO? Esta acción dará de baja tu cuenta del catálogo.");
    if (!confirmDelete) return;
    try { await deleteUser(currentUser.id, currentUser.username); alert("Cuenta eliminada. Desconectando..."); onLogout(); } 
    catch (err: any) { setMessage('[!] Error al eliminar cuenta: ' + err.message); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 text-sm">Cargando base de datos...</p>
    </div>
  );

  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 max-w-2xl mb-8" style={{animation: 'fadeIn 0.4s ease-out'}}>
      <h3 className="text-xl font-bold text-slate-100 mb-6 pb-4 border-b border-white/[0.08]">Estación de Control</h3>

      {message && (
        <div className={`p-3 mb-6 font-medium text-sm rounded-lg ${message.includes('[OK]') ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>{message}</div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
          <h4 className="font-semibold text-slate-300 text-sm uppercase tracking-wider mb-4">Credenciales de Sistema</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Usuario</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Nueva Contraseña</label>
              <input type="password" placeholder="Dejar en blanco para conservar" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all text-sm placeholder:text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-4">
          <h4 className="font-semibold text-slate-300 text-sm uppercase tracking-wider mb-4">Proyecto Musical</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Nombre de la Banda</label>
              <input type="text" required placeholder="Ej. Sonic Fock" value={bandName} onChange={e => setBandName(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Email de Contacto</label>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Género Principal</label>
                <select required value={genreId} onChange={e => setGenreId(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all appearance-none cursor-pointer text-sm">
                  {genres.length === 0 ? (<option value="">Cargando géneros...</option>) : (genres.map(genre => (<option key={genre.id} value={genre.id}>{genre.name}</option>)))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full neo-btn-primary">Guardar Cambios</button>
      </form>

      <div className="mt-10 pt-6 border-t border-white/[0.08]">
        <h4 className="font-bold text-red-400 text-sm uppercase mb-2">Zona de Peligro</h4>
        <p className="text-sm text-slate-500 mb-4">Eliminar tu cuenta ocultará todo tu catálogo del sistema.</p>
        <button onClick={handleDeleteAccount} className="bg-red-500/10 text-red-400 border border-red-500/20 font-semibold uppercase py-2.5 px-5 rounded-lg hover:bg-red-500/20 transition-all cursor-pointer text-sm">
          Eliminar Cuenta
        </button>
      </div>
    </div>
  );
}