import { useState, useEffect } from 'react';
import type { UserDto, MerchandisingDto, ArtistDto } from '../types/dtos';
import { getArtists } from '../api/artistService';
import { getMerch, createMerch } from '../api/merchService';

export default function ArtistMerch({ currentUser }: { currentUser: UserDto }) {
  const [merchList, setMerchList] = useState<MerchandisingDto[]>([]);
  const [myArtists, setMyArtists] = useState<ArtistDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [artistId, setArtistId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Playera');
  const [artistPrice, setArtistPrice] = useState('150');
  const [photoUrl, setPhotoUrl] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [allArtists, allMerch] = await Promise.all([getArtists(), getMerch()]);
      
      const userBands = allArtists.filter(a => a.userId === currentUser.id);
      setMyArtists(userBands);
      
      if (userBands.length > 0) {
        if (!artistId) setArtistId(userBands[0].id.toString());
        
        const myArtistIds = userBands.map(a => a.id);
        const myMerch = allMerch.filter(m => myArtistIds.includes(m.artistId));
        setMerchList(myMerch);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [currentUser.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId) return alert("Crea un perfil de banda primero.");

    try {
      await createMerch({
        artistId: parseInt(artistId),
        name,
        type,
        artistPrice: parseFloat(artistPrice),
        photoUrl: photoUrl || undefined
      });
      setName('');
      setPhotoUrl('');
      loadData();
      alert("Propuesta enviada a revisión del Administrador.");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const getBandName = (id: number) => {
    const artist = myArtists.find(a => a.id === id);
    return artist ? artist.bandName : 'Desconocido';
  };

  const previewPublicPrice = artistPrice ? (parseFloat(artistPrice) * 1.25).toFixed(2) : '0.00';

  if (loading) return <p className="font-mono animate-pulse">Cargando catálogo de mercancía...</p>;

  if (myArtists.length === 0) {
    return (
      <div className="border-4 border-black p-6 bg-yellow-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono mt-4">
        <h3 className="text-xl font-black uppercase mb-2">FALTA CONFIGURACIÓN</h3>
        <p>Aún no tienes un perfil de artista creado. Ve a la pestaña "Mi Perfil" para registrar tu banda antes de proponer mercancía.</p>
      </div>
    );
  }

  return (
    <div className="font-mono mt-4">
      <form onSubmit={handleSubmit} className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
        <h3 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">DISEÑAR MERCHANDISING</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase mb-1">Proyecto Musical (Banda)</label>
            <select required value={artistId} onChange={e => setArtistId(e.target.value)} className="w-full border-2 border-black p-2 bg-white outline-none focus:bg-black focus:text-white uppercase cursor-pointer">
              {myArtists.map(artist => (
                <option key={artist.id} value={artist.id}>{artist.bandName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Nombre del Producto</label>
            <input type="text" required placeholder="Ej. Playera Oficial Tour 2026" value={name} onChange={e => setName(e.target.value)} className="w-full border-2 border-black p-2 outline-none focus:bg-black focus:text-white" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Tipo de Artículo</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border-2 border-black p-2 bg-white outline-none cursor-pointer">
              <option>Playera</option>
              <option>Sueter</option>
              <option>Taza</option>
              <option>Otros</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Tu Precio Base ($)</label>
            <input type="number" min="1" required value={artistPrice} onChange={e => setArtistPrice(e.target.value)} className="w-full border-2 border-black p-2 outline-none focus:bg-black focus:text-white" />
            <p className="text-xs text-gray-500 mt-1 font-bold">Precio público simulado (+25% disquera): ${previewPublicPrice} MXN</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase mb-1">URL de la Foto</label>
            <input type="url" placeholder="https://..." value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="w-full border-2 border-black p-2 outline-none focus:bg-black focus:text-white" />
          </div>
        </div>
        <button type="submit" className="w-full bg-black text-white font-black py-3 hover:bg-white hover:text-black border-2 border-black transition-colors cursor-pointer uppercase">[ ENVIAR PROPUESTA A REVISIÓN ]</button>
      </form>

      <h3 className="text-2xl font-black uppercase mb-4 inline-block bg-black text-white px-2 py-0.5">MIS ARTÍCULOS</h3>
      {merchList.length === 0 ? (
        <p className="italic text-gray-600">No has propuesto ningún artículo de merchandising.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {merchList.map(m => (
            <div key={m.id} className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex">
              <div className="w-24 border-r-4 border-black bg-gray-200 aspect-square">
                {m.photoUrl && <img src={m.photoUrl} className="w-full h-full object-cover" />}
              </div>
              <div className="p-3 flex-grow">
                <h4 className="font-black uppercase truncate">{m.name}</h4>
                <p className="text-xs font-bold text-gray-600 uppercase">
                  Banda: {getBandName(m.artistId)} | Base: ${m.artistPrice}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span className={`px-2 py-0.5 border-2 border-black font-black text-xs uppercase ${m.status === 'Aceptado' ? 'bg-green-300' : 'bg-yellow-200 animate-pulse'}`}>{m.status}</span>
                  {m.status === 'Aceptado' && <span className="text-xs font-black bg-black text-white px-1">SKU: {m.sku} | Stock: {m.availableStock}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}