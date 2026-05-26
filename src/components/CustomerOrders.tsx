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
    <div className="mt-8 max-w-4xl" style={{animation: 'fadeIn 0.4s ease-out'}}>
      <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
        Historial de Compras
      </h2>

      {selectedSale && (
        <div className="bg-white/[0.06] border border-white/10 rounded-xl p-6 mb-8" style={{animation: 'slideUp 0.3s ease-out'}}>
          <div className="flex justify-between items-start border-b border-white/[0.08] pb-3 mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-100">Orden de Compra #{selectedSale.id}</h3>
              <p className="text-xs text-slate-500 mt-1">Fecha: {new Date(selectedSale.saleDate).toLocaleString('es-MX')}</p>
              <p className="text-xs text-slate-500">Estado: {selectedSale.status}</p>
            </div>
            <button onClick={() => setSelectedSale(null)} className="text-slate-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer">
              Cerrar
            </button>
          </div>

          <ul className="divide-y divide-white/[0.06] bg-white/[0.03] rounded-lg mb-4">
            {getSaleDetails(selectedSale.id).map(detail => (
              <li key={detail.id} className="p-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-slate-200">{getItemName(detail.inventoryId)}</p>
                  <p className="text-xs text-slate-500">Precio Unitario: ${detail.unitPrice} MXN</p>
                </div>
                <div className="font-bold text-slate-100">
                  {detail.quantity} u. — ${detail.quantity * detail.unitPrice}
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center pt-2">
            <button 
              onClick={() => handleCancelOrder(selectedSale.id)}
              className="bg-red-500/10 text-red-400 border border-red-500/20 font-medium text-xs uppercase px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer"
            >
              Cancelar Pedido
            </button>
            <p className="text-lg font-bold text-slate-100">
              Total: <span className="gradient-text">${selectedSale.totalAmount} MXN</span>
            </p>
          </div>
        </div>
      )}

      {mySales.length === 0 ? (
        <p className="border border-dashed border-white/10 rounded-xl p-8 text-center text-slate-500 text-sm">Aún no has realizado transacciones en la plataforma.</p>
      ) : (
        <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.08]">
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center w-20">Ticket</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Fecha</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center">Estado</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-right">Monto</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {mySales.map((sale, idx) => (
                <tr key={sale.id} className={`border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors ${idx % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="p-4 text-center font-bold text-sm text-slate-300">#{sale.id}</td>
                  <td className="p-4 text-sm text-slate-300">{new Date(sale.saleDate).toLocaleDateString('es-MX')}</td>
                  <td className="p-4 text-center">
                    <span className="rounded-full px-3 py-1 text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      {sale.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-sm text-slate-200">${sale.totalAmount}</td>
                  <td className="p-4 text-center space-x-2">
                    <button 
                      onClick={() => { setSelectedSale(sale); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="text-xs font-medium text-violet-400 hover:text-violet-300 px-2 py-1 rounded hover:bg-violet-500/10 transition-colors cursor-pointer"
                    >
                      Ver Detalle
                    </button>
                    <button 
                      onClick={() => handleCancelOrder(sale.id)}
                      className="text-xs font-medium text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      Cancelar
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