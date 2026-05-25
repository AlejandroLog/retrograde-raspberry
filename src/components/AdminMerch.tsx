import { useState, useEffect } from 'react';
import type { UserDto, MerchandisingDto } from '../types/dtos';
import { getMerch, approveMerch, updateMerch, deleteMerch } from '../api/merchService';
import { getArtists } from '../api/artistService';
import { createInventory } from '../api/shopService'; // <--- Importamos createInventory

export default function AdminMerch({ currentUser }: { currentUser: UserDto }) {
  const [merch, setMerch] = useState<MerchandisingDto[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState<MerchandisingDto | null>(null);
  const [stock, setStock] = useState('50');
  const [sku, setSku] = useState('');

  const loadData = async () => {
    try {
      const [merchData, artistData] = await Promise.all([getMerch(), getArtists()]);
      setMerch(merchData);
      setArtists(artistData);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const finalSku = sku.trim() 
      ? sku.trim().toUpperCase() 
      : `MCH-${selectedItem.type.substring(0, 3).toUpperCase()}-${Date.now()}`;

    try {
      if (selectedItem.status === 'Pendiente') {
        await approveMerch(selectedItem.id, { availableStock: parseInt(stock), sku: finalSku });
        
        try {
          await createInventory({
            releaseId: 1, 
            physicalFormatId: 1, 
            availableStock: parseInt(stock),
            salePrice: selectedItem.publicPrice || (selectedItem.artistPrice * 1.25),
            sku: finalSku
          });
        } catch (invErr) {
          console.error("No se pudo crear el inventario fantasma:", invErr);
        }

        alert(`Propuesta aceptada con el SKU: ${finalSku} e inyectada en ventas.`);
      } else {
        await updateMerch(selectedItem.id, { availableStock: parseInt(stock), sku: finalSku });
        alert("Artículo actualizado correctamente.");
      }
      setSelectedItem(null);
      setSku('');
      loadData();
    } catch (err: any) { 
      alert("Error: " + err.message); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Dar de baja esta mercancía?")) return;
    try {
      await deleteMerch(id, currentUser.username);
      loadData();
    } catch (err: any) { 
      alert(err.message); 
    }
  };

  const getArtistName = (id: number) => artists.find(a => a.id === id)?.bandName || 'Desconocido';

  if (loading) return <p className="font-mono animate-pulse p-8">Cargando almacenes de mercancía...</p>;

  return (
    <div className="font-mono mt-8 max-w-5xl">
      {selectedItem && (
        <form onSubmit={handleAction} className="border-4 border-black p-6 bg-yellow-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 ring-4 ring-black">
          <h4 className="font-black text-lg uppercase border-b-2 border-black pb-1 mb-4">
            {selectedItem.status === 'Pendiente' ? 'AUTORIZAR Y ASIGNAR LOGÍSTICA' : 'MODIFICAR LOGÍSTICA'}
          </h4>
          <p className="text-xs font-bold mb-4">Producto: {selectedItem.name} | Precio sugerido artista: ${selectedItem.artistPrice}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Stock Inicial</label>
              <input type="number" min="0" required value={stock} onChange={e => setStock(e.target.value)} className="w-full border-2 border-black p-2 bg-white outline-none focus:bg-black focus:text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Código SKU</label>
              <input 
                type="text" 
                placeholder="Auto-generado si se deja vacío" 
                value={sku} 
                onChange={e => setSku(e.target.value)} 
                className="w-full border-2 border-black p-2 bg-white uppercase outline-none focus:bg-black focus:text-white placeholder-gray-500 font-bold" 
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-grow bg-black text-white font-black p-2 uppercase text-sm border-2 border-black hover:bg-white hover:text-black transition-colors cursor-pointer">[ CONFIRMAR ]</button>
            <button type="button" onClick={() => { setSelectedItem(null); setSku(''); }} className="bg-white text-black font-bold p-2 uppercase text-sm border-2 border-black cursor-pointer">Cerrar</button>
          </div>
        </form>
      )}

      <h2 className="text-3xl font-black uppercase mb-6 inline-block bg-black text-white px-2 py-0.5">REVISIÓN DE MERCHANDISING</h2>
      <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white uppercase text-xs font-bold">
              <th className="p-3 border-r-2 border-white">Banda</th>
              <th className="p-3 border-r-2 border-white">Producto</th>
              <th className="p-3 border-r-2 border-white text-center">Estatus</th>
              <th className="p-3 border-r-2 border-white text-right">P. Público</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {merch.map((item, idx) => (
              <tr key={item.id} className={`border-b-2 border-black ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f4f4f0]'}`}>
                <td className="p-3 border-r-2 border-black font-bold text-sm uppercase">{getArtistName(item.artistId)}</td>
                <td className="p-3 border-r-2 border-black font-black uppercase text-sm">
                  {item.name} <span className="text-xs font-normal text-gray-500">({item.type})</span>
                  {item.sku && <div className="text-[10px] text-gray-500 font-mono tracking-tight font-bold mt-0.5">SKU: {item.sku} | Stock: {item.availableStock} u.</div>}
                </td>
                <td className="p-3 border-r-2 border-black text-center">
                  <span className={`px-2 py-0.5 text-xs border-2 border-black font-black uppercase ${item.status === 'Aceptado' ? 'bg-green-300' : 'bg-yellow-200 animate-pulse'}`}>{item.status}</span>
                </td>
                <td className="p-3 border-r-2 border-black text-right font-black">${item.publicPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                <td className="p-3 text-center space-x-2 text-xs">
                  <button onClick={() => { setSelectedItem(item); setStock(item.availableStock.toString()); setSku(item.sku || ''); }} className="font-bold underline uppercase hover:bg-black hover:text-white px-1 cursor-pointer">
                    {item.status === 'Pendiente' ? 'Aceptar' : 'Editar'}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="font-bold text-red-600 underline uppercase hover:bg-red-600 hover:text-white px-1 cursor-pointer">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}