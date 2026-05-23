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
      const [allReleases, allArtists] = await Promise.all([
        getReleases(),
        getArtists()
      ]);

      const myArtists = allArtists.filter(a => a.userId === currentUser.id);
      setUserArtists(myArtists);
      const myArtistIds = myArtists.map(a => a.id);

      const myReleases = allReleases.filter(r => myArtistIds.includes(r.artistId));
      setReleases(myReleases);

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  const getBandName = (id: number) => {
    const artist = userArtists.find(a => a.id === id);
    return artist ? artist.bandName : 'Desconocido';
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("¿Seguro que deseas destruir este lanzamiento? Ya no aparecerá en el catálogo.");
    if (!confirmDelete) return;

    try {
      await deleteRelease(id, currentUser.username);
      fetchData(); 
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const handleSaveCompleted = () => {
    setEditingRelease(null); 
    fetchData(); 
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      
      <CreateReleaseForm 
        onReleaseSaved={handleSaveCompleted} 
        currentUser={currentUser} 
        releaseToEdit={editingRelease}
        onCancelEdit={() => setEditingRelease(null)}
      />

      <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 font-mono inline-block bg-black text-white px-2 py-1">
        CATÁLOGO DE LA BANDA
      </h2>
      
      {loading ? (
        <p className="font-mono text-xl animate-pulse">Leyendo discos...</p>
      ) : releases.length === 0 ? (
        <p className="font-mono text-xl">Sin señales. El catálogo está vacío.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono">
          {releases.map((release) => (
            <div 
              key={release.id} 
              className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all overflow-hidden flex flex-col"
            >
              <div className="h-48 border-b-4 border-black bg-gray-200 overflow-hidden flex items-center justify-center">
                {release.coverUrl ? (
                  <img src={release.coverUrl} alt={`Portada de ${release.title}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 font-bold tracking-widest uppercase">SIN PORTADA</span>
                )}
              </div>
              
              <div className="p-5 flex-grow">
                <h3 className="font-black text-xl uppercase tracking-tighter mb-1 break-words">
                  {release.title}
                </h3>
                <p className="text-sm font-bold uppercase mb-4 text-gray-600">
                  {getBandName(release.artistId)}
                </p>
                
                <div className="border-t-2 border-black pt-2 mb-4">
                  <p className="text-sm font-bold uppercase">Formato: <span className="font-normal">{release.releaseType}</span></p>
                  {release.releaseDate && (
                    <p className="text-sm font-bold uppercase">
                      Lanzamiento: <span className="font-normal">{new Date(release.releaseDate).toLocaleDateString()}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2 border-t-2 border-black border-dashed pt-4 mt-auto">
                  <button 
                    onClick={() => {
                      setEditingRelease(release);
                      window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube la pantalla al formulario
                    }}
                    className="flex-1 border-2 border-black bg-white text-black font-bold uppercase text-xs py-2 hover:bg-black hover:text-white transition-colors"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(release.id)}
                    className="flex-1 border-2 border-red-600 bg-white text-red-600 font-bold uppercase text-xs py-2 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    Eliminar
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}