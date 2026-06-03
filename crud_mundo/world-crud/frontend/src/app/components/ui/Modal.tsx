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
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rounded-2xl w-full overflow-hidden shadow-2xl"
        style={{ maxWidth, background: 'white', border: '1px solid #e2e8f0' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#94a3b8', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
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
      <label style={{ color: '#374151', fontSize: '0.82rem', fontWeight: 500, display: 'block', marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  padding: '8px 12px',
  color: '#1e293b',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

export function Input({ onFocus, onBlur, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={inputStyle}
      onFocus={e => { e.target.style.borderColor = '#14b8a6'; onFocus?.(e); }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; onBlur?.(e); }}
    />
  );
}

export function Select({ onFocus, onBlur, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
      onFocus={e => { e.target.style.borderColor = '#14b8a6'; onFocus?.(e); }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; onBlur?.(e); }}>
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
      onFocus={e => { e.target.style.borderColor = '#14b8a6'; onFocus?.(e); }}
      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; onBlur?.(e); }}
    />
  );
}

interface FormActionsProps {
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
}
export function FormActions({ onCancel, submitLabel = 'Save', loading }: FormActionsProps) {
  return (
    <div className="flex gap-3 justify-end pt-4" style={{ borderTop: '1px solid #e2e8f0' }}>
      <button type="button" onClick={onCancel}
        className="rounded-xl px-5 py-2.5 transition-colors"
        style={{ background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
        onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
        onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
        Cancel
      </button>
      <button type="submit" disabled={loading}
        className="rounded-xl px-5 py-2.5 transition-all"
        style={{ background: loading ? 'rgba(20,184,166,0.5)' : '#14b8a6', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#0d9488'; }}
        onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#14b8a6'; }}>
        {loading ? 'Saving...' : submitLabel}
      </button>
    </div>
  );
}
