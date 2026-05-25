import { useState, useEffect } from 'react';
import type { UserDto, ReleaseDto, ArtistDto, MerchandisingDto, InventoryDto } from '../types/dtos';
import { getReleases } from '../api/releaseService';
import { getArtists } from '../api/artistService';
import { getMerch } from '../api/merchService';
import { createSale, createSaleDetail, getAllInventory } from '../api/shopService';
import CustomerProfile from './CustomerProfile';
import ReleaseDetail, { type CartItem } from './ReleaseDetail';
import CustomerOrders from './CustomerOrders'; // <--- Importación nueva

type CustomerView = 'home' | 'merch' | 'cart' | 'profile' | 'purchases'; // <--- Agregamos 'purchases'

export default function CustomerDashboard({ currentUser, onLogout }: { currentUser: UserDto, onLogout: () => void }) {
  const [currentView, setCurrentView] = useState<CustomerView>('home');
  const [selectedRelease, setSelectedRelease] = useState<ReleaseDto | null>(null);
  
  const [allReleases, setAllReleases] = useState<ReleaseDto[]>([]);
  const [allArtists, setAllArtists] = useState<ArtistDto[]>([]);
  const [allMerch, setAllMerch] = useState<MerchandisingDto[]>([]);
  const [allInventory, setAllInventory] = useState<InventoryDto[]>([]); 
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(`cart_${currentUser.username}`);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    localStorage.setItem(`cart_${currentUser.username}`, JSON.stringify(cart));
  }, [cart, currentUser.username]);

  useEffect(() => {
    Promise.all([getReleases(), getArtists(), getMerch(), getAllInventory()])
      .then(([releases, artists, merchData, inventoryData]) => {
        setAllReleases(releases);
        setAllArtists(artists);
        setAllInventory(inventoryData);
        setAllMerch(merchData.filter(m => m.status === 'Aceptado'));
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al sintonizar catálogos:", err);
        setLoading(false);
      });
  }, []);

  const getBandName = (artistId: number) => {
    const artist = allArtists.find(a => a.id === artistId);
    return artist ? artist.bandName : 'Desconocido';
  };

  const handleNavClick = (view: CustomerView) => {
    setSelectedRelease(null);
    setCurrentView(view);
  };

  const addToCart = (item: CartItem) => {
    if (!item.inventoryId) return;

    setCart(prev => {
      const existing = prev.find(i => i.inventoryId === item.inventoryId);
      if (existing) {
        return prev.map(i => i.inventoryId === item.inventoryId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, item];
    });
  };

  const addMerchToCart = (m: MerchandisingDto) => {
    if (m.availableStock <= 0) {
      alert("[AGOTADO] No quedan existencias de este artículo en el almacén.");
      return;
    }

    const inventoryItem = allInventory.find(i => i.sku === m.sku);

    if (!inventoryItem) {
      alert("Error logístico: Este artículo aún no se refleja en el almacén maestro.");
      return;
    }

    addToCart({
      inventoryId: inventoryItem.id, 
      releaseTitle: m.name,
      formatName: m.type,
      price: m.publicPrice,
      quantity: 1
    });
    alert(`¡"${m.name}" agregado al carrito!`);
  };

  const removeFromCart = (inventoryId: number) => {
    setCart(prev => prev.filter(i => i.inventoryId !== inventoryId));
  };

  const validCartItems = cart.filter(item => item.inventoryId);
  const cartTotal = validCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (validCartItems.length === 0) {
      alert("No hay artículos válidos en el carrito.");
      return;
    }
    setIsProcessing(true);

    try {
      const saleResponse = await createSale({
        customerEmail: currentUser.username, 
        totalAmount: cartTotal,
        status: 'Pagado'
      });

      if (!saleResponse || !saleResponse.id) {
        throw new Error("No se pudo obtener el identificador de la transacción del servidor.");
      }
      
      const finalSaleId = saleResponse.id;

      for (const item of validCartItems) {
        await createSaleDetail({
          saleId: finalSaleId, 
          inventoryId: item.inventoryId!,
          quantity: item.quantity,
          unitPrice: item.price
        });
      }

      setCart([]);
      localStorage.removeItem(`cart_${currentUser.username}`); 
      
      alert("¡COMPRA EXITOSA! Tus discos y mercancía han sido reservados.");
      setCurrentView('purchases'); // Redirigir directamente al historial al pagar
    } catch (err: any) {
      console.error("Fallo transaccional masivo:", err);
      alert("Error procesando pago: " + (err.message || "Error interno del servidor C#."));
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    if (selectedRelease) {
      return (
        <ReleaseDetail 
          release={selectedRelease} 
          bandName={getBandName(selectedRelease.artistId)} 
          onBack={() => setSelectedRelease(null)}
          onAddToCart={addToCart}
        />
      );
    }

    switch (currentView) {
      case 'profile':
        return <CustomerProfile currentUser={currentUser} onLogout={onLogout} />;
      
      case 'purchases':
        return <CustomerOrders currentUser={currentUser} />;

      case 'merch':
        return (
          <div className="mt-8 font-mono">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 border-b-4 border-black pb-2">
              APAREL & MERCHANDISING OFICIAL
            </h2>
            {allMerch.length === 0 ? (
              <p className="p-6 border-4 border-black border-dashed text-center">No hay mercancía disponible en los estantes de la disquera en este momento.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {allMerch.map(m => (
                  <div key={m.id} className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col">
                    <div className="aspect-square border-b-4 border-black bg-gray-200 position-relative">
                      {m.photoUrl ? (
                        <img src={m.photoUrl} className="w-full h-full object-cover" alt={m.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">NO FOTO</div>
                      )}
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-black uppercase bg-black text-white px-1.5 py-0.5">{m.type}</span>
                        <h3 className="font-black uppercase tracking-tighter text-xl mt-2 break-words">{m.name}</h3>
                        <p className="text-xs font-bold text-gray-500 uppercase mt-1">Banda: {getBandName(m.artistId)}</p>
                      </div>
                      <div className="mt-6 border-t-2 border-black pt-3 flex items-center justify-between">
                        <span className="font-black text-lg">${m.publicPrice} MXN</span>
                        {m.availableStock > 0 ? (
                          <button 
                            onClick={() => addMerchToCart(m)}
                            className="bg-black text-white font-bold text-xs uppercase px-3 py-2 hover:bg-green-400 hover:text-black transition-colors cursor-pointer"
                          >
                            [ + LLEVAR ]
                          </button>
                        ) : (
                          <span className="bg-red-200 text-red-700 border border-red-700 px-2 py-1 text-xs font-black uppercase">AGOTADO</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'cart':
        return (
          <div className="mt-8 font-mono max-w-3xl mx-auto">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 border-b-4 border-black pb-2">CARRITO DE COMPRAS</h2>
            {cart.length === 0 ? (
              <p className="p-6 border-4 border-black border-dashed text-center">El carrito está vacío.</p>
            ) : (
              <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                <ul className="divide-y-2 border-black mb-6">
                  {cart.map((item, idx) => (
                    <li key={idx} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-black uppercase text-lg">{item.releaseTitle}</p>
                        <p className="text-sm font-bold text-gray-600 uppercase">
                          Tipo/Formato: {item.formatName} | Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black">${item.price * item.quantity} MXN</span>
                        <button onClick={() => item.inventoryId && removeFromCart(item.inventoryId)} className="text-red-600 font-bold underline cursor-pointer">Eliminar</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t-4 border-black pt-4 flex justify-between items-center mb-6">
                  <span className="font-black text-2xl">TOTAL GENERAL:</span>
                  <span className="font-black text-2xl">${cartTotal} MXN</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing || validCartItems.length === 0}
                  className="w-full bg-black text-white font-black uppercase py-4 hover:bg-green-500 hover:text-black transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'PROCESANDO COMPRA MIXTA...' : '[ PROCEDER AL PAGO ]'}
                </button>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="mt-8 font-mono">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 border-b-4 border-black pb-2">
              DISQUERA / CATÁLOGO GLOBAL
            </h2>
            {loading ? (
              <p className="animate-pulse text-xl">Sintonizando frecuencias...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {allReleases.map(release => (
                  <div 
                    key={release.id} 
                    onClick={() => setSelectedRelease(release)}
                    className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex flex-col"
                  >
                    <div className="aspect-square border-b-4 border-black bg-gray-200">
                      {release.coverUrl ? (
                        <img src={release.coverUrl} className="w-full h-full object-cover" alt={release.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">N/A</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-black uppercase tracking-tighter truncate">{release.title}</h3>
                      <p className="text-xs font-bold text-gray-600 truncate">{getBandName(release.artistId)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div>
      <div className="bg-white border-b-4 border-black font-mono">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          <button onClick={() => handleNavClick('home')} className={`px-6 py-3 font-black uppercase text-sm border-r-4 border-black cursor-pointer ${currentView === 'home' && !selectedRelease ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>Catálogo</button>
          <button onClick={() => handleNavClick('merch')} className={`px-6 py-3 font-black uppercase text-sm border-r-4 border-black cursor-pointer ${currentView === 'merch' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>Merch</button>
          <button onClick={() => handleNavClick('purchases')} className={`px-6 py-3 font-black uppercase text-sm border-r-4 border-black cursor-pointer ${currentView === 'purchases' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>Mis Compras</button>
          <button onClick={() => handleNavClick('cart')} className={`px-6 py-3 font-black uppercase text-sm border-r-4 border-black cursor-pointer ${currentView === 'cart' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>Carrito [{validCartItems.reduce((s, i) => s + i.quantity, 0)}]</button>
          <button onClick={() => handleNavClick('profile')} className={`px-6 py-3 font-black uppercase text-sm border-r-4 border-black cursor-pointer ${currentView === 'profile' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>Mi Perfil</button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {renderContent()}
      </div>
    </div>
  );
}