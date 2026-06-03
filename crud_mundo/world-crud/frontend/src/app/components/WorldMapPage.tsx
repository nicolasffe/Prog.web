import { useRef, useEffect, useState, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { feature } from 'topojson-client';
import { useApp } from '../context/AppContext';
import { mockWeather } from '../data/mockData';
import { Country, City } from '../data/types';
import { DeleteDialog } from './ui/DeleteDialog';
import { Field, Input, Select } from './ui/Modal';
import { toast } from 'sonner';
import {
  Globe as GlobeIcon, Users, DollarSign, Languages, MapPin,
  Thermometer, Pencil, Trash2, Plus, X, ChevronLeft,
  Building2, Save, Flag, Wind,
} from 'lucide-react';

type GeoFeature = { id: string; type: string; geometry: object; properties: Record<string, unknown> };
type PanelMode = 'view' | 'editCountry' | 'cityForm';

const mkEmptyCity = (lat = 0, lng = 0) => ({
  name: '', population: 0, lat, lng, isCapital: false, countryId: '',
});

export default function WorldMapPage() {
  const { countries, continents, cities, updateCountry, deleteCountry, addCity, updateCity, deleteCity } = useApp();

  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Country | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mode, setMode] = useState<PanelMode>('view');
  const [editForm, setEditForm] = useState<Partial<Country>>({});
  const [cityForm, setCityForm] = useState(mkEmptyCity());
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deleteType, setDeleteType] = useState<'country' | 'city' | null>(null);
  const [deleteCityTarget, setDeleteCityTarget] = useState<City | null>(null);
  const [saving, setSaving] = useState(false);

  // Resize container
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
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
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
    ctrl.autoRotateSpeed = 0.35;
    ctrl.enableDamping = true;
    ctrl.dampingFactor = 0.08;
    ctrl.minDistance = 150;
    ctrl.maxDistance = 700;
  }, [selected]);

  const isoMap = Object.fromEntries(countries.map(c => [String(c.isoNumeric), c]));

  const getCapColor = useCallback((d: object) => {
    const { id } = d as GeoFeature;
    const c = isoMap[id];
    if (!c) return 'rgba(15,35,70,0.55)';
    if (selected?.id === c.id) return 'rgba(6,182,212,0.95)';
    if (hovered === id) return 'rgba(20,184,166,0.9)';
    return 'rgba(13,148,136,0.6)';
  }, [isoMap, selected, hovered]);

  const getAlt = useCallback((d: object) => {
    const { id } = d as GeoFeature;
    const c = isoMap[id];
    if (!c) return 0.004;
    if (selected?.id === c.id) return 0.028;
    if (hovered === id) return 0.02;
    return 0.012;
  }, [isoMap, selected, hovered]);

  const getStroke = useCallback((d: object) => {
    const c = isoMap[(d as GeoFeature).id];
    return c ? 'rgba(14,165,233,0.6)' : 'rgba(15,40,80,0.4)';
  }, [isoMap]);

  const getLabel = useCallback((d: object) => {
    const c = isoMap[(d as GeoFeature).id];
    if (!c) return '';
    return `<div style="background:rgba(2,8,20,0.92);color:#14b8a6;padding:5px 10px;border-radius:10px;font-size:13px;font-weight:700;border:1px solid rgba(20,184,166,0.4);white-space:nowrap;pointer-events:none">${c.flag} ${c.name}</div>`;
  }, [isoMap]);

  const handlePolygonClick = useCallback((d: object) => {
    const c = isoMap[(d as GeoFeature).id];
    if (c) {
      setSelected(c);
      setEditForm({ ...c });
      setMode('view');
      setEditingCity(null);
      if (globeRef.current) {
        globeRef.current.pointOfView({ lat: c.lat, lng: c.lng, altitude: 1.6 }, 1000);
      }
    }
  }, [isoMap]);

  // Rings on tracked country centers
  const ringsData = countries.map(c => ({
    lat: c.lat, lng: c.lng,
    maxR: selected?.id === c.id ? 4 : 1.8,
    propagationSpeed: selected?.id === c.id ? 2.5 : 1.0,
    repeatPeriod: selected?.id === c.id ? 900 : 3000,
    color: selected?.id === c.id ? '#06b6d4' : '#14b8a6',
  }));

  const countryCities = selected ? cities.filter(c => c.countryId === selected.id) : [];
  const weather = selected ? mockWeather[selected.id] : null;
  const continent = selected ? continents.find(c => c.id === selected.continentId) : null;

  // --- Handlers ---
  const handleSaveCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    updateCountry(selected.id, editForm);
    toast.success(`${editForm.name ?? selected.name} updated`);
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
      toast.success(`${cityForm.name} updated`);
    } else {
      addCity({ ...cityForm, countryId: selected.id });
      toast.success(`${cityForm.name} added to ${selected.name}`);
    }
    setSaving(false);
    setEditingCity(null);
    setCityForm(mkEmptyCity(selected.lat, selected.lng));
    setMode('view');
  };

  const handleDeleteCountry = () => {
    if (!selected) return;
    deleteCountry(selected.id);
    toast.success(`${selected.name} deleted`);
    setSelected(null);
    setDeleteType(null);
    if (globeRef.current) globeRef.current.controls().autoRotate = true;
  };

  const handleDeleteCity = () => {
    if (!deleteCityTarget) return;
    deleteCity(deleteCityTarget.id);
    toast.success(`${deleteCityTarget.name} deleted`);
    setDeleteCityTarget(null);
    setDeleteType(null);
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

  const closePanel = () => {
    setSelected(null);
    setMode('view');
    if (globeRef.current) globeRef.current.controls().autoRotate = true;
  };

  // --- Panel sections ---
  const ViewPanel = () => (
    <>
      {/* Country hero */}
      <div className="px-5 pt-5 pb-4"
        style={{ background: 'linear-gradient(160deg,rgba(14,165,233,0.1),rgba(20,184,166,0.06))', borderBottom: '1px solid rgba(20,184,166,0.1)', flexShrink: 0 }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <span style={{ fontSize: '2.4rem', lineHeight: 1, flexShrink: 0 }}>{selected?.flag}</span>
            <div className="min-w-0">
              <h2 style={{ color: 'white', fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected?.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {continent && (
                  <span className="px-2 py-0.5 rounded-full" style={{ background: `${continent.color}22`, color: continent.color, fontSize: '0.7rem', fontWeight: 700, border: `1px solid ${continent.color}35` }}>
                    {continent.name}
                  </span>
                )}
                <span style={{ color: '#475569', fontSize: '0.7rem' }}>{selected?.isoCode}</span>
              </div>
            </div>
          </div>
          <button onClick={closePanel}
            className="p-1.5 rounded-lg shrink-0 ml-2 transition-colors"
            style={{ color: '#64748b', background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}>
            <X size={15} />
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setMode('editCountry')}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors"
            style={{ background: 'rgba(20,184,166,0.12)', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.22)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,184,166,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,184,166,0.12)'}>
            <Pencil size={12} /> Edit Country
          </button>
          <button onClick={openAddCity}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors"
            style={{ background: 'rgba(14,165,233,0.12)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.22)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(14,165,233,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(14,165,233,0.12)'}>
            <Plus size={12} /> Add City
          </button>
          <button onClick={() => setDeleteType('country')}
            className="rounded-xl px-3 py-2 transition-colors"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Info rows */}
      <div className="px-5 py-4 space-y-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
        {selected && ([
          { icon: Users, label: 'Population', value: selected.population.toLocaleString(), color: '#14b8a6' },
          { icon: Flag, label: 'Capital', value: selected.capital, color: '#0ea5e9' },
          { icon: DollarSign, label: 'Currency', value: selected.currency, color: '#f59e0b' },
          { icon: Languages, label: 'Language', value: selected.language, color: '#8b5cf6' },
          { icon: MapPin, label: 'Coordinates', value: `${selected.lat.toFixed(2)}°, ${selected.lng.toFixed(2)}°`, color: '#ef4444' },
          { icon: GlobeIcon, label: 'Area', value: `${selected.area.toLocaleString()} km²`, color: '#10b981' },
          { icon: GlobeIcon, label: 'Timezone', value: selected.timezone, color: '#6366f1' },
        ] as const).map(row => (
          <div key={row.label} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${row.color}18` }}>
              <row.icon size={13} style={{ color: row.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: '#475569', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{row.label}</p>
              <p style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Weather */}
      {weather && (
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
          <p style={{ color: '#475569', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Current Weather</p>
          <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.14)' }}>
            <span style={{ fontSize: '1.6rem' }}>
              {weather.condition.match(/Sunny|Clear/) ? '☀️' : weather.condition.match(/Rain/) ? '🌧️' : weather.condition.match(/Snow/) ? '❄️' : weather.condition.match(/Cloud|Overcast|Hazy/) ? '⛅' : '🌤️'}
            </span>
            <div className="flex-1">
              <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem' }}>{weather.temp}°C — {weather.condition}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>💧 {weather.humidity}%</span>
                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
                  <Wind size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> {weather.wind} km/h
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cities */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p style={{ color: '#475569', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Cities ({countryCities.length})
          </p>
          <button onClick={openAddCity}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors"
            style={{ background: 'rgba(20,184,166,0.12)', color: '#14b8a6', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,184,166,0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,184,166,0.12)'}>
            <Plus size={11} /> Add
          </button>
        </div>

        {countryCities.length === 0 ? (
          <div className="text-center py-6 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)' }}>
            <Building2 size={22} style={{ margin: '0 auto 6px', color: '#1e3a5f' }} />
            <p style={{ color: '#475569', fontSize: '0.78rem' }}>No cities yet</p>
            <button onClick={openAddCity}
              className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: 'rgba(20,184,166,0.12)', color: '#14b8a6', border: 'none', cursor: 'pointer' }}>
              Add first city
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {countryCities.map(city => (
              <CityRow key={city.id} city={city} onEdit={openEditCity} onDelete={c => { setDeleteCityTarget(c); setDeleteType('city'); }} />
            ))}
          </div>
        )}
      </div>
    </>
  );

  const EditCountryPanel = () => (
    <form onSubmit={handleSaveCountry} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="flex items-center gap-3 px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button type="button" onClick={() => setMode('view')}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: '#64748b', background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
          <ChevronLeft size={15} />
        </button>
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem' }}>Edit {selected?.name}</span>
        <span style={{ fontSize: '1.2rem', marginLeft: 2 }}>{selected?.flag}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        <Field label="Country Name">
          <Input value={editForm.name ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} required />
        </Field>
        <Field label="Flag Emoji">
          <Input value={editForm.flag ?? ''} onChange={e => setEditForm(f => ({ ...f, flag: e.target.value }))} />
        </Field>
        <Field label="Continent">
          <Select value={editForm.continentId ?? ''} onChange={e => setEditForm(f => ({ ...f, continentId: e.target.value }))}>
            {continents.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Capital">
          <Input value={editForm.capital ?? ''} onChange={e => setEditForm(f => ({ ...f, capital: e.target.value }))} />
        </Field>
        <Field label="Population">
          <Input type="number" value={editForm.population ?? 0} onChange={e => setEditForm(f => ({ ...f, population: Number(e.target.value) }))} />
        </Field>
        <Field label="Language">
          <Input value={editForm.language ?? ''} onChange={e => setEditForm(f => ({ ...f, language: e.target.value }))} />
        </Field>
        <Field label="Currency">
          <Input value={editForm.currency ?? ''} onChange={e => setEditForm(f => ({ ...f, currency: e.target.value }))} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude">
            <Input type="number" step="0.01" value={editForm.lat ?? 0} onChange={e => setEditForm(f => ({ ...f, lat: Number(e.target.value) }))} />
          </Field>
          <Field label="Longitude">
            <Input type="number" step="0.01" value={editForm.lng ?? 0} onChange={e => setEditForm(f => ({ ...f, lng: Number(e.target.value) }))} />
          </Field>
        </div>
        <Field label="Timezone">
          <Input value={editForm.timezone ?? ''} onChange={e => setEditForm(f => ({ ...f, timezone: e.target.value }))} />
        </Field>
      </div>

      <div className="flex gap-2 p-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button type="button" onClick={() => setMode('view')}
          className="flex-1 rounded-xl py-2.5 text-sm transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors"
          style={{ background: saving ? 'rgba(20,184,166,0.4)' : '#14b8a6', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
          <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );

  const CityFormPanel = () => (
    <form onSubmit={handleSaveCity} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="flex items-center gap-3 px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button type="button" onClick={() => { setMode('view'); setEditingCity(null); }}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: '#64748b', background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={15} />
        </button>
        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem' }}>
          {editingCity ? `Edit ${editingCity.name}` : `Add City — ${selected?.name}`}
        </span>
        {selected && <span style={{ fontSize: '1.1rem' }}>{selected.flag}</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        <Field label="City Name *">
          <Input value={cityForm.name} onChange={e => setCityForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Porto" />
        </Field>
        <Field label="Population">
          <Input type="number" value={cityForm.population} onChange={e => setCityForm(f => ({ ...f, population: Number(e.target.value) }))} placeholder="e.g. 250000" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude">
            <Input type="number" step="0.0001" value={cityForm.lat} onChange={e => setCityForm(f => ({ ...f, lat: Number(e.target.value) }))} />
          </Field>
          <Field label="Longitude">
            <Input type="number" step="0.0001" value={cityForm.lng} onChange={e => setCityForm(f => ({ ...f, lng: Number(e.target.value) }))} />
          </Field>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <input type="checkbox" id="capCb" checked={cityForm.isCapital}
            onChange={e => setCityForm(f => ({ ...f, isCapital: e.target.checked }))}
            style={{ width: 15, height: 15, accentColor: '#14b8a6', cursor: 'pointer' }} />
          <label htmlFor="capCb" style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}>Capital city</label>
        </div>
      </div>

      <div className="flex gap-2 p-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button type="button" onClick={() => { setMode('view'); setEditingCity(null); }}
          className="flex-1 rounded-xl py-2.5 text-sm transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors"
          style={{ background: saving ? 'rgba(20,184,166,0.4)' : '#14b8a6', color: 'white', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
          <Save size={14} /> {saving ? 'Saving...' : editingCity ? 'Save' : 'Add City'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="relative flex h-full overflow-hidden" style={{ background: '#020b18' }}>

      {/* Globe container */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden" style={{ minWidth: 0 }}>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20"
            style={{ background: 'rgba(2,8,20,0.75)', backdropFilter: 'blur(4px)' }}>
            <div className="w-12 h-12 rounded-full border-2 border-teal-500 animate-spin mb-4"
              style={{ borderTopColor: 'transparent' }} />
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Loading 3D globe...</p>
          </div>
        )}

        {/* HUD — top left */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 rounded-xl px-4 py-2.5"
            style={{ background: 'rgba(2,8,20,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(20,184,166,0.25)' }}>
            <GlobeIcon size={15} style={{ color: '#14b8a6' }} />
            <span style={{ color: '#f1f5f9', fontSize: '0.82rem', fontWeight: 700 }}>3D World Globe</span>
          </div>
          <div className="rounded-xl px-3 py-2.5"
            style={{ background: 'rgba(2,8,20,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
              <span style={{ color: '#14b8a6', fontWeight: 700 }}>{countries.length}</span> countries ·{' '}
              <span style={{ color: '#0ea5e9', fontWeight: 700 }}>{cities.length}</span> cities
            </span>
          </div>
        </div>

        {/* Hint bar */}
        {!selected && !loading && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 rounded-xl px-5 py-2.5"
            style={{ background: 'rgba(2,8,20,0.82)', backdropFilter: 'blur(12px)', border: '1px solid rgba(20,184,166,0.2)', whiteSpace: 'nowrap' }}>
            <p style={{ color: '#64748b', fontSize: '0.78rem' }}>
              <span style={{ color: '#14b8a6', fontWeight: 600 }}>Drag</span> to rotate ·{' '}
              <span style={{ color: '#14b8a6', fontWeight: 600 }}>Scroll</span> to zoom ·{' '}
              <span style={{ color: '#14b8a6', fontWeight: 600 }}>Click</span> a highlighted country
            </p>
          </div>
        )}

        {/* Globe */}
        {size.w > 0 && (
          <Globe
            ref={globeRef}
            width={size.w}
            height={size.h}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            showAtmosphere
            atmosphereColor="#0ea5e9"
            atmosphereAltitude={0.14}
            polygonsData={features}
            polygonAltitude={getAlt}
            polygonCapColor={getCapColor}
            polygonSideColor={() => 'rgba(14,165,233,0.06)'}
            polygonStrokeColor={getStroke}
            polygonLabel={getLabel}
            onPolygonClick={handlePolygonClick}
            onPolygonHover={(d: object | null) => setHovered(d ? (d as GeoFeature).id : null)}
            ringsData={ringsData}
            ringColor={(d: object) => (d as any).color}
            ringMaxRadius={(d: object) => (d as any).maxR}
            ringPropagationSpeed={(d: object) => (d as any).propagationSpeed}
            ringRepeatPeriod={(d: object) => (d as any).repeatPeriod}
          />
        )}
      </div>

      {/* Side Panel */}
      <div
        style={{
          width: selected ? 340 : 0,
          minWidth: selected ? 340 : 0,
          overflow: 'hidden',
          transition: 'width 0.3s ease, min-width 0.3s ease',
          background: 'rgba(2,8,20,0.98)',
          borderLeft: selected ? '1px solid rgba(20,184,166,0.12)' : 'none',
          display: 'flex',
          flexDirection: 'column',
        }}>
        {selected && (
          <div style={{ width: 340, height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {mode === 'view' && <ViewPanel />}
            {mode === 'editCountry' && <EditCountryPanel />}
            {mode === 'cityForm' && <CityFormPanel />}
          </div>
        )}
      </div>

      <DeleteDialog
        open={deleteType === 'country'}
        entityName={selected?.name ?? ''}
        warning="All associated cities will also be deleted."
        onConfirm={handleDeleteCountry}
        onCancel={() => setDeleteType(null)}
      />
      <DeleteDialog
        open={deleteType === 'city'}
        entityName={deleteCityTarget?.name ?? ''}
        onConfirm={handleDeleteCity}
        onCancel={() => setDeleteType(null)}
      />
    </div>
  );
}

function CityRow({ city, onEdit, onDelete }: { city: City; onEdit: (c: City) => void; onDelete: (c: City) => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="rounded-xl p-3 flex items-center gap-2.5"
      style={{ background: hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.15s' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: city.isCapital ? 'rgba(20,184,166,0.2)' : 'rgba(255,255,255,0.05)' }}>
        <Building2 size={12} style={{ color: city.isCapital ? '#14b8a6' : '#64748b' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>{city.name}</span>
          {city.isCapital && (
            <span style={{ background: 'rgba(20,184,166,0.15)', color: '#14b8a6', fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px', borderRadius: 4 }}>★ CAP</span>
          )}
        </div>
        <p style={{ color: '#475569', fontSize: '0.7rem', marginTop: 1 }}>
          {city.population.toLocaleString()} · {city.lat.toFixed(1)}°, {city.lng.toFixed(1)}°
        </p>
      </div>
      {hov && (
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(city)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#14b8a6'; e.currentTarget.style.background = 'rgba(20,184,166,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'none'; }}>
            <Pencil size={12} />
          </button>
          <button onClick={() => onDelete(city)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'none'; }}>
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
