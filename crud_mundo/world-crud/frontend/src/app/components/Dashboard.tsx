import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Activity,
  Building2,
  Clock,
  Compass,
  Database,
  Flag,
  Globe,
  Layers,
  LucideIcon,
  MapPin,
  Plus,
  RadioTower,
  Satellite,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useApp } from '../context/AppContext';

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub: string;
  color: string;
  onClick?: () => void;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function MetricCard({ icon: Icon, label, value, sub, color, onClick }: MetricCardProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl p-5 text-left transition-all duration-200"
      style={{
        background: 'rgba(15,23,42,0.78)',
        border: '1px solid rgba(148,163,184,0.18)',
        boxShadow: '0 20px 60px rgba(2,8,23,0.24)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = `${color}66`;
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(148,163,184,0.18)';
      }}>
      <div className="flex items-start justify-between">
        <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, color }}>
          <Icon size={21} />
        </div>
        <span style={{ color, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em' }}>ATIVO</span>
      </div>
      <p style={{ color: '#f8fafc', fontSize: '1.85rem', fontWeight: 800, marginTop: 18, lineHeight: 1 }}>{value}</p>
      <p style={{ color: '#cbd5e1', fontSize: '0.82rem', marginTop: 6, fontWeight: 600 }}>{label}</p>
      <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 6 }}>{sub}</p>
    </button>
  );
}

function EmptyActivity() {
  return (
    <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(15,23,42,0.5)', border: '1px dashed rgba(148,163,184,0.2)' }}>
      <Activity size={24} style={{ color: '#38bdf8', margin: '0 auto 10px' }} />
      <p style={{ color: '#cbd5e1', fontWeight: 700 }}>Nenhuma atividade recente</p>
      <p style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 4 }}>Alterações feitas nesta sessão aparecerao aqui.</p>
    </div>
  );
}

