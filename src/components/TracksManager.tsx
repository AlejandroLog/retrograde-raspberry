import { useState, useEffect } from 'react';
import type { UserDto, ReleaseDto, TrackDto } from '../types/dtos';
import { getArtists } from '../api/artistService';
import { getReleases } from '../api/releaseService';
import { getTracks, createTrack, updateTrack, deleteTrack } from '../api/trackService';

export default function TracksManager({ currentUser }: { currentUser: UserDto }) {
  const [myReleases, setMyReleases] = useState<ReleaseDto[]>([]);
  const [myTracks, setMyTracks] = useState<TrackDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<TrackDto | null>(null);
  const [releaseId, setReleaseId] = useState('');
  const [trackNumber, setTrackNumber] = useState('1');
  const [songTitle, setSongTitle] = useState('');
  const [duration, setDuration] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [allArtists, allReleases, allTracks] = await Promise.all([getArtists(), getReleases(), getTracks()]);
      const myArtistIds = allArtists.filter(a => a.userId === currentUser.id).map(a => a.id);
      const releases = allReleases.filter(r => myArtistIds.includes(r.artistId));
      setMyReleases(releases);
      if (releases.length > 0 && !releaseId && !isEditing) setReleaseId(releases[0].id.toString());
      const releaseIds = releases.map(r => r.id);
      const tracks = allTracks.filter(t => releaseIds.includes(t.releaseId));
      tracks.sort((a, b) => { if (a.releaseId === b.releaseId) return a.trackNumber - b.trackNumber; return a.releaseId - b.releaseId; });
      setMyTracks(tracks);
    } catch (err) { console.error("Error cargando pistas", err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [currentUser.id]);

  useEffect(() => {
    if (isEditing) { setReleaseId(isEditing.releaseId.toString()); setTrackNumber(isEditing.trackNumber.toString()); setSongTitle(isEditing.songTitle); setDuration(isEditing.duration || ''); }
    else { setSongTitle(''); setDuration('');
      if (releaseId) { const tracksForThisRelease = myTracks.filter(t => t.releaseId.toString() === releaseId); if (tracksForThisRelease.length > 0) { const maxTrack = Math.max(...tracksForThisRelease.map(t => t.trackNumber)); setTrackNumber((maxTrack + 1).toString()); } else { setTrackNumber('1'); } }
    }
  }, [isEditing, releaseId, myTracks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseId) { alert("Debes crear un Lanzamiento (EP/LP) antes de poder agregarle pistas."); return; }
    if (duration) { const durationRegex = /^\d{1,3}:[0-5]\d$/; if (!durationRegex.test(duration)) { alert("[ERROR] La duración es inválida. Usa el formato MM:SS (ejemplo: 03:45 o 12:30). Los segundos no pueden pasar de 59."); return; } }
    const tNumber = parseInt(trackNumber);
    if (!isEditing) { const isDuplicate = myTracks.some(t => t.releaseId.toString() === releaseId && t.trackNumber === tNumber); if (isDuplicate) { alert(`[ERROR] El track #${tNumber} ya existe en este lanzamiento. Por favor, verifica el Setlist.`); return; } }
    try {
      const trackData = { releaseId: parseInt(releaseId), trackNumber: tNumber, songTitle, duration: duration || undefined };
      if (isEditing) { await updateTrack(isEditing.id, trackData); } else { await createTrack(trackData); }
      setIsEditing(null); loadData(); 
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar esta pista del catálogo?")) return;
    try { await deleteTrack(id, currentUser.username); loadData(); } catch (err: any) { alert("Error al eliminar: " + err.message); }
  };

  const getReleaseName = (id: number) => { const release = myReleases.find(r => r.id === id); return release ? release.title : 'Desconocido'; };

  if (loading) return (<div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div><p className="text-slate-500 text-sm">Buscando cintas master...</p></div>);

  if (myReleases.length === 0) {
    return (<div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6"><h3 className="text-lg font-bold text-amber-400 mb-2">Sin Lanzamientos</h3><p className="text-slate-400 text-sm">Aún no tienes discos grabados. Ve a la sección "Lanzamientos" para registrar un EP o LP antes de subir canciones sueltas.</p></div>);
  }

  return (
    <div className="max-w-4xl mt-4" style={{animation: 'fadeIn 0.4s ease-out'}}>
      <form onSubmit={handleSubmit} className={`bg-white/[0.04] border border-white/10 rounded-xl p-6 mb-8 ${isEditing ? 'ring-1 ring-violet-500/30' : ''}`}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/[0.08]">
          <h3 className="text-lg font-bold text-slate-100">{isEditing ? 'Editando Pista' : 'Nuevo Track'}</h3>
          {isEditing && (<button type="button" onClick={() => setIsEditing(null)} className="text-xs font-medium text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">Cancelar</button>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Disco / EP</label>
            <select required value={releaseId} onChange={e => setReleaseId(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all cursor-pointer appearance-none text-sm">
              {myReleases.map(release => (<option key={release.id} value={release.id}>{release.title}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Track #</label>
            <input type="number" min="1" required value={trackNumber} onChange={e => setTrackNumber(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all text-sm font-bold" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Duración</label>
            <input type="text" placeholder="03:45" pattern="^\d{1,3}:[0-5]\d$" title="Usa el formato MM:SS. Ejemplo: 03:45" value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all text-sm" />
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Título de la Canción</label>
            <input type="text" required placeholder="Ej. Psychedelic Black Hole" value={songTitle} onChange={e => setSongTitle(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all text-sm" />
          </div>
        </div>
        <button type="submit" className="mt-6 w-full neo-btn-primary">{isEditing ? 'Guardar Cambios' : '+ Grabar Track'}</button>
      </form>

      <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
        Setlist / Master Tracks
      </h2>

      {myTracks.length === 0 ? (
        <p className="text-slate-500 text-sm">Sin pistas grabadas.</p>
      ) : (
        <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-white/[0.08]">
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider w-12">#</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Título</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Disco</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Dur.</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center">Acción</th>
              </tr></thead>
              <tbody>
                {myTracks.map((track, index) => (
                  <tr key={track.id} className={`border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors ${index % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                    <td className="p-4 font-bold text-center text-slate-300">{track.trackNumber}</td>
                    <td className="p-4 font-medium text-slate-200 text-sm">{track.songTitle}</td>
                    <td className="p-4 text-sm text-slate-500">{getReleaseName(track.releaseId)}</td>
                    <td className="p-4 text-sm text-slate-400">{track.duration || '--:--'}</td>
                    <td className="p-4 text-center space-x-2">
                      <button onClick={() => { setIsEditing(track); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-xs font-medium text-violet-400 hover:text-violet-300 px-2 py-1 rounded hover:bg-violet-500/10 transition-colors cursor-pointer">Editar</button>
                      <button onClick={() => handleDelete(track.id)} className="text-xs font-medium text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}