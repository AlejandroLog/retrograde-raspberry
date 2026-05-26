import { useState, useEffect } from 'react';
import type { SaleDto, SaleDetailDto, InventoryDto, ReleaseDto, PhysicalFormatDto } from '../types/dtos';
import { getAllSales, getAllSaleDetails, getAllInventory, getPhysicalFormats, deleteSale } from '../api/shopService';
import { getReleases } from '../api/releaseService';

export default function AdminOrders() {
  const [sales, setSales] = useState<SaleDto[]>([]);
  const [saleDetails, setSaleDetails] = useState<SaleDetailDto[]>([]);
  const [inventory, setInventory] = useState<InventoryDto[]>([]);
  const [releases, setReleases] = useState<ReleaseDto[]>([]);
  const [formats, setFormats] = useState<PhysicalFormatDto[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<SaleDto | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, sdData, inv, rel, form] = await Promise.all([
        getAllSales(), getAllSaleDetails(), getAllInventory(), getReleases(), getPhysicalFormats()
      ]);
      setSales(sData.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()));
      setSaleDetails(sdData); setInventory(inv); setReleases(rel); setFormats(form);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCancelOrder = async (id: number) => {
    if (!window.confirm("¿Revocar y eliminar esta orden definitivamente del sistema?")) return;
    try { await deleteSale(id, 'Admin'); if (selectedSale?.id === id) setSelectedSale(null); loadData(); alert("Orden revocada y eliminada."); } catch (err: any) { alert("Error: " + err.message); }
  };

  const getItemName = (invId: number) => {
    const inv = inventory.find(i => i.id === invId);
    if (!inv) return 'Desconocido';
    if (inv.sku && inv.sku.startsWith('MERCH')) return `Merch SKU: ${inv.sku}`;
    const release = releases.find(r => r.id === inv.releaseId);
    const format = formats.find(f => f.id === inv.physicalFormatId);
    return `${release?.title || 'Obra'} [${format?.name || 'Fmt'}]`;
  };

  if (loading) return (<div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div></div>);

  return (
    <div style={{animation: 'fadeIn 0.4s ease-out'}}>
      <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
        Monitor de Envíos y Órdenes
      </h2>

      {selectedSale && (
        <div className="bg-white/[0.06] border border-white/10 rounded-xl p-6 mb-8 max-w-4xl" style={{animation: 'slideUp 0.3s ease-out'}}>
          <div className="flex justify-between items-start border-b border-white/[0.08] pb-3 mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-100">Factura #{selectedSale.id}</h3>
              <p className="text-xs text-slate-500 mt-1">Cliente: <span className="text-slate-300 font-medium">{selectedSale.customerEmail}</span></p>
              <p className="text-xs text-slate-500">Fecha: {new Date(selectedSale.saleDate).toLocaleString('es-MX')}</p>
            </div>
            <button onClick={() => setSelectedSale(null)} className="text-slate-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer">
              Cerrar Panel
            </button>
          </div>

          <table className="w-full text-left mb-6">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs font-semibold uppercase text-slate-400 tracking-wider">
                <th className="pb-2">Artículo</th>
                <th className="pb-2 text-center">Cant.</th>
                <th className="pb-2 text-right">P. Unitario</th>
                <th className="pb-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {saleDetails.filter(sd => sd.saleId === selectedSale.id).map((detail, i) => (
                <tr key={detail.id} className={`border-b border-white/[0.06] text-sm ${i % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="py-3 text-slate-200">{getItemName(detail.inventoryId)}</td>
                  <td className="py-3 text-center text-slate-300">{detail.quantity}</td>
                  <td className="py-3 text-right text-slate-400">${detail.unitPrice}</td>
                  <td className="py-3 text-right font-bold text-slate-200">${detail.quantity * detail.unitPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center pt-2">
            <button onClick={() => handleCancelOrder(selectedSale.id)} className="text-xs font-medium text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors cursor-pointer uppercase">
              Revocar y Eliminar Orden
            </button>
            <p className="text-lg font-bold text-slate-100">
              Gran Total: <span className="gradient-text">${selectedSale.totalAmount} MXN</span>
            </p>
          </div>
        </div>
      )}

      <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden max-w-4xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.08]">
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider w-24">Ticket</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Fecha de Emisión</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Cliente</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-right">Monto</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center">Gestión</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, idx) => (
                <tr key={sale.id} className={`border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors ${idx % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="p-4 text-center font-bold text-sm text-slate-300">#{sale.id}</td>
                  <td className="p-4 text-sm text-slate-400">{new Date(sale.saleDate).toLocaleDateString('es-MX')}</td>
                  <td className="p-4 text-sm font-medium text-slate-200">{sale.customerEmail}</td>
                  <td className="p-4 text-right font-bold text-emerald-400 text-sm">${sale.totalAmount}</td>
                  <td className="p-4 text-center space-x-2">
                    <button onClick={() => { setSelectedSale(sale); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-xs font-medium text-violet-400 hover:text-violet-300 px-3 py-1.5 rounded-lg border border-violet-500/20 hover:bg-violet-500/10 transition-colors cursor-pointer">Ver Detalles</button>
                    <button onClick={() => handleCancelOrder(sale.id)} className="text-xs font-medium text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors cursor-pointer">Revocar</button>
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