import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Globe, Lock, Mail, Eye, EyeOff, AlertCircle, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

type AuthMode = 'login' | 'register';

export default function Login() {
  const { login, register } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@geocrud.app');
  const [password, setPassword] = useState('admin123');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister && !name.trim()) {
      setError('Informe seu nome para criar a conta.');
      return;
    }

    setLoading(true);
    const ok = isRegister
      ? await register(name.trim(), email, password)
      : await login(email, password);
    setLoading(false);

    if (ok) {
      toast.success(isRegister ? 'Conta criada com sucesso!' : 'Login realizado com sucesso!');
      navigate('/app/dashboard');
      return;
    }

    setError(
      isRegister
        ? 'Não foi possível criar a conta. Verifique os dados informados.'
        : 'E-mail ou senha inválidos.'
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2744 100%)' }}>
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(6,182,212,0.4) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />

      <div className="absolute top-8 left-8 flex items-center gap-2 text-slate-400">
        <Globe size={20} className="text-teal-400" />
        <span className="text-sm tracking-widest uppercase" style={{ color: '#94a3b8' }}>GeoCRUD</span>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-2xl p-8 shadow-2xl border border-white/10"
          style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(24px)' }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' }}>
              <Globe size={32} className="text-white" />
            </div>
            <h1 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 }}>
              {isRegister ? 'Criar conta' : 'Entrar no GeoCRUD'}
            </h1>
            <p className="mt-1" style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
              {isRegister ? 'Cadastre-se para gerenciar os dados geográficos.' : 'Acesse para gerenciar continentes, países e cidades.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <button type="button" onClick={() => switchMode('login')}
              className="rounded-lg py-2 transition-colors"
              style={{ background: !isRegister ? '#14b8a6' : 'transparent', color: !isRegister ? 'white' : '#94a3b8', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Entrar
            </button>
            <button type="button" onClick={() => switchMode('register')}
              className="rounded-lg py-2 transition-colors"
              style={{ background: isRegister ? '#14b8a6' : 'transparent', color: isRegister ? 'white' : '#94a3b8', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>Nome</label>
                <div className="relative mt-1.5">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-xl pl-10 pr-4 py-3 outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#f1f5f9',
                      fontSize: '0.9rem',
                    }}
                    placeholder="Seu nome"
                    required
                    onFocus={e => e.target.style.borderColor = '#14b8a6'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>Email</label>
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

            <div>
              <label style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>Senha</label>
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
                  placeholder="********"
                  minLength={6}
                  required
                  onFocus={e => e.target.style.borderColor = '#14b8a6'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                <AlertCircle size={15} style={{ color: '#f87171', flexShrink: 0 }} />
                <p style={{ color: '#f87171', fontSize: '0.8rem' }}>{error}</p>
              </div>
            )}

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
                  {isRegister ? 'Criando conta...' : 'Entrando...'}
                </span>
              ) : isRegister ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p style={{ color: '#64748b', fontSize: '0.75rem' }}>
              {isRegister ? 'A senha deve ter pelo menos 6 caracteres.' : 'Ainda não tem conta? Use a aba Criar conta.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 mt-6">
          {[{ label: 'Continentes', value: '6' }, { label: 'Países', value: '20+' }, { label: 'Cidades', value: '50+' }].map(s => (
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
