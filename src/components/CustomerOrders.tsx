import { useState, useEffect } from 'react';
import type { UserDto, SaleDto, SaleDetailDto, InventoryDto, ReleaseDto, PhysicalFormatDto, MerchandisingDto } from '../types/dtos';
import { getAllSales, getAllSaleDetails, getAllInventory, getPhysicalFormats, deleteSale } from '../api/shopService';
import { getReleases } from '../api/releaseService';
import { getMerch } from '../api/merchService';

export default function CustomerOrders({ currentUser }: { currentUser: UserDto }) {
  const [mySales, setMySales] = useState<SaleDto[]>([]);
  const [saleDetails, setSaleDetails] = useState<SaleDetailDto[]>([]);
  
  const [inventory, setInventory] = useState<InventoryDto[]>([]);
  const [releases, setReleases] = useState<ReleaseDto[]>([]);
  const [formats, setFormats] = useState<PhysicalFormatDto[]>([]);
  const [merch, setMerch] = useState<MerchandisingDto[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<SaleDto | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        salesData, detailsData, invData, relData, formData, merchData
      ] = await Promise.all([
        getAllSales(), getAllSaleDetails(), getAllInventory(), getReleases(), getPhysicalFormats(), getMerch()
      ]);

      const clientSales = salesData
        .filter(s => s.customerEmail.toLowerCase() === currentUser.username.toLowerCase())
        .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

      setMySales(clientSales);
      setSaleDetails(detailsData);
      setInventory(invData);
      setReleases(relData);
      setFormats(formData);
      setMerch(merchData);
    } catch (err) {
      console.error("Error al cargar tus pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentUser.username]);

  const handleCancelOrder = async (id: number) => {
    const confirmCancel = window.confirm("¿Seguro que deseas cancelar y eliminar este pedido? Esta acción es irreversible.");
    if (!confirmCancel) return;

    try {
      await deleteSale(id, currentUser.username);
      if (selectedSale?.id === id) setSelectedSale(null);
      loadData();
      alert("Tu pedido ha sido cancelado y removido con éxito.");
    } catch (err: any) {
      alert("Error al procesar la cancelación: " + err.message);
    }
  };

  const getItemName = (invId: number) => {
    const inv = inventory.find(i => i.id === invId);
    if (!inv) return 'Artículo del catálogo';

    const itemMerch = merch.find(m => m.sku === inv.sku);
    if (itemMerch) return `${itemMerch.name} (${itemMerch.type})`;

    const release = releases.find(r => r.id === inv.releaseId);
    const format = formats.find(f => f.id === inv.physicalFormatId);
    
    return `${release?.title || 'Obra'} [${format?.name || 'Formato'}]`;
  };

  const getSaleDetails = (saleId: number) => saleDetails.filter(sd => sd.saleId === saleId);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 text-sm">Sincronizando recibos de compra...</p>
    </div>
  );

  return (
    <div className="mt-8 max-w-4xl mx-auto" style={{animation: 'fadeIn 0.5s ease-out'}}>
      <div className="flex items-center justify-between mb-8 border-b border-white/[0.05] pb-6">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 flex items-center gap-4 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Historial de Compras
        </h2>
        <span className="bg-white/[0.05] text-slate-300 px-4 py-1.5 rounded-full text-sm font-semibold border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
          {mySales.length} Pedidos
        </span>
      </div>

      {selectedSale && (
        <div className="bg-[#12121a]/80 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-8 mb-10 shadow-2xl relative overflow-hidden" style={{animation: 'slideUp 0.3s ease-out'}}>
          {/* Subtle glow behind receipt */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-600/10 blur-[80px] rounded-full pointer-events-none"></div>

          <div className="flex justify-between items-start border-b border-white/[0.08] pb-6 mb-6 relative z-10">
            <div>
              <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">Recibo Oficial</p>
              <h3 className="text-2xl font-black text-white">Orden #{selectedSale.id}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(selectedSale.saleDate).toLocaleString('es-MX')}
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-bold uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                  {selectedSale.status}
                </span>
              </div>
            </div>
            <button onClick={() => setSelectedSale(null)} className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.1] hover:border-white/20 transition-all cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 mb-6 relative z-10">
            <ul className="divide-y divide-white/[0.06]">
              {getSaleDetails(selectedSale.id).map(detail => (
                <li key={detail.id} className="py-4 px-2 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">📦</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">{getItemName(detail.inventoryId)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Precio Unitario: ${detail.unitPrice} MXN</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">${detail.quantity * detail.unitPrice} <span className="text-xs text-slate-500 font-medium">MXN</span></p>
                    <p className="text-xs text-slate-500 font-medium">Cant: {detail.quantity}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 relative z-10">
            <button 
              onClick={() => handleCancelOrder(selectedSale.id)}
              className="w-full sm:w-auto bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-xs uppercase px-6 py-3 rounded-xl hover:bg-red-500/20 hover:text-red-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Cancelar Pedido
            </button>
            <div className="text-right w-full sm:w-auto">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Total Pagado</p>
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">
                ${selectedSale.totalAmount} <span className="text-sm text-slate-500 tracking-normal font-bold">MXN</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {mySales.length === 0 ? (
        <div className="relative overflow-hidden rounded-3xl p-16 text-center bg-[#12121a] border border-white/[0.04] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-600/10 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-200 mb-2">Aún no tienes compras</h3>
            <p className="text-slate-500 font-medium max-w-sm">No has realizado transacciones en la plataforma. ¡Apoya a tus artistas adquiriendo su material!</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#12121a]/80 backdrop-blur-xl border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/[0.05]">
                <th className="p-5 text-xs font-bold uppercase text-slate-500 tracking-widest text-center w-24">Ticket</th>
                <th className="p-5 text-xs font-bold uppercase text-slate-500 tracking-widest">Fecha</th>
                <th className="p-5 text-xs font-bold uppercase text-slate-500 tracking-widest text-center">Estado</th>
                <th className="p-5 text-xs font-bold uppercase text-slate-500 tracking-widest text-right">Monto</th>
                <th className="p-5 text-xs font-bold uppercase text-slate-500 tracking-widest text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {mySales.map((sale) => (
                <tr key={sale.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-5 text-center font-black text-slate-300">#{sale.id}</td>
                  <td className="p-5 text-sm font-medium text-slate-300 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(sale.saleDate).toLocaleDateString('es-MX')}
                  </td>
                  <td className="p-5 text-center">
                    <span className="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      {sale.status}
                    </span>
                  </td>
                  <td className="p-5 text-right font-black text-white">${sale.totalAmount} <span className="text-xs text-slate-500">MXN</span></td>
                  <td className="p-5 text-center">
                    {/* Botones de acción text-based */}
                    <div className="hidden md:flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setSelectedSale(sale); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="px-3 py-1.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 font-semibold text-xs uppercase tracking-wider hover:bg-violet-500 hover:text-white hover:shadow-[0_0_10px_rgba(139,92,246,0.4)] transition-all cursor-pointer"
                      >
                        Ver Detalles
                      </button>
                      <button 
                        onClick={() => handleCancelOrder(sale.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-semibold text-xs uppercase tracking-wider hover:bg-red-500 hover:text-white hover:shadow-[0_0_10px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                    {/* Acciones para móvil (siempre visibles) */}
                    <div className="md:hidden flex items-center justify-center gap-3">
                      <span className="text-xs text-violet-400 underline cursor-pointer" onClick={() => { setSelectedSale(sale); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Ver</span>
                      <span className="text-xs text-red-400 underline cursor-pointer" onClick={() => handleCancelOrder(sale.id)}>Anular</span>
                    </div>
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