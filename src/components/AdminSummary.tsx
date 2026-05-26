import { useState, useEffect } from 'react';
import { getAllUsers } from '../api/userService';
import { getReleases } from '../api/releaseService';
import { getAllInventory, getAllSales } from '../api/shopService';
import type { SaleDto } from '../types/dtos';

export default function AdminSummary() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalArtists, setTotalArtists] = useState(0);
  const [totalReleases, setTotalReleases] = useState(0);
  const [totalStock, setTotalStock] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [recentSales, setRecentSales] = useState<SaleDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllUsers(), getReleases(), getAllInventory(), getAllSales()])
    .then(([users, releases, inventory, sales]) => {
      setTotalUsers(users.length);
      setTotalArtists(users.filter(u => u.role.toLowerCase() === 'artista').length);
      setTotalReleases(releases.length);
      
      const stock = inventory.reduce((sum, item) => sum + item.stock, 0);
      setTotalStock(stock);

      const earnings = sales.filter(s => s.status === 'Pagado').reduce((sum, item) => sum + item.totalAmount, 0);
      setTotalEarnings(earnings);

      const sortedSales = [...sales].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
      setRecentSales(sortedSales.slice(0, 5));
      setLoading(false);
    })
    .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 text-sm font-medium tracking-wider uppercase">Extrayendo analíticas...</p>
    </div>
  );

  return (
    <div style={{animation: 'fadeIn 0.4s ease-out'}}>
      <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
        <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
        Reporte General del Sistema
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 col-span-2 md:col-span-1">
          <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3">Ventas Netas</h4>
          <p className="text-3xl font-bold text-emerald-400 tracking-tight">
            <span className="text-lg text-emerald-500/50 mr-1">$</span>{totalEarnings.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
          </p>
        </div>
        
        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
          <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3">Total Usuarios</h4>
          <p className="text-3xl font-bold text-slate-100 tracking-tight">{totalUsers}</p>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
          <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3">Artistas</h4>
          <p className="text-3xl font-bold text-slate-100 tracking-tight">{totalArtists}</p>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
          <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3">Lanzamientos</h4>
          <p className="text-3xl font-bold text-slate-100 tracking-tight">{totalReleases}</p>
        </div>

        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
          <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-3">Piezas Físicas</h4>
          <p className="text-3xl font-bold text-slate-100 tracking-tight">{totalStock}</p>
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-3">
        <span className="w-1 h-5 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
        Últimas Transacciones (Top 5)
      </h3>
      
      {recentSales.length === 0 ? (
        <p className="border border-dashed border-white/10 rounded-xl p-8 text-center text-slate-500 text-sm">No hay transacciones registradas.</p>
      ) : (
        <div className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.08]">
                  <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider w-24">Ticket #</th>
                  <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Fecha / Hora</th>
                  <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider">Cliente</th>
                  <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-right">Monto</th>
                  <th className="p-4 text-xs font-semibold uppercase text-slate-400 tracking-wider text-center">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale, i) => (
                  <tr key={sale.id} className={`border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors ${i % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                    <td className="p-4 font-bold text-slate-300 text-sm text-center">#{sale.id}</td>
                    <td className="p-4 text-slate-400 text-sm">{new Date(sale.saleDate).toLocaleString('es-MX')}</td>
                    <td className="p-4 text-slate-200 text-sm">{sale.customerEmail}</td>
                    <td className="p-4 text-right font-bold text-emerald-400 text-sm">${sale.totalAmount}</td>
                    <td className="p-4 text-center">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase border ${sale.status === 'Pagado' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border-amber-500/20'}`}>
                        {sale.status}
                      </span>
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