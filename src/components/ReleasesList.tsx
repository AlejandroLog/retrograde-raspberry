import { useEffect, useState } from 'react';
import { getReleases, deleteRelease } from '../api/releaseService';
import { getArtists } from '../api/artistService';
import type { ReleaseDto, UserDto, ArtistDto } from '../types/dtos';
import CreateReleaseForm from './CreateReleaseForm';

export default function ReleasesList({ currentUser }: { currentUser: UserDto }) {
  const [releases, setReleases] = useState<ReleaseDto[]>([]);
  const [userArtists, setUserArtists] = useState<ArtistDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRelease, setEditingRelease] = useState<ReleaseDto | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allReleases, allArtists] = await Promise.all([getReleases(), getArtists()]);
      const myArtists = allArtists.filter(a => a.userId === currentUser.id);
      setUserArtists(myArtists);
      const myArtistIds = myArtists.map(a => a.id);
      const myReleases = allReleases.filter(r => myArtistIds.includes(r.artistId));
      setReleases(myReleases);
    } catch (err) { console.error("Error:", err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [currentUser.id]);

  const getBandName = (id: number) => { const artist = userArtists.find(a => a.id === id); return artist ? artist.bandName : 'Desconocido'; };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("¿Seguro que deseas destruir este lanzamiento? Ya no aparecerá en el catálogo.");
    if (!confirmDelete) return;
    try { await deleteRelease(id, currentUser.username); fetchData(); } catch (err: any) { alert("Error al eliminar: " + err.message); }
  };

  const handleSaveCompleted = () => { setEditingRelease(null); fetchData(); };

  return (
    <div className="p-4 max-w-4xl mx-auto" style={{animation: 'fadeIn 0.4s ease-out'}}>
      <CreateReleaseForm onReleaseSaved={handleSaveCompleted} currentUser={currentUser} releaseToEdit={editingRelease} onCancelEdit={() => setEditingRelease(null)} />

      <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
        Catálogo de la Banda
      </h2>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div><p className="text-slate-500 text-sm">Leyendo discos...</p></div>
      ) : releases.length === 0 ? (
        <p className="text-slate-500 text-sm">Sin señales. El catálogo está vacío.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {releases.map((release) => (
            <div key={release.id} className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 flex flex-col group">
              <div className="h-48 bg-white/[0.06] overflow-hidden flex items-center justify-center">
                {release.coverUrl ? (
                  <img src={release.coverUrl} alt={`Portada de ${release.title}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <span className="text-slate-600 text-sm">SIN PORTADA</span>
                )}
              </div>
              <div className="p-5 flex-grow">
                <h3 className="font-bold text-lg text-slate-100 mb-1 break-words">{release.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{getBandName(release.artistId)}</p>
                <div className="border-t border-white/[0.06] pt-3 mb-4">
                  <p className="text-sm text-slate-400">Formato: <span className="text-slate-300">{release.releaseType}</span></p>
                  {release.releaseDate && (<p className="text-sm text-slate-400">Lanzamiento: <span className="text-slate-300">{new Date(release.releaseDate).toLocaleDateString()}</span></p>)}
                </div>
                <div className="flex gap-2 mt-auto">
                  <button onClick={() => { setEditingRelease(release); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex-1 border border-white/10 bg-white/[0.04] text-slate-300 font-medium text-xs py-2 rounded-lg hover:bg-white/[0.1] hover:text-white transition-all cursor-pointer">Editar</button>
                  <button onClick={() => handleDelete(release.id)} className="flex-1 border border-red-500/20 bg-red-500/5 text-red-400 font-medium text-xs py-2 rounded-lg hover:bg-red-500/20 transition-all cursor-pointer">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}