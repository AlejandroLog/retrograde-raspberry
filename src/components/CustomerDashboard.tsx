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
          <div className="mt-8" style={{animation: 'fadeIn 0.5s ease-out'}}>
            {/* Merch Hero Banner */}
            <div className="w-full h-48 md:h-64 rounded-3xl mb-12 relative overflow-hidden flex items-center justify-center group shadow-2xl shadow-violet-900/20">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-900/80 via-black/60 to-cyan-900/80 z-10 mix-blend-multiply"></div>
              <img src="/assets/vinyl_stack.png" alt="Merchandising" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700 blur-[2px]" />
              <div className="relative z-20 text-center px-4">
                <span className="text-cyan-400 font-bold tracking-[0.2em] text-xs uppercase mb-3 block drop-shadow-md">Exclusivo</span>
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-200 to-cyan-200 drop-shadow-lg mb-4">
                  Mercancía Oficial
                </h1>
                <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto font-medium">
                  Viste el sonido. Apoya a tus bandas favoritas con indumentaria y coleccionables de edición limitada.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-violet-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></span>
                Colección Actual
              </h2>
              <span className="text-sm font-medium text-slate-500 bg-white/[0.05] px-4 py-1.5 rounded-full border border-white/[0.05]">
                {allMerch.length} Artículos
              </span>
            </div>

            {allMerch.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-3xl p-16 text-center bg-white/[0.02] backdrop-blur-sm">
                <div className="w-16 h-16 mx-auto bg-white/[0.05] rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">👕</span>
                </div>
                <p className="text-slate-400 font-medium">No hay mercancía disponible en los estantes de la disquera en este momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {allMerch.map(m => (
                  <div key={m.id} className="group bg-[#12121a] rounded-2xl overflow-hidden border border-white/[0.04] hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all duration-500 flex flex-col relative">
                    
                    {/* Image Area */}
                    <div className="aspect-[4/5] bg-gradient-to-b from-white/[0.05] to-transparent overflow-hidden relative p-6 flex items-center justify-center">
                      <div className="absolute inset-0 bg-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
                      
                      {/* Badge */}
                      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/10">
                          {m.type}
                        </span>
                        {m.availableStock > 0 && m.availableStock <= 5 && (
                          <span className="bg-red-500/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-red-400/30 flex items-center gap-1 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            ¡Últimos {m.availableStock}!
                          </span>
                        )}
                      </div>

                      {m.photoUrl ? (
                        <img src={m.photoUrl} className="w-full h-full object-contain group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-700 drop-shadow-2xl" alt={m.name} />
                      ) : (
                        <div className="text-6xl group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-700 drop-shadow-2xl">
                          {m.type.toLowerCase().includes('playera') || m.type.toLowerCase().includes('ropa') ? '👕' : '🛍️'}
                        </div>
                      )}
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-5 flex-grow flex flex-col bg-gradient-to-t from-black/80 to-transparent">
                      <div className="mb-4">
                        <p className="text-cyan-400 text-xs font-semibold mb-1 uppercase tracking-wide">{getBandName(m.artistId)}</p>
                        <h3 className="font-bold text-white text-lg leading-tight group-hover:text-cyan-300 transition-colors">{m.name}</h3>
                      </div>
                      
                      <div className="mt-auto flex items-end justify-between">
                        <div>
                          <p className="text-slate-500 text-xs mb-0.5">Precio Oficial</p>
                          <span className="font-black text-xl text-white tracking-tight">${m.publicPrice} <span className="text-sm font-medium text-slate-500">MXN</span></span>
                        </div>
                        
                        {m.availableStock > 0 ? (
                          <button 
                            onClick={() => addMerchToCart(m)}
                            className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/10 text-white flex items-center justify-center hover:bg-cyan-500 hover:border-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:scale-110 transition-all duration-300 group/btn"
                            title="Añadir al carrito"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover/btn:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 hidden group-hover/btn:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                        ) : (
                          <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2 text-xs font-bold tracking-wider rounded-lg uppercase">Agotado</span>
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
          <div className="mt-8 max-w-4xl mx-auto" style={{animation: 'fadeIn 0.5s ease-out'}}>
            <div className="flex items-center justify-between mb-8 border-b border-white/[0.05] pb-6">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500 flex items-center gap-4 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Tu Carrito
              </h2>
              <span className="bg-white/[0.05] text-slate-300 px-4 py-1.5 rounded-full text-sm font-semibold border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                {validCartItems.reduce((s, i) => s + i.quantity, 0)} Artículos
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="relative overflow-hidden rounded-3xl p-16 text-center bg-[#12121a] border border-white/[0.04] shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-600/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-200 mb-2">Tu carrito está vacío</h3>
                  <p className="text-slate-500 font-medium max-w-sm">Explora nuestro catálogo global o la mercancía oficial y apoya a la escena independiente.</p>
                  <button onClick={() => handleNavClick('home')} className="mt-8 px-8 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl font-bold text-white uppercase tracking-widest hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:-translate-y-1 transition-all">
                    Descubrir
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="bg-[#12121a]/80 backdrop-blur-xl border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl">
                    <div className="bg-white/[0.02] px-6 py-4 border-b border-white/[0.05] flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Detalle de Compra</span>
                    </div>
                    <ul className="divide-y divide-white/[0.05]">
                      {cart.map((item, idx) => (
                        <li key={idx} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/[0.02] transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">{item.formatName.toLowerCase().includes('vinil') ? '💿' : item.formatName.toLowerCase().includes('cd') ? '💽' : '👕'}</span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-100 text-lg group-hover:text-cyan-300 transition-colors">{item.releaseTitle}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-semibold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20 uppercase tracking-wider">{item.formatName}</span>
                                <span className="text-sm text-slate-500 font-medium">Cant: {item.quantity}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t border-white/5 sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                            <span className="font-black text-white text-xl">${item.price * item.quantity} <span className="text-xs text-slate-500 font-medium">MXN</span></span>
                            <button 
                              onClick={() => item.inventoryId && removeFromCart(item.inventoryId)} 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/10 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                              title="Eliminar"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-b from-[#1a1a24] to-[#0a0a0f] border border-white/[0.08] rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] sticky top-24">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Resumen del Pedido
                    </h3>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-sm text-slate-400 font-medium">
                        <span>Subtotal</span>
                        <span className="text-slate-200">${cartTotal} MXN</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-400 font-medium">
                        <span>Envío (Estándar)</span>
                        <span className="text-emerald-400">Gratis</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-400 font-medium pb-4 border-b border-white/[0.06]">
                        <span>Impuestos</span>
                        <span className="text-slate-200">Incluidos</span>
                      </div>
                      <div className="flex justify-between items-end pt-2">
                        <span className="font-bold text-slate-300">Total</span>
                        <span className="font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 drop-shadow-md">
                          ${cartTotal} <span className="text-sm text-slate-500 font-bold tracking-widest">MXN</span>
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={handleCheckout}
                      disabled={isProcessing || validCartItems.length === 0}
                      className="w-full relative group overflow-hidden rounded-xl bg-white/[0.05] border border-white/10 p-1 transition-all hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-white/10 disabled:hover:shadow-none cursor-pointer"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-cyan-500 to-violet-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                      <div className="bg-[#0a0a0f] rounded-lg px-6 py-4 flex items-center justify-center gap-2 relative z-10 transition-colors group-hover:bg-[#12121a]">
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                            <span className="font-bold tracking-widest text-cyan-400 text-sm">PROCESANDO...</span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold tracking-widest text-white text-sm">PAGAR AHORA</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </>
                        )}
                      </div>
                    </button>
                    
                    <div className="mt-6 flex items-center justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3 object-contain" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4 object-contain" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/200px-PayPal.svg.png" alt="PayPal" className="h-4 object-contain" />
                    </div>
                  </div>
                </div>
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