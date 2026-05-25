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
      const [allArtists, allReleases, allTracks] = await Promise.all([
        getArtists(),
        getReleases(),
        getTracks()
      ]);

      const myArtistIds = allArtists
        .filter(a => a.userId === currentUser.id)
        .map(a => a.id);

      const releases = allReleases.filter(r => myArtistIds.includes(r.artistId));
      setMyReleases(releases);

      if (releases.length > 0 && !releaseId && !isEditing) {
        setReleaseId(releases[0].id.toString());
      }

      const releaseIds = releases.map(r => r.id);
      const tracks = allTracks.filter(t => releaseIds.includes(t.releaseId));
      
      tracks.sort((a, b) => {
        if (a.releaseId === b.releaseId) {
          return a.trackNumber - b.trackNumber;
        }
        return a.releaseId - b.releaseId;
      });

      setMyTracks(tracks);
    } catch (err) {
      console.error("Error cargando pistas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  useEffect(() => {
    if (isEditing) {
      setReleaseId(isEditing.releaseId.toString());
      setTrackNumber(isEditing.trackNumber.toString());
      setSongTitle(isEditing.songTitle);
      setDuration(isEditing.duration || '');
    } else {
      setSongTitle('');
      setDuration('');
      
      if (releaseId) {
        const tracksForThisRelease = myTracks.filter(t => t.releaseId.toString() === releaseId);
        if (tracksForThisRelease.length > 0) {
          const maxTrack = Math.max(...tracksForThisRelease.map(t => t.trackNumber));
          setTrackNumber((maxTrack + 1).toString());
        } else {
          setTrackNumber('1');
        }
      }
    }
  }, [isEditing, releaseId, myTracks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseId) {
      alert("Debes crear un Lanzamiento (EP/LP) antes de poder agregarle pistas.");
      return;
    }

    if (duration) {
      const durationRegex = /^\d{1,3}:[0-5]\d$/;
      if (!durationRegex.test(duration)) {
        alert("[ERROR] La duración es inválida. Usa el formato MM:SS (ejemplo: 03:45 o 12:30). Los segundos no pueden pasar de 59.");
        return;
      }
    }

    const tNumber = parseInt(trackNumber);

    // Validación anti-duplicados
    if (!isEditing) {
      const isDuplicate = myTracks.some(
        t => t.releaseId.toString() === releaseId && t.trackNumber === tNumber
      );
      if (isDuplicate) {
        alert(`[ERROR] El track #${tNumber} ya existe en este lanzamiento. Por favor, verifica el Setlist.`);
        return;
      }
    }

    try {
      const trackData = {
        releaseId: parseInt(releaseId),
        trackNumber: tNumber,
        songTitle,
        duration: duration || undefined
      };

      if (isEditing) {
        await updateTrack(isEditing.id, trackData);
      } else {
        await createTrack(trackData);
      }

      setIsEditing(null);
      loadData(); 
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar esta pista del catálogo?")) return;
    try {
      await deleteTrack(id, currentUser.username);
      loadData();
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const getReleaseName = (id: number) => {
    const release = myReleases.find(r => r.id === id);
    return release ? release.title : 'Desconocido';
  };

  if (loading) return <p className="animate-pulse font-mono p-8">Buscando cintas master...</p>;

  if (myReleases.length === 0) {
    return (
      <div className="border-4 border-black p-6 bg-yellow-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono">
        <h3 className="text-xl font-black uppercase mb-2">SIN LANZAMIENTOS</h3>
        <p>Aún no tienes discos grabados. Ve a la sección "Lanzamientos" para registrar un EP o LP antes de subir canciones sueltas.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl font-mono mt-4">
      
      <form 
        onSubmit={handleSubmit}
        className={`border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12 ${isEditing ? 'ring-4 ring-yellow-400' : ''}`}
      >
        <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-2">
          <h3 className="text-2xl font-black uppercase tracking-tighter">
            {isEditing ? 'EDITANDO PISTA' : 'NUEVO TRACK'}
          </h3>
          {isEditing && (
            <button 
              type="button" 
              onClick={() => setIsEditing(null)}
              className="bg-black text-white px-3 py-1 font-bold text-sm uppercase hover:bg-red-600 transition-colors cursor-pointer"
            >
              CANCELAR
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold uppercase mb-1">Disco / EP</label>
            <select 
              required
              value={releaseId} 
              onChange={e => setReleaseId(e.target.value)}
              className="w-full border-2 border-black p-2 bg-white outline-none focus:bg-black focus:text-white transition-colors cursor-pointer appearance-none uppercase"
            >
              {myReleases.map(release => (
                <option key={release.id} value={release.id}>
                  {release.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase mb-1">Track #</label>
            <input 
              type="number" 
              min="1"
              required 
              value={trackNumber} 
              onChange={e => setTrackNumber(e.target.value)}
              className="w-full border-2 border-black p-2 bg-white outline-none focus:bg-black focus:text-white transition-colors font-black"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase mb-1">Duración</label>
            <input 
              type="text" 
              placeholder="03:45"
              pattern="^\d{1,3}:[0-5]\d$"
              title="Usa el formato MM:SS. Ejemplo: 03:45"
              value={duration} 
              onChange={e => setDuration(e.target.value)}
              className="w-full border-2 border-black p-2 bg-white outline-none focus:bg-black focus:text-white transition-colors"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-sm font-bold uppercase mb-1">Título de la Canción</label>
            <input 
              type="text" 
              required 
              placeholder="Ej. Psychedelic Black Hole"
              value={songTitle} 
              onChange={e => setSongTitle(e.target.value)}
              className="w-full border-2 border-black p-2 bg-white outline-none focus:bg-black focus:text-white transition-colors"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="mt-6 w-full bg-black text-white font-black uppercase py-3 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all cursor-pointer"
        >
          {isEditing ? '[ GUARDAR CAMBIOS ]' : '[ + GRABAR TRACK ]'}
        </button>
      </form>


      <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 inline-block bg-black text-white px-2 py-1">
        SETLIST / MASTER TRACKS
      </h2>

      {myTracks.length === 0 ? (
        <p className="font-mono text-xl">Sin pistas grabadas.</p>
      ) : (
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white uppercase text-sm">
                  <th className="p-3 border-r-2 border-white">#</th>
                  <th className="p-3 border-r-2 border-white">Título</th>
                  <th className="p-3 border-r-2 border-white">Disco</th>
                  <th className="p-3 border-r-2 border-white">Dur.</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {myTracks.map((track, index) => (
                  <tr 
                    key={track.id} 
                    className={`border-b-2 border-black hover:bg-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-[#f4f4f0]'}`}
                  >
                    <td className="p-3 border-r-2 border-black font-black text-center w-12 text-lg">{track.trackNumber}</td>
                    <td className="p-3 border-r-2 border-black font-bold uppercase">{track.songTitle}</td>
                    <td className="p-3 border-r-2 border-black text-sm uppercase font-bold text-gray-600">{getReleaseName(track.releaseId)}</td>
                    <td className="p-3 border-r-2 border-black text-sm">{track.duration || '--:--'}</td>
                    <td className="p-3 text-center space-x-2">
                      <button 
                        onClick={() => {
                          setIsEditing(track);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-xs uppercase font-bold underline hover:bg-black hover:text-white px-1 cursor-pointer"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(track.id)}
                        className="text-xs uppercase font-bold text-red-600 underline hover:bg-red-600 hover:text-white px-1 cursor-pointer"
                      >
                        Eliminar
                      </button>
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