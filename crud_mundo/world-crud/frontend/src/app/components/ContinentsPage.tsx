import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Layers, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Continent } from '../data/types';
import { Modal, Field, Input, Textarea, FormActions } from './ui/Modal';
import { DeleteDialog } from './ui/DeleteDialog';
import { toast } from 'sonner';

const COLORS = ['#f59e0b', '#0ea5e9', '#8b5cf6', '#10b981', '#ef4444', '#06b6d4', '#f97316', '#ec4899'];
const PAGE_SIZE = 8;

const emptyForm = (): Omit<Continent, 'id'> => ({
  name: '', code: '', description: '', color: COLORS[0],
});

export default function ContinentsPage() {
  const { continents, countries, addContinent, updateContinent, deleteContinent } = useApp();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | null>(null);
  const [form, setForm] = useState<Omit<Continent, 'id'>>(emptyForm());
  const [editing, setEditing] = useState<Continent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Continent | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = continents.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const openCreate = () => { setForm(emptyForm()); setEditing(null); setModal('create'); };
  const openEdit = (c: Continent) => { setForm({ name: c.name, code: c.code, description: c.description, color: c.color }); setEditing(c); setModal('edit'); };
  const openView = (c: Continent) => { setEditing(c); setModal('view'); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    if (editing && modal === 'edit') {
      updateContinent(editing.id, form);
      toast.success(`${form.name} atualizado`);
    } else {
      addContinent(form);
      toast.success(`${form.name} criado`);
    }
    setLoading(false);
    setModal(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteContinent(deleteTarget.id);
    toast.success(`${deleteTarget.name} excluído`);
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 min-h-full" style={{ background: 'radial-gradient(circle at 18% 12%, rgba(56,189,248,0.14), transparent 28%), radial-gradient(circle at 82% 8%, rgba(45,212,191,0.1), transparent 24%), linear-gradient(180deg, #020617 0%, #07111f 54%, #020617 100%)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ color: '#f8fafc', fontSize: '1.4rem', fontWeight: 700 }}>Continentes</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 2 }}>{continents.length} continentes cadastrados</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-colors"
          style={{ background: '#14b8a6', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
          onMouseEnter={e => e.currentTarget.style.background = '#0d9488'}
          onMouseLeave={e => e.currentTarget.style.background = '#14b8a6'}>
          <Plus size={16} /> Adicionar continente
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          placeholder="Buscar continentes..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl outline-none transition-all"
          style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)', color: '#e2e8f0', fontSize: '0.875rem' }}
          onFocus={e => e.target.style.borderColor = '#14b8a6'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(15,23,42,0.78)', border: '1px solid rgba(148,163,184,0.18)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(148,163,184,0.16)' }}>
              {['#', 'Nome', 'Código', 'Países', 'Descrição', 'Ações'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(15,23,42,0.62)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px 16px', textAlign: 'center', color: '#94a3b8' }}>
                  <Layers size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  <p>Nenhum continente encontrado</p>
                </td>
              </tr>
            ) : paged.map((c, idx) => {
              const cCount = countries.filter(x => x.continentId === c.id).length;
              return (
                <tr key={c.id}
                  style={{ borderBottom: '1px solid rgba(148,163,184,0.12)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,41,59,0.62)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.8rem' }}>{page * PAGE_SIZE + idx + 1}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${c.color}20` }}>
                        <Layers size={15} style={{ color: c.color }} />
                      </div>
                      <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="px-2.5 py-1 rounded-lg" style={{ background: `${c.color}15`, color: c.color, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                      {c.code}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#cbd5e1', fontSize: '0.875rem' }}>{cCount}</td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '0.82rem', maxWidth: 300 }}>
                    <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description || '-'}</p>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(c)} className="p-2 rounded-lg transition-colors" title="Visualizar"
                        style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.82)'; e.currentTarget.style.color = '#475569'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                        <Eye size={15} />
                      </button>
                      <button onClick={() => openEdit(c)} className="p-2 rounded-lg transition-colors" title="Editar"
                        style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(30,41,59,0.82)'; e.currentTarget.style.color = '#14b8a6'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(c)} className="p-2 rounded-lg transition-colors" title="Excluir"
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
              className="p-2 rounded-lg transition-colors"
              style={{ background: page === 0 ? '#f1f5f9' : 'white', color: page === 0 ? '#cbd5e1' : '#475569', border: '1px solid rgba(148,163,184,0.18)', cursor: page === 0 ? 'not-allowed' : 'pointer' }}>
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className="w-8 h-8 rounded-lg transition-colors"
                style={{ background: page === i ? '#14b8a6' : 'white', color: page === i ? 'white' : '#475569', border: '1px solid rgba(148,163,184,0.18)', cursor: 'pointer', fontWeight: page === i ? 700 : 400, fontSize: '0.8rem' }}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="p-2 rounded-lg transition-colors"
              style={{ background: page === totalPages - 1 ? '#f1f5f9' : 'white', color: page === totalPages - 1 ? '#cbd5e1' : '#475569', border: '1px solid rgba(148,163,184,0.18)', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer' }}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Adicionar continente' : 'Editar continente'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nome *">
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ex.: Antártida" />
            </Field>
            <Field label="Código *">
              <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required placeholder="Ex.: AN" maxLength={3} />
            </Field>
          </div>
          <Field label="Descrição *">
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Breve descrição do continente..." required />
          </Field>
          <Field label="Cor">
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button key={color} type="button" onClick={() => setForm(f => ({ ...f, color }))}
                  className="w-8 h-8 rounded-lg transition-all"
                  style={{ background: color, border: form.color === color ? '3px solid #0f172a' : '2px solid transparent', cursor: 'pointer', transform: form.color === color ? 'scale(1.15)' : 'scale(1)' }} />
              ))}
            </div>
          </Field>
          <FormActions onCancel={() => setModal(null)} loading={loading} submitLabel={modal === 'create' ? 'Criar' : 'Salvar alterações'} />
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={modal === 'view'} onClose={() => setModal(null)} title="Detalhes do continente">
        {editing && (() => {
          const cCount = countries.filter(x => x.continentId === editing.id).length;
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${editing.color}20` }}>
                  <Layers size={24} style={{ color: editing.color }} />
                </div>
                <div>
                  <h2 style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.2rem' }}>{editing.name}</h2>
                  <span className="px-2.5 py-1 rounded-lg" style={{ background: `${editing.color}15`, color: editing.color, fontSize: '0.75rem', fontWeight: 700 }}>
                    {editing.code}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.62)', border: '1px solid rgba(148,163,184,0.18)' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Países</p>
                  <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.2rem', marginTop: 2 }}>{cCount}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.62)', border: '1px solid rgba(148,163,184,0.18)' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.72rem' }}>Cor</p>
                  <div className="w-5 h-5 rounded mt-2" style={{ background: editing.color }} />
                </div>
              </div>
              {editing.description && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(15,23,42,0.62)', border: '1px solid rgba(148,163,184,0.18)' }}>
                  <p style={{ color: '#94a3b8', fontSize: '0.72rem', marginBottom: 4 }}>Descrição</p>
                  <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5 }}>{editing.description}</p>
                </div>
              )}
              <div className="flex gap-2 justify-end pt-2" style={{ borderTop: '1px solid rgba(148,163,184,0.18)' }}>
                <button onClick={() => setModal(null)} className="rounded-xl px-4 py-2 text-sm" style={{ background: 'rgba(30,41,59,0.72)', color: '#cbd5e1', border: 'none', cursor: 'pointer' }}>Fechar</button>
                <button onClick={() => openEdit(editing)} className="rounded-xl px-4 py-2 text-sm font-semibold" style={{ background: '#14b8a6', color: 'white', border: 'none', cursor: 'pointer' }}>Editar</button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <DeleteDialog
        open={!!deleteTarget}
        entityName={deleteTarget?.name ?? ''}
        warning="Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}


