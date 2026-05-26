import { useState, useEffect } from 'react';
import type { ReleaseDto, TrackDto, InventoryDto, PhysicalFormatDto } from '../types/dtos';
import { getTracksByRelease } from '../api/trackService';
import { getInventoryByRelease, getPhysicalFormats } from '../api/shopService';

export interface CartItem {
  inventoryId?: number | null;
  merchandisingId?: number | null;
  releaseTitle: string;
  formatName: string;
  price: number;
  quantity: number;
}

export default function ReleaseDetail({ 
  release, 
  bandName, 
  onBack,
  onAddToCart
}: { 
  release: ReleaseDto; 
  bandName: string;
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
}) {
  const [tracks, setTracks] = useState<TrackDto[]>([]);
  const [inventory, setInventory] = useState<InventoryDto[]>([]);
  const [formats, setFormats] = useState<PhysicalFormatDto[]>([]);
  const [selectedInvId, setSelectedInvId] = useState('');

  useEffect(() => {
    getTracksByRelease(release.id)
      .then(data => setTracks(data.sort((a, b) => a.trackNumber - b.trackNumber)))
      .catch(err => console.error(err));

    Promise.all([
      getInventoryByRelease(release.id),
      getPhysicalFormats()
    ])
    .then(([invData, formatData]) => {
      setInventory(invData);
      setFormats(formatData);
      if (invData.length > 0) setSelectedInvId(invData[0].id.toString());
    })
    .catch(err => console.error(err));
  }, [release.id]);

  const getFormatName = (formatId: number) => {
    const format = formats.find(f => f.id === formatId);
    return format ? format.name : `Desconocido (ID: ${formatId})`;
  };

  const handleAdd = () => {
    const inv = inventory.find(i => i.id.toString() === selectedInvId);
    if (!inv) return;
    
    onAddToCart({
      inventoryId: inv.id,
      merchandisingId: null,
      releaseTitle: release.title,
      formatName: getFormatName(inv.physicalFormatId),
      price: inv.salePrice,
      quantity: 1
    });
    alert("¡Agregado al carrito!");
  };

  return (
    <div className="mt-4" style={{animation: 'fadeIn 0.4s ease-out'}}>
      <button onClick={onBack} className="mb-6 text-slate-400 hover:text-white transition-colors text-sm font-medium cursor-pointer flex items-center gap-1">
        ← Volver al catálogo
      </button>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/50 aspect-square bg-white/[0.06] mb-6">
            {release.coverUrl ? (
              <img src={release.coverUrl} alt="Portada" className="w-full h-full object-cover" />
            ) : (
              <img src="/assets/turntable.png" className="w-full h-full object-cover opacity-60 grayscale" alt="Fallback Cover" />
            )}
          </div>
          
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-5">
            <h4 className="font-bold text-slate-100 text-lg mb-3">Comprar Obra</h4>
            
            {inventory.length === 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center text-amber-400 text-sm font-medium">AGOTADO / NO DISPONIBLE</div>
            ) : (
              <>
                <select 
                  value={selectedInvId} 
                  onChange={e => setSelectedInvId(e.target.value)} 
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-slate-100 mb-4 cursor-pointer outline-none focus:border-violet-500/50 transition-all appearance-none text-sm"
                >
                  {inventory.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {getFormatName(inv.physicalFormatId)} - ${inv.salePrice} MXN
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleAdd}
                  className="w-full neo-btn-primary"
                >
                  + Al Carrito
                </button>
              </>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <h2 className="text-4xl font-bold text-slate-100 tracking-tight mb-2">{release.title}</h2>
          <h3 className="text-xl text-slate-400 mb-8">{bandName}</h3>
          
          <h4 className="text-lg font-bold gradient-text inline-block mb-4">Setlist</h4>
          {tracks.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No hay pistas registradas para esta obra.</p>
          ) : (
            <ul className="bg-white/[0.04] border border-white/10 rounded-xl overflow-hidden">
              {tracks.map((track, i) => (
                <li key={track.id} className={`flex justify-between p-4 border-b border-white/[0.06] text-sm ${i % 2 !== 0 ? 'bg-white/[0.02]' : ''}`}>
                  <span className="text-slate-200 font-medium">{track.trackNumber}. {track.songTitle}</span>
                  <span className="text-slate-500">{track.duration || '--:--'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}