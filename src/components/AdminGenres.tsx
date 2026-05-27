import { useState, useEffect } from 'react';
import type { MusicalGenreDto } from '../types/dtos';
import { getMusicalGenres, createMusicalGenre, updateMusicalGenre, deleteMusicalGenre } from '../api/genreService';

export default function AdminGenres() {
  const [genres, setGenres] = useState<MusicalGenreDto[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isEditing, setIsEditing] = useState<MusicalGenreDto | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try { const data = await getMusicalGenres(); setGenres(data); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (isEditing) { setName(isEditing.name); setDescription(isEditing.description || ''); } else { setName(''); setDescription(''); }
  }, [isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { name, description: description || undefined };
      if (isEditing) { await updateMusicalGenre(isEditing.id, data); } else { await createMusicalGenre(data); }
      setIsEditing(null); loadData(); alert("Catálogo de géneros actualizado.");
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleDelete = async (id: number) => {
    if(!window.confirm("¿Seguro que deseas eliminar este género musical? Podría afectar a artistas vinculados.")) return;
    try { await deleteMusicalGenre(id, 'Admin'); loadData(); } catch (err: any) { alert("Error: " + err.message); }
  };

  if (loading) return (<div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div></div>);

  return (
    <div style={{animation: 'fadeIn 0.4s ease-out'}}>
      <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
        Taxonomía de Géneros Musicales
      </h2>

      <form onSubmit={handleSubmit} className={`bg-white/[0.04] border border-white/10 rounded-xl p-6 mb-8 max-w-3xl ${isEditing ? 'ring-1 ring-violet-500/30' : ''}`}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/[0.08]">
          <h3 className="text-lg font-bold text-slate-100">{isEditing ? 'Modificando Género' : 'Registrar Nuevo Género'}</h3>
          {isEditing && (<button type="button" onClick={() => setIsEditing(null)} className="text-xs font-medium text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">Cancelar Edición</button>)}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Etiqueta del Género</label>
            <input type="text" required placeholder="Ej. Shoegaze" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Descripción Breve (Opcional)</label>
            <input type="text" placeholder="Características sonoras..." value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all text-sm" />
          </div>
        </div>
        <button type="submit" className="mt-6 w-full neo-btn-primary">{isEditing ? 'Actualizar Género' : '+ Añadir a la Base'}</button>
      </form>

      <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden max-w-3xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.08]">
              <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Género</th>
              <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Descripción</th>
              <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {genres.map((g, idx) => (
              <tr key={g.id} className={`border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors ${idx % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                <td className="p-4 font-bold text-slate-200 text-sm">{g.name}</td>
                <td className="p-4 text-sm text-slate-400">{g.description || <span className="italic text-slate-600">Sin descripción</span>}</td>
                <td className="p-4 text-center space-x-2">
                  <button onClick={() => { setIsEditing(g); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-xs font-medium text-violet-400 hover:text-violet-300 px-2 py-1 rounded hover:bg-violet-500/10 transition-colors cursor-pointer">Editar</button>
                  <button onClick={() => handleDelete(g.id)} className="text-xs font-medium text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}