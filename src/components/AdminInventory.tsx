import { useState, useEffect } from 'react';
import type { InventoryDto, ReleaseDto, PhysicalFormatDto, UserDto } from '../types/dtos';
import { getAllInventory, createInventory, deleteInventory, getPhysicalFormats } from '../api/shopService';
import { getReleases } from '../api/releaseService';

export default function AdminInventory({ currentUser }: { currentUser: UserDto }) {
  const [inventory, setInventory] = useState<InventoryDto[]>([]);
  const [releases, setReleases] = useState<ReleaseDto[]>([]);
  const [formats, setFormats] = useState<PhysicalFormatDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del Formulario
  const [releaseId, setReleaseId] = useState('');
  const [formatId, setFormatId] = useState('');
  const [stock, setStock] = useState('10');
  const [price, setPrice] = useState('250.00');
  const [sku, setSku] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [invData, relData, formData] = await Promise.all([
        getAllInventory(),
        getReleases(),
        getPhysicalFormats()
      ]);
      setInventory(invData);
      setReleases(relData);
      setFormats(formData);

      if (relData.length > 0 && !releaseId) setReleaseId(relData[0].id.toString());
      if (formData.length > 0 && !formatId) setFormatId(formData[0].id.toString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInventory({
        releaseId: parseInt(releaseId),
        physicalFormatId: parseInt(formatId),
        availableStock: parseInt(stock),
        salePrice: parseFloat(price),
        sku: sku || `SKU-${Date.now()}`
      });
      alert('Inventario creado exitosamente');
      setSku('');
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que quieres dar de baja este item del inventario?")) return;
    try {
      await deleteInventory(id, currentUser.username);
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const getReleaseName = (id: number) => releases.find(r => r.id === id)?.title || 'Desconocido';
  const getFormatName = (id: number) => formats.find(f => f.id === id)?.name || 'Desconocido';

  if (loading) return <p className="animate-pulse font-mono p-8">Cargando base de datos logísticas...</p>;

  return (
    <div className="font-mono mt-8">
      
      <form onSubmit={handleSubmit} className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-2">
          NUEVO INGRESO A ALMACÉN
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold uppercase mb-1">Obra / Lanzamiento</label>
            <select 
              value={releaseId} onChange={e => setReleaseId(e.target.value)}
              className="w-full border-2 border-black p-2 outline-none focus:bg-black focus:text-white"
            >
              {releases.map(r => <option key={r.id} value={r.id}>{r.title} ({r.releaseType})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase mb-1">Formato Físico / Digital</label>
            <select 
              value={formatId} onChange={e => setFormatId(e.target.value)}
              className="w-full border-2 border-black p-2 outline-none focus:bg-black focus:text-white"
            >
              {formats.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase mb-1">Stock Disponible</label>
            <input 
              type="number" min="0" required value={stock} onChange={e => setStock(e.target.value)}
              className="w-full border-2 border-black p-2 outline-none focus:bg-black focus:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase mb-1">Precio de Venta ($)</label>
            <input 
              type="number" min="0" step="0.01" required value={price} onChange={e => setPrice(e.target.value)}
              className="w-full border-2 border-black p-2 outline-none focus:bg-black focus:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase mb-1">SKU (Código Interno)</label>
            <input 
              type="text" placeholder="Auto-generado si vacío" value={sku} onChange={e => setSku(e.target.value)}
              className="w-full border-2 border-black p-2 outline-none focus:bg-black focus:text-white"
            />
          </div>
        </div>

        <button type="submit" className="mt-8 w-full bg-black text-white font-black uppercase py-3 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all cursor-pointer">
          [ REGISTRAR EN INVENTARIO ]
        </button>
      </form>

      <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 inline-block bg-black text-white px-2 py-1">
        INVENTARIO ACTIVO
      </h2>

      {inventory.length === 0 ? (
        <p>No hay artículos en el almacén.</p>
      ) : (
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black text-white uppercase text-sm">
                  <th className="p-3 border-r-2 border-white">SKU</th>
                  <th className="p-3 border-r-2 border-white">Lanzamiento</th>
                  <th className="p-3 border-r-2 border-white">Formato</th>
                  <th className="p-3 border-r-2 border-white">Stock</th>
                  <th className="p-3 border-r-2 border-white">Precio</th>
                  <th className="p-3 text-center">Baja</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, idx) => (
                  <tr key={item.id} className={`border-b-2 border-black hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f4f4f0]'}`}>
                    <td className="p-3 border-r-2 border-black font-bold text-xs">{item.sku}</td>
                    <td className="p-3 border-r-2 border-black font-bold uppercase">{getReleaseName(item.releaseId)}</td>
                    <td className="p-3 border-r-2 border-black text-sm">{getFormatName(item.physicalFormatId)}</td>
                    <td className="p-3 border-r-2 border-black font-bold">{item.availableStock}</td>
                    <td className="p-3 border-r-2 border-black font-bold">${item.salePrice}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleDelete(item.id)} className="text-xs font-bold text-red-600 underline hover:bg-red-600 hover:text-white px-2 py-1">
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