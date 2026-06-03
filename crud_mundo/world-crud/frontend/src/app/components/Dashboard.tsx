import { useNavigate } from 'react-router';
import { Layers, Flag, Building2, Globe, TrendingUp, Plus, Clock, CheckCircle, Pencil, Trash2, Thermometer, Wind } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { mockWeather } from '../data/mockData';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const growthData = [
  { month: 'Jan', cities: 38 },
  { month: 'Feb', cities: 40 },
  { month: 'Mar', cities: 43 },
  { month: 'Apr', cities: 45 },
  { month: 'May', cities: 48 },
  { month: 'Jun', cities: 51 },
];

function StatCard({ icon: Icon, label, value, sub, color, onClick }: {
  icon: typeof Globe; label: string; value: number | string; sub: string; color: string; onClick?: () => void;
}) {
  return (
    <button onClick={onClick}
      className="rounded-2xl p-5 text-left transition-all duration-200 w-full"
      style={{ background: 'white', border: '1px solid #e2e8f0', cursor: onClick ? 'pointer' : 'default', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <TrendingUp size={14} style={{ color: '#10b981' }} />
      </div>
      <p style={{ color: '#1e293b', fontSize: '1.6rem', fontWeight: 700, lineHeight: 1 }}>{value}</p>
      <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 4 }}>{label}</p>
      <p style={{ color: color, fontSize: '0.72rem', marginTop: 6, fontWeight: 500 }}>{sub}</p>
    </button>
  );
}

