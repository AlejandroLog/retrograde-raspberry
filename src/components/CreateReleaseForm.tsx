import { useState } from 'react';
import { createRelease } from '../api/releaseService';

export default function CreateReleaseForm({ onReleaseAdded }: { onReleaseAdded: () => void }) {
  const [title, setTitle] = useState('');
  const [releaseType, setReleaseType] = useState('EP');
  const [releaseDate, setReleaseDate] = useState('');
  const [artistId, setArtistId] = useState('1'); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRelease({
        title,
        releaseType,
        releaseDate: releaseDate ? new Date(releaseDate).toISOString() : undefined,
        artistId: parseInt(artistId)
      });
      setTitle('');
      setReleaseDate('');
      onReleaseAdded();
    } catch (error) {
      alert("Error al guardar: " + error);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12 font-mono"
    >
      <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-2">
        NUEVO LANZAMIENTO
      </h3>
      
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
            className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-black focus:text-white transition-colors appearance-none"
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
          <label className="block text-sm font-bold uppercase text-black mb-1">ID Artista</label>
          <input 
            type="number" 
            required 
            value={artistId} 
            onChange={e => setArtistId(e.target.value)}
            className="w-full border-2 border-black p-2 bg-white focus:outline-none focus:bg-black focus:text-white transition-colors"
          />
        </div>
      </div>

      <button 
        type="submit" 
        className="mt-8 w-full bg-white text-black border-4 border-black font-black uppercase py-3 hover:bg-black hover:text-white hover:translate-y-1 transition-all"
      >
        [ + Grabar en Base de Datos ]
      </button>
    </form>
  );
}