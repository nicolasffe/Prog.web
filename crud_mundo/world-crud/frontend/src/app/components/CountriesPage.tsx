import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Flag, ChevronLeft, ChevronRight, Eye, Filter } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Country } from '../data/types';
import { Modal, Field, Input, Select, FormActions } from './ui/Modal';
import { DeleteDialog } from './ui/DeleteDialog';
import { toast } from 'sonner';

const PAGE_SIZE = 8;

const emptyForm = (): Omit<Country, 'id'> => ({
  name: '', continentId: '', population: 0, language: '', currency: '',
  capital: '', flag: '🏳️', lat: 0, lng: 0, area: 0, timezone: '', isoCode: '', isoNumeric: 0,
});

export default function CountriesPage() {
  const { countries, continents, cities, addCountry, updateCountry, deleteCountry } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [continentFilter, setContinentFilter] = useState('');
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<Omit<Country, 'id'>>(emptyForm());
  const [editing, setEditing] = useState<Country | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Country | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = countries.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q) || c.currency.toLowerCase().includes(q);
    const matchContinent = !continentFilter || c.continentId === continentFilter;
    return matchSearch && matchContinent;
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const openCreate = () => { setForm(emptyForm()); setEditing(null); setModal('create'); };
  const openEdit = (c: Country) => {
    setForm({ name: c.name, continentId: c.continentId, population: c.population, language: c.language, currency: c.currency, capital: c.capital, flag: c.flag, flagUrl: c.flagUrl, flagAlt: c.flagAlt, lat: c.lat, lng: c.lng, area: c.area, timezone: c.timezone, isoCode: c.isoCode, isoNumeric: c.isoNumeric, region: c.region, subregion: c.subregion });
    setEditing(c); setModal('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    if (editing && modal === 'edit') {
      await updateCountry(editing.id, form);
      toast.success(`${form.name} updated`);
    } else {
      await addCountry(form);
      toast.success(`${form.name} created`);
    }
    setLoading(false);
    setModal(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCountry(deleteTarget.id);
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: 700 }}>Countries</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 2 }}>{countries.length} countries in database</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-colors"
          style={{ background: '#14b8a6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
          onMouseEnter={e => e.currentTarget.style.background = '#0d9488'}
          onMouseLeave={e => e.currentTarget.style.background = '#14b8a6'}>
          <Plus size={16} /> Add Country
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search countries..."
            className="pl-9 pr-4 py-2.5 rounded-xl outline-none transition-all"
            style={{ background: 'white', border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '0.875rem', width: 220 }}
            onFocus={e => e.target.style.borderColor = '#14b8a6'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
          <Filter size={14} style={{ color: '#94a3b8' }} />
          <select value={continentFilter} onChange={e => { setContinentFilter(e.target.value); setPage(0); }}
            style={{ background: 'transparent', border: 'none', color: '#475569', fontSize: '0.875rem', outline: 'none', cursor: 'pointer' }}>
            <option value="">All Continents</option>
            {continents.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              {['#', 'Country', 'Continent', 'Capital', 'Population', 'Language', 'Currency', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: '#f8fafc', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8' }}>
                  <Flag size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  <p>No countries found</p>
                </td>
              </tr>
            ) : paged.map((c, idx) => {
              const cont = continents.find(x => x.id === c.continentId);
              return (
                <tr key={c.id}
                  style={{ borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '0.8rem' }}>{page * PAGE_SIZE + idx + 1}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex items-center gap-2">
                      {c.flagUrl ? (
                        <img src={c.flagUrl} alt="" aria-hidden="true" style={{ width: 28, height: 20, objectFit: 'cover', borderRadius: 4, boxShadow: '0 0 0 1px rgba(15,23,42,0.08)' }} />
                      ) : (
                        <span style={{ fontSize: '1.3rem' }}>{c.flag}</span>
                      )}
                      <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {cont && (
                      <span className="px-2 py-0.5 rounded-lg" style={{ background: `${cont.color}15`, color: cont.color, fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {cont.name}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{c.capital}</td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{(c.population / 1e6).toFixed(1)}M</td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{c.language}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="px-2 py-0.5 rounded-md text-xs font-medium" style={{ background: '#f1f5f9', color: '#475569' }}>{c.currency}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/app/countries/${c.id}`)} className="p-2 rounded-lg transition-colors" title="View"
                        style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                        <Eye size={15} />
                      </button>
                      <button onClick={() => openEdit(c)} className="p-2 rounded-lg transition-colors" title="Edit"
                        style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#14b8a6'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(c)} className="p-2 rounded-lg transition-colors" title="Delete"
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
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="p-2 rounded-lg"
              style={{ background: page === 0 ? '#f1f5f9' : 'white', color: page === 0 ? '#cbd5e1' : '#475569', border: '1px solid #e2e8f0', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className="w-8 h-8 rounded-lg"
                style={{ background: page === i ? '#14b8a6' : 'white', color: page === i ? 'white' : '#475569', border: '1px solid #e2e8f0', cursor: 'pointer', fontWeight: page === i ? 700 : 400, fontSize: '0.8rem' }}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="p-2 rounded-lg"
              style={{ background: page === totalPages - 1 ? '#f1f5f9' : 'white', color: page === totalPages - 1 ? '#cbd5e1' : '#475569', border: '1px solid #e2e8f0', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer' }}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Add Country' : 'Edit Country'} maxWidth={560}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name *">
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Portugal" />
            </Field>
            <Field label="Flag URL">
              <Input value={form.flagUrl ?? ''} onChange={e => setForm(f => ({ ...f, flagUrl: e.target.value }))} placeholder="https://flagcdn.com/pt.svg" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Continent *">
              <Select value={form.continentId} onChange={e => setForm(f => ({ ...f, continentId: e.target.value }))} required>
                <option value="">Select continent</option>
                {continents.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Capital *">
              <Input value={form.capital} onChange={e => setForm(f => ({ ...f, capital: e.target.value }))} required placeholder="e.g. Lisbon" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Population">
              <Input type="number" value={form.population} onChange={e => setForm(f => ({ ...f, population: Number(e.target.value) }))} placeholder="e.g. 10000000" />
            </Field>
            <Field label="Area (km²)">
              <Input type="number" value={form.area} onChange={e => setForm(f => ({ ...f, area: Number(e.target.value) }))} placeholder="e.g. 92212" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Language">
              <Input value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} placeholder="e.g. Portuguese" />
            </Field>
            <Field label="Currency">
              <Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} placeholder="e.g. EUR" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="ISO Code">
              <Input value={form.isoCode} onChange={e => setForm(f => ({ ...f, isoCode: e.target.value.toUpperCase() }))} placeholder="e.g. PT" maxLength={3} />
            </Field>
            <Field label="Timezone">
              <Input value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))} placeholder="e.g. UTC+0" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude">
              <Input type="number" step="0.01" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: Number(e.target.value) }))} placeholder="e.g. 39.40" />
            </Field>
            <Field label="Longitude">
              <Input type="number" step="0.01" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: Number(e.target.value) }))} placeholder="e.g. -8.22" />
            </Field>
          </div>
          <FormActions onCancel={() => setModal(null)} loading={loading} submitLabel={modal === 'create' ? 'Create' : 'Save Changes'} />
        </form>
      </Modal>

      <DeleteDialog
        open={!!deleteTarget}
        entityName={deleteTarget?.name ?? ''}
        warning="All associated cities will also be deleted."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
