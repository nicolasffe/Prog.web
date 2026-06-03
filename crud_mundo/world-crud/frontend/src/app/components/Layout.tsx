import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link, Navigate } from 'react-router';
import {
  Globe, LayoutDashboard, Layers, Flag, Building2,
  LogOut, Search, Bell, ChevronRight, Menu, User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Toaster } from 'sonner';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/continents', icon: Layers, label: 'Continents' },
  { to: '/app/countries', icon: Flag, label: 'Countries' },
  { to: '/app/cities', icon: Building2, label: 'Cities' },
];

export default function Layout() {
  const { isAuthenticated, logout, continents, countries, cities } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f1f5f9' }}>
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-300 shrink-0"
        style={{
          width: sidebarOpen ? 240 : 64,
          background: '#0f172a',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2 shrink-0 group" style={{ textDecoration: 'none' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
              style={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' }}>
              <Globe size={16} className="text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>GeoCRUD</p>
                <p style={{ color: '#64748b', fontSize: '0.65rem', letterSpacing: '0.1em' }}>GLOBE VIEW</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto rounded-md p-1 transition-colors"
            style={{ color: '#64748b' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
            {sidebarOpen ? <ChevronRight size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }, i) => (
            <NavLink key={to} to={to}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-150 group"
              style={({ isActive }) => ({
                background: isActive ? (i === 0 ? 'rgba(20,184,166,0.2)' : 'rgba(20,184,166,0.12)') : 'transparent',
                color: isActive ? '#14b8a6' : '#94a3b8',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.875rem',
                textDecoration: 'none',
                marginBottom: i === 0 ? 6 : 0,
                borderBottom: i === 0 && sidebarOpen ? '1px solid rgba(255,255,255,0.04)' : 'none',
                paddingBottom: i === 0 && sidebarOpen ? '12px' : undefined,
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = '#e2e8f0';
                }
              }}
              onMouseLeave={e => {
                const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}>
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Stats mini */}
        {sidebarOpen && (
          <div className="mx-3 mb-4 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: '#64748b', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Database</p>
            {[
              { label: 'Continents', value: continents.length, color: '#8b5cf6' },
              { label: 'Countries', value: countries.length, color: '#14b8a6' },
              { label: 'Cities', value: cities.length, color: '#0ea5e9' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-1">
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{s.label}</span>
                <span style={{ color: s.color, fontSize: '0.8rem', fontWeight: 600 }}>{s.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 mx-2 mb-3 rounded-lg px-3 py-2.5 transition-colors"
          style={{ color: '#64748b', fontSize: '0.875rem', background: 'transparent', border: 'none', cursor: 'pointer', width: 'calc(100% - 16px)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}>
          <LogOut size={18} className="shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-3.5 shrink-0"
          style={{ background: 'white', borderBottom: '1px solid #e2e8f0', height: 60 }}>
          <div className="flex-1 relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search continents, countries, cities..."
              className="w-full pl-9 pr-4 py-2 rounded-lg outline-none transition-all"
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#1e293b',
                fontSize: '0.85rem',
              }}
              onFocus={e => e.target.style.borderColor = '#14b8a6'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <Link to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
              style={{ color: '#14b8a6', background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.2)', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(20,184,166,0.15)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(20,184,166,0.08)'; }}>
              <Globe size={14} />
              <span>Globe</span>
            </Link>
            <button className="relative p-2 rounded-lg transition-colors"
              style={{ color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: '#14b8a6' }} />
            </button>

            <div className="flex items-center gap-2 pl-3" style={{ borderLeft: '1px solid #e2e8f0' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #0ea5e9)' }}>
                <User size={15} className="text-white" />
              </div>
              <div>
                <p style={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.2 }}>Admin User</p>
                <p style={{ color: '#94a3b8', fontSize: '0.7rem' }}>admin@geocrud.app</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
