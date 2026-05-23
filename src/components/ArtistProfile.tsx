import { useState, useEffect } from 'react';
import type { UserDto, ArtistDto, MusicalGenreDto } from '../types/dtos';
import { updateUser, deleteUser } from '../api/userService';
import { getArtists, createArtist, updateArtist } from '../api/artistService';
import { getMusicalGenres } from '../api/genreService';

export default function ArtistProfile({ 
  currentUser, 
  onLogout 
}: { 
  currentUser: UserDto;
  onLogout: () => void;
}) {
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
    Promise.all([
      getMusicalGenres(),
      getArtists()
    ])
    .then(([fetchedGenres, artists]) => {
      setGenres(fetchedGenres);
      
      if (fetchedGenres.length > 0 && !genreId) {
        setGenreId(fetchedGenres[0].id.toString());
      }

      const foundArtist = artists.find(a => a.userId === currentUser.id);
      if (foundArtist) {
        setArtistProfile(foundArtist);
        setBandName(foundArtist.bandName);
        setContactEmail(foundArtist.contactEmail || '');
        setGenreId(foundArtist.musicalGenreId.toString());
      }
      
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setMessage('[!] Error al cargar datos: ' + err.message);
      setLoading(false);
    });
  }, [currentUser.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    if (!genreId) {
      setMessage('[!] Debes seleccionar un género musical.');
      return;
    }
    
    try {
      if (password) {
        await updateUser(currentUser.id, {
          username: username,
          passwordHash: password,
          role: currentUser.role
        });
      }

      const artistData = {
        userId: currentUser.id,
        musicalGenreId: parseInt(genreId),
        bandName: bandName,
        contactEmail: contactEmail
      };

      if (artistProfile) {
        await updateArtist(artistProfile.id, artistData);
      } else {
        const newArtist = await createArtist(artistData);
        setArtistProfile(newArtist);
      }

      setMessage('[OK] Perfil actualizado correctamente.');
      setPassword(''); 
    } catch (err: any) {
      setMessage('[!] Error: ' + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "¿ESTÁS SEGURO? Esta acción dará de baja tu cuenta del catálogo."
    );
    if (!confirmDelete) return;

    try {
      await deleteUser(currentUser.id, currentUser.username);
      alert("Cuenta eliminada. Desconectando...");
      onLogout(); 
    } catch (err: any) {
      setMessage('[!] Error al eliminar cuenta: ' + err.message);
    }
  };

  if (loading) return <p className="animate-pulse font-mono">Cargando base de datos...</p>;

  return (
    <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl font-mono mb-8">
      <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-2">
        ESTACIÓN DE CONTROL
      </h3>

      {message && (
        <div className={`p-3 mb-6 font-bold text-white border-2 border-black ${message.includes('[OK]') ? 'bg-green-600' : 'bg-black animate-pulse'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="border-2 border-black p-4 bg-[#f4f4f0]">
          <h4 className="font-bold uppercase mb-4 underline">Credenciales de Sistema</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold uppercase mb-1">Usuario</label>
              <input 
                type="text" 
                required 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full border-2 border-black p-2 bg-white focus:bg-black focus:text-white outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase mb-1">Nueva Contraseña</label>
              <input 
                type="password" 
                placeholder="Dejar en blanco para conservar"
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full border-2 border-black p-2 bg-white focus:bg-black focus:text-white outline-none transition-colors placeholder:text-xs"
              />
            </div>
          </div>
        </div>

        <div className="border-2 border-black p-4 bg-[#f4f4f0]">
          <h4 className="font-bold uppercase mb-4 underline">Proyecto Musical</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold uppercase mb-1">Nombre de la Banda</label>
              <input 
                type="text" 
                required
                placeholder="Ej. Sonic Fock"
                value={bandName} 
                onChange={e => setBandName(e.target.value)}
                className="w-full border-2 border-black p-2 bg-white focus:bg-black focus:text-white outline-none transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold uppercase mb-1">Email de Contacto</label>
                <input 
                  type="email" 
                  value={contactEmail} 
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full border-2 border-black p-2 bg-white focus:bg-black focus:text-white outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase mb-1">Género Principal</label>
                
                <select 
                  required
                  value={genreId} 
                  onChange={e => setGenreId(e.target.value)}
                  className="w-full border-2 border-black p-2 bg-white focus:bg-black focus:text-white outline-none transition-colors appearance-none cursor-pointer"
                >
                  {genres.length === 0 ? (
                    <option value="">Cargando géneros...</option>
                  ) : (
                    genres.map(genre => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))
                  )}
                </select>
                
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-black text-white font-black uppercase py-3 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all cursor-pointer"
        >
          [ GUARDAR CAMBIOS ]
        </button>
      </form>

      <div className="mt-12 pt-6 border-t-4 border-black border-dashed">
        <h4 className="font-black text-red-600 uppercase mb-2">Zona de Peligro</h4>
        <p className="text-sm mb-4">Eliminar tu cuenta ocultará todo tu catálogo del sistema.</p>
        <button 
          onClick={handleDeleteAccount}
          className="bg-white text-red-600 border-4 border-red-600 font-black uppercase py-2 px-4 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
        >
          Destruir Cuenta
        </button>
      </div>
    </div>
  );
}