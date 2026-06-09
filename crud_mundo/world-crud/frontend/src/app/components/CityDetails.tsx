import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Building2, Users, MapPin, Thermometer, Wind, Pencil, Trash2, Save, X, Flag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DeleteDialog } from './ui/DeleteDialog';
import { Field, Input, SearchableSelect, FormActions } from './ui/Modal';
import { toast } from 'sonner';
import { numberInputValue, parseNumberInput } from '../utils/numberInput';
import { validateCityPopulation } from '../utils/cityValidation';
import { City } from '../data/types';

type Weather = {
  temperature: number;
  feelsLike?: number | null;
  humidity?: number | null;
  windSpeed?: number | null;
  description?: string | null;
  provider: string;
  cached?: boolean;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
const TOKEN_KEY = 'world_crud_token';

export default function CityDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cities, countries, continents, updateCity, deleteCity } = useApp();

  const city = cities.find(c => c.id === id);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Omit<City, 'id'>>(city ? { ...city } : { name: '', countryId: '', population: 0, lat: 0, lng: 0, isCapital: false });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    if (city) setForm({ ...city });
  }, [id]);

  if (!city) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ color: '#94a3b8' }}>
        <Building2 size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
        <p>Cidade não encontrada.</p>
        <button onClick={() => navigate('/app/cities')} className="mt-4 px-4 py-2 rounded-xl"
          style={{ background: '#14b8a6', color: 'white', border: 'none', cursor: 'pointer' }}>
          Voltar para cidades
        </button>
      </div>
    );
  }

  const country = countries.find(c => c.id === city.countryId);
  const continent = country ? continents.find(c => c.id === country.continentId) : null;
  useEffect(() => {
    if (!city) return;
    let cancelled = false;
    setWeatherLoading(true);
    fetch(`${API_URL}/weather/city/${city.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) ?? ''}`,
      },
    })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (!cancelled) setWeather(data);
      })
      .catch(() => {
        if (!cancelled) setWeather(null);
      })
      .finally(() => {
        if (!cancelled) setWeatherLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [city?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const populationError = validateCityPopulation(form, countries);
    if (populationError) {
      toast.error(populationError);
      return;
    }
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      await updateCity(city.id, form);
      toast.success(`${form.name} atualizada com sucesso`);
      setEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar a cidade.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    deleteCity(city.id);
    toast.success(`${city.name} excluída`);
    navigate('/app/cities');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-full" style={{ background: 'radial-gradient(circle at 18% 12%, rgba(56,189,248,0.14), transparent 28%), radial-gradient(circle at 82% 8%, rgba(45,212,191,0.1), transparent 24%), linear-gradient(180deg, #020617 0%, #07111f 54%, #020617 100%)' }}>
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/app/cities')}
          className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors"
          style={{ background: 'rgba(15,23,42,0.78)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.18)', cursor: 'pointer', fontSize: '0.875rem' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,41,59,0.82)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(15,23,42,0.78)'}>
          <ArrowLeft size={16} /> Voltar para cidades
        </button>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={() => { setForm({ ...city }); setEditing(false); }}
                className="flex items-center gap-2 rounded-xl px-4 py-2"
                style={{ background: 'rgba(30,41,59,0.72)', color: '#cbd5e1', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                <X size={15} /> Cancelar
              </button>
              <button type="submit" form="cityForm"
                className="flex items-center gap-2 rounded-xl px-4 py-2"
                style={{ background: '#14b8a6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                <Save size={15} /> {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2"
                style={{ background: 'rgba(15,23,42,0.78)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.18)', cursor: 'pointer', fontWeight: 500 }}>
                <Pencil size={15} /> Editar
              </button>
              <button onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontWeight: 500 }}>
                <Trash2 size={15} /> Excluir
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="rounded-2xl p-8 mb-6" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(20,184,166,0.15)', border: '2px solid rgba(20,184,166,0.3)' }}>
            <Building2 size={28} style={{ color: '#14b8a6' }} />
          </div>
          <div>
            <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>
              {editing ? (
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="rounded-lg px-3 py-1 outline-none"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '1.4rem', fontWeight: 700 }} />
              ) : city.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              {country && (
                <button onClick={() => navigate(`/app/countries/${country.id}`)}
                  className="flex items-center gap-1.5 transition-opacity"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  {country.flagUrl ? (
                    <img src={country.flagUrl} alt={country.flagAlt || `${country.name} flag`} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 3 }} />
                  ) : (
                    <span style={{ fontSize: '1.1rem' }}>{country.flag}</span>
                  )}
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{country.name}</span>
                </button>
              )}
              {continent && (
                <span className="px-2.5 py-0.5 rounded-full" style={{ background: `${continent.color}25`, color: continent.color, fontSize: '0.78rem', fontWeight: 600 }}>
                  {continent.name}
                </span>
              )}
              {city.isCapital && (
                <span className="px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(20,184,166,0.2)', color: '#14b8a6', fontSize: '0.78rem', fontWeight: 600 }}>
                  Capital
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <form id="cityForm" onSubmit={handleSave} className="rounded-2xl p-6 mb-6 space-y-4"
          style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)' }}>
          <h3 style={{ color: '#f8fafc', fontWeight: 700 }}>Editar detalhes da cidade</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome"><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></Field>
            <Field label="País">
              <SearchableSelect
                value={form.countryId}
                onChange={countryId => setForm(f => ({ ...f, countryId }))}
                placeholder="Selecione um país"
                searchPlaceholder="Buscar país..."
                options={countries.map(c => ({
                  value: c.id,
                  label: `${c.flag} ${c.name}`,
                  description: continents.find(continent => continent.id === c.continentId)?.name,
                }))}
              />
            </Field>
          </div>
          <Field label="População">
            <Input type="number" value={numberInputValue(form.population)} onChange={e => setForm(f => ({ ...f, population: parseNumberInput(e.target.value) }))} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude"><Input type="number" step="0.0001" value={numberInputValue(form.lat)} onChange={e => setForm(f => ({ ...f, lat: parseNumberInput(e.target.value) }))} /></Field>
            <Field label="Longitude"><Input type="number" step="0.0001" value={numberInputValue(form.lng)} onChange={e => setForm(f => ({ ...f, lng: parseNumberInput(e.target.value) }))} /></Field>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(15,23,42,0.62)', border: '1px solid rgba(148,163,184,0.18)' }}>
            <input type="checkbox" id="capEdit" checked={form.isCapital} onChange={e => setForm(f => ({ ...f, isCapital: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: '#14b8a6', cursor: 'pointer' }} />
            <label htmlFor="capEdit" style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
              Esta cidade é a capital do país
            </label>
          </div>
        </form>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, label: 'População', value: city.population.toLocaleString(), color: '#14b8a6' },
          { icon: MapPin, label: 'Latitude', value: `${city.lat.toFixed(4)} graus`, color: '#0ea5e9' },
          { icon: MapPin, label: 'Longitude', value: `${city.lng.toFixed(4)} graus`, color: '#8b5cf6' },
          { icon: Flag, label: 'País', value: country?.name ?? '-', color: '#f59e0b' },
        ].map(card => (
          <div key={card.label} className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${card.color}15` }}>
              <card.icon size={17} style={{ color: card.color }} />
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</p>
            <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '0.95rem', marginTop: 4 }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Weather + map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location preview */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)' }}>
          <div className="p-5 pb-0">
            <p style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 12 }}>Prévia da localização</p>
          </div>
          <div className="mx-5 mb-5 rounded-xl overflow-hidden" style={{ background: '#0f172a' }}>
            <div className="relative" style={{ height: 180 }}>
              <div className="absolute inset-0 opacity-15"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(20,184,166,0.8) 1px, transparent 0)', backgroundSize: '15px 15px' }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full opacity-20 animate-ping"
                    style={{ background: '#14b8a6' }} />
                  <div className="w-10 h-10 rounded-full flex items-center justify-center relative z-10"
                    style={{ background: 'rgba(20,184,166,0.3)', border: '2px solid #14b8a6' }}>
                    <MapPin size={18} style={{ color: '#14b8a6' }} />
                  </div>
                </div>
                <p style={{ color: '#14b8a6', fontWeight: 700, fontSize: '1rem', marginTop: 12 }}>{city.name}</p>
                <p style={{ color: '#94a3b8', fontSize: '0.72rem', fontFamily: 'monospace', marginTop: 4 }}>
                  {city.lat.toFixed(6)} graus, {city.lng.toFixed(6)} graus
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weather */}
        {weather ? (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)' }}>
            <div className="flex items-center justify-between mb-4">
              <p style={{ color: '#e2e8f0', fontWeight: 600 }}>Clima atual</p>
              <Thermometer size={16} style={{ color: '#0ea5e9' }} />
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(20,184,166,0.1))', border: '1px solid rgba(14,165,233,0.2)' }}>
                <span style={{ fontSize: '1.8rem' }}>
                  {/sun|clear/i.test(weather.description ?? '') ? 'Sol' :
                    /rain/i.test(weather.description ?? '') ? 'Chuva' :
                      /cloud|overcast/i.test(weather.description ?? '') ? 'Nublado' :
                        /snow/i.test(weather.description ?? '') ? 'Neve' : 'Tempo'}
                </span>
              </div>
              <div>
                <p style={{ color: '#f8fafc', fontSize: '2rem', fontWeight: 800 }}>{Math.round(weather.temperature)}°C</p>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{weather.description ?? weather.provider}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.62)', border: '1px solid rgba(148,163,184,0.18)' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Umidade</p>
                <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.1rem', marginTop: 4 }}>{weather.humidity ?? '-'}%</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.62)', border: '1px solid rgba(148,163,184,0.18)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Wind size={12} style={{ color: '#94a3b8' }} />
                  <p style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vento</p>
                </div>
                <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.1rem' }}>{weather.windSpeed ?? '-'} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8' }}>km/h</span></p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl p-5 flex items-center justify-center" style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)' }}>
            <div className="text-center" style={{ color: '#94a3b8' }}>
              <Thermometer size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
              <p style={{ fontSize: '0.85rem' }}>{weatherLoading ? 'Carregando clima...' : 'Dados de clima indisponíveis'}</p>
            </div>
          </div>
        )}
      </div>

      <DeleteDialog
        open={deleteOpen}
        entityName={city.name}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
