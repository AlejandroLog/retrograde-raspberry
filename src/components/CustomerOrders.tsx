import { useState, useEffect } from 'react';
import type { UserDto, SaleDto, SaleDetailDto, InventoryDto, ReleaseDto, PhysicalFormatDto, MerchandisingDto } from '../types/dtos';
import { getAllSales, getAllSaleDetails, getAllInventory, getPhysicalFormats, deleteSale } from '../api/shopService';
import { getReleases } from '../api/releaseService';
import { getMerch } from '../api/merchService';

export default function CustomerOrders({ currentUser }: { currentUser: UserDto }) {
  const [mySales, setMySales] = useState<SaleDto[]>([]);
  const [saleDetails, setSaleDetails] = useState<SaleDetailDto[]>([]);
  
  // Estados para resolución de nombres
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

      // Filtrar únicamente las ventas que pertenecen a este cliente
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

    // Resolver si el SKU pertenece a Merch
    const itemMerch = merch.find(m => m.sku === inv.sku);
    if (itemMerch) return `${itemMerch.name} (${itemMerch.type})`;

    // Resolver si pertenece a un Lanzamiento Musical
    const release = releases.find(r => r.id === inv.releaseId);
    const format = formats.find(f => f.id === inv.physicalFormatId);
    
    return `${release?.title || 'Obra'} [${format?.name || 'Formato'}]`;
  };

  const getSaleDetails = (saleId: number) => saleDetails.filter(sd => sd.saleId === saleId);

  if (loading) return <p className="font-mono animate-pulse p-8">Sincronizando recibos de compra...</p>;

  return (
    <div className="font-mono mt-8 max-w-4xl">
      <h2 className="text-3xl font-black uppercase mb-6 inline-block bg-black text-white px-2 py-0.5">
        HISTORIAL DE COMPRAS
      </h2>

      {/* DETALLE EXPANDIDO DEL TICKET */}
      {selectedSale && (
        <div className="border-4 border-black p-6 bg-yellow-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 ring-4 ring-black">
          <div className="flex justify-between items-start border-b-4 border-black pb-3 mb-4">
            <div>
              <h3 className="text-xl font-black">ORDEN DE COMPRA #{selectedSale.id}</h3>
              <p className="text-xs font-bold text-gray-600">Fecha: {new Date(selectedSale.saleDate).toLocaleString('es-MX')}</p>
              <p className="text-xs font-bold text-gray-600">Estado de Envío: {selectedSale.status}</p>
            </div>
            <button onClick={() => setSelectedSale(null)} className="bg-black text-white px-2 py-1 text-xs font-bold uppercase hover:bg-red-600 cursor-pointer">
              [ Cerrar ]
            </button>
          </div>

          <ul className="divide-y-2 border-black border-2 border-black bg-white mb-4">
            {getSaleDetails(selectedSale.id).map(detail => (
              <li key={detail.id} className="p-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-black uppercase">{getItemName(detail.inventoryId)}</p>
                  <p className="text-xs text-gray-500 font-bold">Precio Unitario: ${detail.unitPrice} MXN</p>
                </div>
                <div className="font-black">
                  {detail.quantity} u. — ${detail.quantity * detail.unitPrice}
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center pt-2">
            <button 
              onClick={() => handleCancelOrder(selectedSale.id)}
              className="bg-red-200 border-2 border-red-700 text-red-700 font-bold text-xs uppercase px-3 py-1.5 hover:bg-red-700 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar Pedido
            </button>
            <p className="text-xl font-black">
              Total: <span className="bg-white border-2 border-black px-2 py-0.5">${selectedSale.totalAmount} MXN</span>
            </p>
          </div>
        </div>
      )}

      {/* TABLA PRINCIPAL DE RECIBOS */}
      {mySales.length === 0 ? (
        <p className="p-6 border-4 border-black border-dashed text-center font-bold">Aún no has realizado transacciones en la plataforma.</p>
      ) : (
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-xs font-bold">
                <th className="p-3 text-center w-20">Ticket</th>
                <th className="p-3">Fecha</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-right">Monto</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {mySales.map((sale, idx) => (
                <tr key={sale.id} className={`border-b-2 border-black hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f4f4f0]'}`}>
                  <td className="p-3 text-center font-black">#{sale.id}</td>
                  <td className="p-3 text-sm font-bold">{new Date(sale.saleDate).toLocaleDateString('es-MX')}</td>
                  <td className="p-3 text-center">
                    <span className="bg-green-200 border border-green-700 text-green-700 px-2 py-0.5 text-xs font-black uppercase">
                      {sale.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-black">${sale.totalAmount}</td>
                  <td className="p-3 text-center space-x-3 text-xs">
                    <button 
                      onClick={() => { setSelectedSale(sale); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="font-bold underline uppercase hover:bg-black hover:text-white px-1 cursor-pointer"
                    >
                      Ver Detalle
                    </button>
                    <button 
                      onClick={() => handleCancelOrder(sale.id)}
                      className="font-bold text-red-600 underline uppercase hover:bg-red-600 hover:text-white px-1 cursor-pointer"
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