import { useState, useEffect } from 'react';
import type { UserDto, SaleDto, SaleDetailDto, InventoryDto, ReleaseDto, PhysicalFormatDto, MerchandisingDto } from '../types/dtos';
import { getAllSales, getAllSaleDetails, getAllInventory, getPhysicalFormats, deleteSale } from '../api/shopService';
import { getReleases } from '../api/releaseService';
import { getMerch } from '../api/merchService';

export default function AdminOrders({ currentUser }: { currentUser: UserDto }) {
  const [sales, setSales] = useState<SaleDto[]>([]);
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

      const sortedSales = salesData.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

      setSales(sortedSales);
      setSaleDetails(detailsData);
      setInventory(invData);
      setReleases(relData);
      setFormats(formData);
      setMerch(merchData);
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿ALERTA MÁXIMA: Estás seguro de eliminar este pedido? Esto cancelará la transacción.")) return;
    try {
      await deleteSale(id, currentUser.username);
      if (selectedSale?.id === id) setSelectedSale(null);
      loadData();
      alert("Pedido eliminado del registro.");
    } catch (err: any) {
      alert("Error al eliminar pedido: " + err.message);
    }
  };

  const getItemName = (invId: number) => {
    const inv = inventory.find(i => i.id === invId);
    if (!inv) return 'Producto Desconocido';

    const isMerch = merch.find(m => m.sku === inv.sku);
    if (isMerch) return `${isMerch.name} [${isMerch.type}]`;

    const release = releases.find(r => r.id === inv.releaseId);
    const format = formats.find(f => f.id === inv.physicalFormatId);
    
    return `${release?.title || 'Obra'} - ${format?.name || 'Formato'}`;
  };

  const getSaleDetails = (saleId: number) => saleDetails.filter(sd => sd.saleId === saleId);

  if (loading) return <p className="font-mono animate-pulse p-8">Recuperando bitácora de transacciones...</p>;

  return (
    <div className="font-mono mt-8 max-w-5xl">
      <h2 className="text-3xl font-black uppercase mb-6 inline-block bg-black text-white px-2 py-0.5">
        CENTRO DE DISTRIBUCIÓN Y PEDIDOS
      </h2>

      {selectedSale && (
        <div className="border-4 border-black p-6 bg-yellow-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 ring-4 ring-black">
          <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-4">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">TICKET #{selectedSale.id}</h3>
              <p className="font-bold text-sm">Cliente: {selectedSale.customerEmail}</p>
              <p className="font-bold text-sm">Fecha: {new Date(selectedSale.saleDate).toLocaleString('es-MX')}</p>
            </div>
            <button onClick={() => setSelectedSale(null)} className="bg-black text-white px-3 py-1 font-bold uppercase hover:bg-red-600 transition-colors cursor-pointer">
              X CERRAR
            </button>
          </div>

          <h4 className="font-black mb-2 uppercase bg-black text-white px-2 py-0.5 inline-block text-sm">ARTÍCULOS EN EL PAQUETE</h4>
          <ul className="divide-y-2 border-black border-2 border-black bg-white">
            {getSaleDetails(selectedSale.id).map(detail => (
              <li key={detail.id} className="p-3 flex justify-between items-center hover:bg-gray-100">
                <div className="flex flex-col">
                  <span className="font-black uppercase">{getItemName(detail.inventoryId)}</span>
                  <span className="text-xs font-bold text-gray-500">
                    ID Inventario: {detail.inventoryId} | Precio U.: ${detail.unitPrice}
                  </span>
                </div>
                <div className="font-black text-lg">
                  {detail.quantity} <span className="text-xs font-normal">unidades</span>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 text-right">
            <span className="text-sm font-bold uppercase mr-2">Total Pagado:</span>
            <span className="text-2xl font-black bg-green-300 border-2 border-black px-2">${selectedSale.totalAmount} MXN</span>
          </div>
        </div>
      )}

      {sales.length === 0 ? (
        <p className="p-6 border-4 border-black border-dashed font-bold">No hay pedidos registrados en el sistema.</p>
      ) : (
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white uppercase text-xs font-bold">
                  <th className="p-3 border-r-2 border-white text-center">Folio</th>
                  <th className="p-3 border-r-2 border-white">Fecha</th>
                  <th className="p-3 border-r-2 border-white">Comprador</th>
                  <th className="p-3 border-r-2 border-white text-center">Estado</th>
                  <th className="p-3 border-r-2 border-white text-right">Monto</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, idx) => (
                  <tr key={sale.id} className={`border-b-2 border-black hover:bg-gray-100 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f4f4f0]'}`}>
                    <td className="p-3 border-r-2 border-black text-center font-black">#{sale.id}</td>
                    <td className="p-3 border-r-2 border-black text-sm font-bold">{new Date(sale.saleDate).toLocaleDateString('es-MX')}</td>
                    <td className="p-3 border-r-2 border-black font-bold uppercase truncate max-w-[150px]">{sale.customerEmail}</td>
                    <td className="p-3 border-r-2 border-black text-center">
                      <span className="bg-green-300 border-2 border-black px-2 py-0.5 text-xs font-black uppercase tracking-tight">
                        {sale.status}
                      </span>
                    </td>
                    <td className="p-3 border-r-2 border-black text-right font-black">
                      ${sale.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center space-x-2 text-xs">
                      <button 
                        onClick={() => { setSelectedSale(sale); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                        className="font-bold underline uppercase hover:bg-black hover:text-white px-1 cursor-pointer"
                      >
                        Ver Detalles
                      </button>
                      <button 
                        onClick={() => handleDelete(sale.id)} 
                        className="font-bold text-red-600 underline uppercase hover:bg-red-600 hover:text-white px-1 cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}