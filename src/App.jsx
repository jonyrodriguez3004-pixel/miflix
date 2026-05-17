import React, { useState, useRef, useEffect } from 'react';
import { Play, Info, X, ChevronLeft, ChevronRight, Search, Bell, Menu, Lock, Unlock, Plus, Edit2, Trash2, Share2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  // Configuración falsa para entorno de prueba. En un entorno real se usarían las credenciales de Firebase.
  apiKey: "AIzaSyFakeKey123",
  authDomain: "miflix-demo.firebaseapp.com",
  projectId: "miflix-demo",
  storageBucket: "miflix-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializamos firebase
const app = initializeApp(firebaseConfig);

const INITIAL_MOVIES = [
  {
    id: '1',
    title: 'Viaje a la Montaña',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
    category: 'Viajes',
    year: '2023',
    duration: '15m',
    description: 'Nuestra aventura escalando el pico nevado el invierno pasado.'
  },
  {
    id: '2',
    title: 'Navidad en Familia',
    thumbnail: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
    category: 'Eventos',
    year: '2023',
    duration: '45m',
    description: 'Apertura de regalos y cena navideña en casa de los abuelos.'
  },
  {
    id: '3',
    title: 'Cumpleaños de Sofía',
    thumbnail: 'https://images.unsplash.com/photo-1530103862676-de88927954da?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 
    category: 'Cumpleaños',
    year: '2024',
    duration: '20m',
    description: 'Celebrando los 10 años con pastel y piñata.'
  }
];

const VideoPlayer = ({ movie, onClose }) => {
  if (!movie) return null;

  const isYouTube = movie.videoUrl.includes('youtube.com') || movie.videoUrl.includes('youtu.be');
  
  // Parche para YouTube: Extraer ID y usar el dominio nocookie
  let embedUrl = movie.videoUrl;
  if (isYouTube) {
      let videoId = '';
      if (movie.videoUrl.includes('youtube.com/watch?v=')) {
          videoId = movie.videoUrl.split('v=')[1]?.split('&')[0];
      } else if (movie.videoUrl.includes('youtu.be/')) {
          videoId = movie.videoUrl.split('youtu.be/')[1]?.split('?')[0];
      } else if (movie.videoUrl.includes('youtube.com/embed/')) {
          videoId = movie.videoUrl.split('embed/')[1]?.split('?')[0];
      }
      
      if (videoId) {
           embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
      }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-50 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full transition-colors"
      >
        <X className="w-8 h-8" />
      </button>
      
      {isYouTube ? (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          title={movie.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      ) : (
        <video 
          src={movie.videoUrl} 
          controls 
          autoPlay 
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
};

const InfoModal = ({ movie, onClose, onPlay }) => {
    const [showCopied, setShowCopied] = useState(false);

    if (!movie) return null;

    const handleShare = async () => {
        const shareData = {
            title: movie.title,
            text: `¡Mira el recuerdo familiar "${movie.title}" en nuestro MiFlix! 🍿`,
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text} \n ${shareData.url}`);
                setShowCopied(true);
                setTimeout(() => setShowCopied(false), 2000);
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <div className="relative bg-[#181818] w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-gray-800" onClick={e => e.stopPropagation()}>
                <div className="relative aspect-video w-full">
                    <img src={movie.thumbnail} alt={movie.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 bg-[#181818]/70 text-white rounded-full p-2 hover:bg-white hover:text-black transition">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-6 md:left-8">
                         <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">{movie.title}</h2>
                         <div className="flex flex-wrap items-center gap-3">
                             <button onClick={() => { onClose(); onPlay(movie); }} className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded hover:bg-gray-200 transition font-bold text-lg">
                                <Play className="w-5 h-5 fill-current" /> Reproducir
                            </button>
                            <button onClick={handleShare} className="flex items-center gap-2 bg-zinc-800/80 backdrop-blur-sm text-white px-5 py-2.5 rounded hover:bg-zinc-700 transition font-bold text-lg border border-gray-600">
                                <Share2 className="w-5 h-5" /> 
                                {showCopied ? '¡Enlace copiado!' : 'Compartir'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-6 md:p-8 text-white flex-1 overflow-y-auto">
                    <div className="flex items-center gap-4 mb-6 text-sm text-gray-400 font-semibold">
                        <span className="text-green-500">Nuevo</span>
                        <span>{movie.year}</span>
                        <span className="border border-gray-600 px-1.5 rounded">{movie.category}</span>
                        <span>{movie.duration}</span>
                    </div>
                    <p className="text-lg leading-relaxed text-gray-300">{movie.description}</p>
                </div>
            </div>
        </div>
    );
};

const MovieSlider = ({ title, movies, onPlay, onInfo, isAdmin, onDelete }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="mb-8 relative group">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 md:px-12">{title}</h2>
      
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-black/50 p-2 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block hover:bg-black/80"
      >
        <ChevronLeft className="w-8 h-8 text-white" />
      </button>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-4 md:px-12 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie) => (
          <div 
            key={movie.id} 
            className="relative flex-none w-48 sm:w-64 md:w-72 aspect-video transition-transform duration-300 hover:scale-105 hover:z-30 snap-start cursor-pointer rounded-md overflow-hidden group/item"
          >
            <img 
              src={movie.thumbnail} 
              alt={movie.title}
              className="w-full h-full object-cover"
              onClick={() => onPlay(movie)}
            />
            
            {isAdmin && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(movie.id); }}
                    className="absolute top-2 right-2 bg-red-600 p-2 rounded-full text-white opacity-0 group-hover/item:opacity-100 transition shadow-lg z-50 hover:bg-red-700"
                    title="Eliminar video"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <h3 className="text-white font-bold text-sm md:text-base truncate mb-2">{movie.title}</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onPlay(movie); }}
                  className="bg-white rounded-full p-2 hover:bg-gray-200 transition"
                >
                  <Play className="w-4 h-4 text-black fill-current" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onInfo(movie); }}
                  className="border-2 border-gray-400 rounded-full p-2 hover:border-white transition group/btn bg-black/50"
                >
                  <Info className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-40 bg-black/50 p-2 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block hover:bg-black/80"
      >
        <ChevronRight className="w-8 h-8 text-white" />
      </button>
    </div>
  );
};

export default function App() {
  const [playingMovie, setPlayingMovie] = useState(null);
  const [infoMovie, setInfoMovie] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  
  // Estado para Administrador y Datos
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [pin, setPin] = useState('');
  const [movies, setMovies] = useState(INITIAL_MOVIES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: '', videoUrl: '', thumbnail: '', category: 'Familia', description: '', year: new Date().getFullYear().toString(), duration: '' });

  const ADMIN_PIN = '1234';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
        searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
        setIsAdmin(true);
        setShowAdminLogin(false);
        setPin('');
    } else {
        alert("PIN incorrecto");
    }
  };

  const handleAddVideo = (e) => {
    e.preventDefault();
    const video = {
        ...newVideo,
        id: Date.now().toString()
    };
    setMovies([video, ...movies]);
    setShowAddModal(false);
    setNewVideo({ title: '', videoUrl: '', thumbnail: '', category: 'Familia', description: '', year: new Date().getFullYear().toString(), duration: '' });
  };

  const handleDeleteVideo = (id) => {
    if(window.confirm('¿Estás seguro de que quieres eliminar este video?')) {
        setMovies(movies.filter(m => m.id !== id));
    }
  };

  const categories = [...new Set(movies.map(m => m.category))];
  const featuredMovie = movies[0]; // El primer video siempre será el destacado

  // Filtrado por búsqueda
  const filteredMovies = movies.filter(movie => 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#141414] text-white overflow-x-hidden font-sans">
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#141414] shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="px-4 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-red-600 text-2xl md:text-4xl font-black tracking-tighter cursor-pointer">MiFlix</h1>
            <div className="hidden md:flex gap-4 text-sm font-medium text-gray-300">
              <span className="text-white cursor-pointer font-bold">Inicio</span>
              <span className="hover:text-gray-400 cursor-pointer transition">Categorías</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Buscador */}
            <div className={`flex items-center ${isSearchOpen ? 'bg-black/80 border border-white' : ''} px-2 py-1 transition-all duration-300`}>
                <Search 
                    className="w-5 h-5 cursor-pointer hover:text-gray-400 transition" 
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                />
                <input 
                    ref={searchInputRef}
                    type="text"
                    placeholder="Títulos, categorías"
                    className={`bg-transparent text-white text-sm outline-none transition-all duration-300 ${isSearchOpen ? 'w-48 md:w-64 ml-2 opacity-100' : 'w-0 opacity-0'}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => { if(!searchQuery) setIsSearchOpen(false) }}
                />
            </div>
            
            {/* Botón Administrador */}
            {isAdmin ? (
                <button onClick={() => setIsAdmin(false)} className="text-green-500 hover:text-green-400 transition" title="Salir de Modo Administrador">
                    <Unlock className="w-5 h-5" />
                </button>
            ) : (
                <button onClick={() => setShowAdminLogin(true)} className="text-gray-400 hover:text-white transition" title="Modo Administrador">
                    <Lock className="w-5 h-5" />
                </button>
            )}
            
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center cursor-pointer">
              <span className="font-bold">F</span>
            </div>
          </div>
        </div>
      </nav>

      {}
      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-sm border border-zinc-700">
                <h3 className="text-2xl font-bold mb-4 text-center">Modo Editor</h3>
                <p className="text-sm text-gray-400 mb-6 text-center">Ingresa el PIN de seguridad (1234)</p>
                <form onSubmit={handleAdminLogin}>
                    <input 
                        type="password" 
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-600 rounded px-4 py-3 mb-4 text-center text-2xl tracking-widest outline-none focus:border-white"
                        placeholder="••••"
                        autoFocus
                    />
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700">Cancelar</button>
                        <button type="submit" className="flex-1 px-4 py-2 bg-red-600 rounded hover:bg-red-700 font-bold">Desbloquear</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Add Video Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
             <div className="bg-zinc-900 p-6 md:p-8 rounded-lg w-full max-w-xl border border-zinc-700 my-8">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Añadir Nuevo Recuerdo</h3>
                    <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6 hover:text-gray-400"/></button>
                 </div>
                 <form onSubmit={handleAddVideo} className="space-y-4">
                     <div>
                         <label className="block text-sm text-gray-400 mb-1">Título</label>
                         <input required type="text" value={newVideo.title} onChange={e=>setNewVideo({...newVideo, title: e.target.value})} className="w-full bg-zinc-800 border border-zinc-600 rounded p-2 outline-none focus:border-white" />
                     </div>
                     <div>
                         <label className="block text-sm text-gray-400 mb-1">URL del Video (YouTube o MP4)</label>
                         <input required type="text" value={newVideo.videoUrl} onChange={e=>setNewVideo({...newVideo, videoUrl: e.target.value})} className="w-full bg-zinc-800 border border-zinc-600 rounded p-2 outline-none focus:border-white" placeholder="Ej: https://youtu.be/..." />
                     </div>
                     <div>
                         <label className="block text-sm text-gray-400 mb-1">URL de la Imagen de Portada</label>
                         <input required type="text" value={newVideo.thumbnail} onChange={e=>setNewVideo({...newVideo, thumbnail: e.target.value})} className="w-full bg-zinc-800 border border-zinc-600 rounded p-2 outline-none focus:border-white" placeholder="https://..." />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Categoría</label>
                            <input required type="text" value={newVideo.category} onChange={e=>setNewVideo({...newVideo, category: e.target.value})} className="w-full bg-zinc-800 border border-zinc-600 rounded p-2 outline-none focus:border-white" />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Año</label>
                            <input type="text" value={newVideo.year} onChange={e=>setNewVideo({...newVideo, year: e.target.value})} className="w-full bg-zinc-800 border border-zinc-600 rounded p-2 outline-none focus:border-white" />
                        </div>
                     </div>
                     <div>
                         <label className="block text-sm text-gray-400 mb-1">Descripción corta</label>
                         <textarea value={newVideo.description} onChange={e=>setNewVideo({...newVideo, description: e.target.value})} className="w-full bg-zinc-800 border border-zinc-600 rounded p-2 outline-none focus:border-white h-24"></textarea>
                     </div>
                     <button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-3 rounded font-bold mt-4 transition">Guardar Video</button>
                 </form>
             </div>
          </div>
      )}

      {}
      {/* Modo Búsqueda Activo */}
      {searchQuery ? (
          <div className="pt-32 px-4 md:px-12 min-h-screen">
              <h2 className="text-xl md:text-2xl font-semibold mb-6">
                  Resultados para "{searchQuery}"
              </h2>
              {filteredMovies.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {filteredMovies.map(movie => (
                          <div 
                              key={movie.id} 
                              className="relative aspect-video transition-transform duration-300 hover:scale-105 hover:z-30 cursor-pointer rounded-md overflow-hidden group/item"
                              onClick={() => setInfoMovie(movie)}
                          >
                              <img src={movie.thumbnail} alt={movie.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                  <Play className="w-12 h-12 text-white/80" />
                              </div>
                              <div className="absolute bottom-2 left-2 right-2">
                                  <p className="text-white text-sm font-semibold truncate drop-shadow-md">{movie.title}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                      <Search className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-lg">No encontramos coincidencias.</p>
                  </div>
              )}
          </div>
      ) : (
          /* Modo Normal (Hero + Sliders) */
          <>
              {/* Botón flotante Admin */}
              {isAdmin && (
                  <button 
                      onClick={() => setShowAddModal(true)}
                      className="fixed bottom-8 right-8 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-2xl flex items-center gap-2 font-bold transition-transform hover:scale-105"
                  >
                      <Plus className="w-6 h-6" /> Añadir Video
                  </button>
              )}

              {/* Hero Section */}
              {featuredMovie && (
                  <div className="relative h-[70vh] md:h-[85vh] w-full">
                    <div className="absolute inset-0">
                      <img 
                        src={featuredMovie.thumbnail} 
                        alt={featuredMovie.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                    </div>
                    
                    <div className="absolute bottom-1/4 left-4 md:left-12 max-w-2xl">
                      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
                        {featuredMovie.title}
                      </h1>
                      <p className="text-gray-200 text-sm md:text-lg mb-6 line-clamp-3 drop-shadow-md max-w-xl">
                        {featuredMovie.description}
                      </p>
                      
                      <div className="flex items-center gap-3 md:gap-4">
                        <button 
                          onClick={() => setPlayingMovie(featuredMovie)}
                          className="flex items-center gap-2 bg-white text-black px-4 md:px-8 py-2 md:py-3 rounded hover:bg-gray-200 transition font-bold text-sm md:text-lg"
                        >
                          <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                          Reproducir
                        </button>
                        <button 
                          onClick={() => setInfoMovie(featuredMovie)}
                          className="flex items-center gap-2 bg-gray-500/70 text-white px-4 md:px-8 py-2 md:py-3 rounded hover:bg-gray-500/90 transition font-bold text-sm md:text-lg backdrop-blur-sm"
                        >
                          <Info className="w-5 h-5 md:w-6 md:h-6" />
                          Más información
                        </button>
                      </div>
                    </div>
                  </div>
              )}

              {/* Sliders de Categorías */}
              <div className="-mt-16 md:-mt-32 pb-20 relative z-10">
                {categories.map((category) => (
                    <MovieSlider 
                        key={category}
                        title={category} 
                        movies={movies.filter(m => m.category === category)}
                        onPlay={setPlayingMovie}
                        onInfo={setInfoMovie}
                        isAdmin={isAdmin}
                        onDelete={handleDeleteVideo}
                    />
                ))}
              </div>
          </>
      )}

      {}
      {playingMovie && (
        <VideoPlayer 
          movie={playingMovie} 
          onClose={() => setPlayingMovie(null)} 
        />
      )}

      {infoMovie && (
        <InfoModal 
          movie={infoMovie} 
          onClose={() => setInfoMovie(null)}
          onPlay={(movie) => {
            setInfoMovie(null);
            setPlayingMovie(movie);
          }}
        />
      )}
    </div>
  );
}