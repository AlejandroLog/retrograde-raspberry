import { useState, useEffect } from 'react';
import { createRelease, updateRelease } from '../api/releaseService';
import { getArtists } from '../api/artistService';
import type { UserDto, ArtistDto, ReleaseDto } from '../types/dtos';

export default function CreateReleaseForm({ 
  onReleaseSaved, 
  currentUser,
  releaseToEdit,
  onCancelEdit
}: { 
  onReleaseSaved: () => void;
  currentUser: UserDto;
  releaseToEdit?: ReleaseDto | null;
  onCancelEdit?: () => void;
}) {
  const [title, setTitle] = useState('');
  const [releaseType, setReleaseType] = useState('EP');
  const [releaseDate, setReleaseDate] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  
  const [artistId, setArtistId] = useState('');
  const [userArtists, setUserArtists] = useState<ArtistDto[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(true);

  useEffect(() => {
    getArtists()
      .then(artists => {
        const myProjects = artists.filter(a => a.userId === currentUser.id);
        setUserArtists(myProjects);
        if (myProjects.length > 0 && !artistId) {
          setArtistId(myProjects[0].id.toString());
        }
        setLoadingArtists(false);
      })
      .catch(err => {
        console.error("Error cargando artistas", err);
        setLoadingArtists(false);
      });
  }, [currentUser.id]);

  useEffect(() => {
    if (releaseToEdit) {
      setTitle(releaseToEdit.title);
      setReleaseType(releaseToEdit.releaseType);
      setReleaseDate(releaseToEdit.releaseDate ? releaseToEdit.releaseDate.split('T')[0] : '');
      setCoverUrl(releaseToEdit.coverUrl || '');
      setArtistId(releaseToEdit.artistId.toString());
    } else {
      setTitle('');
      setReleaseType('EP');
      setReleaseDate('');
      setCoverUrl('');
    }
  }, [releaseToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId) {
      alert("Debes tener un perfil de artista antes de crear un lanzamiento.");
      return;
    }

    try {
      const releaseData = {
        title,
        releaseType,
        releaseDate: releaseDate ? new Date(releaseDate).toISOString() : undefined,
        artistId: parseInt(artistId),
        coverUrl: coverUrl || undefined
      };

      if (releaseToEdit) {
        await updateRelease(releaseToEdit.id, releaseData);
      } else {
        await createRelease(releaseData);
      }
      
      setTitle('');
      setReleaseDate('');
      setCoverUrl('');
      onReleaseSaved();
    } catch (error) {
      alert("Error al guardar: " + error);
    }
  };

  if (loadingArtists) return <p className="font-mono animate-pulse">Cargando perfil...</p>;

  if (userArtists.length === 0) {
    return (
      <div className="border-4 border-black p-6 bg-yellow-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12 font-mono">
        <h3 className="text-xl font-black uppercase mb-2">FALTA CONFIGURACIÓN</h3>
        <p>Aún no tienes un perfil de artista creado. Ve a la pestaña "Mi Perfil" para registrar tu banda antes de subir música.</p>
      </div>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12 font-mono ${releaseToEdit ? 'ring-4 ring-yellow-400' : ''}`}
    >
      <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-2">
        <h3 className="text-2xl font-black uppercase tracking-tighter">
          {releaseToEdit ? 'EDITANDO LANZAMIENTO' : 'NUEVO LANZAMIENTO'}
        </h3>
        {releaseToEdit && onCancelEdit && (
          <button 
            type="button" 
            onClick={onCancelEdit}
            className="bg-black text-white px-3 py-1 font-bold text-sm uppercase hover:bg-red-600 transition-colors"
          >
            CANCELAR
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold uppercase text-black mb-1">Título de la Obra</label>
          <input 
            type="text" 
            required 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-black focus:text-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase text-black mb-1">Formato</label>
          <select 
            value={releaseType} 
            onChange={e => setReleaseType(e.target.value)}
            className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-black focus:text-white transition-colors appearance-none cursor-pointer"
          >
            <option>Single</option>
            <option>EP</option>
            <option>LP</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold uppercase text-black mb-1">Fecha</label>
          <input 
            type="date" 
            value={releaseDate} 
            onChange={e => setReleaseDate(e.target.value)}
            className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-black focus:text-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-bold uppercase text-black mb-1">Proyecto Musical</label>
          <select 
            required
            value={artistId} 
            onChange={e => setArtistId(e.target.value)}
            className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-black focus:text-white transition-colors appearance-none cursor-pointer"
          >
            {userArtists.map(artist => (
              <option key={artist.id} value={artist.id}>
                {artist.bandName}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-bold uppercase text-black mb-1">URL Portada / Cover Art</label>
          <input 
            type="url" 
            placeholder="https://imgur.com/tu-portada.jpg"
            value={coverUrl} 
            onChange={e => setCoverUrl(e.target.value)}
            className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-black focus:text-white transition-colors"
          />
        </div>
      </div>

      <button 
        type="submit" 
        className="mt-8 w-full bg-white text-black border-4 border-black font-black uppercase py-3 hover:bg-black hover:text-white hover:translate-y-1 transition-all cursor-pointer"
      >
        {releaseToEdit ? '[ GUARDAR CAMBIOS ]' : '[ + GRABAR EN BASE DE DATOS ]'}
      </button>
    </form>
  );
}