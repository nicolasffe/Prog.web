import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import {
  ArrowLeft, Globe, Users, DollarSign, Languages, MapPin, Thermometer,
  Wind, Pencil, Trash2, Plus, Building2, CheckCircle, X, Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockWeather } from '../data/mockData';
import { DeleteDialog } from './ui/DeleteDialog';
import { Field, Input, Select, FormActions } from './ui/Modal';
import { toast } from 'sonner';

export default function CountryDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { countries, continents, cities, updateCountry, deleteCountry } = useApp();

  const country = countries.find(c => c.id === id);
  const [editing, setEditing] = useState(searchParams.get('edit') === 'true');
  const [form, setForm] = useState(country ? { ...country } : null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (country) setForm({ ...country });
  }, [id]);

  if (!country || !form) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ color: '#94a3b8' }}>
        <Globe size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
        <p>Pais nao encontrado.</p>
        <button onClick={() => navigate('/app/countries')} className="mt-4 px-4 py-2 rounded-xl"
          style={{ background: '#14b8a6', color: 'white', border: 'none', cursor: 'pointer' }}>
          Voltar para paises
        </button>
      </div>
    );
  }

  const continent = continents.find(c => c.id === country.continentId);
  const countryCities = cities.filter(c => c.countryId === country.id);
  const weather = mockWeather[country.id];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 500));
    await updateCountry(country.id, form);
    toast.success(`${form.name} atualizado com sucesso`);
    setSaving(false);
    setEditing(false);
  };

  const handleDelete = () => {
    deleteCountry(country.id);
    toast.success(`${country.name} excluido`);
    navigate('/app/countries');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-full" style={{ background: 'radial-gradient(circle at 18% 12%, rgba(56,189,248,0.14), transparent 28%), radial-gradient(circle at 82% 8%, rgba(45,212,191,0.1), transparent 24%), linear-gradient(180deg, #020617 0%, #07111f 54%, #020617 100%)' }}>
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/app/countries')}
          className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors"
          style={{ background: 'rgba(15,23,42,0.78)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.18)', cursor: 'pointer', fontSize: '0.875rem' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,41,59,0.82)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(15,23,42,0.78)'}>
          <ArrowLeft size={16} /> Voltar para paises
        </button>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button type="button" onClick={() => { setForm({ ...country }); setEditing(false); }}
                className="flex items-center gap-2 rounded-xl px-4 py-2 transition-colors"
                style={{ background: 'rgba(30,41,59,0.72)', color: '#cbd5e1', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                <X size={15} /> Cancelar
              </button>
              <button type="submit" form="countryForm"
                className="flex items-center gap-2 rounded-xl px-4 py-2 transition-colors"
                style={{ background: '#14b8a6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                <Save size={15} /> {saving ? 'Salvando...' : 'Salvar alteracoes'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 transition-colors"
                style={{ background: 'rgba(15,23,42,0.78)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.18)', cursor: 'pointer', fontWeight: 500 }}>
                <Pencil size={15} /> Editar
              </button>
              <button onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 transition-colors"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontWeight: 500 }}>
                <Trash2 size={15} /> Excluir
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden mb-6"
        style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="p-8">
          <div className="flex items-center gap-6">
            {country.flagUrl ? (
              <img src={country.flagUrl} alt={country.flagAlt || `${country.name} flag`} style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 10, boxShadow: '0 12px 30px rgba(0,0,0,0.25)' }} />
            ) : (
              <span style={{ fontSize: '4rem' }}>{country.flag}</span>
            )}
            <div>
              {editing ? (
                <div className="space-y-2">
                  <input value={form.name} onChange={e => setForm(f => ({ ...f!, name: e.target.value }))}
                    className="rounded-lg px-3 py-1.5 outline-none"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '1.3rem', fontWeight: 700 }} />
                </div>
              ) : (
                <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{country.name}</h1>
              )}
              <div className="flex items-center gap-3 mt-2">
                {continent && (
                  <span className="px-3 py-1 rounded-full" style={{ background: `${continent.color}25`, color: continent.color, fontSize: '0.82rem', fontWeight: 600, border: `1px solid ${continent.color}40` }}>
                    {continent.name}
                  </span>
                )}
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{country.isoCode} - {country.timezone}</span>
              </div>
              {country.officialName && (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 8 }}>{country.officialName}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit form or info cards */}
      {editing ? (
        <form id="countryForm" onSubmit={handleSave} className="rounded-2xl p-6 mb-6 space-y-4"
          style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)' }}>
          <h3 style={{ color: '#f8fafc', fontWeight: 700, marginBottom: 4 }}>Editar detalhes do pais</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name"><Input value={form.name} onChange={e => setForm(f => ({ ...f!, name: e.target.value }))} required /></Field>
            <Field label="Flag Emoji"><Input value={form.flag} onChange={e => setForm(f => ({ ...f!, flag: e.target.value }))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Continente">
              <Select value={form.continentId} onChange={e => setForm(f => ({ ...f!, continentId: e.target.value }))}>
                {continents.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Capital"><Input value={form.capital} onChange={e => setForm(f => ({ ...f!, capital: e.target.value }))} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Populacao *"><Input type="number" value={form.population} onChange={e => setForm(f => ({ ...f!, population: Number(e.target.value) }))} required /></Field>
            <Field label="Moeda *"><Input value={form.currency} onChange={e => setForm(f => ({ ...f!, currency: e.target.value }))} required /></Field>
            <Field label="Idioma *"><Input value={form.language} onChange={e => setForm(f => ({ ...f!, language: e.target.value }))} required /></Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Latitude"><Input type="number" step="0.01" value={form.lat} onChange={e => setForm(f => ({ ...f!, lat: Number(e.target.value) }))} /></Field>
            <Field label="Longitude"><Input type="number" step="0.01" value={form.lng} onChange={e => setForm(f => ({ ...f!, lng: Number(e.target.value) }))} /></Field>
            <Field label="Timezone"><Input value={form.timezone} onChange={e => setForm(f => ({ ...f!, timezone: e.target.value }))} /></Field>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Users, label: 'Populacao', value: country.population.toLocaleString(), color: '#14b8a6' },
            { icon: DollarSign, label: 'Moeda', value: country.currency, color: '#f59e0b' },
            { icon: Languages, label: 'Idioma', value: country.language, color: '#8b5cf6' },
            { icon: MapPin, label: 'Area', value: `${country.area.toLocaleString()} km2`, color: '#0ea5e9' },
          ].map(card => (
            <div key={card.label} className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: `${card.color}15` }}>
                <card.icon size={18} style={{ color: card.color }} />
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</p>
              <p style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {(country.region || country.subregion || country.timezones?.length || country.maps?.googleMaps || country.maps?.openStreetMaps) && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)' }}>
          <div className="flex items-center justify-between mb-4">
            <p style={{ color: '#e2e8f0', fontWeight: 600 }}>Dados externos do pais</p>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>REST Countries</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.62)', border: '1px solid rgba(148,163,184,0.18)' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Region</p>
              <p style={{ color: '#e2e8f0', fontWeight: 700, marginTop: 4 }}>{[country.region, country.subregion].filter(Boolean).join(' - ') || 'N/A'}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.62)', border: '1px solid rgba(148,163,184,0.18)' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Timezones</p>
              <p style={{ color: '#e2e8f0', fontWeight: 700, marginTop: 4 }}>{country.timezones?.slice(0, 3).join(', ') || country.timezone}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.62)', border: '1px solid rgba(148,163,184,0.18)' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Maps</p>
              <div className="flex gap-2 mt-3">
                {country.maps?.googleMaps && <a href={country.maps.googleMaps} target="_blank" rel="noreferrer" style={{ color: '#14b8a6', fontWeight: 700, fontSize: '0.82rem' }}>Google</a>}
                {country.maps?.openStreetMaps && <a href={country.maps.openStreetMaps} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', fontWeight: 700, fontSize: '0.82rem' }}>OSM</a>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map preview + coordinates */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)' }}>
          <div className="p-5 pb-0">
            <div className="flex items-center justify-between mb-4">
              <p style={{ color: '#e2e8f0', fontWeight: 600 }}>Location & Coordinates</p>
              <Globe size={16} style={{ color: '#94a3b8' }} />
            </div>
          </div>
          <div className="mx-5 mb-5 rounded-xl overflow-hidden" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
            <div className="relative" style={{ height: 160 }}>
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(20,184,166,0.6) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ background: 'rgba(20,184,166,0.2)', border: '2px solid #14b8a6' }}>
                    <MapPin size={20} style={{ color: '#14b8a6' }} />
                  </div>
                  <p style={{ color: '#14b8a6', fontWeight: 600, fontSize: '0.9rem' }}>{country.capital}</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    {country.lat.toFixed(4)} graus, {country.lng.toFixed(4)} graus
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.62)', border: '1px solid rgba(148,163,184,0.18)' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Latitude</p>
              <p style={{ color: '#e2e8f0', fontWeight: 700, fontFamily: 'monospace', marginTop: 2 }}>{country.lat.toFixed(4)} grausN</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.62)', border: '1px solid rgba(148,163,184,0.18)' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Longitude</p>
              <p style={{ color: '#e2e8f0', fontWeight: 700, fontFamily: 'monospace', marginTop: 2 }}>{country.lng.toFixed(4)} grausE</p>
            </div>
          </div>
        </div>

        {/* Weather + cities */}
        <div className="space-y-4">
          {/* Weather */}
          {weather && (
            <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)' }}>
              <div className="flex items-center justify-between mb-3">
              <p style={{ color: '#e2e8f0', fontWeight: 600 }}>Clima atual</p>
                <Thermometer size={16} style={{ color: '#0ea5e9' }} />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(20,184,166,0.15))', border: '1px solid rgba(14,165,233,0.2)' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {weather.condition.includes('Sunny') || weather.condition.includes('Clear') ? 'Sol' :
                      weather.condition.includes('Rain') ? 'Chuva' :
                        weather.condition.includes('Cloud') ? 'Nublado' :
                          weather.condition.includes('Snow') ? 'Neve' : 'Tempo'}
                  </span>
                </div>
                <div>
                  <p style={{ color: '#f8fafc', fontSize: '1.8rem', fontWeight: 800 }}>{weather.temp} grausC</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{weather.condition}</p>
                </div>
                <div className="ml-auto space-y-1">
                  <div className="flex items-center gap-2">
                    <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Umidade</span>
                    <span style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600 }}>{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind size={12} style={{ color: '#94a3b8' }} />
                    <span style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600 }}>{weather.wind} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cities */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)' }}>
            <div className="flex items-center justify-between mb-4">
              <p style={{ color: '#e2e8f0', fontWeight: 600 }}>Cidades ({countryCities.length})</p>
              <button onClick={() => navigate('/app/cities')}
                className="flex items-center gap-1 text-sm transition-colors"
                style={{ color: '#14b8a6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                <Plus size={14} /> Adicionar cidade
              </button>
            </div>
            {countryCities.length === 0 ? (
              <div className="text-center py-6" style={{ color: '#94a3b8' }}>
                <Building2 size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                <p style={{ fontSize: '0.85rem' }}>Nenhuma cidade cadastrada para este pais</p>
              </div>
            ) : (
              <div className="space-y-2">
                {countryCities.map(city => (
                  <button key={city.id} onClick={() => navigate(`/app/cities/${city.id}`)}
                    className="w-full flex items-center justify-between rounded-xl px-4 py-3 transition-colors text-left"
                    style={{ background: 'rgba(15,23,42,0.62)', border: '1px solid rgba(148,163,184,0.18)', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(30,41,59,0.82)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(30,41,59,0.62)'}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: city.isCapital ? 'rgba(20,184,166,0.15)' : '#e2e8f0' }}>
                        <Building2 size={13} style={{ color: city.isCapital ? '#14b8a6' : '#64748b' }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.875rem' }}>{city.name}</span>
                          {city.isCapital && <span style={{ background: 'rgba(20,184,166,0.1)', color: '#14b8a6', fontSize: '0.65rem', fontWeight: 600, padding: '1px 6px', borderRadius: 6 }}>Capital</span>}
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{city.population.toLocaleString()} - {city.lat.toFixed(2)} graus, {city.lng.toFixed(2)} graus</p>
                      </div>
                    </div>
                    <CheckCircle size={14} style={{ color: '#14b8a6' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteDialog
        open={deleteOpen}
        entityName={country.name}
        warning="Todas as cidades associadas tambem serao excluidas."
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}


