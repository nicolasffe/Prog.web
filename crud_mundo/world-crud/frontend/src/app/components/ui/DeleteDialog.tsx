import { Trash2 } from 'lucide-react';

interface DeleteDialogProps {
  open: boolean;
  entityName: string;
  warning?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteDialog({ open, entityName, warning, onConfirm, onCancel }: DeleteDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.1)' }}>
          <Trash2 size={20} style={{ color: '#ef4444' }} />
        </div>
        <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.05rem', textAlign: 'center' }}>Confirm Delete</h3>
        <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: '#1e293b' }}>{entityName}</strong>?
          {warning && <><br /><span style={{ color: '#ef4444' }}>{warning}</span></>}
        </p>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel}
            className="flex-1 rounded-xl py-2.5 transition-colors"
            style={{ background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 rounded-xl py-2.5 transition-colors"
            style={{ background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
