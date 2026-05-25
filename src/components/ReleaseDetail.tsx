import { useState, useEffect } from 'react';
import type { ReleaseDto, TrackDto, InventoryDto, PhysicalFormatDto } from '../types/dtos';
import { getTracksByRelease } from '../api/trackService';
import { getInventoryByRelease, getPhysicalFormats } from '../api/shopService';

// Interfaz actualizada para soportar el carrito mixto (Discos + Merch)
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
      merchandisingId: null, // Dejamos esto en nulo porque es un disco físico/digital
      releaseTitle: release.title,
      formatName: getFormatName(inv.physicalFormatId),
      price: inv.salePrice,
      quantity: 1
    });
    alert("¡Agregado al carrito!");
  };

  return (
    <div className="font-mono mt-4">
      <button onClick={onBack} className="mb-6 font-bold underline hover:bg-black hover:text-white px-2 cursor-pointer">&lt; VOLVER AL CATÁLOGO</button>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          <div className="border-4 border-black bg-gray-200 aspect-square shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6">
            {release.coverUrl ? (
              <img src={release.coverUrl} alt="Portada" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">SIN PORTADA</div>
            )}
          </div>
          
          <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xl mb-2">COMPRAR OBRA</h4>
            
            {inventory.length === 0 ? (
              <div className="bg-yellow-300 p-2 font-bold text-center border-2 border-black">AGOTADO / NO DISPONIBLE</div>
            ) : (
              <>
                <select 
                  value={selectedInvId} 
                  onChange={e => setSelectedInvId(e.target.value)} 
                  className="w-full border-2 border-black p-2 mb-4 bg-white font-bold cursor-pointer outline-none focus:bg-black focus:text-white appearance-none uppercase text-sm"
                >
                  {inventory.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {getFormatName(inv.physicalFormatId)} - ${inv.salePrice} MXN
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleAdd}
                  className="w-full bg-black text-white font-black py-3 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] transition-all cursor-pointer"
                >
                  [ + AL CARRITO ]
                </button>
              </>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <h2 className="text-5xl font-black uppercase tracking-tighter mb-2">{release.title}</h2>
          <h3 className="text-2xl font-bold text-gray-600 mb-6">{bandName}</h3>
          
          <h4 className="text-2xl font-black bg-black text-white inline-block px-2 py-1 mb-4">SETLIST</h4>
          {tracks.length === 0 ? (
            <p className="italic">No hay pistas registradas para esta obra.</p>
          ) : (
            <ul className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {tracks.map((track, i) => (
                <li key={track.id} className={`flex justify-between p-3 border-b-2 border-black ${i % 2 === 0 ? 'bg-white' : 'bg-[#f4f4f0]'}`}>
                  <span className="font-bold">{track.trackNumber}. {track.songTitle}</span>
                  <span>{track.duration || '--:--'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}