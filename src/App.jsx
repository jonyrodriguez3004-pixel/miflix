import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Info, X, ChevronLeft, ChevronRight, Search, Lock, Unlock, 
  Plus, Trash2, Share2, Folder, Video, ChevronDown, Check, AlertCircle 
} from 'lucide-react';
import { initializeApp } from 'firebase/app';

// Configuración de inicialización simulada para mantener el entorno estable
const firebaseConfig = {
  apiKey: "AIzaSyFakeKey123",
  authDomain: "miflix-demo.firebaseapp.com",
  projectId: "miflix-demo",
  storageBucket: "miflix-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
initializeApp(firebaseConfig);

const INITIAL_MOVIES = [
  {
    id: '1',
    title: 'Viaje a la Montaña (Invierno)',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
    category: 'Viajes',
    year: '2023',
    duration: '15m',
    description: 'Nuestra aventura escalando el pico nevado el invierno pasado con toda la familia.',
    isSeries: false,
    isEmbed: false
  },
  {
    id: '2',
    title: 'Colección Vacaciones de Verano',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    category: 'Viajes',
    year: '2025',
    description: 'Recopilación de nuestros mejores días en la costa, paseos en lancha y fogatas nocturnas.',
    isSeries: true,
    episodes: [
      {
        id: 'ep1',
        title: 'Capítulo 1: Llegada al Puerto y Primer Atardecer',
        videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        duration: '10m',
        isEmbed: false
      },
      {
        id: 'ep2',
        title: 'Capítulo 2: El Paseo en Lancha y los Delfines',
        videoUrl: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
        duration: '12m',
        isEmbed: false
      }
    ]
  },
  {
    id: '3',
    title: 'Cumpleaños Sorpresa de Mamá',
    thumbnail: 'https://images.unsplash.com/photo-1530103862676-de88927954da?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ', 
    category: 'Eventos',
    year: '2024',
    duration: '20m',
    description: 'Mariachis, pastel y las lágrimas de emoción de mamá en su fiesta sorpresa.',
    isSeries: false,
    isEmbed: false
  }
];

const VideoPlayer = ({ movie, onClose }) => {
  if (!movie) return null;

  // Verificamos si es un código de inserción o iframe
  const isEmbed = movie.isEmbed || !!movie.embedCode;

  if (isEmbed && movie.embedCode) {
    let adjustedEmbed = movie.embedCode;
    // Forzamos que se adapte al tamaño de la pantalla responsivamente
    adjustedEmbed = adjustedEmbed.replace(/width="[0-9%px]*"/g, 'width="100%"');
    adjustedEmbed = adjustedEmbed.replace(/height="[0-9%px]*"/g, 'height="100%"');
    if (adjustedEmbed.includes('<iframe')) {
      adjustedEmbed = adjustedEmbed.replace('<iframe', '<iframe style="width: 100%; height: 100%; border: none;"');
    }

    return (
      <div className="fixed inset-0 z-[110] bg-black flex items-center justify-center">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 text-white hover:text-gray-300 bg-black/50 p-2 rounded-full transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        <div 
          className="w-full h-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: adjustedEmbed }}
        />
      </div>
    );
  }

  const url = movie.videoUrl || '';
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isDrive = url.includes('drive.google.com') || url.includes('docs.google.com');

  let embedUrl = url;
  if (isYouTube) {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }
    if (videoId) {
      embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    }
  }

  let driveEmbedUrl = '';
  if (isDrive) {
    let driveId = '';
    if (url.includes('/file/d/')) {
      driveId = url.split('/file/d/')[1]?.split('/')[0]?.split('?')[0];
    } else if (url.includes('id=')) {
      driveId = url.split('id=')[1]?.split('&')[0];
    } else if (url.includes('export=download')) {
      driveId = url.split('id=')[1]?.split('&')[0];
    }
    if (driveId) {
      driveEmbedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
    }
  }

  return (
    <div className="fixed inset-0 z-[110] bg-black flex items-center justify-center">
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
      ) : isDrive && driveEmbedUrl ? (
        <iframe
          src={driveEmbedUrl}
          className="w-full h-full border-none"
          title={movie.title}
          allow="autoplay; encrypted-media"
          allowFullScreen
        ></iframe>
      ) : (
        <video 
          src={url} 
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
      text: `¡Mira nuestro recuerdo familiar "${movie.title}" en MiFlix! 🍿`,
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
      console.error('Error al compartir:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm"></div>
      <div 
        className="relative bg-[#181818] w-full max-w-3xl rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-zinc-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full">
          <img src={movie.thumbnail} alt={movie.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent"></div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-black/75 text-white rounded-full p-2 hover:bg-white hover:text-black transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 drop-shadow-md">{movie.title}</h2>
            
            <div className="flex flex-wrap items-center gap-3">
              {!movie.isSeries ? (
                <button 
                  onClick={() => { onClose(); onPlay(movie); }} 
                  className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition font-bold"
                >
                  <Play className="w-5 h-5 fill-current" /> Reproducir
                </button>
              ) : (
                <span className="bg-red-600 text-white font-bold px-3 py-1 rounded text-sm uppercase tracking-wider">
                  Colección de Recuerdos
                </span>
              )}
              <button 
                onClick={handleShare} 
                className="flex items-center gap-2 bg-zinc-800/80 backdrop-blur-sm text-white px-5 py-2 rounded hover:bg-zinc-700 transition font-bold border border-zinc-700"
              >
                <Share2 className="w-5 h-5" /> 
                {showCopied ? '¡Copiado!' : 'Compartir'}
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="p-6 md:p-8 text-white flex-1 overflow-y-auto">
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-400 font-semibold">
            <span className="text-green-500 font-bold">★ Recuerdo Familiar</span>
            <span>{movie.year}</span>
            <span className="border border-zinc-700 px-2 py-0.5 rounded text-xs uppercase bg-zinc-800">{movie.category}</span>
            {!movie.isSeries && <span>{movie.duration}</span>}
          </div>
          <p className="text-base text-zinc-300 leading-relaxed mb-6">{movie.description}</p>

          {/* Sección de episodios si es una Carpeta/Serie */}
          {movie.isSeries && movie.episodes && (
            <div className="mt-6 border-t border-zinc-800 pt-6">
              <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                <Folder className="w-5 h-5 text-red-500" /> Lista de Videos / Capítulos ({movie.episodes.length})
              </h3>
              <div className="space-y-3">
                {movie.episodes.map((ep, idx) => (
                  <div 
                    key={ep.id || idx}
                    className="flex items-center justify-between p-3 bg-zinc-900/60 hover:bg-zinc-800/80 rounded-lg border border-zinc-800/50 transition duration-200 group/ep cursor-pointer"
                    onClick={() => { onClose(); onPlay(ep); }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover/ep:bg-red-600 group-hover/ep:text-white transition">
                        <Play className="w-4 h-4 fill-current" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-zinc-100 group-hover/ep:text-white">{ep.title}</p>
                        <span className="text-xs text-zinc-500">{ep.duration || 'Video'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
      <h2 className="text-lg md:text-xl font-bold text-zinc-200 mb-3 px-4 md:px-12 flex items-center gap-2">
        <span>{title}</span>
      </h2>
      
      <button 
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-black/60 p-2 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block hover:bg-black/90 text-white"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-4 md:px-12 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie) => (
          <div 
            key={movie.id} 
            className="relative flex-none w-44 sm:w-60 md:w-64 aspect-video transition-transform duration-300 hover:scale-105 hover:z-30 snap-start cursor-pointer rounded-lg overflow-hidden group/item border border-zinc-800/40 shadow-md"
          >
            <img 
              src={movie.thumbnail || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80'} 
              alt={movie.title}
              className="w-full h-full object-cover"
              onClick={() => onInfo(movie)}
            />
            
            {/* Etiquetas distintivas sobre la portada */}
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-red-500">
              {movie.isSeries ? 'Colección' : 'Video'}
            </div>

            {isAdmin && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(movie.id); }}
                className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-full text-white opacity-0 group-hover/item:opacity-100 transition shadow-lg z-40 hover:bg-red-700"
                title="Eliminar recuerdo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <h3 className="text-white font-bold text-xs md:text-sm truncate mb-2">{movie.title}</h3>
              <div className="flex items-center gap-2">
                {!movie.isSeries ? (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onPlay(movie); }}
                    className="bg-white rounded-full p-1.5 hover:bg-gray-200 transition"
                  >
                    <Play className="w-3.5 h-3.5 text-black fill-current" />
                  </button>
                ) : (
                  <div className="bg-red-600 rounded-full p-1.5 hover:bg-red-700 transition">
                    <Folder className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); onInfo(movie); }}
                  className="border border-zinc-400 rounded-full p-1.5 hover:border-white transition bg-black/50"
                >
                  <Info className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-40 bg-black/60 p-2 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:block hover:bg-black/90 text-white"
      >
        <ChevronRight className="w-7 h-7" />
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
  
  // Estado para Administrador y datos persistentes
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  
  // Persistencia de datos en LocalStorage
  const [movies, setMovies] = useState(() => {
    const saved = localStorage.getItem('miflix_custom_movies');
    return saved ? JSON.parse(saved) : INITIAL_MOVIES;
  });

  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); // ID del video a borrar

  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newVideo, setNewVideo] = useState({ 
    title: '', 
    videoUrl: '', 
    embedCode: '',
    isEmbed: false,
    thumbnail: '', 
    category: 'Familia', 
    description: '', 
    year: new Date().getFullYear().toString(), 
    duration: '',
    isSeries: false,
    episodes: []
  });

  // Estado para agregar episodios uno por uno en el modal
  const [tempEpisode, setTempEpisode] = useState({
    title: '',
    videoUrl: '',
    embedCode: '',
    isEmbed: false,
    duration: ''
  });

  const ADMIN_PIN = '1234';

  useEffect(() => {
    localStorage.setItem('miflix_custom_movies', JSON.stringify(movies));
  }, [movies]);

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
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const handleAddVideo = (e) => {
    e.preventDefault();
    const videoToSave = {
      ...newVideo,
      id: Date.now().toString(),
      // Si es video único, aseguramos que la lista de episodios esté limpia
      episodes: newVideo.isSeries ? newVideo.episodes : []
    };
    
    setMovies([videoToSave, ...movies]);
    setShowAddModal(false);
    
    // Reseteamos el formulario
    setNewVideo({ 
      title: '', 
      videoUrl: '', 
      embedCode: '',
      isEmbed: false,
      thumbnail: '', 
      category: 'Familia', 
      description: '', 
      year: new Date().getFullYear().toString(), 
      duration: '',
      isSeries: false,
      episodes: []
    });
  };

  const handleAddEpisodeToTempList = () => {
    if (!tempEpisode.title) return;
    const newEp = {
      ...tempEpisode,
      id: `ep-${Date.now()}`
    };
    setNewVideo({
      ...newVideo,
      episodes: [...newVideo.episodes, newEp]
    });
    // Limpiamos el subformulario
    setTempEpisode({
      title: '',
      videoUrl: '',
      embedCode: '',
      isEmbed: false,
      duration: ''
    });
  };

  const handleRemoveEpisodeFromTempList = (id) => {
    setNewVideo({
      ...newVideo,
      episodes: newVideo.episodes.filter(ep => ep.id !== id)
    });
  };

  const confirmDeleteVideo = () => {
    if (deleteConfirmId) {
      setMovies(movies.filter(m => m.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const categoriesList = ['Todas', ...new Set(movies.map(m => m.category))];
  const featuredMovie = movies.find(m => !m.isSeries) || movies[0]; // Buscamos una peli o tomamos el primero para el Banner

  // Filtrado final de películas basado en Búsqueda y Categoría
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          movie.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          movie.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todas' || movie.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#141414] text-white overflow-x-hidden font-sans select-none">
      
      {/* Navigation Bar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#141414] shadow-lg border-b border-zinc-800/40' : 'bg-gradient-to-b from-black/90 to-transparent'}`}>
        <div className="px-4 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-red-600 text-2xl md:text-3xl font-black tracking-tighter cursor-pointer hover:scale-105 transition active:scale-95" onClick={() => { setSelectedCategory('Todas'); setSearchQuery(''); }}>
              MiFlix
            </h1>
            
            <div className="flex items-center gap-4 text-sm font-medium relative">
              <button 
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition font-bold bg-zinc-900/40 px-3 py-1.5 rounded-md border border-zinc-800"
              >
                <span>Categorías: <strong className="text-red-500">{selectedCategory}</strong></span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Dropdown de Categorías */}
              {isCategoryMenuOpen && (
                <div className="absolute top-10 left-0 bg-[#181818] border border-zinc-800 rounded-lg shadow-xl py-2 w-48 z-50">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsCategoryMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition hover:bg-zinc-800 ${selectedCategory === cat ? 'text-red-500 font-bold' : 'text-zinc-300'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* Buscador Integrado */}
            <div className={`flex items-center ${isSearchOpen ? 'bg-black/90 border border-zinc-700 rounded-md' : ''} px-2 py-1 transition-all duration-300`}>
              <Search 
                className="w-5 h-5 cursor-pointer text-zinc-400 hover:text-white transition" 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Títulos, categorías..."
                className={`bg-transparent text-white text-xs md:text-sm outline-none transition-all duration-300 ${isSearchOpen ? 'w-36 sm:w-56 ml-2 opacity-100' : 'w-0 opacity-0'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => { if(!searchQuery) setIsSearchOpen(false) }}
              />
            </div>
            
            {/* Botón Administrador (Cerradura) */}
            {isAdmin ? (
              <button onClick={() => setIsAdmin(false)} className="text-green-500 bg-green-500/10 p-2 rounded-full border border-green-500/20 hover:scale-105 transition" title="Salir de Modo Editor">
                <Unlock className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setShowAdminLogin(true)} className="text-zinc-400 bg-zinc-900 border border-zinc-800 p-2 rounded-full hover:text-white hover:scale-105 transition" title="Modo Editor">
                <Lock className="w-4 h-4" />
              </button>
            )}
            
            <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-black text-sm">
              F
            </div>
          </div>
        </div>
      </nav>

      {}
      {showAdminLogin && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] p-8 rounded-xl w-full max-w-sm border border-zinc-800 shadow-2xl">
            <h3 className="text-xl font-bold mb-2 text-center text-white">Modo Editor</h3>
            <p className="text-xs text-zinc-400 mb-6 text-center">Ingresa el PIN de seguridad (1234) para gestionar videos familiares.</p>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input 
                type="password" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-red-500 text-white"
                placeholder="••••"
                maxLength={4}
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-red-500 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> PIN Incorrecto. Intenta de nuevo.
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setShowAdminLogin(false); setPinError(false); }} 
                  className="flex-1 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg font-semibold transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg font-bold transition shadow-lg shadow-red-600/20"
                >
                  Desbloquear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] p-6 rounded-xl w-full max-w-md border border-zinc-800 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">¿Eliminar recuerdo familiar?</h3>
            <p className="text-sm text-zinc-400 mb-6">Esta acción quitará el video permanentemente de tu lista de MiFlix. ¿Deseas continuar?</p>
            
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setDeleteConfirmId(null)} 
                className="px-5 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg font-semibold transition"
              >
                No, mantener
              </button>
              <button 
                onClick={confirmDeleteVideo} 
                className="px-5 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg font-bold transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#181818] p-6 md:p-8 rounded-xl w-full max-w-2xl border border-zinc-800 my-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Video className="w-6 h-6 text-red-600" /> Añadir Nuevo Recuerdo
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddVideo} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Título del Recuerdo</label>
                  <input 
                    required 
                    type="text" 
                    value={newVideo.title} 
                    onChange={e => setNewVideo({...newVideo, title: e.target.value})} 
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-red-500" 
                    placeholder="Ej. Cumpleaños de la Abuela"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">URL de la Imagen de Portada</label>
                  <input 
                    required 
                    type="text" 
                    value={newVideo.thumbnail} 
                    onChange={e => setNewVideo({...newVideo, thumbnail: e.target.value})} 
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-red-500" 
                    placeholder="https://images.unsplash.com/..." 
                  />
                </div>
              </div>

              {/* Selector de Tipo: Video Único o Serie */}
              <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-800/80">
                <label className="block text-zinc-300 font-semibold mb-2">Estructura del Recuerdo</label>
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setNewVideo({...newVideo, isSeries: false})}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs border transition flex items-center justify-center gap-1.5 ${!newVideo.isSeries ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/10' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                  >
                    <Video className="w-4 h-4" /> Video Único / Película
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNewVideo({...newVideo, isSeries: true})}
                    className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs border transition flex items-center justify-center gap-1.5 ${newVideo.isSeries ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/10' : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}
                  >
                    <Folder className="w-4 h-4" /> Serie / Carpeta de Videos
                  </button>
                </div>
              </div>

              {}
              {!newVideo.isSeries ? (
                <div className="bg-zinc-900/40 p-4 rounded-lg border border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-zinc-300 font-semibold">Origen del Video</label>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => setNewVideo({...newVideo, isEmbed: false})}
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded transition ${!newVideo.isEmbed ? 'bg-zinc-200 text-black' : 'bg-zinc-800 text-zinc-400'}`}
                      >
                        Enlace Normal
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setNewVideo({...newVideo, isEmbed: true})}
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded transition ${newVideo.isEmbed ? 'bg-zinc-200 text-black' : 'bg-zinc-800 text-zinc-400'}`}
                      >
                        Código Embed
                      </button>
                    </div>
                  </div>

                  {!newVideo.isEmbed ? (
                    <input 
                      required={!newVideo.isSeries && !newVideo.isEmbed}
                      type="text" 
                      value={newVideo.videoUrl} 
                      onChange={e => setNewVideo({...newVideo, videoUrl: e.target.value})} 
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-red-500" 
                      placeholder="Ej. https://drive.google.com/file/d/... o YouTube"
                    />
                  ) : (
                    <textarea 
                      required={!newVideo.isSeries && newVideo.isEmbed}
                      value={newVideo.embedCode} 
                      onChange={e => setNewVideo({...newVideo, embedCode: e.target.value})} 
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-red-500 h-20 font-mono text-xs" 
                      placeholder='Ej. <iframe src="..." ...></iframe>'
                    />
                  )}
                </div>
              ) : (
                <div className="bg-zinc-900/40 p-4 rounded-lg border border-zinc-800 space-y-3">
                  <h4 className="font-bold text-zinc-300 flex items-center gap-1"><Folder className="w-4 h-4 text-red-500" /> Crear Lista de Videos (Capítulos)</h4>
                  
                  {/* Lista de episodios ya agregados temporalmente */}
                  {newVideo.episodes.length > 0 && (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto bg-zinc-950/50 p-2 rounded border border-zinc-800">
                      {newVideo.episodes.map((ep, idx) => (
                        <div key={ep.id} className="flex justify-between items-center text-xs bg-zinc-900 p-2 rounded border border-zinc-800">
                          <span className="font-semibold">{idx + 1}. {ep.title} ({ep.duration || 'N/A'})</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveEpisodeFromTempList(ep.id)}
                            className="text-red-500 hover:text-red-400 transition"
                          >
                            Quitar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Creador de episodio temporal */}
                  <div className="p-3 bg-zinc-900/80 rounded-lg border border-zinc-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="Título del Capítulo (Ej. Día 1 - Viaje)" 
                        value={tempEpisode.title}
                        onChange={e => setTempEpisode({...tempEpisode, title: e.target.value})}
                        className="bg-zinc-950 border border-zinc-800 p-2 rounded text-xs outline-none focus:border-red-500 text-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Duración (Ej. 10m)" 
                        value={tempEpisode.duration}
                        onChange={e => setTempEpisode({...tempEpisode, duration: e.target.value})}
                        className="bg-zinc-950 border border-zinc-800 p-2 rounded text-xs outline-none focus:border-red-500 text-white"
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setTempEpisode({...tempEpisode, isEmbed: false})}
                        className={`text-[9px] font-bold px-2 py-1 rounded ${!tempEpisode.isEmbed ? 'bg-zinc-300 text-black' : 'bg-zinc-800 text-zinc-400'}`}
                      >
                        Enlace Normal
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setTempEpisode({...tempEpisode, isEmbed: true})}
                        className={`text-[9px] font-bold px-2 py-1 rounded ${tempEpisode.isEmbed ? 'bg-zinc-300 text-black' : 'bg-zinc-800 text-zinc-400'}`}
                      >
                        Embed
                      </button>
                    </div>

                    {!tempEpisode.isEmbed ? (
                      <input 
                        type="text" 
                        placeholder="URL de Video (Drive, MP4, YouTube)" 
                        value={tempEpisode.videoUrl}
                        onChange={e => setTempEpisode({...tempEpisode, videoUrl: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-xs outline-none focus:border-red-500"
                      />
                    ) : (
                      <textarea 
                        placeholder='Código Embed completo <iframe ...></iframe>' 
                        value={tempEpisode.embedCode}
                        onChange={e => setTempEpisode({...tempEpisode, embedCode: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 p-2 rounded text-xs outline-none focus:border-red-500 h-14 font-mono"
                      />
                    )}

                    <button 
                      type="button" 
                      onClick={handleAddEpisodeToTempList}
                      disabled={!tempEpisode.title}
                      className="w-full py-1.5 bg-zinc-800 text-white font-bold hover:bg-zinc-700 text-xs rounded transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Guardar Capítulo en la Lista
                    </button>
                  </div>
                </div>
              )}

              {}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Categoría / Carpeta</label>
                  <input 
                    required 
                    type="text" 
                    value={newVideo.category} 
                    onChange={e => setNewVideo({...newVideo, category: e.target.value})} 
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-red-500" 
                    placeholder="Ej. Viajes, Familia"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Año</label>
                  <input 
                    type="text" 
                    value={newVideo.year} 
                    onChange={e => setNewVideo({...newVideo, year: e.target.value})} 
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-red-500" 
                  />
                </div>
              </div>

              {!newVideo.isSeries && (
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Duración del Video</label>
                  <input 
                    type="text" 
                    value={newVideo.duration} 
                    onChange={e => setNewVideo({...newVideo, duration: e.target.value})} 
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-red-500" 
                    placeholder="Ej. 15m, 1h 20m"
                  />
                </div>
              )}

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Descripción Corta</label>
                <textarea 
                  value={newVideo.description} 
                  onChange={e => setNewVideo({...newVideo, description: e.target.value})} 
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2.5 outline-none focus:border-red-500 h-20" 
                  placeholder="Detalles significativos..."
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold mt-4 transition shadow-lg shadow-red-600/20 text-sm"
              >
                Guardar Recuerdo en MiFlix
              </button>
            </form>
          </div>
        </div>
      )}

      {}
      {searchQuery || selectedCategory !== 'Todas' ? (
        <div className="pt-28 px-4 md:px-12 min-h-screen">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 border-b border-zinc-800 pb-4">
            <h2 className="text-xl md:text-2xl font-bold">
              {searchQuery ? `Resultados para "${searchQuery}"` : `Mostrando la categoría: ${selectedCategory}`}
            </h2>
            <button 
              onClick={() => { setSelectedCategory('Todas'); setSearchQuery(''); }}
              className="text-xs text-red-500 hover:underline font-bold mt-2 sm:mt-0"
            >
              Borrar filtros / Ir al inicio
            </button>
          </div>

          {filteredMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
              {filteredMovies.map(movie => (
                <div 
                  key={movie.id} 
                  className="relative aspect-video transition-transform duration-300 hover:scale-105 hover:z-30 cursor-pointer rounded-lg overflow-hidden group/item border border-zinc-800/40"
                  onClick={() => setInfoMovie(movie)}
                >
                  <img src={movie.thumbnail} alt={movie.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-10 h-10 text-white/80" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-semibold truncate drop-shadow-md">{movie.title}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500">
              <Search className="w-16 h-16 mb-4 opacity-30 text-red-600" />
              <p className="text-lg font-semibold">No se encontraron recuerdos.</p>
              <p className="text-xs text-zinc-600 mt-1">Prueba con otras palabras o selecciona otra categoría.</p>
            </div>
          )}
        </div>
      ) : (
        /* Normal Mode: Banner Hero + Sliders */
        <>
          {/* Botón flotante para Administrador */}
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="fixed bottom-8 right-8 z-50 bg-red-600 hover:bg-red-700 text-white rounded-full px-5 py-3.5 shadow-2xl flex items-center gap-2 font-bold transition-transform hover:scale-105"
            >
              <Plus className="w-5 h-5" /> Añadir Video / Carpeta
            </button>
          )}

          {}
          {featuredMovie && (
            <div className="relative h-[70vh] md:h-[80vh] w-full">
              <div className="absolute inset-0">
                <img 
                  src={featuredMovie.thumbnail} 
                  alt={featuredMovie.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
              </div>
              
              <div className="absolute bottom-1/5 left-4 md:left-12 max-w-2xl">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 drop-shadow-lg leading-tight">
                  {featuredMovie.title}
                </h1>
                <p className="text-zinc-200 text-xs md:text-sm mb-6 line-clamp-3 drop-shadow-md max-w-lg leading-relaxed">
                  {featuredMovie.description}
                </p>
                
                <div className="flex items-center gap-3">
                  {!featuredMovie.isSeries ? (
                    <button 
                      onClick={() => setPlayingMovie(featuredMovie)}
                      className="flex items-center gap-2 bg-white text-black px-6 py-2.5 rounded-lg hover:bg-gray-200 transition font-bold text-sm"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Reproducir
                    </button>
                  ) : (
                    <span className="bg-red-600 text-white font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider">
                      Colección de Recuerdos
                    </span>
                  )}
                  <button 
                    onClick={() => setInfoMovie(featuredMovie)}
                    className="flex items-center gap-2 bg-zinc-500/40 text-white px-6 py-2.5 rounded-lg hover:bg-zinc-500/60 transition font-bold text-sm backdrop-blur-md border border-zinc-600/20"
                  >
                    <Info className="w-4 h-4" />
                    Más información
                  </button>
                </div>
              </div>
            </div>
          )}

          {}
          <div className="-mt-12 md:-mt-20 pb-24 relative z-10">
            {categoriesList.filter(c => c !== 'Todas').map((category) => (
              <MovieSlider 
                key={category}
                title={category} 
                movies={movies.filter(m => m.category === category)}
                onPlay={setPlayingMovie}
                onInfo={setInfoMovie}
                isAdmin={isAdmin}
                onDelete={(id) => setDeleteConfirmId(id)}
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
