import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Globe, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@geocrud.app');
  const [password, setPassword] = useState('admin123');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      toast.success('Welcome back!');
      navigate('/app/dashboard');
    } else {
      setError('Use a valid email and a password with at least 6 characters.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2744 100%)' }}>
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(6,182,212,0.4) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #14b8a6, transparent)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-1/4 right-1/6 w-80 h-80 rounded-full opacity-8"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', filter: 'blur(60px)' }} />

      {/* Globe decoration */}
      <div className="absolute top-8 left-8 flex items-center gap-2 text-slate-400">
        <Globe size={20} className="text-teal-400" />
        <span className="text-sm tracking-widest uppercase" style={{ color: '#94a3b8' }}>GeoCRUD</span>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-2xl p-8 shadow-2xl border border-white/10"
          style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(24px)' }}>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' }}>
              <Globe size={32} className="text-white" />
            </div>
            <h1 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 }}>
              Welcome to GeoCRUD
            </h1>
            <p className="mt-1" style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              Sign in to manage your geographic data
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
              <div className="relative mt-1.5">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-4 py-3 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f1f5f9',
                    fontSize: '0.9rem',
                  }}
                  placeholder="admin@geocrud.app"
                  required
                  onFocus={e => e.target.style.borderColor = '#14b8a6'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
              <div className="relative mt-1.5">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl pl-10 pr-12 py-3 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f1f5f9',
                    fontSize: '0.9rem',
                  }}
                  placeholder="••••••••"
                  required
                  onFocus={e => e.target.style.borderColor = '#14b8a6'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertCircle size={15} style={{ color: '#f87171', flexShrink: 0 }} />
                <p style={{ color: '#f87171', fontSize: '0.8rem' }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 transition-all duration-200"
              style={{
                background: loading ? 'rgba(20,184,166,0.5)' : 'linear-gradient(135deg, #14b8a6, #0ea5e9)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none',
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p style={{ color: '#475569', fontSize: '0.75rem' }}>
              Use any email and a password with 6+ characters to create or enter an account.
            </p>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="flex items-center justify-center gap-8 mt-6">
          {[{ label: 'Continents', value: '6' }, { label: 'Countries', value: '20+' }, { label: 'Cities', value: '50+' }].map(s => (
            <div key={s.label} className="text-center">
              <p style={{ color: '#14b8a6', fontSize: '1.1rem', fontWeight: 700 }}>{s.value}</p>
              <p style={{ color: '#64748b', fontSize: '0.75rem' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
