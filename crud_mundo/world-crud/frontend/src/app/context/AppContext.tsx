import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityItem, City, Continent, Country } from '../data/types';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthResult = {
  ok: boolean;
  message?: string;
};

type ApiContinent = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
};

type ApiCountry = {
  id: string;
  name: string;
  officialName?: string | null;
  code: string;
  capital?: string | null;
  region?: string | null;
  subregion?: string | null;
  population: number;
  language: string;
  currency: string;
  area?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  flagUrl?: string | null;
  continentId: string;
};

type ExternalCountry = {
  name: string;
  officialName?: string;
  code: string;
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number | null;
  area?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  flagUrl?: string;
  flagAlt?: string;
  currencies?: Array<{ code: string; name: string; symbol?: string }>;
  languages?: string[];
  timezones?: string[];
  maps?: {
    googleMaps?: string;
    openStreetMaps?: string;
  };
};

type ApiCity = {
  id: string;
  name: string;
  state?: string | null;
  countryId: string;
  latitude: number;
  longitude: number;
  population: number;
  timezone?: string | null;
};

interface AppContextType {
  continents: Continent[];
  countries: Country[];
  cities: City[];
  activity: ActivityItem[];
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  recordActivity: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
  addContinent: (c: Omit<Continent, 'id'>) => Promise<void>;
  updateContinent: (id: string, c: Partial<Continent>) => Promise<void>;
  deleteContinent: (id: string) => Promise<void>;
  addCountry: (c: Omit<Country, 'id'>) => Promise<void>;
  updateCountry: (id: string, c: Partial<Country>) => Promise<void>;
  deleteCountry: (id: string) => Promise<void>;
  addCity: (c: Omit<City, 'id'>) => Promise<void>;
  updateCity: (id: string, c: Partial<City>) => Promise<void>;
  deleteCity: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
const TOKEN_KEY = 'world_crud_token';
const USER_KEY = 'world_crud_user';
const ACTIVITY_KEY = 'world_crud_activity';
const COLORS = ['#f59e0b', '#0ea5e9', '#8b5cf6', '#10b981', '#ef4444', '#06b6d4', '#f97316', '#ec4899'];
const ISO_NUMERIC: Record<string, number> = {
  BR: 76, US: 840, FR: 250, JP: 392, AR: 32, DE: 276, CA: 124, MX: 484,
  CO: 170, GB: 826, IT: 380, ES: 724, CN: 156, IN: 356, KR: 410,
  NG: 566, EG: 818, ZA: 710, AU: 36, NZ: 554,
};

function flagFromCode(code: string) {
  const clean = code.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  if (clean.length !== 2) return 'Bandeira';
  return clean
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
}

function apiHeaders(token: string | null, json = true) {
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options: RequestInit = {}, token = localStorage.getItem(TOKEN_KEY)): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...apiHeaders(token, options.body !== undefined),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = 'Não foi possível concluir a ação.';
    try {
      const body = await response.json();
      if (typeof body.message === 'string') message = body.message;
    } catch {
      // Keep the generic message when the server does not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function mapContinent(item: ApiContinent, index: number): Continent {
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    description: item.description ?? '',
    color: COLORS[index % COLORS.length],
  };
}

function mapCountry(item: ApiCountry, external?: ExternalCountry): Country {
  const code = item.code || item.name.slice(0, 2).toUpperCase();
  const currencies = external?.currencies ?? [];
  const languages = external?.languages ?? [];
  const timezones = external?.timezones ?? [];
  return {
    id: item.id,
    name: item.name,
    officialName: item.officialName ?? external?.officialName ?? '',
    continentId: item.continentId,
    population: item.population,
    language: item.language || languages.join(', ') || item.subregion || item.region || 'N/A',
    languages,
    currency: item.currency || currencies.map(currency => currency.code).join(', ') || 'N/A',
    currencies,
    capital: item.capital ?? '',
    flag: flagFromCode(code),
    flagUrl: item.flagUrl || external?.flagUrl || '',
    flagAlt: external?.flagAlt || '',
    lat: item.latitude ?? 0,
    lng: item.longitude ?? 0,
    area: item.area ?? 0,
    timezone: timezones[0] ?? 'UTC',
    timezones,
    region: external?.region ?? item.region ?? '',
    subregion: external?.subregion ?? item.subregion ?? '',
    maps: external?.maps,
    isoCode: code,
    isoNumeric: ISO_NUMERIC[code.toUpperCase()] ?? 0,
  };
}

