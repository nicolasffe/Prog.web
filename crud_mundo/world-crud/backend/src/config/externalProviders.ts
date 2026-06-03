import { env } from "./env";

export const externalProviders = {
  restCountriesBaseUrl: "https://restcountries.com/v3.1",
  geonamesBaseUrl: "http://api.geonames.org",
  openMeteoBaseUrl: "https://api.open-meteo.com/v1",
  openWeatherBaseUrl: "https://api.openweathermap.org/data/2.5",
  openWeatherApiKey: env.OPENWEATHER_API_KEY,
  geonamesUsername: env.GEONAMES_USERNAME,
  weatherCacheMinutes: 30
};
