import { useState, useEffect } from 'react';
import type { InventoryDto, ReleaseDto, PhysicalFormatDto } from '../types/dtos';
import { getAllInventory, createInventory, deleteInventory, getPhysicalFormats } from '../api/shopService';
import { getReleases } from '../api/releaseService';

export default function AdminInventory() {
  const [inventoryList, setInventoryList] = useState<InventoryDto[]>([]);
  const [releases, setReleases] = useState<ReleaseDto[]>([]);
  const [formats, setFormats] = useState<PhysicalFormatDto[]>([]);
  
  const [releaseId, setReleaseId] = useState('');
  const [physicalFormatId, setPhysicalFormatId] = useState('');
  const [stock, setStock] = useState('10');
  const [salePrice, setSalePrice] = useState('250');
  
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [inv, rel, form] = await Promise.all([getAllInventory(), getReleases(), getPhysicalFormats()]);
      setInventoryList(inv); setReleases(rel); setFormats(form);
      if (rel.length > 0 && !releaseId) setReleaseId(rel[0].id.toString());
      if (form.length > 0 && !physicalFormatId) setPhysicalFormatId(form[0].id.toString());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseId || !physicalFormatId) return alert("Faltan datos");
    try {
      const data = { releaseId: parseInt(releaseId), physicalFormatId: parseInt(physicalFormatId), stock: parseInt(stock), salePrice: parseFloat(salePrice) };
      await createInventory(data);
      setStock('10'); setSalePrice('250'); loadData(); alert("Inventario actualizado.");
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleDelete = async (id: number) => {
    if(!window.confirm("¿Eliminar lote de inventario?")) return;
    try { await deleteInventory(id); loadData(); } catch (err: any) { alert("Error: " + err.message); }
  };

  const getReleaseName = (id: number) => releases.find(r => r.id === id)?.title || 'Desconocido';
  const getFormatName = (id: number) => formats.find(f => f.id === id)?.name || 'Desconocido';

  if (loading) return (<div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div><p className="text-slate-500 text-sm font-medium tracking-wider uppercase">Leyendo inventario...</p></div>);

  return (
    <div style={{animation: 'fadeIn 0.4s ease-out'}}>
      <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
        Almacén de Obras Físicas
      </h2>

      <form onSubmit={handleSubmit} className={`bg-white/[0.04] border border-white/10 rounded-xl p-6 mb-8`}>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/[0.08]">
          <h3 className="text-lg font-bold text-slate-100">Ingresar Nuevo Lote</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Obra / Lanzamiento</label>
            <select required value={releaseId} onChange={e => setReleaseId(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all appearance-none cursor-pointer text-sm">
              {releases.map(r => (<option key={r.id} value={r.id}>{r.title}</option>))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Formato Físico</label>
            <select required value={physicalFormatId} onChange={e => setPhysicalFormatId(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all appearance-none cursor-pointer text-sm">
              {formats.map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Stock (Copias)</label>
            <input type="number" min="0" required value={stock} onChange={e => setStock(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Precio Venta Público ($)</label>
            <input type="number" min="1" step="0.01" required value={salePrice} onChange={e => setSalePrice(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all text-sm" />
          </div>
        </div>
        <button type="submit" className="mt-6 w-full neo-btn-primary">+ Ingresar al Almacén</button>
      </form>

      <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.08]">
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">SKU</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Obra</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Formato</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center">Stock</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-right">Precio</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventoryList.map((inv, idx) => (
                <tr key={inv.id} className={`border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors ${idx % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="p-4 font-mono text-xs text-slate-500">{inv.sku}</td>
                  <td className="p-4 text-sm font-medium text-slate-200">{getReleaseName(inv.releaseId)}</td>
                  <td className="p-4 text-sm text-slate-400">{getFormatName(inv.physicalFormatId)}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${inv.stock < 5 ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'text-slate-300'}`}>{inv.stock}</span>
                  </td>
                  <td className="p-4 text-right font-bold text-emerald-400 text-sm">${inv.salePrice}</td>
                  <td className="p-4 text-center space-x-2">
                    <button onClick={() => handleDelete(inv.id)} className="text-xs font-medium text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}