function ActivityBadge({ action }: { action: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    created: { bg: 'rgba(16,185,129,0.1)', text: '#10b981' },
    updated: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6' },
    deleted: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
  };
  const s = styles[action] ?? styles.created;
  const icons: Record<string, typeof Plus> = { created: Plus, updated: Pencil, deleted: Trash2 };
  const Icon = icons[action] ?? Plus;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.text, fontSize: '0.7rem', fontWeight: 500 }}>
      <Icon size={10} />
      {action}
    </span>
  );
}

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Dashboard() {
  const { continents, countries, cities, activity, isLoading } = useApp();
  const navigate = useNavigate();

  const featuredCountry = countries.find(c => c.isoCode === 'FR') ?? countries[0] ?? null;
  const weather = featuredCountry ? mockWeather[featuredCountry.id] ?? { temp: 0, condition: 'N/A', humidity: 0, wind: 0 } : null;
  const featuredCities = featuredCountry ? cities.filter(c => c.countryId === featuredCountry.id) : [];

  const topByPop = [...countries].sort((a, b) => b.population - a.population).slice(0, 5);
  const maxPopulation = topByPop[0]?.population || 1;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="rounded-2xl p-6" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#1e293b', fontWeight: 600 }}>Loading dashboard...</p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>Fetching data from the backend.</p>
        </div>
      </div>
    );
  }

  if (!featuredCountry) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: 700 }}>Dashboard</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 2 }}>No countries loaded yet.</p>
          </div>
          <button onClick={() => navigate('/app/countries')} className="rounded-lg px-3 py-2 text-sm" style={{ background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer' }}>
            + Country
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Globe} label="Continents" value={continents.length} sub="All regions tracked" color="#8b5cf6" onClick={() => navigate('/app/continents')} />
          <StatCard icon={Flag} label="Countries" value={countries.length} sub="Active in database" color="#14b8a6" onClick={() => navigate('/app/countries')} />
          <StatCard icon={Building2} label="Cities" value={cities.length} sub="Geographic entries" color="#0ea5e9" onClick={() => navigate('/app/cities')} />
          <StatCard icon={TrendingUp} label="World Pop." value="0" sub="Total tracked population" color="#f59e0b" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '1.4rem', fontWeight: 700 }}>Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 2 }}>Overview of your geographic database</p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { label: '+ Continent', to: '/app/continents' },
            { label: '+ Country', to: '/app/countries' },
            { label: '+ City', to: '/app/cities' },
          ].map(b => (
            <button key={b.label} onClick={() => navigate(b.to)}
              className="rounded-lg px-3 py-2 text-sm transition-colors"
              style={{ background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
              onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Globe} label="Continents" value={continents.length} sub="All regions tracked" color="#8b5cf6" onClick={() => navigate('/app/continents')} />
        <StatCard icon={Flag} label="Countries" value={countries.length} sub="Active in database" color="#14b8a6" onClick={() => navigate('/app/countries')} />
        <StatCard icon={Building2} label="Cities" value={cities.length} sub="Geographic entries" color="#0ea5e9" onClick={() => navigate('/app/cities')} />
        <StatCard icon={TrendingUp} label="World Pop." value="~8.1B" sub="Total tracked population" color="#f59e0b" />
      </div>

      {/* Main content row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Country */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="px-5 pt-5 pb-4" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Featured Country</span>
              <button onClick={() => navigate(`/app/countries/${featuredCountry.id}`)}
                style={{ color: '#14b8a6', fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}>View →</button>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: '2.5rem' }}>{featuredCountry.flag}</span>
              <div>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>{featuredCountry.name}</p>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{continents.find(c => c.id === featuredCountry.continentId)?.name}</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Population', value: featuredCountry.population.toLocaleString() },
              { label: 'Capital', value: featuredCountry.capital },
              { label: 'Currency', value: featuredCountry.currency },
              { label: 'Language', value: featuredCountry.language },
              { label: 'Coordinates', value: `${featuredCountry.lat.toFixed(2)}°, ${featuredCountry.lng.toFixed(2)}°` },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between">
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{row.label}</span>
                <span style={{ color: '#1e293b', fontSize: '0.82rem', fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}

            {/* Weather */}
            <div className="mt-4 pt-4 rounded-xl p-3 flex items-center gap-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Thermometer size={18} style={{ color: '#0ea5e9' }} />
              <div>
                <p style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.9rem' }}>{weather.temp}°C — {weather.condition}</p>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Humidity {weather.humidity}% · Wind {weather.wind} km/h</p>
              </div>
            </div>

            {/* Cities */}
            <div>
              <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cities</p>
              <div className="flex flex-wrap gap-1.5">
                {featuredCities.map(c => (
                  <button key={c.id} onClick={() => navigate(`/app/cities/${c.id}`)}
                    className="px-2.5 py-1 rounded-lg text-xs transition-colors"
                    style={{ background: c.isCapital ? 'rgba(20,184,166,0.1)' : '#f1f5f9', color: c.isCapital ? '#14b8a6' : '#475569', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                    {c.isCapital ? '★ ' : ''}{c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Growth chart + top countries */}
        <div className="space-y-4">
          {/* Chart */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Cities Growth</p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 16 }}>Entries added over time</p>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
                <Area type="monotone" dataKey="cities" stroke="#14b8a6" fill="url(#cGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top countries by population */}
          <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.9rem', marginBottom: 12 }}>Top by Population</p>
            <div className="space-y-2.5">
              {topByPop.map((c, i) => {
                const pct = (c.population / maxPopulation) * 100;
                return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '1rem' }}>{c.flag}</span>
                        <span style={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 500 }}>{c.name}</span>
                      </div>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{(c.population / 1e6).toFixed(0)}M</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: '#f1f5f9' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: i === 0 ? '#14b8a6' : '#e2e8f0', backgroundColor: i < 2 ? '#14b8a6' : '#cbd5e1' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-4">
            <p style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.9rem' }}>Recent Activity</p>
            <Clock size={15} style={{ color: '#94a3b8' }} />
          </div>
          <div className="space-y-3">
            {activity.slice(0, 8).map(item => (
              <div key={item.id} className="flex items-start gap-3 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: item.action === 'created' ? 'rgba(16,185,129,0.1)' : item.action === 'updated' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)' }}>
                  {item.action === 'created' ? <Plus size={12} style={{ color: '#10b981' }} /> :
                    item.action === 'updated' ? <Pencil size={12} style={{ color: '#3b82f6' }} /> :
                      <Trash2 size={12} style={{ color: '#ef4444' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ActivityBadge action={item.action} />
                    <span style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'capitalize' }}>{item.entity}</span>
                  </div>
                  <p style={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 500, marginTop: 2 }}>{item.name}</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.72rem', marginTop: 1 }}>{timeAgo(item.timestamp)}</p>
                </div>
                <CheckCircle size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Continent overview */}
      <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-4">
          <p style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.9rem' }}>Continents Overview</p>
          <button onClick={() => navigate('/app/map')} style={{ color: '#14b8a6', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>
            Open Map →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {continents.map(cont => {
            const cCount = countries.filter(c => c.continentId === cont.id).length;
            const cityCount = cities.filter(city => countries.find(c => c.id === city.countryId && c.continentId === cont.id)).length;
            return (
              <button key={cont.id} onClick={() => navigate('/app/map')}
                className="rounded-xl p-4 text-center transition-all duration-200"
                style={{ background: `${cont.color}10`, border: `1px solid ${cont.color}25`, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = `${cont.color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${cont.color}10`; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ background: cont.color }}>
                  <Globe size={14} className="text-white" />
                </div>
                <p style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.8rem' }}>{cont.name}</p>
                <p style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: 2 }}>{cCount} countries</p>
                <p style={{ color: cont.color, fontSize: '0.7rem', fontWeight: 500 }}>{cityCount} cities</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
