import { useEffect, useState } from 'react';
import { getReleases } from '../api/releaseService';
import type { ReleaseDto } from '../types/dtos';
import CreateReleaseForm from './CreateReleaseForm';

export default function ReleasesList() {
  const [releases, setReleases] = useState<ReleaseDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReleases = () => {
    setLoading(true);
    getReleases()
      .then((data) => {
        setReleases(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <CreateReleaseForm onReleaseAdded={fetchReleases} />

      <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 font-mono inline-block bg-black text-white px-2 py-1">
        CATÁLOGO
      </h2>
      
      {loading ? (
        <p className="font-mono text-xl animate-pulse">Leyendo discos...</p>
      ) : releases.length === 0 ? (
        <p className="font-mono text-xl">Sin señales. El catálogo está vacío.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono">
          {releases.map((release) => (
            <div 
              key={release.id} 
              className="border-4 border-black p-5 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              <h3 className="font-black text-xl uppercase tracking-tighter mb-2 break-words">
                {release.title}
              </h3>
              <div className="border-t-2 border-black pt-2 mt-2">
                <p className="text-sm font-bold uppercase">Formato: <span className="font-normal">{release.releaseType}</span></p>
                {release.releaseDate && (
                  <p className="text-sm font-bold uppercase">
                    Lanzamiento: <span className="font-normal">{new Date(release.releaseDate).toLocaleDateString()}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}