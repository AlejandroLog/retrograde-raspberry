import { useState, useEffect } from 'react';
import type { UserDto, ReleaseDto, ArtistDto } from '../types/dtos';
import { getReleases } from '../api/releaseService';
import { getArtists } from '../api/artistService';
import { createSale, createSaleDetail } from '../api/shopService';
import CustomerProfile from './CustomerProfile';
import ReleaseDetail, { type CartItem } from './ReleaseDetail';

type CustomerView = 'home' | 'cart' | 'profile';

export default function CustomerDashboard({ currentUser, onLogout }: { currentUser: UserDto, onLogout: () => void }) {
  const [currentView, setCurrentView] = useState<CustomerView>('home');
  const [selectedRelease, setSelectedRelease] = useState<ReleaseDto | null>(null);
  
  const [allReleases, setAllReleases] = useState<ReleaseDto[]>([]);
  const [allArtists, setAllArtists] = useState<ArtistDto[]>([]);
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
    Promise.all([getReleases(), getArtists()])
      .then(([releases, artists]) => {
        setAllReleases(releases);
        setAllArtists(artists);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar catálogo:", err);
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
    setCart(prev => {
      const existing = prev.find(i => i.inventoryId === item.inventoryId);
      if (existing) {
        return prev.map(i => i.inventoryId === item.inventoryId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (inventoryId: number) => {
    setCart(prev => prev.filter(i => i.inventoryId !== inventoryId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
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

      for (const item of cart) {
        await createSaleDetail({
          saleId: finalSaleId, 
          inventoryId: item.inventoryId,
          quantity: item.quantity,
          unitPrice: item.price
        });
      }

      setCart([]);
      localStorage.removeItem(`cart_${currentUser.username}`); 
      
      alert("¡COMPRA EXITOSA! El pedido ha sido registrado en la disquera.");
      setCurrentView('home');
    } catch (err: any) {
      console.error("Fallo transaccional:", err);
      alert("Error procesando pago: " + (err.message || "Error interno del servidor. Revisa logs de Rider."));
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
                        <p className="text-sm font-bold text-gray-600 uppercase">Formato: {item.formatName} | Cantidad: {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-black">${item.price * item.quantity} MXN</span>
                        <button onClick={() => removeFromCart(item.inventoryId)} className="text-red-600 font-bold underline cursor-pointer">Eliminar</button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="border-t-4 border-black pt-4 flex justify-between items-center mb-6">
                  <span className="font-black text-2xl">TOTAL:</span>
                  <span className="font-black text-2xl">${cartTotal} MXN</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-black text-white font-black uppercase py-4 hover:bg-green-500 hover:text-black transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'PROCESANDO TRANSACCIÓN...' : '[ PROCEDER AL PAGO ]'}
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
          <button onClick={() => handleNavClick('cart')} className={`px-6 py-3 font-black uppercase text-sm border-r-4 border-black cursor-pointer ${currentView === 'cart' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>Carrito [{cart.reduce((s, i) => s + i.quantity, 0)}]</button>
          <button onClick={() => handleNavClick('profile')} className={`px-6 py-3 font-black uppercase text-sm border-r-4 border-black cursor-pointer ${currentView === 'profile' ? 'bg-black text-white' : 'hover:bg-gray-200'}`}>Mi Perfil</button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 pb-12">
        {renderContent()}
      </div>
    </div>
  );
}