import { useState, useEffect } from 'react';
import type { PhysicalFormatDto } from '../types/dtos';
import { getPhysicalFormats, createPhysicalFormat, deletePhysicalFormat } from '../api/shopService';

export default function AdminFormats() {
  const [formats, setFormats] = useState<PhysicalFormatDto[]>([]);
  const [name, setName] = useState('');
  const [hasColorOption, setHasColorOption] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try { const data = await getPhysicalFormats(); setFormats(data); } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { name, hasColorOption };
      await createPhysicalFormat(data);
      setName(''); setHasColorOption(false); loadData(); alert("Catálogo de formatos actualizado.");
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleDelete = async (id: number) => {
    if(!window.confirm("¿Seguro que deseas eliminar este formato físico?")) return;
    try { await deletePhysicalFormat(id); loadData(); } catch (err: any) { alert("Error: " + err.message); }
  };

  if (loading) return (<div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div></div>);

  return (
    <div style={{animation: 'fadeIn 0.4s ease-out'}}>
      <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
        Catálogo de Formatos Físicos
      </h2>

      <form onSubmit={handleSubmit} className={`bg-white/[0.04] border border-white/10 rounded-xl p-6 mb-8 max-w-2xl`}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/[0.08]">
          <h3 className="text-lg font-bold text-slate-100">Crear Formato Físico</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Nombre del Formato</label>
            <input type="text" required placeholder="Ej. Vinilo 12 pulgadas" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all text-sm" />
          </div>
          <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
            <input type="checkbox" id="colorOpt" checked={hasColorOption} onChange={e => setHasColorOption(e.target.checked)} className="w-5 h-5 rounded border-2 border-white/20 bg-white/[0.04] checked:bg-violet-500 checked:border-violet-500 cursor-pointer accent-violet-500" />
            <label htmlFor="colorOpt" className="text-sm font-medium text-slate-300 cursor-pointer select-none">¿Admite variantes de color? (Ej. vinilos color especial)</label>
          </div>
        </div>
        <button type="submit" className="mt-6 w-full neo-btn-primary">+ Añadir al Catálogo</button>
      </form>

      <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden max-w-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.08]">
              <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Formato</th>
              <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center">Opc. Color</th>
              <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {formats.map((f, idx) => (
              <tr key={f.id} className={`border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors ${idx % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                <td className="p-4 font-medium text-slate-200 text-sm">{f.name}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${f.hasColorOption ? 'bg-violet-500/15 text-violet-400 border-violet-500/20' : 'bg-slate-500/15 text-slate-400 border-slate-500/20'}`}>{f.hasColorOption ? 'SÍ' : 'NO'}</span>
                </td>
                <td className="p-4 text-center space-x-2">
                  <button onClick={() => handleDelete(f.id)} className="text-xs font-medium text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}