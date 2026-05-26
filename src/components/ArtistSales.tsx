import { useState, useEffect } from 'react';
import type { UserDto, SaleDto, SaleDetailDto, InventoryDto, ReleaseDto, PhysicalFormatDto } from '../types/dtos';
import { getArtists } from '../api/artistService';
import { getReleases } from '../api/releaseService';
import { getAllInventory, getAllSales, getAllSaleDetails, getPhysicalFormats } from '../api/shopService';

interface ArtistSaleRecord { detailId: number; saleDate: string; releaseTitle: string; formatName: string; quantity: number; unitPrice: number; totalEarned: number; }

export default function ArtistSales({ currentUser }: { currentUser: UserDto }) {
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalItemsSold, setTotalItemsSold] = useState(0);
  const [salesRecords, setSalesRecords] = useState<ArtistSaleRecord[]>([]);

  useEffect(() => {
    Promise.all([getArtists(), getReleases(), getAllInventory(), getAllSales(), getAllSaleDetails(), getPhysicalFormats()])
    .then(([artists, releases, inventory, sales, saleDetails, formats]) => {
      const myArtistIds = artists.filter(a => a.userId === currentUser.id).map(a => a.id);
      const myReleases = releases.filter(r => myArtistIds.includes(r.artistId));
      const myReleaseIds = myReleases.map(r => r.id);
      const myInventory = inventory.filter(inv => myReleaseIds.includes(inv.releaseId));
      const myInventoryIds = myInventory.map(inv => inv.id);
      const mySaleDetails = saleDetails.filter(sd => myInventoryIds.includes(sd.inventoryId));
      let earnings = 0; let itemsSold = 0; const records: ArtistSaleRecord[] = [];
      mySaleDetails.forEach(detail => {
        earnings += (detail.quantity * detail.unitPrice); itemsSold += detail.quantity;
        const sale = sales.find(s => s.id === detail.saleId);
        const invItem = myInventory.find(i => i.id === detail.inventoryId);
        const release = myReleases.find(r => r.id === invItem?.releaseId);
        const format = formats.find(f => f.id === invItem?.physicalFormatId);
        records.push({ detailId: detail.id, saleDate: sale ? sale.saleDate : new Date().toISOString(), releaseTitle: release ? release.title : 'Desconocido', formatName: format ? format.name : 'N/A', quantity: detail.quantity, unitPrice: detail.unitPrice, totalEarned: detail.quantity * detail.unitPrice });
      });
      records.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
      setTotalEarnings(earnings); setTotalItemsSold(itemsSold); setSalesRecords(records); setLoading(false);
    })
    .catch(err => { console.error("Error al cargar ventas del artista:", err); setLoading(false); });
  }, [currentUser.id]);

  if (loading) return (<div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div><p className="text-slate-500 text-sm">Recopilando datos de distribución...</p></div>);

  return (
    <div className="mt-4 max-w-5xl" style={{animation: 'fadeIn 0.4s ease-out'}}>
      <h2 className="text-2xl font-bold text-slate-100 mb-8 flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
        Reporte de Regalías y Ventas
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
          <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">Ingresos Generados</h4>
          <p className="text-4xl font-bold text-emerald-400 tracking-tight">
            <span className="text-xl mr-1">$</span>{totalEarnings.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
          <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">Unidades Desplazadas</h4>
          <p className="text-4xl font-bold text-slate-100 tracking-tight">{totalItemsSold} <span className="text-lg text-slate-500">copias</span></p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-100 mb-4 pb-3 border-b border-white/[0.08]">Historial de Transacciones</h3>
      {salesRecords.length === 0 ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-amber-400 text-sm font-medium">Aún no tienes ventas registradas. ¡Sigue promocionando tu material!</div>
      ) : (
        <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-white/[0.08]">
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Fecha</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Obra / Lanzamiento</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Formato</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center">Cant.</th>
                <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-right">Regalía</th>
              </tr></thead>
              <tbody>
                {salesRecords.map((record, idx) => (
                  <tr key={record.detailId} className={`border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors ${idx % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                    <td className="p-4 text-xs text-slate-400">{new Date(record.saleDate).toLocaleDateString('es-MX')}</td>
                    <td className="p-4 font-semibold text-slate-200 text-sm">{record.releaseTitle}</td>
                    <td className="p-4 text-sm text-slate-400">{record.formatName}</td>
                    <td className="p-4 text-center font-medium text-sm text-slate-300">{record.quantity}</td>
                    <td className="p-4 text-right font-bold text-emerald-400 text-sm">${record.totalEarned.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
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