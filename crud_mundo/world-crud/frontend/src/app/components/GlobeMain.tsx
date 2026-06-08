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
  { name: 'Africa', lat: 3, lng: 22, color: '#8bc6b2' },
  { name: 'Asia', lat: 34, lng: 100, color: '#8fbfd4' },
  { name: 'Europa', lat: 52, lng: 15, color: '#9cb7d8' },
  { name: 'America N.', lat: 46, lng: -100, color: '#8fc9c1' },
  { name: 'America S.', lat: -14, lng: -57, color: '#9dc58b' },
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
    isAuthenticated, login, logout,
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

  // Login
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
    return `<div style="background:rgba(3,25,35,0.94);color:#67e8f9;padding:5px 12px;border-radius:10px;font-size:13px;font-weight:700;border:1px solid rgba(45,212,191,0.38);white-space:nowrap;pointer-events:none;box-shadow:0 4px 22px rgba(6,182,212,0.18)">${c.flag} ${c.name}</div>`;
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
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (!ok) setLoginError('Use um email valido e uma senha com pelo menos 6 caracteres.');
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
      {/* Hero */}
      <div className="px-5 pt-5 pb-4 shrink-0"
        style={{ background: 'linear-gradient(160deg,rgba(14,165,233,0.08),rgba(20,184,166,0.04))', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-start gap-3 mb-3">
          <span style={{ fontSize: '2.6rem', lineHeight: 1, flexShrink: 0 }}>{selected?.flag}</span>
          <div className="flex-1 min-w-0">
            <h2 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selected?.name}
            </h2>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {continent && (
                <span style={{ background: `${continent.color}20`, color: continent.color, fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, border: `1px solid ${continent.color}35` }}>
                  {continent.name}
                </span>
              )}
              <span style={{ color: '#334155', fontSize: '0.7rem' }}>{selected?.isoCode} - {selected?.timezone}</span>
            </div>
          </div>
          <button onClick={closePanel}
            style={{ color: '#334155', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '5px', cursor: 'pointer', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
            <X size={14} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={() => setMode('editCountry')}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors"
            style={{ background: 'rgba(20,184,166,0.1)', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.2)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,184,166,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,184,166,0.1)'}>
            <Pencil size={11} /> Editar
          </button>
          <button onClick={openAddCity}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors"
            style={{ background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.2)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(14,165,233,0.1)'}>
            <Plus size={11} /> Cidade
          </button>
          <button onClick={() => setDeleteType('country')}
            className="rounded-xl px-3 py-2 transition-colors"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#7f1d1d', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#7f1d1d'; }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="grid grid-cols-2 gap-2">
          {selected && ([
            { label: 'Populacao', value: (selected.population / 1e6).toFixed(1) + 'M', color: '#14b8a6' },
            { label: 'Capital', value: selected.capital, color: '#0ea5e9' },
            { label: 'Moeda', value: selected.currency, color: '#f59e0b' },
            { label: 'Idioma', value: selected.language.split('/')[0].trim(), color: '#8b5cf6' },
            { label: 'Area', value: (selected.area / 1000).toFixed(0) + 'k km2', color: '#10b981' },
            { label: 'Coordenadas', value: `${selected.lat.toFixed(1)} graus, ${selected.lng.toFixed(1)} graus`, color: '#6366f1' },
          ] as const).map(row => (
            <div key={row.label} className="rounded-xl p-2.5"
              style={{ background: `${row.color}08`, border: `1px solid ${row.color}14` }}>
              <p style={{ color: '#334155', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{row.label}</p>
              <p style={{ color: row.color, fontSize: '0.78rem', fontWeight: 700, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weather */}
      {(weather || weatherLoading || weatherCity) && (
        <div className="px-5 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-3 rounded-xl p-3"
            style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.12)' }}>
            {weather ? (
              <>
                <span style={{ fontSize: '1.4rem' }}>{getWeatherLabel(weather.description)}</span>
                <div className="flex-1">
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>
                    {Math.round(weather.temperature)} grausC <span style={{ color: '#475569', fontWeight: 400, fontSize: '0.78rem' }}>- {weather.description ?? weather.provider}</span>
                  </p>
                  <p style={{ color: '#334155', fontSize: '0.68rem', marginTop: 1 }}>Umidade {weather.humidity ?? '-'}% | Vento {weather.windSpeed ?? '-'} km/h</p>
                </div>
              </>
            ) : (
              <div className="flex-1" style={{ color: '#334155', fontSize: '0.72rem' }}>
                {weatherLoading ? 'Carregando clima...' : 'Dados de clima indisponiveis'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cities */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-2.5">
          <p style={{ color: '#334155', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
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
            style={{ background: 'rgba(255,255,255,0.01)', border: '1px dashed rgba(255,255,255,0.06)' }}>
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
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem' }}>Editar pais</span>
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
        <Field label="Populacao *"><Input type="number" value={editForm.population ?? 0} onChange={e => setEditForm(f => ({ ...f, population: Number(e.target.value) }))} required /></Field>
        <Field label="Idioma *"><Input value={editForm.language ?? ''} onChange={e => setEditForm(f => ({ ...f, language: e.target.value }))} required /></Field>
        <Field label="Moeda *"><Input value={editForm.currency ?? ''} onChange={e => setEditForm(f => ({ ...f, currency: e.target.value }))} required /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude"><Input type="number" step="0.01" value={editForm.lat ?? 0} onChange={e => setEditForm(f => ({ ...f, lat: Number(e.target.value) }))} /></Field>
          <Field label="Longitude"><Input type="number" step="0.01" value={editForm.lng ?? 0} onChange={e => setEditForm(f => ({ ...f, lng: Number(e.target.value) }))} /></Field>
        </div>
        <Field label="Fuso horario"><Input value={editForm.timezone ?? ''} onChange={e => setEditForm(f => ({ ...f, timezone: e.target.value }))} /></Field>
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
        <Field label="Populacao *"><Input type="number" value={cityForm.population} onChange={e => setCityForm(f => ({ ...f, population: Number(e.target.value) }))} placeholder="Ex.: 250000" required /></Field>
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
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 30, background: 'rgba(2,10,24,0.7)', backdropFilter: 'blur(6px)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', border: `2px solid ${OCEAN.aqua}`, borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', marginBottom: 14 }} />
            <p style={{ color: '#8bd8dd', fontSize: '0.85rem' }}>Carregando globo...</p>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(2,8,20,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(34,211,238,0.16)', borderRadius: 12, padding: '7px 10px' }}>
                  <Thermometer size={13} style={{ color: OCEAN.aqua }} />
                  <span style={{ color: '#67e8f9', fontSize: '0.72rem', fontWeight: 700 }}>
                    {citiesWeatherLoading ? 'Clima...' : `${allWeatherMarkers.length} temperaturas`}
                  </span>
                </div>
              </div>
            </div>

            {/* Weather controls */}
            <div style={{ position: 'absolute', top: 58, left: 16, zIndex: 10, width: 282, background: 'rgba(2,8,20,0.72)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 12 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {([
                  { value: 'weather', label: 'Clima', icon: Thermometer },
                  { value: 'countries', label: 'Paises', icon: Flag },
                ] as const).map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => setGlobeLayer(value)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 8px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: globeLayer === value ? 'rgba(34,211,238,0.18)' : 'rgba(255,255,255,0.03)', color: globeLayer === value ? OCEAN.aqua : '#64748b', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                    <Icon size={12} /> {label}
                  </button>
                ))}
                <button type="button" onClick={handleRefreshWeather} disabled={citiesWeatherRefreshing}
                  title="Atualizar clima"
                  style={{ width: 34, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)', color: citiesWeatherRefreshing ? '#334155' : OCEAN.aqua, cursor: citiesWeatherRefreshing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={13} style={{ animation: citiesWeatherRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <label style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 700 }}>
                  Min {tempMin}C
                  <input type="range" min="-20" max="50" value={tempMin}
                    onChange={e => setTempMin(Math.min(Number(e.target.value), tempMax))}
                    style={{ width: '100%', accentColor: OCEAN.aqua }} />
                </label>
                <label style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 700 }}>
                  Max {tempMax}C
                  <input type="range" min="-20" max="50" value={tempMax}
                    onChange={e => setTempMax(Math.max(Number(e.target.value), tempMin))}
                    style={{ width: '100%', accentColor: OCEAN.aqua }} />
                </label>
              </div>

              <p style={{ color: '#64748b', fontSize: '0.68rem', lineHeight: 1.35, marginBottom: 10 }}>
                Temperaturas exibidas por cidade. Os paises ficam neutros para evitar leitura de clima uniforme.
              </p>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: '0.72rem', fontWeight: 700, marginBottom: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={showExtremes} onChange={e => setShowExtremes(e.target.checked)}
                  style={{ accentColor: OCEAN.aqua }} />
                Destacar mais quente e mais fria
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
                {hottestCity && (
                  <button type="button" onClick={() => flyToWeatherCity(hottestCity.city.countryId)}
                    style={{ textAlign: 'left', border: '1px solid rgba(205,154,92,0.22)', background: 'rgba(205,154,92,0.07)', borderRadius: 10, padding: 8, cursor: 'pointer' }}>
                    <p style={{ color: '#d7a96d', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase' }}>Mais quente</p>
                    <p style={{ color: '#f8fafc', fontSize: '0.74rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hottestCity.city.name}</p>
                    <p style={{ color: '#d7a96d', fontSize: '0.78rem', fontWeight: 800 }}>{Math.round(hottestCity.temperature)}C</p>
                  </button>
                )}
                {coldestCity && (
                  <button type="button" onClick={() => flyToWeatherCity(coldestCity.city.countryId)}
                    style={{ textAlign: 'left', border: '1px solid rgba(142,190,199,0.22)', background: 'rgba(142,190,199,0.07)', borderRadius: 10, padding: 8, cursor: 'pointer' }}>
                    <p style={{ color: '#9ecbd2', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase' }}>Mais fria</p>
                    <p style={{ color: '#f8fafc', fontSize: '0.74rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{coldestCity.city.name}</p>
                    <p style={{ color: '#9ecbd2', fontSize: '0.78rem', fontWeight: 800 }}>{Math.round(coldestCity.temperature)}C</p>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {rankedWeather.slice(0, 5).map((item, index) => (
                  <button key={item.city.id} type="button" onClick={() => flyToWeatherCity(item.city.countryId)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ color: '#334155', fontSize: '0.68rem', width: 16, fontWeight: 800 }}>{index + 1}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.city.name}</span>
                    <span style={{ color: temperatureAccent(item.temperature), fontSize: '0.74rem', fontWeight: 800 }}>{Math.round(item.temperature)}C</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search - top center */}
            <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 20, width: 380 }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#334155', pointerEvents: 'none' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                  placeholder="Buscar paises, capitais..."
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
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Admin</span>
                <ChevronDown size={12} style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {menuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 210, borderRadius: 14, overflow: 'hidden', background: 'rgba(3,12,30,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                  <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#475569', fontSize: '0.7rem' }}>admin@geocrud.app</p>
                  </div>
                  {([
                    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                    { to: '/app/continents', icon: Layers, label: 'Continentes', count: continents.length },
                    { to: '/app/countries', icon: Flag, label: 'Paises', count: countries.length },
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
                  <button onClick={() => { logout(); setMenuOpen(false); }}
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
            <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: 'min(720px, calc(100vw - 420px))', minWidth: 460 }}>
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
            <div style={{ position: 'absolute', bottom: 24, right: 16, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {([
                { icon: ZoomIn, action: zoomIn, title: 'Aproximar' },
                { icon: ZoomOut, action: zoomOut, title: 'Afastar' },
                { icon: RotateCcw, action: resetView, title: 'Redefinir visualizacao' },
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
            {!selected && !loading && (
              <div style={{ position: 'absolute', bottom: 22, left: 16, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(3,10,24,0.58)', backdropFilter: 'blur(18px)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 14, padding: '7px 10px', boxShadow: '0 14px 40px rgba(0,0,0,0.22)' }}>
                  {[
                    ['Arraste', 'girar'],
                    ['Role', 'zoom'],
                    ['Clique', 'abrir pais'],
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
              return `${item.city.name} ${Math.round(item.temperature)} grausC`;
            }}
            labelSize={0.56}
            labelDotRadius={0.16}
            labelColor={(d: object) => temperatureAccent((d as any).temperature)}
            labelResolution={2}
            labelLabel={(d: object) => {
              const item = d as any;
              return `<div style="background:rgba(3,12,30,0.96);color:#e2e8f0;padding:8px 10px;border-radius:10px;border:1px solid rgba(34,211,238,0.24);font-size:12px;line-height:1.35"><strong>${item.city.name}</strong><br/>${Math.round(item.temperature)} grausC - ${item.description ?? item.provider}<br/>Umidade ${item.humidity ?? '-'}% | Vento ${item.windSpeed ?? '-'} km/h</div>`;
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
              return `<div style="background:rgba(3,12,30,0.96);color:#e2e8f0;padding:8px 10px;border-radius:10px;border:1px solid ${temperatureAccent(item.temperature)};font-size:12px;line-height:1.35"><strong>${item.city.name}</strong><br/>Destaque: ${Math.round(item.temperature)} grausC</div>`;
            }}
            onPointClick={(d: object) => flyToWeatherCity((d as any).city.countryId)}
          />
        )}

        {/* -- Login overlay ------------------------------------ */}
        {!isAuthenticated && !loading && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,8,20,0.25)', backdropFilter: 'blur(3px)' }}>
            <div style={{ width: 320, borderRadius: 20, background: 'rgba(3,10,26,0.93)', backdropFilter: 'blur(24px)', border: '1px solid rgba(20,184,166,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', padding: '28px 28px 24px' }}>

              {/* Logo row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#14b8a6,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GlobeIcon size={14} style={{ color: 'white' }} />
                </div>
                <span style={{ color: '#475569', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em' }}>GeoCRUD</span>
              </div>

              <p style={{ color: 'white', fontSize: '1.05rem', fontWeight: 800, marginBottom: 4 }}>Entrar</p>
              <p style={{ color: '#1e293b', fontSize: '0.75rem', marginBottom: 18 }}>para acessar o banco de dados geografico</p>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Email */}
                <div style={{ position: 'relative' }}>
                  <Mail size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#1e293b', pointerEvents: 'none' }} />
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                    placeholder="Email" required
                    style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(20,184,166,0.35)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                  />
                </div>

                {/* Senha */}
                <div style={{ position: 'relative' }}>
                  <Lock size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#1e293b', pointerEvents: 'none' }} />
                  <input type={showPw ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Senha" required
                    style={{ width: '100%', paddingLeft: 32, paddingRight: 36, paddingTop: 9, paddingBottom: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, color: '#e2e8f0', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(20,184,166,0.35)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#1e293b', display: 'flex' }}>
                    {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>

                {loginError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '6px 10px' }}>
                    <AlertCircle size={12} style={{ color: '#f87171', flexShrink: 0 }} />
                    <p style={{ color: '#f87171', fontSize: '0.72rem' }}>{loginError}</p>
                  </div>
                )}

                <button type="submit" disabled={loginLoading}
                  style={{ marginTop: 4, background: loginLoading ? 'rgba(20,184,166,0.35)' : 'linear-gradient(135deg,#14b8a6,#0ea5e9)', color: 'white', border: 'none', borderRadius: 12, padding: '10px', fontWeight: 700, fontSize: '0.875rem', cursor: loginLoading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}>
                  {loginLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <p style={{ color: '#0f172a', fontSize: '0.68rem', textAlign: 'center', marginTop: 14 }}>Use uma conta cadastrada para acessar o sistema.</p>
            </div>
          </div>
        )}
      </div>

      {/* -- Country side panel ------------------------------------------- */}
      <div style={{
        width: selected ? 320 : 0,
        minWidth: selected ? 320 : 0,
        overflow: 'hidden',
        transition: 'width 0.28s ease, min-width 0.28s ease',
        background: 'rgba(2,8,20,0.98)',
        borderLeft: selected ? '1px solid rgba(20,184,166,0.1)' : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {selected && (
          <div style={{ width: 320, height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {mode === 'view' && <ViewMode />}
            {mode === 'editCountry' && <EditCountryPanel />}
            {mode === 'cityForm' && <CityFormPanel />}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <DeleteDialog open={deleteType === 'country'} entityName={selected?.name ?? ''} warning="Todas as cidades associadas tambem serao excluidas." onConfirm={handleDeleteCountry} onCancel={() => setDeleteType(null)} />
      <DeleteDialog open={deleteType === 'city'} entityName={deleteCityTarget?.name ?? ''} onConfirm={handleDeleteCity} onCancel={() => setDeleteType(null)} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function CityRow({ city, onEdit, onDelete }: { city: City; onEdit: (c: City) => void; onDelete: (c: City) => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      style={{ background: hov ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      <div style={{ width: 26, height: 26, borderRadius: 8, background: city.isCapital ? 'rgba(20,184,166,0.18)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Building2 size={11} style={{ color: city.isCapital ? '#14b8a6' : '#334155' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>{city.name}</span>
          {city.isCapital && <span style={{ background: 'rgba(20,184,166,0.12)', color: '#14b8a6', fontSize: '0.58rem', fontWeight: 700, padding: '1px 5px', borderRadius: 5 }}>CAP</span>}
        </div>
        <p style={{ color: '#1e293b', fontSize: '0.67rem', marginTop: 1 }}>{city.population.toLocaleString()} - {city.lat.toFixed(1)} graus, {city.lng.toFixed(1)} graus</p>
      </div>
      {hov && (
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          <button onClick={() => onEdit(city)}
            style={{ width: 24, height: 24, borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.1)'; e.currentTarget.style.color = '#14b8a6'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#334155'; }}>
            <Pencil size={11} />
          </button>
          <button onClick={() => onDelete(city)}
            style={{ width: 24, height: 24, borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#334155'; }}>
            <Trash2 size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

