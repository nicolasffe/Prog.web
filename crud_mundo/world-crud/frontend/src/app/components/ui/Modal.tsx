import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: number;
}

export function Modal({ open, onClose, title, children, maxWidth = 520 }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,6,23,0.72)', backdropFilter: 'blur(10px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rounded-2xl w-full overflow-hidden shadow-2xl"
        style={{
          maxWidth,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(2,6,23,0.98))',
          border: '1px solid rgba(56,189,248,0.18)',
          boxShadow: '0 28px 90px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.16)' }}>
          <h3 style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.12)'; e.currentTarget.style.color = '#67e8f9'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
}
export function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label style={{ color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: 'rgba(15,23,42,0.82)',
  border: '1px solid rgba(148,163,184,0.22)',
  borderRadius: 10,
  padding: '8px 12px',
  color: '#e2e8f0',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

export function Input({ onFocus, onBlur, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={inputStyle}
      onFocus={e => { e.target.style.borderColor = '#38bdf8'; onFocus?.(e); }}
      onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.22)'; onBlur?.(e); }}
    />
  );
}

export function Select({ onFocus, onBlur, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
      onFocus={e => { e.target.style.borderColor = '#38bdf8'; onFocus?.(e); }}
      onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.22)'; onBlur?.(e); }}>
      {children}
    </select>
  );
}

export function Textarea({ onFocus, onBlur, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      style={{ ...inputStyle, resize: 'vertical' }}
      onFocus={e => { e.target.style.borderColor = '#38bdf8'; onFocus?.(e); }}
      onBlur={e => { e.target.style.borderColor = 'rgba(148,163,184,0.22)'; onBlur?.(e); }}
    />
  );
}

interface FormActionsProps {
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
}
export function FormActions({ onCancel, submitLabel = 'Salvar', loading }: FormActionsProps) {
  return (
    <div className="flex gap-3 justify-end pt-4" style={{ borderTop: '1px solid rgba(148,163,184,0.16)' }}>
      <button type="button" onClick={onCancel}
        className="rounded-xl px-5 py-2.5 transition-colors"
        style={{ background: 'rgba(30,41,59,0.82)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.16)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(51,65,85,0.9)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(30,41,59,0.82)'}>
        Cancelar
      </button>
      <button type="submit" disabled={loading}
        className="rounded-xl px-5 py-2.5 transition-all"
        style={{ background: loading ? 'rgba(56,189,248,0.38)' : 'linear-gradient(135deg, #38bdf8, #2dd4bf)', color: '#020617', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 700 }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1.08)'; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.filter = 'brightness(1)'; }}>
        {loading ? 'Salvando...' : submitLabel}
      </button>
    </div>
  );
}
