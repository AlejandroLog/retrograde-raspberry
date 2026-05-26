import { useState, useEffect } from 'react';
import { createRelease, updateRelease } from '../api/releaseService';
import { getArtists } from '../api/artistService';
import type { UserDto, ArtistDto, ReleaseDto } from '../types/dtos';

export default function CreateReleaseForm({ onReleaseSaved, currentUser, releaseToEdit, onCancelEdit }: { onReleaseSaved: () => void; currentUser: UserDto; releaseToEdit?: ReleaseDto | null; onCancelEdit?: () => void; }) {
  const [title, setTitle] = useState('');
  const [releaseType, setReleaseType] = useState('EP');
  const [releaseDate, setReleaseDate] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [artistId, setArtistId] = useState('');
  const [userArtists, setUserArtists] = useState<ArtistDto[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(true);

  useEffect(() => {
    getArtists().then(artists => { const myProjects = artists.filter(a => a.userId === currentUser.id); setUserArtists(myProjects); if (myProjects.length > 0 && !artistId) setArtistId(myProjects[0].id.toString()); setLoadingArtists(false); }).catch(err => { console.error("Error cargando artistas", err); setLoadingArtists(false); });
  }, [currentUser.id]);

  useEffect(() => {
    if (releaseToEdit) { setTitle(releaseToEdit.title); setReleaseType(releaseToEdit.releaseType); setReleaseDate(releaseToEdit.releaseDate ? releaseToEdit.releaseDate.split('T')[0] : ''); setCoverUrl(releaseToEdit.coverUrl || ''); setArtistId(releaseToEdit.artistId.toString()); }
    else { setTitle(''); setReleaseType('EP'); setReleaseDate(''); setCoverUrl(''); }
  }, [releaseToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId) { alert("Debes tener un perfil de artista antes de crear un lanzamiento."); return; }
    try {
      const releaseData = { title, releaseType, releaseDate: releaseDate ? new Date(releaseDate).toISOString() : undefined, artistId: parseInt(artistId), coverUrl: coverUrl || undefined };
      if (releaseToEdit) { await updateRelease(releaseToEdit.id, releaseData); } else { await createRelease(releaseData); }
      setTitle(''); setReleaseDate(''); setCoverUrl(''); onReleaseSaved();
    } catch (error) { alert("Error al guardar: " + error); }
  };

  if (loadingArtists) return (<div className="flex items-center gap-2 py-4"><div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div><p className="text-slate-500 text-sm">Cargando perfil...</p></div>);

  if (userArtists.length === 0) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-bold text-amber-400 mb-2">Falta Configuración</h3>
        <p className="text-slate-400 text-sm">Aún no tienes un perfil de artista creado. Ve a la pestaña "Mi Perfil" para registrar tu banda antes de subir música.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`bg-white/[0.04] border border-white/10 rounded-xl p-6 mb-8 ${releaseToEdit ? 'ring-1 ring-violet-500/30' : ''}`}>
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/[0.08]">
        <h3 className="text-lg font-bold text-slate-100">{releaseToEdit ? 'Editando Lanzamiento' : 'Nuevo Lanzamiento'}</h3>
        {releaseToEdit && onCancelEdit && (
          <button type="button" onClick={onCancelEdit} className="text-xs font-medium text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">Cancelar</button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Título de la Obra</label>
          <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Formato</label>
          <select value={releaseType} onChange={e => setReleaseType(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all appearance-none cursor-pointer text-sm">
            <option>Single</option><option>EP</option><option>LP</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Fecha</label>
          <input type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Proyecto Musical</label>
          <select required value={artistId} onChange={e => setArtistId(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all appearance-none cursor-pointer text-sm">
            {userArtists.map(artist => (<option key={artist.id} value={artist.id}>{artist.bandName}</option>))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">URL Portada / Cover Art</label>
          <input type="url" placeholder="https://imgur.com/tu-portada.jpg" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all text-sm" />
        </div>
      </div>

      <button type="submit" className="mt-6 w-full neo-btn-primary">{releaseToEdit ? 'Guardar Cambios' : 'Grabar en Base de Datos'}</button>
    </form>
  );
}