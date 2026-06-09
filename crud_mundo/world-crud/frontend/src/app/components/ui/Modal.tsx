import { X } from 'lucide-react';
import { ChangeEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

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

export type SearchableSelectOption = {
  value: string;
  label: string;
  description?: string;
};

interface SearchableSelectProps {
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
}

export function SearchableSelect({
  value,
  options,
  onChange,
  placeholder = 'Selecione uma opção',
  searchPlaceholder = 'Digite para buscar...',
  required,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find(option => option.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(q) ||
      option.description?.toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: 'relative', width: '100%' }}>
      <input
        value={open ? query : selected?.label ?? ''}
        onChange={e => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery('');
          setOpen(true);
        }}
        placeholder={selected ? searchPlaceholder : placeholder}
        required={required && !value}
        style={inputStyle}
      />
      {open && (
        <div
          style={{
            position: 'absolute',
            zIndex: 70,
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            maxHeight: 220,
            overflowY: 'auto',
            background: 'rgba(8,16,34,0.98)',
            border: '1px solid rgba(56,189,248,0.24)',
            borderRadius: 12,
            boxShadow: '0 22px 60px rgba(0,0,0,0.48)',
            padding: 6,
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.8rem', padding: '10px 12px' }}>Nenhuma opção encontrada</div>
          ) : filtered.map(option => (
            <button
              key={option.value}
              type="button"
              onMouseDown={event => {
                event.preventDefault();
                onChange(option.value);
                setQuery('');
                setOpen(false);
              }}
              style={{
                width: '100%',
                display: 'block',
                textAlign: 'left',
                background: option.value === value ? 'rgba(56,189,248,0.14)' : 'transparent',
                border: 'none',
                borderRadius: 9,
                padding: '9px 10px',
                color: '#e2e8f0',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700 }}>{option.label}</span>
              {option.description && (
                <span style={{ display: 'block', color: '#64748b', fontSize: '0.72rem', marginTop: 2 }}>{option.description}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface FlagImageInputProps {
  value?: string | null;
  fallback?: string;
  alt?: string;
  onChange: (value: string) => void;
}

export function FlagImageInput({ value, fallback, alt = 'Bandeira', onChange }: FlagImageInputProps) {
  const [error, setError] = useState('');

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Selecione uma imagem válida.');
      return;
    }
    if (file.size > 900_000) {
      setError('Use uma imagem de até 900 KB.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(String(reader.result));
      setError('');
    };
    reader.onerror = () => setError('Não foi possível carregar a imagem.');
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 74, height: 48, borderRadius: 10, overflow: 'hidden', background: 'rgba(15,23,42,0.82)', border: '1px solid rgba(148,163,184,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {value ? (
          <img src={value} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '1.35rem' }}>{fallback || '🏳️'}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, padding: '8px 12px', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.22)', color: '#7dd3fc', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>
          Escolher imagem
          <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={handleFile} style={{ display: 'none' }} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange('')} style={{ marginLeft: 8, background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            Remover
          </button>
        )}
        <p style={{ color: error ? '#fca5a5' : '#64748b', fontSize: '0.68rem', marginTop: 6, lineHeight: 1.35 }}>
          {error || 'PNG, JPG, SVG ou WEBP.'}
        </p>
      </div>
    </div>
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
