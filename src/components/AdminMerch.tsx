import { useState, useEffect } from 'react';
import type { MerchandisingDto, ArtistDto, InventoryDto } from '../types/dtos';
import { getMerch, updateMerch, approveMerch } from '../api/merchService';
import { getArtists } from '../api/artistService';
import { createInventory } from '../api/shopService';

export default function AdminMerch() {
  const [merchList, setMerchList] = useState<MerchandisingDto[]>([]);
  const [artists, setArtists] = useState<ArtistDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMerch, setSelectedMerch] = useState<MerchandisingDto | null>(null);
  const [approvalSku, setApprovalSku] = useState('');
  const [approvalStock, setApprovalStock] = useState('50');

  const loadData = async () => {
    setLoading(true);
    try {
      const [merch, arts] = await Promise.all([getMerch(), getArtists()]);
      setMerchList(merch);
      setArtists(arts);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const getBandName = (id: number) => { const a = artists.find(x => x.id === id); return a ? a.bandName : 'Desconocido'; };

  const handleApprove = async () => {
    if (!selectedMerch || !approvalStock) return alert("Faltan datos de aprobación");
    
    // Auto-generar SKU si está en blanco
    const finalSku = approvalSku.trim() || `MERCH-${selectedMerch.id}-${Date.now().toString().slice(-4)}`;
    
    try {
      await approveMerch(selectedMerch.id, { availableStock: parseInt(approvalStock), sku: finalSku });
      alert("Mercancía aprobada y registrada en inventario maestro con SKU: " + finalSku);
      setSelectedMerch(null);
      setApprovalSku('');
      loadData();
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const handleReject = async (merch: MerchandisingDto) => {
    if (!window.confirm("¿Rechazar esta propuesta de mercancía?")) return;
    try { await updateMerch(merch.id, { ...merch, status: 'Rechazado' }); loadData(); } catch (err: any) { alert("Error: " + err.message); }
  };

  if (loading) return (<div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div></div>);

  return (
    <div style={{animation: 'fadeIn 0.4s ease-out'}}>
      <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
        Control de Calidad: Merchandising
      </h2>

      {selectedMerch && (
        <div className="bg-white/[0.06] border border-white/10 rounded-xl p-6 mb-8 max-w-2xl" style={{animation: 'slideUp 0.3s ease-out'}}>
          <div className="flex justify-between items-start border-b border-white/[0.08] pb-3 mb-4">
            <h3 className="text-xl font-bold text-slate-100">Aprobar: {selectedMerch.name}</h3>
            <button onClick={() => setSelectedMerch(null)} className="text-slate-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer">Cancelar</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 mb-1 tracking-wider">Precio Solicitado (Artista)</p>
              <p className="font-bold text-slate-200">${selectedMerch.artistPrice} MXN</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400 mb-1 tracking-wider">Precio Final al Público (+25%)</p>
              <p className="font-bold text-emerald-400">${(selectedMerch.artistPrice * 1.25).toFixed(2)} MXN</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Asignar SKU Oficial</label>
              <input type="text" placeholder="Ej. MERCH-TSHIRT-001" value={approvalSku} onChange={e => setApprovalSku(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2 text-slate-100 outline-none focus:border-violet-500/50 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Stock Inicial Recibido</label>
              <input type="number" min="1" value={approvalStock} onChange={e => setApprovalStock(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2 text-slate-100 outline-none focus:border-violet-500/50 transition-all text-sm" />
            </div>
          </div>
          <button onClick={handleApprove} className="w-full neo-btn-primary">Confirmar Aprobación e Ingresar a Inventario</button>
        </div>
      )}

      <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.08]">
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Artículo</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Banda / Proyecto</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-right">Precio Base</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center">Estado</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center">Resolución</th>
              </tr>
            </thead>
            <tbody>
              {merchList.map((m, idx) => (
                <tr key={m.id} className={`border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors ${idx % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="p-4 text-sm font-medium text-slate-200">
                    {m.name}
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{m.type}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-400">{getBandName(m.artistId)}</td>
                  <td className="p-4 text-right font-bold text-slate-300 text-sm">${m.artistPrice}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${m.status === 'Aceptado' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : m.status === 'Rechazado' ? 'bg-red-500/15 text-red-400 border-red-500/20' : 'bg-amber-500/15 text-amber-400 border-amber-500/20 animate-pulse'}`}>{m.status}</span>
                  </td>
                  <td className="p-4 text-center space-x-2">
                    {m.status === 'Pendiente' ? (
                      <>
                        <button onClick={() => { setSelectedMerch(m); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-xs font-medium text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors cursor-pointer">Revisar</button>
                        <button onClick={() => handleReject(m)} className="text-xs font-medium text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors cursor-pointer">Rechazar</button>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium">RESUELTO</span>
                    )}
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