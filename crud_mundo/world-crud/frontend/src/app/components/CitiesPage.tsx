import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Building2, ChevronLeft, ChevronRight, Eye, Filter, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { City } from '../data/types';
import { Modal, Field, Input, SearchableSelect, FormActions } from './ui/Modal';
import { DeleteDialog } from './ui/DeleteDialog';
import { toast } from 'sonner';
import { numberInputValue, parseNumberInput } from '../utils/numberInput';
import { validateCityPopulation } from '../utils/cityValidation';

const PAGE_SIZE = 10;

const emptyForm = (): Omit<City, 'id'> => ({
  name: '', countryId: '', population: 0, lat: 0, lng: 0, isCapital: false,
});

export default function CitiesPage() {
  const { cities, countries, continents, addCity, updateCity, deleteCity } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [continentFilter, setContinentFilter] = useState('');
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<Omit<City, 'id'>>(emptyForm());
  const [editing, setEditing] = useState<City | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<City | null>(null);
  const [loading, setLoading] = useState(false);

  const filteredCountries = continentFilter
    ? countries.filter(c => c.continentId === continentFilter)
    : countries;

  const filtered = cities.filter(city => {
    const q = search.toLowerCase();
    const country = countries.find(c => c.id === city.countryId);
    const matchSearch = city.name.toLowerCase().includes(q) || (country?.name.toLowerCase().includes(q) ?? false);
    const matchCountry = !countryFilter || city.countryId === countryFilter;
    const matchContinent = !continentFilter || country?.continentId === continentFilter;
    return matchSearch && matchCountry && matchContinent;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const openCreate = () => { setForm(emptyForm()); setEditing(null); setModal('create'); };
  const openEdit = (c: City) => {
    setForm({ name: c.name, countryId: c.countryId, population: c.population, lat: c.lat, lng: c.lng, isCapital: c.isCapital });
    setEditing(c); setModal('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const populationError = validateCityPopulation(form, countries);
    if (populationError) {
      toast.error(populationError);
      return;
    }
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 400));
      if (editing && modal === 'edit') {
        await updateCity(editing.id, form);
        toast.success(`${form.name} atualizada`);
      } else {
        await addCity(form);
        toast.success(`${form.name} criada`);
      }
      setModal(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível salvar a cidade.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCity(deleteTarget.id);
    toast.success(`${deleteTarget.name} excluÃ­da`);
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 min-h-full" style={{ background: 'radial-gradient(circle at 18% 12%, rgba(56,189,248,0.14), transparent 28%), radial-gradient(circle at 82% 8%, rgba(45,212,191,0.1), transparent 24%), linear-gradient(180deg, #020617 0%, #07111f 54%, #020617 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: 700 }}>Cidades</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 2 }}>{cities.length} cidades cadastradas</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-colors"
          style={{ background: '#14b8a6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
          onMouseEnter={e => e.currentTarget.style.background = '#0d9488'}
          onMouseLeave={e => e.currentTarget.style.background = '#14b8a6'}>
          <Plus size={16} /> Adicionar cidade
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Buscar cidades..."
            className="pl-9 pr-4 py-2.5 rounded-xl outline-none transition-all"
            style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)', color: '#e2e8f0', fontSize: '0.875rem', width: 200 }}
            onFocus={e => e.target.style.borderColor = '#14b8a6'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)', width: 240 }}>
          <Filter size={14} style={{ color: '#94a3b8' }} />
          <SearchableSelect
            value={continentFilter}
            onChange={value => { setContinentFilter(value); setCountryFilter(''); setPage(0); }}
            placeholder="Filtrar continente"
            searchPlaceholder="Buscar continente..."
            options={[
              { value: '', label: 'Todos os continentes' },
              ...continents.map(c => ({ value: c.id, label: c.name, description: c.code })),
            ]}
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)', width: 240 }}>
          <Filter size={14} style={{ color: '#94a3b8' }} />
          <SearchableSelect
            value={countryFilter}
            onChange={value => { setCountryFilter(value); setPage(0); }}
            placeholder="Filtrar país"
            searchPlaceholder="Buscar país..."
            options={[
              { value: '', label: 'Todos os países' },
              ...filteredCountries.map(c => ({
                value: c.id,
                label: `${c.flag} ${c.name}`,
                description: continents.find(continent => continent.id === c.continentId)?.name,
              })),
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.16)' }}>
              {['#', 'Cidade', 'PaÃ­s', 'PopulaÃ§Ã£o', 'Latitude', 'Longitude', 'Status', 'AÃ§Ãµes'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(15,23,42,0.62)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8' }}>
                  <Building2 size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  <p>Nenhuma cidade encontrada</p>
                </td>
              </tr>
            ) : paged.map((city, idx) => {
              const country = countries.find(c => c.id === city.countryId);
              return (
                <tr key={city.id}
                  style={{ borderBottom: '1px solid rgba(148,163,184,0.12)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,41,59,0.62)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.8rem' }}>{page * PAGE_SIZE + idx + 1}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(30,41,59,0.72)' }}>
                        <Building2 size={13} style={{ color: '#94a3b8' }} />
                      </div>
                      <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{city.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {country && (
                      <div className="flex items-center gap-1.5">
                        {country.flagUrl ? (
                          <img src={country.flagUrl} alt="" aria-hidden="true" style={{ width: 22, height: 15, objectFit: 'cover', borderRadius: 3 }} />
                        ) : (
                          <span style={{ fontSize: '1rem' }}>{country.flag}</span>
                        )}
                        <span style={{ color: '#cbd5e1', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{country.name}</span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1', fontSize: '0.82rem' }}>{city.population.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} style={{ color: '#94a3b8' }} />
                      <span style={{ color: '#cbd5e1', fontSize: '0.82rem', fontFamily: 'monospace' }}>{city.lat.toFixed(2)} graus</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#cbd5e1', fontSize: '0.82rem', fontFamily: 'monospace' }}>{city.lng.toFixed(2)} graus</td>
                  <td style={{ padding: '12px 16px' }}>
                    {city.isCapital ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(20,184,166,0.1)', color: '#14b8a6' }}>Capital</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(30,41,59,0.72)', color: '#94a3b8' }}>Cidade</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/app/cities/${city.id}`)} className="p-2 rounded-lg transition-colors" title="Visualizar"
                        style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.82)'; e.currentTarget.style.color = '#475569'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                        <Eye size={15} />
                      </button>
                      <button onClick={() => openEdit(city)} className="p-2 rounded-lg transition-colors" title="Editar"
                        style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.82)'; e.currentTarget.style.color = '#14b8a6'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(city)} className="p-2 rounded-lg transition-colors" title="Excluir"
                        style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
            Mostrando {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-2 rounded-lg"
              style={{ background: page === 0 ? '#f1f5f9' : 'white', color: page === 0 ? '#cbd5e1' : '#475569', border: '1px solid rgba(148,163,184,0.18)', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className="w-8 h-8 rounded-lg"
                style={{ background: page === i ? '#14b8a6' : 'white', color: page === i ? 'white' : '#475569', border: '1px solid rgba(148,163,184,0.18)', cursor: 'pointer', fontWeight: page === i ? 700 : 400, fontSize: '0.8rem' }}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="p-2 rounded-lg"
              style={{ background: page === totalPages - 1 ? '#f1f5f9' : 'white', color: page === totalPages - 1 ? '#cbd5e1' : '#475569', border: '1px solid rgba(148,163,184,0.18)', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer' }}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Adicionar cidade' : 'Editar cidade'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome *">
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ex.: Porto" />
            </Field>
            <Field label="PaÃ­s *">
              <SearchableSelect
                value={form.countryId}
                onChange={countryId => setForm(f => ({ ...f, countryId }))}
                required
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
          <Field label="PopulaÃ§Ã£o *">
            <Input type="number" value={numberInputValue(form.population)} onChange={e => setForm(f => ({ ...f, population: parseNumberInput(e.target.value) }))} placeholder="Ex.: 250000" required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude">
              <Input type="number" step="0.0001" value={numberInputValue(form.lat)} onChange={e => setForm(f => ({ ...f, lat: parseNumberInput(e.target.value) }))} placeholder="e.g. 41.15" />
            </Field>
            <Field label="Longitude">
              <Input type="number" step="0.0001" value={numberInputValue(form.lng)} onChange={e => setForm(f => ({ ...f, lng: parseNumberInput(e.target.value) }))} placeholder="e.g. -8.61" />
            </Field>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(15,23,42,0.62)', border: '1px solid rgba(148,163,184,0.18)' }}>
            <input
              type="checkbox"
              id="isCapital"
              checked={form.isCapital}
              onChange={e => setForm(f => ({ ...f, isCapital: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: '#14b8a6', cursor: 'pointer' }}
            />
            <label htmlFor="isCapital" style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
              Esta cidade Ã© a capital do paÃ­s
            </label>
          </div>
          <FormActions onCancel={() => setModal(null)} loading={loading} submitLabel={modal === 'create' ? 'Criar' : 'Salvar alteraÃ§Ãµes'} />
        </form>
      </Modal>

      <DeleteDialog
        open={!!deleteTarget}
        entityName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

