import { useCallback, useEffect, useState } from 'react';
import { City, Country } from '../data/types';
import { API_URL } from '../config/api';

export type Weather = {
  temperature: number;
  feelsLike?: number | null;
  humidity?: number | null;
  windSpeed?: number | null;
  description?: string | null;
  provider: string;
  cached?: boolean;
};

const TOKEN_KEY = 'world_crud_token';

export function getCountryWeatherCity(country: Country | null | undefined, cities: City[]) {
  if (!country) return null;

  const countryCities = cities.filter(city => city.countryId === country.id);
  return (
    countryCities.find(city => city.isCapital) ??
    countryCities.find(city => city.name.toLowerCase() === country.capital.toLowerCase()) ??
    countryCities[0] ??
    null
  );
}

export function getWeatherLabel(description?: string | null) {
  if (/sun|clear/i.test(description ?? '')) return 'Sol';
  if (/rain/i.test(description ?? '')) return 'Chuva';
  if (/snow/i.test(description ?? '')) return 'Neve';
  if (/cloud|overcast|hazy/i.test(description ?? '')) return 'Nublado';
  return 'Tempo';
}

export function useCityWeather(cityId?: string | null) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    if (!cityId) {
      setWeather(null);
      setWeatherLoading(false);
      return;
    }

    let cancelled = false;
    setWeatherLoading(true);
    fetch(`${API_URL}/weather/city/${cityId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) ?? ''}`,
      },
    })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (!cancelled) setWeather(data);
      })
      .catch(() => {
        if (!cancelled) setWeather(null);
      })
      .finally(() => {
        if (!cancelled) setWeatherLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cityId]);

  return { weather, weatherLoading };
}

export type CityWeather = Weather & {
  city: {
    id: string;
    name: string;
    countryId: string;
    latitude: number;
    longitude: number;
    population: number;
  };
};

type CityWeatherResponse = CityWeather | {
  city: City;
  weather: null;
  error?: string;
};

export function useCitiesWeather(enabled = true) {
  const [citiesWeather, setCitiesWeather] = useState<CityWeather[]>([]);
  const [citiesWeatherLoading, setCitiesWeatherLoading] = useState(false);
  const [citiesWeatherRefreshing, setCitiesWeatherRefreshing] = useState(false);

  const loadCitiesWeather = useCallback(async (forceRefresh = false) => {
    if (!enabled) {
      setCitiesWeather([]);
      setCitiesWeatherLoading(false);
      setCitiesWeatherRefreshing(false);
      return;
    }

    if (forceRefresh) setCitiesWeatherRefreshing(true);
    else setCitiesWeatherLoading(true);

    try {
      const response = await fetch(`${API_URL}/weather/cities${forceRefresh ? '?refresh=true' : ''}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) ?? ''}`,
        },
      });
      const data: CityWeatherResponse[] = response.ok ? await response.json() : [];
      setCitiesWeather(data.filter((item): item is CityWeather => 'temperature' in item));
    } catch {
      setCitiesWeather([]);
    } finally {
      setCitiesWeatherLoading(false);
      setCitiesWeatherRefreshing(false);
    }
  }, [enabled]);

  useEffect(() => {
    let cancelled = false;

    loadCitiesWeather().finally(() => {
      if (cancelled) return;
    });

    return () => {
      cancelled = true;
    };
  }, [loadCitiesWeather]);

  return {
    citiesWeather,
    citiesWeatherLoading,
    citiesWeatherRefreshing,
    refreshCitiesWeather: () => loadCitiesWeather(true),
  };
}
