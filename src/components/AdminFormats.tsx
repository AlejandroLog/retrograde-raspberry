import { useState, useEffect } from 'react';
import type { PhysicalFormatDto, UserDto } from '../types/dtos';
import { getPhysicalFormats, createPhysicalFormat, deletePhysicalFormat } from '../api/shopService';

export default function AdminFormats({ currentUser }: { currentUser: UserDto }) {
  const [formats, setFormats] = useState<PhysicalFormatDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del Formulario
  const [name, setName] = useState('');
  const [requiresShipping, setRequiresShipping] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPhysicalFormats();
      setFormats(data);
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
      await createPhysicalFormat({
        name,
        requiresPhysicalShipping: requiresShipping
      });
      setName('');
      setRequiresShipping(false);
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que quieres eliminar este formato? Puede afectar el inventario existente.")) return;
    try {
      await deletePhysicalFormat(id, currentUser.username);
      loadData();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <p className="animate-pulse font-mono p-8">Cargando formatos...</p>;

  return (
    <div className="font-mono mt-8 max-w-4xl">
      
      <form onSubmit={handleSubmit} className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 border-b-4 border-black pb-2">
          NUEVO FORMATO
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label className="block text-sm font-bold uppercase mb-1">Nombre del Formato</label>
            <input 
              type="text" required placeholder="Ej. Vinil 12 pulgadas" value={name} onChange={e => setName(e.target.value)}
              className="w-full border-2 border-black p-2 outline-none focus:bg-black focus:text-white"
            />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input 
              type="checkbox" 
              id="shipping"
              checked={requiresShipping} 
              onChange={e => setRequiresShipping(e.target.checked)}
              className="w-5 h-5 border-2 border-black cursor-pointer appearance-none checked:bg-black checked:after:content-['X'] checked:after:text-white checked:after:flex checked:after:justify-center checked:after:items-center checked:after:h-full checked:after:font-bold"
            />
            <label htmlFor="shipping" className="text-sm font-bold uppercase cursor-pointer">
              ¿Requiere envío físico?
            </label>
          </div>
        </div>

        <button type="submit" className="mt-8 w-full bg-black text-white font-black uppercase py-3 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all cursor-pointer">
          [ REGISTRAR FORMATO ]
        </button>
      </form>

      <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 inline-block bg-black text-white px-2 py-1">
        FORMATOS REGISTRADOS
      </h2>

      {formats.length === 0 ? (
        <p>No hay formatos dados de alta.</p>
      ) : (
        <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase text-sm">
                <th className="p-3 border-r-2 border-white w-16 text-center">ID</th>
                <th className="p-3 border-r-2 border-white">Nombre</th>
                <th className="p-3 border-r-2 border-white text-center">Físico</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {formats.map((format, idx) => (
                <tr key={format.id} className={`border-b-2 border-black hover:bg-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#f4f4f0]'}`}>
                  <td className="p-3 border-r-2 border-black font-bold text-center">{format.id}</td>
                  <td className="p-3 border-r-2 border-black font-bold uppercase">{format.name}</td>
                  <td className="p-3 border-r-2 border-black text-center font-bold">
                    {format.requiresPhysicalShipping ? 'SÍ' : 'NO'}
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => handleDelete(format.id)} className="text-xs font-bold text-red-600 underline hover:bg-red-600 hover:text-white px-2 py-1">
                      Eliminar
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