function timeAgo(date: Date) {
  const diff = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diff < 60) return `ha ${diff}s`;
  if (diff < 3600) return `ha ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `ha ${Math.floor(diff / 3600)}h`;
  return `ha ${Math.floor(diff / 86400)}d`;
}

export default function Dashboard() {
  const { continents, countries, cities, activity, isLoading } = useApp();
  const navigate = useNavigate();

  const populationTotal = countries.reduce((sum, country) => sum + country.population, 0);
  const featuredCountry = countries.find(country => country.isoCode === 'BR') ?? countries[0] ?? null;
  const featuredCities = featuredCountry ? cities.filter(city => city.countryId === featuredCountry.id) : [];
  const topCountries = [...countries].sort((a, b) => b.population - a.population).slice(0, 5);
  const maxPopulation = topCountries[0]?.population || 1;

  const chartData = useMemo(() => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const base = Math.max(1, Math.floor(cities.length / labels.length));
    return labels.map((month, index) => ({
      month,
      cities: Math.min(cities.length, base * (index + 1) + Math.max(0, index - 2)),
      countries: Math.min(countries.length, Math.ceil((countries.length / labels.length) * (index + 1))),
    }));
  }, [cities.length, countries.length]);

  if (isLoading) {
    return (
      <div className="p-6 min-h-full" style={{ background: '#020617' }}>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(15,23,42,0.82)', border: '1px solid rgba(148,163,184,0.2)' }}>
          <p style={{ color: '#f8fafc', fontWeight: 800 }}>Carregando painel...</p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>Buscando dados geográficos no backend.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-full p-6 space-y-6"
      style={{
        background:
          'radial-gradient(circle at 18% 12%, rgba(56,189,248,0.18), transparent 28%), radial-gradient(circle at 82% 8%, rgba(45,212,191,0.12), transparent 24%), linear-gradient(180deg, #020617 0%, #07111f 54%, #020617 100%)',
      }}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-3" style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(56,189,248,0.2)' }}>
            <Satellite size={14} style={{ color: '#38bdf8' }} />
            <span style={{ color: '#bae6fd', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em' }}>PAINEL DE CONTROLE</span>
          </div>
          <h1 style={{ color: '#f8fafc', fontSize: '1.9rem', fontWeight: 900, letterSpacing: 0 }}>Painel GeoCRUD</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: 4 }}>Monitore continentes, países, cidades e dados externos em um único painel.</p>
        </div>

        <div className="flex items-center gap-2">
          {[
            { label: 'Continente', to: '/app/continents', icon: Layers },
            { label: 'País', to: '/app/countries', icon: Flag },
            { label: 'Cidade', to: '/app/cities', icon: Building2 },
          ].map(({ label, to, icon: Icon }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 transition-colors"
              style={{ background: 'rgba(15,23,42,0.78)', color: '#e0f2fe', border: '1px solid rgba(148,163,184,0.18)', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(14,165,233,0.16)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(15,23,42,0.78)'; e.currentTarget.style.borderColor = 'rgba(148,163,184,0.18)'; }}>
              <Plus size={14} />
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard icon={Globe} label="Continentes" value={continents.length} sub="Regioes mapeadas" color="#38bdf8" onClick={() => navigate('/app/continents')} />
        <MetricCard icon={Flag} label="Países" value={countries.length} sub="Dados enriquecidos por APIs" color="#2dd4bf" onClick={() => navigate('/app/countries')} />
        <MetricCard icon={Building2} label="Cidades" value={cities.length} sub="Coordenadas cadastradas" color="#a78bfa" onClick={() => navigate('/app/cities')} />
        <MetricCard icon={Users} label="População" value={formatNumber(populationTotal)} sub="População total cadastrada" color="#facc15" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 rounded-3xl p-5" style={{ background: 'rgba(15,23,42,0.74)', border: '1px solid rgba(148,163,184,0.18)', boxShadow: '0 24px 70px rgba(2,8,23,0.28)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 800 }}>Resumo geográfico</p>
              <p style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 3 }}>Projecao baseada nos registros atuais.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: 'rgba(45,212,191,0.12)', color: '#99f6e4', fontSize: '0.75rem', fontWeight: 800 }}>
              <RadioTower size={14} />
              API ONLINE
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="citiesGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="countriesGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 12, color: '#f8fafc', fontSize: 12 }} />
                <Area type="monotone" dataKey="cities" stroke="#38bdf8" fill="url(#citiesGlow)" strokeWidth={3} dot={false} />
                <Area type="monotone" dataKey="countries" stroke="#2dd4bf" fill="url(#countriesGlow)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-3xl p-5" style={{ background: 'rgba(15,23,42,0.74)', border: '1px solid rgba(148,163,184,0.18)', boxShadow: '0 24px 70px rgba(2,8,23,0.28)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 800 }}>País em destaque</p>
              <p style={{ color: '#64748b', fontSize: '0.78rem', marginTop: 3 }}>Principal país monitorado.</p>
            </div>
            <Compass size={18} style={{ color: '#38bdf8' }} />
          </div>

          {featuredCountry ? (
            <div>
              <button
                onClick={() => navigate(`/app/countries/${featuredCountry.id}`)}
                className="w-full rounded-2xl p-4 text-left transition-colors"
                style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.16), rgba(45,212,191,0.08))', border: '1px solid rgba(56,189,248,0.22)', cursor: 'pointer' }}>
                <div className="flex items-center gap-4">
                  {featuredCountry.flagUrl ? (
                    <img src={featuredCountry.flagUrl} alt="" aria-hidden="true" style={{ width: 58, height: 40, objectFit: 'cover', borderRadius: 8, boxShadow: '0 10px 28px rgba(0,0,0,0.24)' }} />
                  ) : (
                    <span style={{ fontSize: '2.3rem' }}>{featuredCountry.flag}</span>
                  )}
                  <div>
                    <p style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: 900 }}>{featuredCountry.name}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: 2 }}>{featuredCountry.region || featuredCountry.subregion || 'Região desconhecida'}</p>
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: 'Capital', value: featuredCountry.capital || 'N/A' },
                  { label: 'Moeda', value: featuredCountry.currency },
                  { label: 'Idioma', value: featuredCountry.language },
                  { label: 'Cidades', value: featuredCities.length },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl p-3" style={{ background: 'rgba(2,6,23,0.45)', border: '1px solid rgba(148,163,184,0.12)' }}>
                    <p style={{ color: '#64748b', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</p>
                    <p style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '0.88rem', marginTop: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: '#94a3b8' }}>Cadastre um país para ativar este painel.</p>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="rounded-3xl p-5" style={{ background: 'rgba(15,23,42,0.74)', border: '1px solid rgba(148,163,184,0.18)' }}>
          <div className="flex items-center justify-between mb-5">
            <p style={{ color: '#f8fafc', fontWeight: 800 }}>Maiores populações</p>
            <TrendingUp size={18} style={{ color: '#facc15' }} />
          </div>
          <div className="space-y-4">
            {topCountries.map(country => {
              const pct = (country.population / maxPopulation) * 100;
              return (
                <button key={country.id} onClick={() => navigate(`/app/countries/${country.id}`)} className="w-full text-left" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 700 }}>{country.name}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{formatNumber(country.population)}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'rgba(148,163,184,0.14)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #38bdf8, #2dd4bf)' }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl p-5" style={{ background: 'rgba(15,23,42,0.74)', border: '1px solid rgba(148,163,184,0.18)' }}>
          <div className="flex items-center justify-between mb-5">
            <p style={{ color: '#f8fafc', fontWeight: 800 }}>Grade continental</p>
            <Database size={18} style={{ color: '#2dd4bf' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {continents.map(continent => {
              const countryCount = countries.filter(country => country.continentId === continent.id).length;
              return (
                <button
                  key={continent.id}
                  onClick={() => navigate('/app/continents')}
                  className="rounded-2xl p-3 text-left transition-colors"
                  style={{ background: `${continent.color}12`, border: `1px solid ${continent.color}35`, cursor: 'pointer' }}>
                  <p style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.82rem' }}>{continent.name}</p>
                  <p style={{ color: continent.color, fontSize: '0.78rem', marginTop: 4, fontWeight: 800 }}>{countryCount} países</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl p-5" style={{ background: 'rgba(15,23,42,0.74)', border: '1px solid rgba(148,163,184,0.18)' }}>
          <div className="flex items-center justify-between mb-5">
            <p style={{ color: '#f8fafc', fontWeight: 800 }}>Atividades recentes</p>
            <Clock size={18} style={{ color: '#a78bfa' }} />
          </div>
          {activity.length === 0 ? (
            <EmptyActivity />
          ) : (
            <div className="space-y-3">
              {activity.slice(0, 7).map(item => (
                <div key={item.id} className="rounded-2xl p-3" style={{ background: 'rgba(2,6,23,0.45)', border: '1px solid rgba(148,163,184,0.12)' }}>
                  <div className="flex items-center justify-between">
                    <span style={{ color: item.action === 'deleted' ? '#fb7185' : item.action === 'updated' ? '#38bdf8' : '#2dd4bf', fontSize: '0.72rem', fontWeight: 900, textTransform: 'uppercase' }}>{item.action}</span>
                    <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{timeAgo(item.timestamp)}</span>
                  </div>
                  <p style={{ color: '#e2e8f0', fontWeight: 800, fontSize: '0.86rem', marginTop: 5 }}>{item.name}</p>
                  <p style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'capitalize', marginTop: 2 }}>{item.entity}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
