import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { feature } from 'topojson-client';
import { Link } from 'react-router';
import { Toaster, toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { Country, City } from '../data/types';
import { DeleteDialog } from './ui/DeleteDialog';
import { Field, Input, Select } from './ui/Modal';
import { getCountryWeatherCity, getWeatherLabel, useCitiesWeather, useCityWeather } from '../hooks/useCityWeather';
import {
  Globe as GlobeIcon, Search, User, LogOut, LayoutDashboard,
  Flag, Layers, Building2, Users, DollarSign, Languages, MapPin,
  Thermometer, Wind, Pencil, Trash2, Plus, X, ChevronLeft,
  Save, ZoomIn, ZoomOut, RotateCcw, Lock, Mail, Eye, EyeOff,
  AlertCircle, ChevronDown, RefreshCw,
} from 'lucide-react';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const OCEAN = {
  bg: '#020617',
  deep: '#0f172a',
  teal: '#10b981',
  aqua: '#22d3ee',
  mint: '#6ee7b7',
  blue: '#0ea5e9',
};

const SPACE_BACKGROUND = `
  radial-gradient(circle at 18% 22%, rgba(125, 211, 252, 0.28) 0 1px, transparent 2px),
  radial-gradient(circle at 72% 18%, rgba(255, 255, 255, 0.75) 0 1px, transparent 2px),
  radial-gradient(circle at 42% 68%, rgba(186, 230, 253, 0.52) 0 1px, transparent 2px),
  radial-gradient(circle at 84% 72%, rgba(45, 212, 191, 0.38) 0 1px, transparent 2px),
  radial-gradient(circle at 58% 35%, rgba(255, 255, 255, 0.46) 0 1px, transparent 2px),
  radial-gradient(circle at 50% 45%, rgba(14, 165, 233, 0.16), transparent 42%),
  linear-gradient(180deg, #020617 0%, #071827 48%, #020617 100%)
`;

const CONTINENTS_NAV = [
  { name: 'África', lat: 3, lng: 22, color: '#8bc6b2' },
  { name: 'Ásia', lat: 34, lng: 100, color: '#8fbfd4' },
  { name: 'Europa', lat: 52, lng: 15, color: '#9cb7d8' },
  { name: 'América N.', lat: 46, lng: -100, color: '#8fc9c1' },
  { name: 'América S.', lat: -14, lng: -57, color: '#9dc58b' },
  { name: 'Oceania', lat: -24, lng: 134, color: '#67e8f9' },
];

const temperatureColor = (temperature: number) => {
  if (temperature >= 32) return 'rgba(205, 154, 92, 0.34)';
  if (temperature >= 24) return 'rgba(213, 196, 121, 0.32)';
  if (temperature >= 16) return 'rgba(142, 181, 136, 0.3)';
  if (temperature >= 6) return 'rgba(142, 190, 199, 0.3)';
  return 'rgba(176, 188, 211, 0.32)';
};

const temperatureAccent = (temperature: number) => {
  if (temperature >= 32) return '#c99a63';
  if (temperature >= 24) return '#c8bc7e';
  if (temperature >= 16) return '#91ad8c';
  if (temperature >= 6) return '#90b8c0';
  return '#b4bfd2';
};

type GeoFeature = { id: string; type: string; geometry: object; properties: Record<string, unknown> };
type PanelMode = 'view' | 'editCountry' | 'cityForm';
type GlobeLayer = 'countries' | 'weather';
const mkEmptyCity = (lat = 0, lng = 0) => ({ name: '', population: 0, lat, lng, isCapital: false, countryId: '' });

export default function GlobeMain() {
  const {
    isAuthenticated, login, register, logout, user, authError, recordActivity,
    countries, continents, cities,
    updateCountry, deleteCountry, addCity, updateCity, deleteCity,
  } = useApp();

  // Globe
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  // Selection
  const [selected, setSelected] = useState<Country | null>(null);

  // Panel
  const [mode, setMode] = useState<PanelMode>('view');
  const [editForm, setEditForm] = useState<Partial<Country>>({});
  const [cityForm, setCityForm] = useState(mkEmptyCity());
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deleteType, setDeleteType] = useState<'country' | 'city' | null>(null);
  const [deleteCityTarget, setDeleteCityTarget] = useState<City | null>(null);
  const [saving, setSaving] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // User menu
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Login
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [registerName, setRegisterName] = useState('');
  const [loginEmail, setLoginEmail] = useState('admin@geocrud.app');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [globeLayer, setGlobeLayer] = useState<GlobeLayer>('weather');
  const [tempMin, setTempMin] = useState(-10);
  const [tempMax, setTempMax] = useState(45);
  const [showExtremes, setShowExtremes] = useState(true);
  const { citiesWeather, citiesWeatherLoading, citiesWeatherRefreshing, refreshCitiesWeather } = useCitiesWeather(isAuthenticated);
  const isCompact = size.w < 820;
  const isTiny = size.w < 560;

  // Resize observer
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        setSize({ w: Math.floor(e.contentRect.width), h: Math.floor(e.contentRect.height) });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Load TopoJSON
  useEffect(() => {
    fetch(GEO_URL)
      .then(r => r.json())
      .then(world => {
        const fc = (feature as any)(world, world.objects.countries);
        setFeatures(fc.features);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Globe controls
  useEffect(() => {
    if (!globeRef.current) return;
    const ctrl = globeRef.current.controls();
    ctrl.autoRotate = !selected;
    ctrl.autoRotateSpeed = isAuthenticated ? 0.3 : 0.6;
    ctrl.enableDamping = true;
    ctrl.dampingFactor = 0.07;
    ctrl.minDistance = 120;
    ctrl.maxDistance = 900;
    ctrl.enablePan = false;
  }, [selected, isAuthenticated]);

  const isoMap = useMemo(() => {
    const entries = countries.flatMap(c => [
      [String(c.isoNumeric), c],
      [String(c.isoNumeric).padStart(3, '0'), c],
    ]);
    return Object.fromEntries(entries);
  }, [countries]);

  const cityWeatherMarkers = useMemo(() => citiesWeather.filter(item =>
    Number.isFinite(item.city.latitude) &&
    Number.isFinite(item.city.longitude) &&
    item.temperature >= tempMin &&
    item.temperature <= tempMax
  ), [citiesWeather, tempMin, tempMax]);

  const allWeatherMarkers = useMemo(() => citiesWeather.filter(item =>
    Number.isFinite(item.city.latitude) && Number.isFinite(item.city.longitude)
  ), [citiesWeather]);

  const rankedWeather = useMemo(
    () => [...cityWeatherMarkers].sort((a, b) => b.temperature - a.temperature),
    [cityWeatherMarkers]
  );
  const hottestCity = rankedWeather[0] ?? null;
  const coldestCity = rankedWeather[rankedWeather.length - 1] ?? null;

  // Globe color/altitude callbacks
  const getCapColor = useCallback((d: object) => {
    const { id } = d as GeoFeature;
    const c = isoMap[id];
    if (!c) return 'rgba(7, 25, 34, 0.12)';
    if (globeLayer === 'weather') {
      if (selected?.id === c.id) return 'rgba(170, 218, 213, 0.26)';
      if (hovered === id) return 'rgba(170, 218, 213, 0.2)';
      return 'rgba(190, 215, 202, 0.13)';
    }
    if (selected?.id === c.id) return 'rgba(132, 202, 214, 0.58)';
    if (hovered === id) return 'rgba(154, 210, 186, 0.5)';
    return 'rgba(92, 151, 133, 0.34)';
  }, [isoMap, selected, hovered, globeLayer]);

  const getAlt = useCallback((d: object) => {
    const { id } = d as GeoFeature;
    const c = isoMap[id];
    if (!c) return 0.002;
    if (globeLayer === 'weather') return selected?.id === c.id || hovered === id ? 0.011 : 0.006;
    if (selected?.id === c.id) return 0.026;
    if (hovered === id) return 0.018;
    return 0.01;
  }, [isoMap, selected, hovered, globeLayer]);

  const getStroke = useCallback((d: object) => {
    const c = isoMap[(d as GeoFeature).id];
    if (!c) return 'rgba(8,145,178,0.12)';
    return globeLayer === 'weather' ? 'rgba(167, 218, 218, 0.36)' : 'rgba(103,232,249,0.42)';
  }, [isoMap, globeLayer]);

  const getLabel = useCallback((d: object) => {
    if (!isAuthenticated) return '';
    const c = isoMap[(d as GeoFeature).id];
    if (!c) return '';
    const flag = c.flagUrl
      ? `<img src="${c.flagUrl}" alt="" style="width:28px;height:19px;object-fit:cover;border-radius:4px;box-shadow:0 4px 10px rgba(0,0,0,0.28)" />`
      : `<span style="font-size:1.15rem;line-height:1">${c.flag}</span>`;
    return `<div style="display:flex;align-items:center;gap:9px;background:rgba(3,18,32,0.94);color:#e0f2fe;padding:8px 11px;border-radius:12px;font-size:13px;font-weight:800;border:1px solid rgba(125,211,252,0.28);white-space:nowrap;pointer-events:none;box-shadow:0 12px 34px rgba(0,0,0,0.38),0 0 18px rgba(14,165,233,0.12)">${flag}<span style="display:flex;align-items:baseline;gap:6px"><span style="color:#7dd3fc;font-size:0.72rem;font-weight:900;letter-spacing:0.05em">${c.isoCode}</span><span>${c.name}</span></span></div>`;
  }, [isoMap, isAuthenticated]);

  const handlePolygonClick = useCallback((d: object) => {
    if (!isAuthenticated) return;
    const c = isoMap[(d as GeoFeature).id];
    if (c) {
      setSelected(c);
      setEditForm({ ...c });
      setMode('view');
      setEditingCity(null);
      globeRef.current?.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.5 }, 1000);
    }
  }, [isoMap, isAuthenticated]);

  // Navigation helpers
  const flyToContinent = (lat: number, lng: number) => {
    setSelected(null);
    globeRef.current?.pointOfView({ lat, lng, altitude: 2.2 }, 1100);
  };

  const flyToCountry = (c: Country) => {
    setSelected(c);
    setEditForm({ ...c });
    setMode('view');
    setSearchQuery('');
    setSearchFocused(false);
    globeRef.current?.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.5 }, 1100);
  };

  const zoomIn = () => {
    const pov = globeRef.current?.pointOfView();
    if (pov) globeRef.current.pointOfView({ ...pov, altitude: Math.max(0.4, pov.altitude * 0.68) }, 350);
  };
  const zoomOut = () => {
    const pov = globeRef.current?.pointOfView();
    if (pov) globeRef.current.pointOfView({ ...pov, altitude: Math.min(8, pov.altitude * 1.45) }, 350);
  };
  const resetView = () => {
    setSelected(null);
    globeRef.current?.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 900);
  };

  // Search
  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < 1) return [];
    const q = searchQuery.toLowerCase();
    return countries.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.capital.toLowerCase().includes(q) ||
      c.isoCode.toLowerCase().includes(q)
    ).slice(0, 7);
  }, [searchQuery, countries]);

  // Rings animation data
  const ringsData = useMemo(() => countries.map(c => ({
    lat: c.lat, lng: c.lng,
    maxR: selected?.id === c.id ? 5 : 1.8,
    propagationSpeed: selected?.id === c.id ? 3.5 : 0.9,
    repeatPeriod: selected?.id === c.id ? 750 : 3500,
    color: selected?.id === c.id ? OCEAN.aqua : OCEAN.mint,
  })), [countries, selected]);

  // Derived panel data
  const countryCities = selected ? cities.filter(c => c.countryId === selected.id) : [];
  const weatherCity = getCountryWeatherCity(selected, cities);
  const { weather, weatherLoading } = useCityWeather(weatherCity?.id);
  const continent = selected ? continents.find(c => c.id === selected.continentId) : null;

  // Login
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = authMode === 'register'
      ? await register(registerName.trim(), loginEmail, loginPassword)
      : await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (!result.ok) {
      setLoginError(result.message || authError || (authMode === 'register'
        ? 'Informe nome, e-mail válido e senha com pelo menos 6 caracteres.'
        : 'Use um e-mail válido e uma senha com pelo menos 6 caracteres.'));
      return;
    }
    toast.success(authMode === 'register' ? 'Conta criada com sucesso' : 'Login realizado com sucesso');
  };

  // Country CRUD
  const handleSaveCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    updateCountry(selected.id, editForm);
    toast.success(`${editForm.name ?? selected.name} atualizado`);
    setSelected(prev => prev ? { ...prev, ...editForm } as Country : null);
    setSaving(false);
    setMode('view');
  };

  const handleSaveCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    if (editingCity) {
      updateCity(editingCity.id, cityForm);
      toast.success(`${cityForm.name} atualizada`);
    } else {
      addCity({ ...cityForm, countryId: selected.id });
      toast.success(`${cityForm.name} adicionada`);
    }
    setSaving(false);
    setEditingCity(null);
    setMode('view');
  };

  const handleDeleteCountry = () => {
    if (!selected) return;
    deleteCountry(selected.id);
    toast.success(`${selected.name} removido`);
    setSelected(null);
    setDeleteType(null);
  };

  const handleDeleteCity = () => {
    if (!deleteCityTarget) return;
    deleteCity(deleteCityTarget.id);
    toast.success(`${deleteCityTarget.name} removida`);
    setDeleteCityTarget(null);
    setDeleteType(null);
  };

  const closePanel = () => {
    setSelected(null);
    setMode('view');
  };

  const openAddCity = () => {
    setCityForm(mkEmptyCity(selected?.lat ?? 0, selected?.lng ?? 0));
    setEditingCity(null);
    setMode('cityForm');
  };

  const openEditCity = (city: City) => {
    setEditingCity(city);
    setCityForm({ name: city.name, population: city.population, lat: city.lat, lng: city.lng, isCapital: city.isCapital, countryId: city.countryId });
    setMode('cityForm');
  };

  const flyToWeatherCity = (countryId: string) => {
    const country = countries.find(item => item.id === countryId);
    if (country) flyToCountry(country);
  };

  const handleRefreshWeather = async () => {
    await refreshCitiesWeather();
    recordActivity({ action: 'refreshed', entity: 'weather', name: 'Temperaturas do globo' });
    toast.success('Temperaturas atualizadas');
  };

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // --- Panel sections -------------------------------------------------------
  const ViewMode = () => (
    <>
      <div className="shrink-0" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(3,10,26,0.94))', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start gap-4">
            <div style={{ width: 72, height: 52, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(148,163,184,0.18)', boxShadow: '0 16px 36px rgba(0,0,0,0.28)', flexShrink: 0 }}>
              {selected?.flagUrl ? (
                <img src={selected.flagUrl} alt={selected.flagAlt || `Bandeira de ${selected.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>{selected?.flag}</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 style={{ color: '#f8fafc', fontSize: '1.35rem', fontWeight: 850, lineHeight: 1.1, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected?.name}</h2>
                  {selected?.officialName && (
                    <p style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.officialName}</p>
                  )}
                </div>
                <button onClick={closePanel}
                  title="Fechar"
                  style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 10, cursor: 'pointer', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
                  <X size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {continent && (
                  <span style={{ background: `${continent.color}18`, color: '#bae6fd', fontSize: '0.72rem', fontWeight: 800, padding: '4px 9px', borderRadius: 999, border: '1px solid rgba(125,211,252,0.18)' }}>{continent.name}</span>
                )}
                <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700 }}>{selected?.isoCode}</span>
                <span style={{ color: '#475569', fontSize: '0.72rem' }}>{selected?.timezone}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <button onClick={() => setMode('editCountry')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, padding: '9px 8px', background: 'rgba(20,184,166,0.1)', color: '#5eead4', border: '1px solid rgba(94,234,212,0.18)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800 }}>
              <Pencil size={13} /> Editar
            </button>
            <button onClick={openAddCity} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, padding: '9px 8px', background: 'rgba(56,189,248,0.1)', color: '#7dd3fc', border: '1px solid rgba(125,211,252,0.18)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800 }}>
              <Plus size={13} /> Cidade
            </button>
            <button onClick={() => setDeleteType('country')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, padding: '9px 8px', background: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(252,165,165,0.16)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800 }}>
              <Trash2 size={13} /> Excluir
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 22 }}>
          {selected && ([
            { icon: Users, label: 'População', value: selected.population.toLocaleString('pt-BR'), color: '#5eead4' },
            { icon: Flag, label: 'Capital', value: selected.capital || '-', color: '#7dd3fc' },
            { icon: DollarSign, label: 'Moeda', value: selected.currency, color: '#facc15' },
            { icon: Languages, label: 'Idioma', value: selected.language.split('/')[0].trim(), color: '#c4b5fd' },
            { icon: GlobeIcon, label: 'Área', value: `${Math.round(selected.area).toLocaleString('pt-BR')} km²`, color: '#86efac' },
            { icon: MapPin, label: 'Coordenadas', value: `${selected.lat.toFixed(2)}, ${selected.lng.toFixed(2)}`, color: '#93c5fd' },
          ] as const).map(row => (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '18px 1fr', gap: 8, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
              <row.icon size={15} style={{ color: row.color }} />
              <div style={{ minWidth: 0 }}>
                <p style={{ color: '#64748b', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 850, marginBottom: 3 }}>{row.label}</p>
                <p style={{ color: '#e2e8f0', fontSize: '0.86rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {(weather || weatherLoading || weatherCity) && (
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
          <div style={{ padding: '4px 0 2px' }}>
            {weather ? (
              <div className="flex items-center gap-4">
                <div style={{ width: 3, height: 52, borderRadius: 999, background: 'linear-gradient(180deg, #7dd3fc, #5eead4)', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p style={{ color: '#64748b', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 850, marginBottom: 5 }}>{weatherCity?.name ? `Clima em ${weatherCity.name}` : 'Clima atual'}</p>
                  <div className="flex items-end gap-2">
                    <p style={{ color: '#f8fafc', fontSize: '1.55rem', fontWeight: 900, lineHeight: 1 }}>
                      {Math.round(weather.temperature)}<span style={{ color: '#bae6fd', fontSize: '0.92rem', fontWeight: 850, marginLeft: 3 }}>°C</span>
                    </p>
                    <p style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700 }}>{getWeatherLabel(weather.description)}</p>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.72rem', marginTop: 7 }}>{weather.description ?? weather.provider} - Umidade {weather.humidity ?? '-'}% - Vento {weather.windSpeed ?? '-'} km/h</p>
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700 }}>{weatherLoading ? 'Carregando clima...' : 'Dados de clima indisponíveis'}</p>
            )}
          </div>
        </div>
      )}

      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 800 }}>
            Cidades ({countryCities.length})
          </p>
          <button onClick={openAddCity}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition-colors"
            style={{ background: 'rgba(20,184,166,0.1)', color: '#14b8a6', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,184,166,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,184,166,0.1)'}>
            <Plus size={10} /> Adicionar
          </button>
        </div>

        {countryCities.length === 0 ? (
          <div className="text-center py-5 rounded-xl"
            style={{ borderTop: '1px solid rgba(148,163,184,0.08)', borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
            <p style={{ color: '#1e293b', fontSize: '0.75rem' }}>Nenhuma cidade cadastrada</p>
            <button onClick={openAddCity}
              className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(20,184,166,0.1)', color: '#14b8a6', border: 'none', cursor: 'pointer' }}>
              Adicionar primeira cidade
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {countryCities.map(city => (
              <CityRow key={city.id} city={city}
                onEdit={openEditCity}
                onDelete={c => { setDeleteCityTarget(c); setDeleteType('city'); }} />
            ))}
          </div>
        )}
      </div>
    </>
  );

  const EditCountryPanel = () => (
    <form onSubmit={handleSaveCountry} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button type="button" onClick={() => setMode('view')}
          style={{ color: '#475569', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '5px', cursor: 'pointer' }}>
          <ChevronLeft size={14} />
        </button>
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem' }}>Editar país</span>
        <span style={{ fontSize: '1.1rem' }}>{selected?.flag}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        <Field label="Nome"><Input value={editForm.name ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required /></Field>
        <Field label="Bandeira"><Input value={editForm.flag ?? ''} onChange={e => setEditForm(f => ({ ...f, flag: e.target.value }))} /></Field>
        <Field label="Continente">
          <Select value={editForm.continentId ?? ''} onChange={e => setEditForm(f => ({ ...f, continentId: e.target.value }))}>
            {continents.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Capital"><Input value={editForm.capital ?? ''} onChange={e => setEditForm(f => ({ ...f, capital: e.target.value }))} /></Field>
        <Field label="População *"><Input type="number" value={editForm.population ?? 0} onChange={e => setEditForm(f => ({ ...f, population: Number(e.target.value) }))} required /></Field>
        <Field label="Idioma *"><Input value={editForm.language ?? ''} onChange={e => setEditForm(f => ({ ...f, language: e.target.value }))} required /></Field>
        <Field label="Moeda *"><Input value={editForm.currency ?? ''} onChange={e => setEditForm(f => ({ ...f, currency: e.target.value }))} required /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude"><Input type="number" step="0.01" value={editForm.lat ?? 0} onChange={e => setEditForm(f => ({ ...f, lat: Number(e.target.value) }))} /></Field>
          <Field label="Longitude"><Input type="number" step="0.01" value={editForm.lng ?? 0} onChange={e => setEditForm(f => ({ ...f, lng: Number(e.target.value) }))} /></Field>
        </div>
        <Field label="Fuso horário"><Input value={editForm.timezone ?? ''} onChange={e => setEditForm(f => ({ ...f, timezone: e.target.value }))} /></Field>
      </div>
      <div className="flex gap-2 p-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button type="button" onClick={() => setMode('view')}
          className="flex-1 rounded-xl py-2.5 text-sm"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
          style={{ background: saving ? 'rgba(20,184,166,0.3)' : '#14b8a6', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
          <Save size={13} /> {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );

  const CityFormPanel = () => (
    <form onSubmit={handleSaveCity} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button type="button" onClick={() => { setMode('view'); setEditingCity(null); }}
          style={{ color: '#475569', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '5px', cursor: 'pointer' }}>
          <ChevronLeft size={14} />
        </button>
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem' }}>
          {editingCity ? 'Editar cidade' : `Adicionar cidade - ${selected?.flag} ${selected?.name}`}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        <Field label="Nome da cidade *"><Input value={cityForm.name} onChange={e => setCityForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ex.: Porto" /></Field>
        <Field label="População *"><Input type="number" value={cityForm.population} onChange={e => setCityForm(f => ({ ...f, population: Number(e.target.value) }))} placeholder="Ex.: 250000" required /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude"><Input type="number" step="0.0001" value={cityForm.lat} onChange={e => setCityForm(f => ({ ...f, lat: Number(e.target.value) }))} /></Field>
          <Field label="Longitude"><Input type="number" step="0.0001" value={cityForm.lng} onChange={e => setCityForm(f => ({ ...f, lng: Number(e.target.value) }))} /></Field>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <input type="checkbox" id="capCb" checked={cityForm.isCapital}
            onChange={e => setCityForm(f => ({ ...f, isCapital: e.target.checked }))}
            style={{ width: 14, height: 14, accentColor: '#14b8a6', cursor: 'pointer' }} />
          <label htmlFor="capCb" style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}>Cidade capital</label>
        </div>
      </div>
      <div className="flex gap-2 p-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button type="button" onClick={() => { setMode('view'); setEditingCity(null); }}
          className="flex-1 rounded-xl py-2.5 text-sm"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
          style={{ background: saving ? 'rgba(20,184,166,0.3)' : '#14b8a6', color: 'white', border: 'none', cursor: 'pointer' }}>
          <Save size={13} /> {saving ? 'Salvando...' : editingCity ? 'Salvar' : 'Adicionar cidade'}
        </button>
      </div>
    </form>
  );

  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: SPACE_BACKGROUND, backgroundSize: '260px 260px, 340px 340px, 420px 420px, 520px 520px, 620px 620px, 100% 100%, 100% 100%', display: 'flex', position: 'fixed', inset: 0 }}>
      <Toaster position="top-right" richColors />

      {/* -- Globe ------------------------------------------------ */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>

        {/* Loading */}
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, background: 'rgba(2,8,20,0.76)', backdropFilter: 'blur(8px)' }}>
            <div style={{ width: 'min(340px, calc(100vw - 40px))', borderRadius: 22, padding: 24, background: 'rgba(8,16,34,0.82)', border: '1px solid rgba(125,211,252,0.16)', boxShadow: '0 30px 80px rgba(0,0,0,0.46)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 18 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#5eead4,#38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GlobeIcon size={21} style={{ color: '#082f49' }} />
                </div>
                <div>
                  <p style={{ color: '#f8fafc', fontSize: '0.95rem', fontWeight: 900 }}>Preparando o globo</p>
                  <p style={{ color: '#64748b', fontSize: '0.74rem', marginTop: 3 }}>Carregando países e relevo 3D</p>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', background: 'rgba(148,163,184,0.14)' }}>
                <div style={{ width: '54%', height: '100%', borderRadius: 999, background: 'linear-gradient(90deg,#5eead4,#38bdf8)', animation: 'loadingBar 1.2s ease-in-out infinite' }} />
              </div>
            </div>
          </div>
        )}

        {/* -- HUD: Top bar -------------------------------------- */}
        {isAuthenticated && (
          <>
            {/* Logo - top left */}
            <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(2,8,20,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '7px 12px' }}>
                  <GlobeIcon size={14} style={{ color: OCEAN.aqua }} />
                  <span style={{ color: '#9bdfe5', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em' }}>GeoCRUD</span>
                </div>
                <div style={{ display: isTiny ? 'none' : 'flex', alignItems: 'center', gap: 6, background: 'rgba(2,8,20,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(34,211,238,0.16)', borderRadius: 12, padding: '7px 10px' }}>
                  <Thermometer size={13} style={{ color: OCEAN.aqua }} />
                  <span style={{ color: '#67e8f9', fontSize: '0.72rem', fontWeight: 700 }}>
                    {citiesWeatherLoading ? 'Clima...' : `${allWeatherMarkers.length} temperaturas`}
                  </span>
                </div>
              </div>
            </div>

            {/* Weather controls */}
            <div style={{ position: 'absolute', top: isCompact ? 112 : 58, left: 16, zIndex: 10, width: isCompact ? 'min(294px, calc(100vw - 32px))' : 294, background: 'rgba(2,8,20,0.64)', backdropFilter: 'blur(18px)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 16, padding: isTiny ? '10px 12px' : '12px 14px', boxShadow: '0 18px 44px rgba(0,0,0,0.24)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 11, borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                {([
                  { value: 'weather', label: 'Clima', icon: Thermometer },
                  { value: 'countries', label: 'Países', icon: Flag },
                ] as const).map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => setGlobeLayer(value)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 8px', borderRadius: 9, border: 'none', background: globeLayer === value ? 'rgba(125,211,252,0.13)' : 'transparent', color: globeLayer === value ? '#bae6fd' : '#64748b', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}>
                    <Icon size={12} /> {label}
                  </button>
                ))}
                <button type="button" onClick={handleRefreshWeather} disabled={citiesWeatherRefreshing}
                  title="Atualizar clima"
                  style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: 'transparent', color: citiesWeatherRefreshing ? '#334155' : '#7dd3fc', cursor: citiesWeatherRefreshing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={13} style={{ animation: citiesWeatherRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                </button>
              </div>

              <div style={{ padding: '12px 0 10px', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.68rem', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Faixa</span>
                  <span style={{ color: '#cbd5e1', fontSize: '0.72rem', fontWeight: 850 }}>{tempMin}°C a {tempMax}°C</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ color: '#64748b', fontSize: '0.66rem', fontWeight: 800 }}>
                  Min
                  <input type="range" min="-20" max="50" value={tempMin}
                    onChange={e => setTempMin(Math.min(Number(e.target.value), tempMax))}
                    style={{ width: '100%', accentColor: '#7dd3fc' }} />
                </label>
                <label style={{ color: '#64748b', fontSize: '0.66rem', fontWeight: 800 }}>
                  Max
                  <input type="range" min="-20" max="50" value={tempMax}
                    onChange={e => setTempMax(Math.max(Number(e.target.value), tempMin))}
                    style={{ width: '100%', accentColor: '#7dd3fc' }} />
                </label>
                </div>
              </div>

              <p style={{ display: isTiny ? 'none' : 'block', color: '#64748b', fontSize: '0.68rem', lineHeight: 1.35, margin: '10px 0' }}>
                Temperaturas exibidas por cidade. Os países ficam neutros para evitar leitura de clima uniforme.
              </p>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: '0.72rem', fontWeight: 800, marginBottom: 9, cursor: 'pointer' }}>
                <input type="checkbox" checked={showExtremes} onChange={e => setShowExtremes(e.target.checked)}
                  style={{ accentColor: '#7dd3fc' }} />
                Destacar mais quente e mais fria
              </label>

              <div style={{ display: isTiny ? 'none' : 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 14, padding: '9px 0', borderTop: '1px solid rgba(148,163,184,0.1)', borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                {hottestCity && (
                  <button type="button" onClick={() => flyToWeatherCity(hottestCity.city.countryId)}
                    style={{ textAlign: 'left', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', minWidth: 0 }}>
                    <p style={{ color: '#c99a63', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mais quente</p>
                    <p style={{ color: '#e2e8f0', fontSize: '0.76rem', fontWeight: 850, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3 }}>{hottestCity.city.name}</p>
                    <p style={{ color: '#c99a63', fontSize: '0.76rem', fontWeight: 900, marginTop: 2 }}>{Math.round(hottestCity.temperature)}°C</p>
                  </button>
                )}
                {coldestCity && (
                  <button type="button" onClick={() => flyToWeatherCity(coldestCity.city.countryId)}
                    style={{ textAlign: 'left', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', minWidth: 0 }}>
                    <p style={{ color: '#90b8c0', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Mais fria</p>
                    <p style={{ color: '#e2e8f0', fontSize: '0.76rem', fontWeight: 850, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 3 }}>{coldestCity.city.name}</p>
                    <p style={{ color: '#90b8c0', fontSize: '0.76rem', fontWeight: 900, marginTop: 2 }}>{Math.round(coldestCity.temperature)}°C</p>
                  </button>
                )}
              </div>

              <div style={{ display: isTiny ? 'none' : 'flex', flexDirection: 'column', marginTop: 8 }}>
                {rankedWeather.slice(0, 5).map((item, index) => (
                  <button key={item.city.id} type="button" onClick={() => flyToWeatherCity(item.city.countryId)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'transparent', border: 'none', borderBottom: index < 4 ? '1px solid rgba(148,163,184,0.08)' : 'none', padding: '8px 0', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ color: '#475569', fontSize: '0.68rem', width: 16, fontWeight: 900 }}>{index + 1}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.74rem', fontWeight: 800, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.city.name}</span>
                    <span style={{ color: temperatureAccent(item.temperature), fontSize: '0.74rem', fontWeight: 900 }}>{Math.round(item.temperature)}°C</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search - top center */}
            <div style={{ position: 'absolute', top: isCompact ? 58 : 16, left: isCompact ? 16 : '50%', right: isCompact ? 16 : 'auto', transform: isCompact ? 'none' : 'translateX(-50%)', zIndex: 20, width: isCompact ? 'auto' : 380, maxWidth: isCompact ? 'calc(100vw - 32px)' : undefined }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                  placeholder="Buscar países, capitais..."
                  style={{
                    width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 9, paddingBottom: 9,
                    background: 'rgba(2,8,20,0.72)', backdropFilter: 'blur(16px)',
                    border: `1px solid ${searchFocused ? 'rgba(34,211,238,0.42)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 14, color: '#f1f5f9', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                />
                {/* Dropdown */}
                {searchFocused && searchResults.length > 0 && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, borderRadius: 14, overflow: 'hidden', background: 'rgba(3,12,30,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                    {searchResults.map((c, i) => {
                      const cont = continents.find(x => x.id === c.continentId);
                      return (
                        <button key={c.id} onMouseDown={() => flyToCountry(c)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'transparent', border: 'none', borderBottom: i < searchResults.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer', textAlign: 'left' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,211,238,0.1)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{c.flag}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: '#f1f5f9', fontSize: '0.85rem', fontWeight: 600 }}>{c.name}</p>
                            <p style={{ color: '#334155', fontSize: '0.7rem', marginTop: 1 }}>
                              {c.capital}{cont ? ` - ${cont.name}` : ''}
                            </p>
                          </div>
                          <MapPin size={12} style={{ color: '#334155', flexShrink: 0 }} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* User menu - top right */}
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20 }} onMouseDown={e => e.stopPropagation()}>
              <button onClick={() => setMenuOpen(m => !m)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(2,8,20,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '7px 12px', cursor: 'pointer', color: '#64748b' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(20,184,166,0.25)'; e.currentTarget.style.color = '#94a3b8'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#64748b'; }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg, ${OCEAN.teal}, ${OCEAN.aqua})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={11} style={{ color: 'white' }} />
                </div>
                <span style={{ display: isTiny ? 'none' : 'inline', fontSize: '0.75rem', fontWeight: 600, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Usuário'}</span>
                <ChevronDown size={12} style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {menuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 210, borderRadius: 14, overflow: 'hidden', background: 'rgba(3,12,30,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                  <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 850, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Usuário'}</p>
                    <p style={{ color: '#64748b', fontSize: '0.7rem', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                  </div>
                  <button onClick={() => { setProfileOpen(true); setMenuOpen(false); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.82rem', fontWeight: 700, textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,211,238,0.08)'; e.currentTarget.style.color = '#bae6fd'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                    <User size={14} />
                    <span>Meu perfil</span>
                  </button>
                  {([
                    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                    { to: '/app/continents', icon: Layers, label: 'Continentes', count: continents.length },
                    { to: '/app/countries', icon: Flag, label: 'Países', count: countries.length },
                    { to: '/app/cities', icon: Building2, label: 'Cidades', count: cities.length },
                  ] as const).map(item => (
                    <Link key={item.to} to={item.to}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', color: '#64748b', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: '0.82rem', fontWeight: 500 }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}>
                      <item.icon size={14} />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {'count' in item && <span style={{ background: 'rgba(34,211,238,0.16)', color: OCEAN.aqua, fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: 8 }}>{item.count}</span>}
                    </Link>
                  ))}
                  <button onClick={() => { logout(); setMenuOpen(false); setProfileOpen(false); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.82rem' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}>
                    <LogOut size={14} />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>

            {/* Continent navigator */}
            <div style={{ position: 'absolute', bottom: isCompact ? 16 : 22, left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: isCompact ? 'calc(100vw - 32px)' : 'min(720px, calc(100vw - 420px))', minWidth: isCompact ? 0 : 460, display: isTiny ? 'none' : 'block' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 5, borderRadius: 16, background: 'rgba(3,10,24,0.58)', backdropFilter: 'blur(18px)', border: '1px solid rgba(148,163,184,0.12)', boxShadow: '0 14px 40px rgba(0,0,0,0.24)' }}>
                {CONTINENTS_NAV.map(c => (
                  <button key={c.name} onClick={() => flyToContinent(c.lat, c.lng)}
                    style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12, padding: '8px 11px', color: '#d5e4ea', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.18s', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.72)'; e.currentTarget.style.borderColor = `${c.color}66`; e.currentTarget.style.color = c.color; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.5)'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.1)'; e.currentTarget.style.color = '#d5e4ea'; }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color, boxShadow: `0 0 12px ${c.color}55`, flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom controls - bottom right */}
            <div style={{ position: 'absolute', bottom: isCompact && selected ? 256 : 24, right: 16, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {([
                { icon: ZoomIn, action: zoomIn, title: 'Aproximar' },
                { icon: ZoomOut, action: zoomOut, title: 'Afastar' },
                { icon: RotateCcw, action: resetView, title: 'Redefinir visualização' },
              ] as const).map(({ icon: Icon, action, title }) => (
                <button key={title} onClick={action} title={title}
                  style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(2,8,20,0.65)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.07)', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)'; e.currentTarget.style.color = OCEAN.aqua; e.currentTarget.style.background = 'rgba(34,211,238,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'rgba(2,8,20,0.65)'; }}>
                  <Icon size={14} />
                </button>
              ))}
            </div>

            {/* Hint - only when nothing selected */}
            {!selected && !loading && !isCompact && (
              <div style={{ position: 'absolute', bottom: 22, left: 16, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(3,10,24,0.58)', backdropFilter: 'blur(18px)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 14, padding: '7px 10px', boxShadow: '0 14px 40px rgba(0,0,0,0.22)' }}>
                  {[
                    ['Arraste', 'girar'],
                    ['Role', 'zoom'],
                    ['Clique', 'abrir país'],
                  ].map(([action, detail]) => (
                    <div key={action} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#d5e4ea', fontSize: '0.7rem', fontWeight: 800 }}>{action}</span>
                      <span style={{ color: '#64748b', fontSize: '0.66rem', fontWeight: 600 }}>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Globe canvas */}
        {size.w > 0 && (
          <Globe
            ref={globeRef}
            width={size.w}
            height={size.h}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundColor="rgba(186,230,253,0)"
            showAtmosphere
            atmosphereColor={OCEAN.aqua}
            atmosphereAltitude={0.2}
            polygonsData={features}
            polygonAltitude={getAlt}
            polygonCapColor={getCapColor}
            polygonSideColor={() => globeLayer === 'weather' ? 'rgba(90, 126, 122, 0.1)' : 'rgba(34,211,238,0.07)'}
            polygonStrokeColor={getStroke}
            polygonLabel={getLabel}
            onPolygonClick={handlePolygonClick}
            onPolygonHover={(d: object | null) => setHovered(d ? (d as GeoFeature).id : null)}
            ringsData={isAuthenticated && globeLayer === 'countries' ? ringsData : []}
            ringColor={(d: object) => (d as any).color}
            ringMaxRadius={(d: object) => (d as any).maxR}
            ringPropagationSpeed={(d: object) => (d as any).propagationSpeed}
            ringRepeatPeriod={(d: object) => (d as any).repeatPeriod}
            labelsData={isAuthenticated && globeLayer === 'weather' ? cityWeatherMarkers : []}
            labelLat={(d: object) => (d as any).city.latitude}
            labelLng={(d: object) => (d as any).city.longitude}
            labelAltitude={0.014}
            labelText={(d: object) => {
              const item = d as any;
              return `${item.city.name} ${Math.round(item.temperature)}°C`;
            }}
            labelSize={0.56}
            labelDotRadius={0.16}
            labelColor={(d: object) => temperatureAccent((d as any).temperature)}
            labelResolution={2}
            labelLabel={(d: object) => {
              const item = d as any;
              return `<div style="background:rgba(3,12,30,0.96);color:#e2e8f0;padding:8px 10px;border-radius:10px;border:1px solid rgba(34,211,238,0.24);font-size:12px;line-height:1.35"><strong>${item.city.name}</strong><br/>${Math.round(item.temperature)}°C - ${item.description ?? item.provider}<br/>Umidade ${item.humidity ?? '-'}% | Vento ${item.windSpeed ?? '-'} km/h</div>`;
            }}
            onLabelClick={(d: object) => flyToWeatherCity((d as any).city.countryId)}
            pointsData={isAuthenticated && globeLayer === 'weather' && showExtremes ? [hottestCity, coldestCity].filter(Boolean) : []}
            pointLat={(d: object) => (d as any).city.latitude}
            pointLng={(d: object) => (d as any).city.longitude}
            pointAltitude={0.02}
            pointRadius={0.32}
            pointColor={(d: object) => temperatureColor((d as any).temperature)}
            pointLabel={(d: object) => {
              const item = d as any;
              return `<div style="background:rgba(3,12,30,0.96);color:#e2e8f0;padding:8px 10px;border-radius:10px;border:1px solid ${temperatureAccent(item.temperature)};font-size:12px;line-height:1.35"><strong>${item.city.name}</strong><br/>Destaque: ${Math.round(item.temperature)}°C</div>`;
            }}
            onPointClick={(d: object) => flyToWeatherCity((d as any).city.countryId)}
          />
        )}

        {profileOpen && user && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, background: 'rgba(2,8,20,0.46)', backdropFilter: 'blur(6px)' }} onMouseDown={() => setProfileOpen(false)}>
            <div style={{ width: 'min(430px, calc(100vw - 32px))', borderRadius: 22, background: 'linear-gradient(180deg, rgba(8,16,34,0.98), rgba(3,8,22,0.98))', border: '1px solid rgba(125,211,252,0.16)', boxShadow: '0 34px 90px rgba(0,0,0,0.58)', overflow: 'hidden' }} onMouseDown={e => e.stopPropagation()}>
              <div style={{ padding: 22, borderBottom: '1px solid rgba(148,163,184,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 16, background: `linear-gradient(135deg, ${OCEAN.teal}, ${OCEAN.aqua})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={24} style={{ color: '#082f49' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    <p style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 800, marginTop: 9, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Conta autenticada</p>
                  </div>
                  <button onClick={() => setProfileOpen(false)} title="Fechar" style={{ width: 34, height: 34, borderRadius: 11, border: '1px solid rgba(148,163,184,0.12)', background: 'rgba(255,255,255,0.04)', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(148,163,184,0.08)' }}>
                {[
                  { label: 'Continentes', value: continents.length, icon: Layers },
                  { label: 'Países', value: countries.length, icon: Flag },
                  { label: 'Cidades', value: cities.length, icon: Building2 },
                ].map(item => (
                  <div key={item.label} style={{ background: 'rgba(3,8,22,0.96)', padding: '16px 12px', textAlign: 'center' }}>
                    <item.icon size={16} style={{ color: '#7dd3fc', margin: '0 auto 7px' }} />
                    <p style={{ color: '#f8fafc', fontSize: '1.05rem', fontWeight: 900 }}>{item.value}</p>
                    <p style={{ color: '#64748b', fontSize: '0.66rem', fontWeight: 800, marginTop: 2 }}>{item.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ padding: 18 }}>
                <button onClick={() => { logout(); setProfileOpen(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(239,68,68,0.08)', color: '#fca5a5', borderRadius: 14, padding: '11px 12px', cursor: 'pointer', fontWeight: 850 }}>
                  <LogOut size={15} /> Sair da conta
                </button>
              </div>
            </div>
          </div>
        )}

        {/* -- Login overlay ------------------------------------ */}
        {!isAuthenticated && !loading && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,8,20,0.42)', backdropFilter: 'blur(6px)' }}>
            <div style={{ width: 'min(420px, calc(100vw - 32px))', borderRadius: 24, background: 'linear-gradient(180deg, rgba(8,16,34,0.96), rgba(3,8,22,0.98))', backdropFilter: 'blur(28px)', border: '1px solid rgba(125,211,252,0.16)', boxShadow: '0 34px 90px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.04)', padding: '30px 32px 28px' }}>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg,#5eead4,#38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 32px rgba(56,189,248,0.22)' }}>
                    <GlobeIcon size={20} style={{ color: '#082f49' }} />
                  </div>
                  <div>
                    <span style={{ color: '#e2e8f0', fontSize: '0.98rem', fontWeight: 900, letterSpacing: '0.04em' }}>GeoCRUD</span>
                    <p style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 700, marginTop: 2 }}>Plataforma geográfica</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7dd3fc', background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(125,211,252,0.16)', borderRadius: 999, padding: '6px 10px', fontSize: '0.68rem', fontWeight: 850 }}>
                  <Lock size={12} />
                  Seguro
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <p style={{ color: '#f8fafc', fontSize: '1.55rem', fontWeight: 900, lineHeight: 1, marginBottom: 8 }}>{authMode === 'register' ? 'Criar conta' : 'Entrar'}</p>
                <p style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.45 }}>
                  {authMode === 'register' ? 'Cadastre-se para começar a gerenciar dados geográficos.' : 'Acesse o painel para gerenciar continentes, países, cidades e clima.'}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {authMode === 'register' && (
                  <div style={{ position: 'relative' }}>
                    <User size={17} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                    <input type="text" value={registerName} onChange={e => setRegisterName(e.target.value)}
                      placeholder="Nome completo" required
                      style={{ width: '100%', paddingLeft: 48, paddingRight: 16, paddingTop: 15, paddingBottom: 15, background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(148,163,184,0.16)', borderRadius: 16, color: '#f8fafc', fontSize: '0.98rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s' }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(94,234,212,0.42)'; e.target.style.background = 'rgba(15,23,42,0.9)'; e.target.style.boxShadow = '0 0 0 4px rgba(45,212,191,0.08)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.16)'; e.target.style.background = 'rgba(15,23,42,0.72)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                )}
                {/* Email */}
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                    placeholder="E-mail" required
                    style={{ width: '100%', paddingLeft: 48, paddingRight: 16, paddingTop: 15, paddingBottom: 15, background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(148,163,184,0.16)', borderRadius: 16, color: '#f8fafc', fontSize: '0.98rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(94,234,212,0.42)'; e.target.style.background = 'rgba(15,23,42,0.9)'; e.target.style.boxShadow = '0 0 0 4px rgba(45,212,191,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.16)'; e.target.style.background = 'rgba(15,23,42,0.72)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Senha */}
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
                  <input type={showPw ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Senha" required
                    style={{ width: '100%', paddingLeft: 48, paddingRight: 48, paddingTop: 15, paddingBottom: 15, background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(148,163,184,0.16)', borderRadius: 16, color: '#f8fafc', fontSize: '0.98rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(94,234,212,0.42)'; e.target.style.background = 'rgba(15,23,42,0.9)'; e.target.style.boxShadow = '0 0 0 4px rgba(45,212,191,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.16)'; e.target.style.background = 'rgba(15,23,42,0.72)'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    title={showPw ? 'Ocultar senha' : 'Mostrar senha'}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {loginError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(248,113,113,0.24)', borderRadius: 12, padding: '10px 12px' }}>
                    <AlertCircle size={15} style={{ color: '#fca5a5', flexShrink: 0 }} />
                    <p style={{ color: '#fecaca', fontSize: '0.78rem', fontWeight: 700 }}>{loginError}</p>
                  </div>
                )}

                <button type="submit" disabled={loginLoading}
                  style={{ marginTop: 6, background: loginLoading ? 'rgba(20,184,166,0.38)' : 'linear-gradient(135deg,#5eead4,#38bdf8)', color: '#062235', border: 'none', borderRadius: 16, padding: '15px', fontWeight: 900, fontSize: '1rem', cursor: loginLoading ? 'not-allowed' : 'pointer', transition: 'transform 0.16s, filter 0.16s, opacity 0.16s', boxShadow: loginLoading ? 'none' : '0 18px 34px rgba(56,189,248,0.22)' }}
                  onMouseEnter={e => { if (!loginLoading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.filter = 'brightness(1.06)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.filter = 'none'; }}>
                  {loginLoading ? (authMode === 'register' ? 'Criando conta...' : 'Entrando...') : (authMode === 'register' ? 'Criar conta' : 'Entrar')}
                </button>
              </form>

              <button type="button"
                onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setLoginError(''); }}
                style={{ width: '100%', marginTop: 14, background: 'transparent', border: 'none', color: '#7dd3fc', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800 }}>
                {authMode === 'register' ? 'Já tenho uma conta' : 'Criar uma nova conta'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, color: '#64748b', fontSize: '0.74rem', fontWeight: 700, marginTop: 18 }}>
                <span style={{ width: 5, height: 5, borderRadius: 999, background: '#5eead4', boxShadow: '0 0 16px rgba(94,234,212,0.8)' }} />
                {authMode === 'register' ? 'A senha será protegida com criptografia.' : 'Use uma conta cadastrada para acessar o sistema.'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* -- Country side panel ------------------------------------------- */}
      <div style={{
        position: isCompact ? 'absolute' : 'relative',
        left: isCompact ? 0 : 'auto',
        right: isCompact ? 0 : 'auto',
        bottom: isCompact ? 0 : 'auto',
        zIndex: isCompact ? 24 : 'auto',
        width: isCompact ? '100%' : selected ? 380 : 0,
        minWidth: isCompact ? 0 : selected ? 380 : 0,
        height: isCompact ? selected ? 'min(54vh, 430px)' : 0 : 'auto',
        maxHeight: isCompact ? '54vh' : 'none',
        overflow: 'hidden',
        transition: isCompact ? 'height 0.28s ease' : 'width 0.28s ease, min-width 0.28s ease',
        background: 'rgba(2,8,20,0.98)',
        borderLeft: !isCompact && selected ? '1px solid rgba(20,184,166,0.1)' : 'none',
        borderTop: isCompact && selected ? '1px solid rgba(20,184,166,0.12)' : 'none',
        borderTopLeftRadius: isCompact && selected ? 22 : 0,
        borderTopRightRadius: isCompact && selected ? 22 : 0,
        boxShadow: isCompact && selected ? '0 -24px 70px rgba(0,0,0,0.42)' : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {selected && (
          <div style={{ width: isCompact ? '100%' : 380, height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {mode === 'view' && <ViewMode />}
            {mode === 'editCountry' && <EditCountryPanel />}
            {mode === 'cityForm' && <CityFormPanel />}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <DeleteDialog open={deleteType === 'country'} entityName={selected?.name ?? ''} warning="Todas as cidades associadas também serão excluídas." onConfirm={handleDeleteCountry} onCancel={() => setDeleteType(null)} />
      <DeleteDialog open={deleteType === 'city'} entityName={deleteCityTarget?.name ?? ''} onConfirm={handleDeleteCity} onCancel={() => setDeleteType(null)} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes loadingBar {
          0% { transform: translateX(-70%); width: 42%; }
          55% { width: 70%; }
          100% { transform: translateX(250%); width: 42%; }
        }
      `}</style>
    </div>
  );
}

function CityRow({ city, onEdit, onDelete }: { city: City; onEdit: (c: City) => void; onDelete: (c: City) => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ background: hov ? 'rgba(148,163,184,0.06)' : 'transparent', borderBottom: '1px solid rgba(148,163,184,0.08)', padding: '12px 0', display: 'flex', alignItems: 'center', gap: 11, transition: 'background 0.15s' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      <div style={{ width: 30, height: 30, borderRadius: 9, background: city.isCapital ? 'rgba(20,184,166,0.12)' : 'rgba(148,163,184,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Building2 size={14} style={{ color: city.isCapital ? '#5eead4' : '#94a3b8' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#e2e8f0', fontSize: '0.86rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{city.name}</span>
          {city.isCapital && <span style={{ background: 'rgba(20,184,166,0.14)', color: '#5eead4', fontSize: '0.6rem', fontWeight: 900, padding: '2px 6px', borderRadius: 6 }}>CAP</span>}
        </div>
        <p style={{ color: '#64748b', fontSize: '0.72rem', marginTop: 3 }}>{city.population.toLocaleString('pt-BR')} hab. - {city.lat.toFixed(1)}, {city.lng.toFixed(1)}</p>
      </div>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0, opacity: hov ? 1 : 0.35 }}>
        <button onClick={() => onEdit(city)}
          title="Editar cidade"
          style={{ width: 28, height: 28, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5eead4' }}>
          <Pencil size={12} />
        </button>
        <button onClick={() => onDelete(city)}
          title="Excluir cidade"
          style={{ width: 28, height: 28, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fca5a5' }}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

