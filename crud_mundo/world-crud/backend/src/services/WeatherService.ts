import { externalProviders } from "../config/externalProviders";
import { cityRepository } from "../repositories/CityRepository";
import { weatherRepository } from "../repositories/WeatherRepository";
import { HttpError } from "../utils/HttpError";

type WeatherResult = {
  temperature: number;
  feelsLike?: number | null;
  humidity?: number | null;
  windSpeed?: number | null;
  description?: string | null;
  icon?: string | null;
  provider: string;
};

type OpenWeatherResponse = {
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
  };
  wind?: { speed?: number };
  weather?: Array<{ description?: string; icon?: string }>;
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
  };
};

export class WeatherService {
  async listCitiesWeather(forceRefresh = false) {
    const cities = await cityRepository.list();

    const results = await Promise.allSettled(
      cities.map(city => this.getByCityId(city.id, forceRefresh))
    );

    const weatherByCity = [];

    for (const [index, result] of results.entries()) {
      if (result.status === "fulfilled") {
        weatherByCity.push(result.value);
        continue;
      }

      weatherByCity.push({
        city: cities[index],
        weather: null,
        error: result.reason instanceof Error
          ? result.reason.message
          : "Nao foi possivel carregar o clima."
      });
    }

    return weatherByCity;
  }

  async getByCityId(cityId: string, forceRefresh = false) {
    const city = await cityRepository.findById(cityId);

    if (!city) {
      throw new HttpError(404, "Cidade nao encontrada.");
    }

    const cached = await weatherRepository.findByCityId(cityId);
    const cacheTtlMs = externalProviders.weatherCacheMinutes * 60 * 1000;

    if (!forceRefresh && cached && Date.now() - cached.fetchedAt.getTime() < cacheTtlMs) {
      return { ...cached, city, cached: true };
    }

    const weather = await this.fetchCurrentWeather(city.latitude, city.longitude);
    const saved = await weatherRepository.upsert(city.id, {
      ...weather,
      fetchedAt: new Date()
    });

    return { ...saved, city, cached: false };
  }

  private async fetchCurrentWeather(latitude: number, longitude: number) {
    if (externalProviders.openWeatherApiKey) {
      return this.fetchOpenWeather(latitude, longitude);
    }

    return this.fetchOpenMeteo(latitude, longitude);
  }

  private async fetchOpenWeather(
    latitude: number,
    longitude: number
  ): Promise<WeatherResult> {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      units: "metric",
      lang: "pt_br",
      appid: externalProviders.openWeatherApiKey
    });

    const response = await fetch(
      `${externalProviders.openWeatherBaseUrl}/weather?${params.toString()}`
    );

    if (!response.ok) {
      throw new HttpError(502, "OpenWeather indisponivel no momento.");
    }

    const data = (await response.json()) as OpenWeatherResponse;

    if (typeof data.main?.temp !== "number") {
      throw new HttpError(502, "Resposta invalida do OpenWeather.");
    }

    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like ?? null,
      humidity: data.main.humidity ?? null,
      windSpeed: data.wind?.speed ?? null,
      description: data.weather?.[0]?.description ?? null,
      icon: data.weather?.[0]?.icon ?? null,
      provider: "openweather"
    };
  }

  private async fetchOpenMeteo(
    latitude: number,
    longitude: number
  ): Promise<WeatherResult> {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current:
        "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m",
      timezone: "auto"
    });

    const response = await fetch(
      `${externalProviders.openMeteoBaseUrl}/forecast?${params.toString()}`
    );

    if (!response.ok) {
      throw new HttpError(502, "Open-Meteo indisponivel no momento.");
    }

    const data = (await response.json()) as OpenMeteoResponse;

    if (typeof data.current?.temperature_2m !== "number") {
      throw new HttpError(502, "Resposta invalida do Open-Meteo.");
    }

    return {
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature ?? null,
      humidity: data.current.relative_humidity_2m ?? null,
      windSpeed: data.current.wind_speed_10m ?? null,
      description: "Tempo atual",
      icon: null,
      provider: "open-meteo"
    };
  }
}

export const weatherService = new WeatherService();
