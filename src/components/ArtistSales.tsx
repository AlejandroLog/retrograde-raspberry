import { useState, useEffect } from 'react';
import type { UserDto, SaleDto, SaleDetailDto, InventoryDto, ReleaseDto, PhysicalFormatDto } from '../types/dtos';
import { getArtists } from '../api/artistService';
import { getReleases } from '../api/releaseService';
import { getAllInventory, getAllSales, getAllSaleDetails, getPhysicalFormats } from '../api/shopService';

interface ArtistSaleRecord {
  detailId: number;
  saleDate: string;
  releaseTitle: string;
  formatName: string;
  quantity: number;
  unitPrice: number;
  totalEarned: number;
}

export default function ArtistSales({ currentUser }: { currentUser: UserDto }) {
  const [loading, setLoading] = useState(true);
  
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalItemsSold, setTotalItemsSold] = useState(0);
  const [salesRecords, setSalesRecords] = useState<ArtistSaleRecord[]>([]);

  useEffect(() => {
    Promise.all([
      getArtists(),
      getReleases(),
      getAllInventory(),
      getAllSales(),
      getAllSaleDetails(),
      getPhysicalFormats()
    ])
    .then(([artists, releases, inventory, sales, saleDetails, formats]) => {
      const myArtistIds = artists.filter(a => a.userId === currentUser.id).map(a => a.id);

      const myReleases = releases.filter(r => myArtistIds.includes(r.artistId));
      const myReleaseIds = myReleases.map(r => r.id);

      const myInventory = inventory.filter(inv => myReleaseIds.includes(inv.releaseId));
      const myInventoryIds = myInventory.map(inv => inv.id);

      const mySaleDetails = saleDetails.filter(sd => myInventoryIds.includes(sd.inventoryId));

      let earnings = 0;
      let itemsSold = 0;
      const records: ArtistSaleRecord[] = [];

      mySaleDetails.forEach(detail => {
        earnings += (detail.quantity * detail.unitPrice);
        itemsSold += detail.quantity;

        const sale = sales.find(s => s.id === detail.saleId);
        const invItem = myInventory.find(i => i.id === detail.inventoryId);
        const release = myReleases.find(r => r.id === invItem?.releaseId);
        const format = formats.find(f => f.id === invItem?.physicalFormatId);

        records.push({
          detailId: detail.id,
          saleDate: sale ? sale.saleDate : new Date().toISOString(),
          releaseTitle: release ? release.title : 'Desconocido',
          formatName: format ? format.name : 'N/A',
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
          totalEarned: detail.quantity * detail.unitPrice
        });
      });

      records.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());

      setTotalEarnings(earnings);
      setTotalItemsSold(itemsSold);
      setSalesRecords(records);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error al cargar ventas del artista:", err);
      setLoading(false);
    });
  }, [currentUser.id]);

  if (loading) {
    return <p className="animate-pulse font-mono text-xl p-8">Recopilando datos de distribución...</p>;
  }

  return (
    <div className="font-mono mt-4 max-w-5xl">
      <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 inline-block bg-black text-white px-3 py-1">
        REPORTE DE REGALÍAS Y VENTAS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h4 className="text-sm font-bold uppercase text-gray-500 mb-2">Ingresos Generados</h4>
          <p className="text-5xl font-black tracking-tighter text-green-600">
            <span className="text-2xl mr-1">$</span>
            {totalEarnings.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h4 className="text-sm font-bold uppercase text-gray-500 mb-2">Unidades Desplazadas</h4>
          <p className="text-5xl font-black tracking-tighter">
            {totalItemsSold} <span className="text-xl">copias</span>
          </p>
        </div>
      </div>

      <h3 className="text-xl font-black uppercase tracking-tighter mb-4 border-b-4 border-black pb-2">
        HISTORIAL DE TRANSACCIONES
      </h3>

      {salesRecords.length === 0 ? (
        <div className="border-4 border-black p-6 bg-yellow-100 font-bold">
          Aún no tienes ventas registradas. ¡Sigue promocionando tu material!
        </div>
      ) : (
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white uppercase text-sm">
                  <th className="p-3 border-r-2 border-white">Fecha</th>
                  <th className="p-3 border-r-2 border-white">Obra / Lanzamiento</th>
                  <th className="p-3 border-r-2 border-white">Formato</th>
                  <th className="p-3 border-r-2 border-white text-center">Cant.</th>
                  <th className="p-3 text-right">Regalía</th>
                </tr>
              </thead>
              <tbody>
                {salesRecords.map((record, idx) => (
                  <tr key={record.detailId} className={`border-b-2 border-black hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f4f4f0]'}`}>
                    <td className="p-3 border-r-2 border-black text-xs font-bold">
                      {new Date(record.saleDate).toLocaleDateString('es-MX')}
                    </td>
                    <td className="p-3 border-r-2 border-black font-black uppercase">{record.releaseTitle}</td>
                    <td className="p-3 border-r-2 border-black text-sm">{record.formatName}</td>
                    <td className="p-3 border-r-2 border-black text-center font-bold">{record.quantity}</td>
                    <td className="p-3 text-right font-black text-green-700">
                      ${record.totalEarned.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
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