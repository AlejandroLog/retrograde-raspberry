import { useState, useEffect } from 'react';
import type { UserDto, ReleaseDto, ArtistDto, MerchandisingDto, InventoryDto } from '../types/dtos';
import { getReleases } from '../api/releaseService';
import { getArtists } from '../api/artistService';
import { getMerch } from '../api/merchService';
import { createSale, createSaleDetail, getAllInventory } from '../api/shopService';
import CustomerProfile from './CustomerProfile';
import ReleaseDetail, { type CartItem } from './ReleaseDetail';
import CustomerOrders from './CustomerOrders';

type CustomerView = 'home' | 'merch' | 'cart' | 'profile' | 'purchases';

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
      setCurrentView('purchases');
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
          <div className="mt-8" style={{animation: 'fadeIn 0.4s ease-out'}}>
            <h2 className="text-2xl font-bold text-slate-100 mb-8 flex items-center gap-3">
              <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
              Merchandising Oficial
            </h2>
            {allMerch.length === 0 ? (
              <p className="border border-dashed border-white/10 rounded-xl p-8 text-center text-slate-500 text-sm">No hay mercancía disponible en los estantes de la disquera en este momento.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {allMerch.map(m => (
                  <div key={m.id} className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 flex flex-col">
                    <div className="aspect-square bg-white/[0.06] overflow-hidden">
                      {m.photoUrl ? (
                        <img src={m.photoUrl} className="w-full h-full object-cover" alt={m.name} />
                      ) : (
                        <img src="/assets/vinyl_stack.png" className="w-full h-full object-cover opacity-50 grayscale" alt="Fallback Merch" />
                      )}
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-semibold uppercase bg-violet-500/20 text-violet-300 px-2.5 py-1 rounded-full border border-violet-500/20">{m.type}</span>
                        <h3 className="font-bold text-slate-100 text-lg mt-3 break-words">{m.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">Banda: {getBandName(m.artistId)}</p>
                      </div>
                      <div className="mt-5 border-t border-white/[0.06] pt-3 flex items-center justify-between">
                        <span className="font-bold text-slate-100">${m.publicPrice} MXN</span>
                        {m.availableStock > 0 ? (
                          <button 
                            onClick={() => addMerchToCart(m)}
                            className="bg-white/[0.08] text-emerald-400 font-semibold text-xs uppercase px-3 py-2 rounded-lg hover:bg-emerald-500/20 hover:border-emerald-500/20 border border-white/10 transition-all duration-300 cursor-pointer"
                          >
                            + Llevar
                          </button>
                        ) : (
                          <span className="bg-red-500/15 text-red-400 border border-red-500/20 px-3 py-1 text-xs font-medium rounded-full">AGOTADO</span>
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
          <div className="mt-8 max-w-3xl mx-auto" style={{animation: 'fadeIn 0.4s ease-out'}}>
            <h2 className="text-2xl font-bold text-slate-100 mb-8 flex items-center gap-3">
              <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
              Carrito de Compras
            </h2>
            {cart.length === 0 ? (
              <p className="border border-dashed border-white/10 rounded-xl p-8 text-center text-slate-500 text-sm">El carrito está vacío.</p>
            ) : (
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6">
                <ul className="divide-y divide-white/[0.06] mb-6">
                  {cart.map((item, idx) => (
                    <li key={idx} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-100 text-lg">{item.releaseTitle}</p>
                        <p className="text-sm text-slate-500">
                          Tipo/Formato: {item.formatName} · Cantidad: {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-100">${item.price * item.quantity} MXN</span>
                        <button onClick={() => item.inventoryId && removeFromCart(item.inventoryId)} className="text-red-400 font-medium text-sm hover:bg-red-500/10 px-2 py-1 rounded-lg transition-colors cursor-pointer">Eliminar</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-white/10 pt-4 flex justify-between items-center mb-6">
                  <span className="font-bold text-xl text-slate-100">Total:</span>
                  <span className="font-bold text-2xl gradient-text">${cartTotal} MXN</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing || validCartItems.length === 0}
                  className="w-full neo-btn-primary"
                >
                  {isProcessing ? 'PROCESANDO COMPRA...' : 'PROCEDER AL PAGO →'}
                </button>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="mt-8" style={{animation: 'fadeIn 0.4s ease-out'}}>
            {/* Hero Banner */}
            <div className="w-full h-64 md:h-80 rounded-2xl mb-12 relative overflow-hidden flex items-end">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent z-10"></div>
              <img src="/assets/vinyl_stack.png" alt="Vinyl Collection" className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="relative z-20 p-8 md:p-12 w-full max-w-3xl">
                <span className="bg-violet-500/20 text-violet-300 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-violet-500/20 mb-4 inline-block">Novedades Físicas</span>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">Encuentra Tu Siguiente Vinilo.</h1>
                <p className="text-slate-300 md:text-lg max-w-xl">Apoya a tus artistas independientes favoritos adquiriendo sus tirajes limitados de música y mercancía oficial.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-100 mb-8 flex items-center gap-3">
              <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-cyan-500 rounded-full"></span>
              Catálogo Global
            </h2>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-[3px] border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 text-sm">Sintonizando frecuencias...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {allReleases.map(release => (
                  <div 
                    key={release.id} 
                    onClick={() => setSelectedRelease(release)}
                    className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden hover:-translate-y-1.5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer flex flex-col group"
                  >
                    <div className="aspect-square bg-white/[0.06] overflow-hidden">
                      {release.coverUrl ? (
                        <img src={release.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={release.title} />
                      ) : (
                        <img src="/assets/turntable.png" className="w-full h-full object-cover opacity-60 grayscale group-hover:scale-105 transition-transform duration-500" alt="Fallback Cover" />
                      )}
                    </div>
                    <div className="p-3.5">
                      <h3 className="font-semibold text-slate-100 truncate">{release.title}</h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{getBandName(release.artistId)}</p>
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
      <div className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex overflow-x-auto gap-1 px-4 py-2">
          <button onClick={() => handleNavClick('home')} className={`px-5 py-2.5 font-semibold text-sm rounded-lg transition-all duration-300 cursor-pointer whitespace-nowrap ${currentView === 'home' && !selectedRelease ? 'bg-white/[0.1] text-white shadow-lg shadow-violet-500/10' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'}`}>Catálogo</button>
          <button onClick={() => handleNavClick('merch')} className={`px-5 py-2.5 font-semibold text-sm rounded-lg transition-all duration-300 cursor-pointer whitespace-nowrap ${currentView === 'merch' ? 'bg-white/[0.1] text-white shadow-lg shadow-violet-500/10' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'}`}>Merch</button>
          <button onClick={() => handleNavClick('purchases')} className={`px-5 py-2.5 font-semibold text-sm rounded-lg transition-all duration-300 cursor-pointer whitespace-nowrap ${currentView === 'purchases' ? 'bg-white/[0.1] text-white shadow-lg shadow-violet-500/10' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'}`}>Mis Compras</button>
          <button onClick={() => handleNavClick('cart')} className={`px-5 py-2.5 font-semibold text-sm rounded-lg transition-all duration-300 cursor-pointer whitespace-nowrap ${currentView === 'cart' ? 'bg-white/[0.1] text-white shadow-lg shadow-violet-500/10' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'}`}>Carrito [{validCartItems.reduce((s, i) => s + i.quantity, 0)}]</button>
          <button onClick={() => handleNavClick('profile')} className={`px-5 py-2.5 font-semibold text-sm rounded-lg transition-all duration-300 cursor-pointer whitespace-nowrap ${currentView === 'profile' ? 'bg-white/[0.1] text-white shadow-lg shadow-violet-500/10' : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'}`}>Mi Perfil</button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {renderContent()}
      </div>
    </div>
  );
}