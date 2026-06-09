import { externalProviders } from "../config/externalProviders";
import { HttpError } from "../utils/HttpError";

type RestCountry = {
  name?: {
    common?: string;
    official?: string;
  };
  cca2?: string;
  cca3?: string;
  capital?: string[];
  region?: string;
  subregion?: string;
  population?: number;
  area?: number;
  latlng?: number[];
  flags?: {
    png?: string;
    svg?: string;
    alt?: string;
  };
  currencies?: Record<string, { name?: string; symbol?: string }>;
  languages?: Record<string, string>;
  timezones?: string[];
  maps?: {
    googleMaps?: string;
    openStreetMaps?: string;
  };
};

type GeoNamesResponse = {
  geonames?: Array<{
    geonameId: number;
    name: string;
    adminName1?: string;
    countryName?: string;
    countryCode?: string;
    lat?: string;
    lng?: string;
    population?: number;
    timezone?: { timeZoneId?: string };
  }>;
  status?: { message?: string };
};

export class ExternalGeoService {
  async getCountries() {
    const url = `${externalProviders.restCountriesBaseUrl}/all?fields=name,cca2,capital,region,subregion,flags,currencies,languages,timezones,maps`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new HttpError(502, "REST Countries indisponivel no momento.");
    }

    const countries = (await response.json()) as RestCountry[];

    return countries
      .map((country) => ({
        name: country.name?.common ?? "",
        officialName: country.name?.official ?? "",
        code: country.cca2 ?? country.cca3 ?? "",
        capital: country.capital?.[0] ?? "",
        region: country.region ?? "",
        subregion: country.subregion ?? "",
        population: country.population ?? null,
        area: country.area ?? null,
        latitude: country.latlng?.[0] ?? null,
        longitude: country.latlng?.[1] ?? null,
        flagUrl: country.flags?.svg ?? country.flags?.png ?? "",
        flagAlt: country.flags?.alt ?? "",
        currencies: Object.entries(country.currencies ?? {}).map(([code, value]) => ({
          code,
          name: value.name ?? code,
          symbol: value.symbol ?? ""
        })),
        languages: Object.values(country.languages ?? {}),
        timezones: country.timezones ?? [],
        maps: {
          googleMaps: country.maps?.googleMaps ?? "",
          openStreetMaps: country.maps?.openStreetMaps ?? ""
        },
        suggestedContinentCode: this.regionToContinentCode(country.region)
      }))
      .filter((country) => country.name && country.code)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async searchCities(query: string, countryCode?: string) {
    if (!externalProviders.geonamesUsername) {
      throw new HttpError(
        400,
        "GEONAMES_USERNAME não configurado no backend."
      );
    }

    const params = new URLSearchParams({
      q: query,
      maxRows: "10",
      featureClass: "P",
      style: "FULL",
      username: externalProviders.geonamesUsername
    });

    if (countryCode) {
      params.set("country", countryCode);
    }

    const response = await fetch(
      `${externalProviders.geonamesBaseUrl}/searchJSON?${params.toString()}`
    );

    if (!response.ok) {
      throw new HttpError(502, "GeoNames indisponivel no momento.");
    }

    const data = (await response.json()) as GeoNamesResponse;

    if (data.status?.message) {
      throw new HttpError(502, data.status.message);
    }

    return (data.geonames ?? []).map((city) => ({
      providerId: city.geonameId,
      name: city.name,
      state: city.adminName1 ?? "",
      countryName: city.countryName ?? "",
      countryCode: city.countryCode ?? "",
      latitude: city.lat ? Number(city.lat) : null,
      longitude: city.lng ? Number(city.lng) : null,
      population: city.population ?? null,
      timezone: city.timezone?.timeZoneId ?? ""
    }));
  }

  private regionToContinentCode(region?: string) {
    const normalized = region?.toLowerCase();

    if (normalized === "africa") return "AF";
    if (normalized === "americas") return "AM";
    if (normalized === "asia") return "AS";
    if (normalized === "europe") return "EU";
    if (normalized === "oceania") return "OC";
    if (normalized === "antarctic") return "AN";

    return "";
  }
}

export const externalGeoService = new ExternalGeoService();
