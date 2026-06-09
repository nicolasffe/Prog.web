import { Trash2 } from 'lucide-react';

interface DeleteDialogProps {
  open: boolean;
  entityName: string;
  warning?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function DeleteDialog({ open, entityName, warning, loading = false, onConfirm, onCancel }: DeleteDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.72)', backdropFilter: 'blur(10px)' }}>
      <div
        className="rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))',
          border: '1px solid rgba(248,113,113,0.24)',
          boxShadow: '0 28px 90px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(248,113,113,0.13)', border: '1px solid rgba(248,113,113,0.24)' }}>
          <Trash2 size={20} style={{ color: '#f87171' }} />
        </div>
        <h3 style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.05rem', textAlign: 'center' }}>Confirmar exclusão</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
          Tem certeza que deseja excluir <strong style={{ color: '#e2e8f0' }}>{entityName}</strong>?
          {warning && <><br /><span style={{ color: '#f87171' }}>{warning}</span></>}
        </p>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 rounded-xl py-2.5 transition-colors"
            style={{ background: 'rgba(30,41,59,0.82)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.16)', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: loading ? 0.65 : 1 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(51,65,85,0.9)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(30,41,59,0.82)'}>
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 rounded-xl py-2.5 transition-colors"
            style={{ background: '#f87171', color: '#020617', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, opacity: loading ? 0.75 : 1 }}
            onMouseEnter={e => e.currentTarget.style.background = '#fb7185'}
            onMouseLeave={e => e.currentTarget.style.background = '#f87171'}>
            {loading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}