function mapCity(item: ApiCity, countries: Country[]): City {
  const country = countries.find(c => c.id === item.countryId);
  return {
    id: item.id,
    name: item.name,
    countryId: item.countryId,
    population: item.population ?? 0,
    lat: item.latitude,
    lng: item.longitude,
    isCapital: Boolean(country?.capital && country.capital.toLowerCase() === item.name.toLowerCase()),
  };
}

function toCountryPayload(country: Partial<Country>) {
  return {
    name: country.name ?? '',
    code: country.isoCode || country.name?.slice(0, 2).toUpperCase() || '',
    capital: country.capital || null,
    region: country.region || country.language || null,
    subregion: country.subregion || null,
    population: country.population ?? 0,
    language: country.language ?? '',
    currency: country.currency ?? '',
    area: country.area ?? null,
    latitude: country.lat ?? null,
    longitude: country.lng ?? null,
    flagUrl: country.flagUrl || null,
    continentId: country.continentId ?? '',
  };
}

function toCityPayload(city: Partial<City>) {
  return {
    name: city.name ?? '',
    countryId: city.countryId ?? '',
    latitude: city.lat ?? 0,
    longitude: city.lng ?? 0,
    population: city.population ?? 0,
    timezone: null,
  };
}

function readActivity(): ActivityItem[] {
  try {
    const stored = localStorage.getItem(ACTIVITY_KEY);
    if (!stored) return [];
    return (JSON.parse(stored) as Array<Omit<ActivityItem, 'timestamp'> & { timestamp: string }>).map(item => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch {
    return [];
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) as User : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [continents, setContinents] = useState<Continent[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>(readActivity);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [authError, setAuthError] = useState<string | null>(null);

  const addActivity = useCallback((item: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    setActivity(prev => {
      const next = [{ ...item, id: crypto.randomUUID(), timestamp: new Date() }, ...prev.slice(0, 19)];
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const saveSession = useCallback((nextToken: string, nextUser: User) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setContinents([]);
    setCountries([]);
    setCities([]);
  }, []);

  const refreshData = useCallback(async (authToken = token) => {
    if (!authToken) return;
    const apiContinents = await request<ApiContinent[]>('/continents', {}, authToken);
    const apiCountries = await request<ApiCountry[]>('/countries', {}, authToken);
    let externalCountries: ExternalCountry[] = [];
    try {
      externalCountries = await request<ExternalCountry[]>('/external/countries', {}, authToken);
    } catch (error) {
      console.warn('External country enrichment unavailable.', error);
    }
    const externalByCode = new Map(
      externalCountries.map(country => [country.code.toUpperCase(), country])
    );
    const mappedContinents = apiContinents.map(mapContinent);
    const mappedCountries = apiCountries.map(country =>
      mapCountry(country, externalByCode.get(country.code.toUpperCase()))
    );
    const apiCities = await request<ApiCity[]>('/cities', {}, authToken);
    setContinents(mappedContinents);
    setCountries(mappedCountries);
    setCities(apiCities.map(city => mapCity(city, mappedCountries)));
  }, [token]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    request<{ user: User }>('/auth/me', {}, token)
      .then(({ user: currentUser }) => {
        if (cancelled) return;
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        setUser(currentUser);
        return refreshData(token);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clearSession, refreshData, token]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthError(null);
      const result = await request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }, null);

      saveSession(result.token, result.user);
      await refreshData(result.token);
      addActivity({ action: 'signed_in', entity: 'user', name: result.user.name || result.user.email });
      return { ok: true };
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Não foi possível entrar.';
      setAuthError(message);
      return { ok: false, message };
    }
  }, [addActivity, refreshData, saveSession]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      setAuthError(null);
      const result = await request<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }, null);

      saveSession(result.token, result.user);
      await refreshData(result.token);
      addActivity({ action: 'registered', entity: 'user', name: result.user.name || result.user.email });
      return { ok: true };
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Não foi possível criar a conta.';
      setAuthError(message);
      return { ok: false, message };
    }
  }, [addActivity, refreshData, saveSession]);

  const logout = useCallback(() => {
    if (user) addActivity({ action: 'signed_out', entity: 'user', name: user.name || user.email });
    clearSession();
  }, [addActivity, clearSession, user]);

  const addContinent = useCallback(async (continent: Omit<Continent, 'id'>) => {
    await request<ApiContinent>('/continents', {
      method: 'POST',
      body: JSON.stringify({
        name: continent.name,
        code: continent.code,
        description: continent.description || null,
      }),
    });
    addActivity({ action: 'created', entity: 'continent', name: continent.name });
    await refreshData();
  }, [addActivity, refreshData]);

  const updateContinent = useCallback(async (id: string, continent: Partial<Continent>) => {
    await request<ApiContinent>(`/continents/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: continent.name,
        code: continent.code,
        description: continent.description || null,
      }),
    });
    addActivity({ action: 'updated', entity: 'continent', name: continent.name ?? id });
    await refreshData();
  }, [addActivity, refreshData]);

  const deleteContinent = useCallback(async (id: string) => {
    const name = continents.find(x => x.id === id)?.name ?? id;
    await request<void>(`/continents/${id}`, { method: 'DELETE' });
    addActivity({ action: 'deleted', entity: 'continent', name });
    await refreshData();
  }, [addActivity, continents, refreshData]);

  const addCountry = useCallback(async (country: Omit<Country, 'id'>) => {
    await request<ApiCountry>('/countries', {
      method: 'POST',
      body: JSON.stringify(toCountryPayload(country)),
    });
    addActivity({ action: 'created', entity: 'country', name: country.name });
    await refreshData();
  }, [addActivity, refreshData]);

  const updateCountry = useCallback(async (id: string, country: Partial<Country>) => {
    const existing = countries.find(item => item.id === id);
    const merged = existing ? { ...existing, ...country } : country;
    await request<ApiCountry>(`/countries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toCountryPayload(merged)),
    });
    addActivity({ action: 'updated', entity: 'country', name: merged.name ?? id });
    await refreshData();
  }, [addActivity, countries, refreshData]);

  const deleteCountry = useCallback(async (id: string) => {
    const name = countries.find(x => x.id === id)?.name ?? id;
    await request<void>(`/countries/${id}`, { method: 'DELETE' });
    addActivity({ action: 'deleted', entity: 'country', name });
    await refreshData();
  }, [addActivity, countries, refreshData]);

  const addCity = useCallback(async (city: Omit<City, 'id'>) => {
    await request<ApiCity>('/cities', {
      method: 'POST',
      body: JSON.stringify(toCityPayload(city)),
    });
    if (city.isCapital) {
      const country = countries.find(item => item.id === city.countryId);
      if (country) {
        await request<ApiCountry>(`/countries/${country.id}`, {
          method: 'PUT',
          body: JSON.stringify(toCountryPayload({ ...country, capital: city.name })),
        });
      }
    }
    addActivity({ action: 'created', entity: 'city', name: city.name });
    await refreshData();
  }, [addActivity, countries, refreshData]);

  const updateCity = useCallback(async (id: string, city: Partial<City>) => {
    const existing = cities.find(item => item.id === id);
    const merged = existing ? { ...existing, ...city } : city;
    await request<ApiCity>(`/cities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toCityPayload(merged)),
    });
    if (merged.isCapital) {
      const country = countries.find(item => item.id === merged.countryId);
      if (country) {
        await request<ApiCountry>(`/countries/${country.id}`, {
          method: 'PUT',
          body: JSON.stringify(toCountryPayload({ ...country, capital: merged.name })),
        });
      }
    }
    addActivity({ action: 'updated', entity: 'city', name: merged.name ?? id });
    await refreshData();
  }, [addActivity, cities, countries, refreshData]);

  const deleteCity = useCallback(async (id: string) => {
    const name = cities.find(x => x.id === id)?.name ?? id;
    await request<void>(`/cities/${id}`, { method: 'DELETE' });
    addActivity({ action: 'deleted', entity: 'city', name });
    await refreshData();
  }, [addActivity, cities, refreshData]);

  const value = useMemo<AppContextType>(() => ({
    continents,
    countries,
    cities,
    activity,
    user,
    isAuthenticated: Boolean(token && user),
    isLoading,
    authError,
    login,
    register,
    logout,
    recordActivity: addActivity,
    addContinent,
    updateContinent,
    deleteContinent,
    addCountry,
    updateCountry,
    deleteCountry,
    addCity,
    updateCity,
    deleteCity,
  }), [
    continents, countries, cities, activity, user, token, isLoading, authError, login, register, logout, addActivity,
    addContinent, updateContinent, deleteContinent, addCountry, updateCountry,
    deleteCountry, addCity, updateCity, deleteCity,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
