import { useState, useEffect } from 'react';
import type { MusicalGenreDto, UserDto } from '../types/dtos';
import { getMusicalGenres, createMusicalGenre, updateMusicalGenre, deleteMusicalGenre } from '../api/genreService';

export default function AdminGenres({ currentUser }: { currentUser: UserDto }) {
  const [genres, setGenres] = useState<MusicalGenreDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Estados del Formulario (Sirve para crear y editar)
  const [isEditing, setIsEditing] = useState<MusicalGenreDto | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadGenres = async () => {
    setLoading(true);
    try {
      const data = await getMusicalGenres();
      setGenres(data);
    } catch (err: any) {
      console.error(err);
      setMessage('[!] Error al cargar géneros: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGenres();
  }, []);

  // Detectar si hacemos clic en editar para rellenar los inputs
  useEffect(() => {
    if (isEditing) {
      setName(isEditing.name);
      setDescription(isEditing.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const genreData = { name, description: description || undefined };

      if (isEditing) {
        await updateMusicalGenre(isEditing.id, genreData);
        setMessage(`[OK] Género "${name}" actualizado con éxito.`);
        setIsEditing(null);
      } else {
        await createMusicalGenre(genreData);
        setMessage(`[OK] Género "${name}" registrado correctamente.`);
      }

      loadGenres();
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    }
  };

  const handleDelete = async (genre: MusicalGenreDto) => {
    const confirmDelete = window.confirm(`¿Seguro que deseas eliminar el género "${genre.name}"? Los artistas vinculados conservarán su ID pero el género ya no aparecerá en los catálogos.`);
    if (!confirmDelete) return;

    try {
      await deleteMusicalGenre(genre.id, currentUser.username);
      setMessage(`[OK] Género "${genre.name}" dado de baja.`);
      loadGenres();
    } catch (err: any) {
      alert("Error al eliminar: " + err.message);
    }
  };

  if (loading) return <p className="animate-pulse font-mono p-8">Sincronizando enciclopedias musicales...</p>;

  return (
    <div className="font-mono mt-8 max-w-4xl">
      
      {message && (
        <div className={`p-3 mb-6 font-bold text-white border-2 border-black ${message.includes('[OK]') ? 'bg-green-600' : 'bg-black animate-pulse'}`}>
          {message}
        </div>
      )}

      {/* FORMULARIO DE REGISTRO / EDICIÓN */}
      <form onSubmit={handleSubmit} className={`border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12 ${isEditing ? 'ring-4 ring-yellow-400' : ''}`}>
        <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-2">
          <h3 className="text-2xl font-black uppercase tracking-tighter">
            {isEditing ? 'EDITANDO GÉNERO DE MÚSICA' : 'NUEVA CORRIENTE SONORA'}
          </h3>
          {isEditing && (
            <button 
              type="button" 
              onClick={() => setIsEditing(null)} 
              className="bg-black text-white px-3 py-1 font-bold text-sm uppercase hover:bg-red-600 cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold uppercase mb-1">Nombre de la Corriente o Género</label>
            <input 
              type="text" required placeholder="Ej. Heavy Metal, Dream Pop, Cyberpunk" value={name} onChange={e => setName(e.target.value)}
              className="w-full border-2 border-black p-2 bg-white outline-none focus:bg-black focus:text-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase mb-1">Breve Descripción / Manifiesto</label>
            <textarea 
              rows={2} placeholder="Ej. Guitarras distorsionadas, atmósferas oscuras, tempos acelerados..." value={description} onChange={e => setDescription(e.target.value)}
              className="w-full border-2 border-black p-2 bg-white outline-none focus:bg-black focus:text-white transition-colors resize-none"
            />
          </div>
        </div>

        <button type="submit" className="mt-6 w-full bg-black text-white font-black uppercase py-3 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all cursor-pointer">
          {isEditing ? '[ SALVAGUARDAR CAMBIOS ]' : '[ + DEPOSITAR EN BASE DE DATOS ]'}
        </button>
      </form>

      <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 inline-block bg-black text-white px-2 py-1">
        BIBLIOTECA DE ESTILOS
      </h2>

      {genres.length === 0 ? (
        <p>No hay géneros musicales guardados en el archivo.</p>
      ) : (
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-sm">
                <th className="p-3 border-r-2 border-white w-16 text-center">ID</th>
                <th className="p-3 border-r-2 border-white w-48">Género</th>
                <th className="p-3 border-r-2 border-white">Descripción</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {genres.map((genre, idx) => (
                <tr key={genre.id} className={`border-b-2 border-black hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f4f4f0]'}`}>
                  <td className="p-3 border-r-2 border-black text-center font-bold text-lg">{genre.id}</td>
                  <td className="p-3 border-r-2 border-black font-black uppercase tracking-tight">{genre.name}</td>
                  <td className="p-3 border-r-2 border-black text-xs font-mono text-gray-700 italic">{genre.description || 'Sin descripción asignada.'}</td>
                  <td className="p-3 text-center space-x-3 w-40">
                    <button 
                      onClick={() => { setIsEditing(genre); setMessage(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="text-xs font-bold uppercase underline hover:bg-black hover:text-white px-1 cursor-pointer"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(genre)}
                      className="text-xs font-bold uppercase text-red-600 underline hover:bg-red-600 hover:text-white px-1 cursor-pointer"
                    >
                      Eliminar
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