import { useState, useEffect } from 'react';
import { getAllSales } from '../api/shopService';
import { getAllUsers } from '../api/userService';
import { getReleases } from '../api/releaseService';
import { getArtists } from '../api/artistService';
import type { SaleDto } from '../types/dtos';

export default function AdminSummary() {
  const [loading, setLoading] = useState(true);
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [activeArtists, setActiveArtists] = useState(0);
  const [totalReleases, setTotalReleases] = useState(0);
  
  const [recentSales, setRecentSales] = useState<SaleDto[]>([]);

  useEffect(() => {
    Promise.all([
      getAllSales(),
      getAllUsers(),
      getReleases(),
      getArtists()
    ])
    .then(([salesData, usersData, releasesData, artistsData]) => {
      const revenue = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
      setTotalRevenue(revenue);
      setTotalOrders(salesData.length);
      
      const sortedSales = [...salesData].sort((a, b) => 
        new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
      );
      setRecentSales(sortedSales.slice(0, 5));

      const customers = usersData.filter(u => u.role.toLowerCase() === 'cliente').length;
      const artists = usersData.filter(u => u.role.toLowerCase() === 'artista').length;
      setActiveCustomers(customers);
      setActiveArtists(artists);

      setTotalReleases(releasesData.length);

      setLoading(false);
    })
    .catch(err => {
      console.error("Error cargando métricas:", err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 font-mono">
        <div className="w-16 h-16 border-8 border-black border-t-transparent animate-spin mb-4"></div>
        <p className="font-black tracking-widest uppercase animate-pulse">Calculando métricas globales...</p>
      </div>
    );
  }

  const StatCard = ({ title, value, prefix = "" }: { title: string, value: string | number, prefix?: string }) => (
    <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
      <h4 className="text-sm font-bold uppercase text-gray-500 mb-2">{title}</h4>
      <p className="text-4xl font-black tracking-tighter break-words">
        <span className="text-xl mr-1">{prefix}</span>{value}
      </p>
    </div>
  );

  return (
    <div className="font-mono mt-8 max-w-6xl">
      <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 inline-block bg-black text-white px-3 py-1">
        PUNTO DE CONTROL MÁSTER
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <StatCard title="Ingresos Totales" value={totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })} prefix="$" />
        <StatCard title="Pedidos Procesados" value={totalOrders} />
        <StatCard title="Discos en Catálogo" value={totalReleases} />
        <StatCard title="Fans / Clientes Activos" value={activeCustomers} />
        <StatCard title="Músicos Firmados" value={activeArtists} />
      </div>

      <h3 className="text-xl font-black uppercase tracking-tighter mb-4 border-b-4 border-black pb-2">
        ÚLTIMAS 5 TRANSACCIONES
      </h3>

      {recentSales.length === 0 ? (
        <p className="border-4 border-black p-6 bg-yellow-100 font-bold">Aún no hay ventas registradas en el sistema.</p>
      ) : (
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white uppercase text-sm">
                  <th className="p-3 border-r-2 border-white text-center w-16">ID</th>
                  <th className="p-3 border-r-2 border-white">Fecha</th>
                  <th className="p-3 border-r-2 border-white">Cliente (Email)</th>
                  <th className="p-3 border-r-2 border-white text-center">Estado</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale, idx) => (
                  <tr key={sale.id} className={`border-b-2 border-black hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f4f4f0]'}`}>
                    <td className="p-3 border-r-2 border-black font-bold text-center">#{sale.id}</td>
                    <td className="p-3 border-r-2 border-black text-sm">
                      {new Date(sale.saleDate).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-3 border-r-2 border-black font-bold text-sm truncate max-w-[200px]">{sale.customerEmail}</td>
                    <td className="p-3 border-r-2 border-black text-center">
                      <span className="bg-green-300 border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                        {sale.status}
                      </span>
                    </td>
                    <td className="p-3 font-black text-right">${sale.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
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