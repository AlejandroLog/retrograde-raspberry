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
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [currentUser.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId) return alert("Crea un perfil de banda primero.");
    try {
      await createMerch({ artistId: parseInt(artistId), name, type, artistPrice: parseFloat(artistPrice), photoUrl: photoUrl || undefined });
      setName(''); setPhotoUrl(''); loadData();
      alert("Propuesta enviada a revisión del Administrador.");
    } catch (err: any) { alert("Error: " + err.message); }
  };

  const getBandName = (id: number) => { const artist = myArtists.find(a => a.id === id); return artist ? artist.bandName : 'Desconocido'; };
  const previewPublicPrice = artistPrice ? (parseFloat(artistPrice) * 1.25).toFixed(2) : '0.00';

  if (loading) return (<div className="flex flex-col items-center justify-center py-20"><div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div><p className="text-slate-500 text-sm">Cargando catálogo de mercancía...</p></div>);

  if (myArtists.length === 0) {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 mt-4">
        <h3 className="text-lg font-bold text-amber-400 mb-2">Falta Configuración</h3>
        <p className="text-slate-400 text-sm">Aún no tienes un perfil de artista creado. Ve a la pestaña "Mi Perfil" para registrar tu banda antes de proponer mercancía.</p>
      </div>
    );
  }

  return (
    <div className="mt-4" style={{animation: 'fadeIn 0.4s ease-out'}}>
      <form onSubmit={handleSubmit} className="bg-white/[0.04] border border-white/10 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-bold text-slate-100 mb-6 pb-4 border-b border-white/[0.08]">Diseñar Merchandising</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Proyecto Musical (Banda)</label>
            <select required value={artistId} onChange={e => setArtistId(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 transition-all cursor-pointer text-sm appearance-none">{myArtists.map(artist => (<option key={artist.id} value={artist.id}>{artist.bandName}</option>))}</select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Nombre del Producto</label>
            <input type="text" required placeholder="Ej. Playera Oficial Tour 2026" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Tipo de Artículo</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none cursor-pointer text-sm appearance-none">
              <option>Playera</option><option>Sueter</option><option>Taza</option><option>Otros</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Tu Precio Base ($)</label>
            <input type="number" min="1" required value={artistPrice} onChange={e => setArtistPrice(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all text-sm" />
            <p className="text-xs text-slate-500 mt-1">Precio público simulado (+25% disquera): ${previewPublicPrice} MXN</p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">URL de la Foto</label>
            <input type="url" placeholder="https://..." value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 outline-none focus:border-violet-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all text-sm" />
          </div>
        </div>
        <button type="submit" className="w-full neo-btn-primary mt-2">Enviar Propuesta a Revisión</button>
      </form>

      <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-3">
        <span className="w-1 h-5 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
        Mis Artículos
      </h3>
      {merchList.length === 0 ? (
        <p className="text-slate-500 text-sm italic">No has propuesto ningún artículo de merchandising.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {merchList.map(m => (
            <div key={m.id} className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden flex hover:border-white/20 transition-all duration-300">
              <div className="w-24 bg-white/[0.06] aspect-square flex-shrink-0 overflow-hidden">
                {m.photoUrl && <img src={m.photoUrl} className="w-full h-full object-cover" />}
              </div>
              <div className="p-3 flex-grow">
                <h4 className="font-semibold text-slate-100 truncate">{m.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Banda: {getBandName(m.artistId)} · Base: ${m.artistPrice}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium border ${m.status === 'Aceptado' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/15 text-amber-400 border-amber-500/20 animate-pulse'}`}>{m.status}</span>
                  {m.status === 'Aceptado' && <span className="text-[10px] text-slate-500 bg-white/[0.06] px-2 py-0.5 rounded">SKU: {m.sku} · Stock: {m.availableStock}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}