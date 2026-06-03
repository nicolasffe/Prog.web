import { cityRepository } from "../repositories/CityRepository";
import { continentRepository } from "../repositories/ContinentRepository";
import { countryRepository } from "../repositories/CountryRepository";

export class DashboardService {
  async stats() {
    const [continents, countries, cities, latestCities] = await Promise.all([
      continentRepository.count(),
      countryRepository.count(),
      cityRepository.count(),
      cityRepository.latest(5)
    ]);

    return {
      totals: {
        continents,
        countries,
        cities
      },
      latestCities
    };
  }
}

export const dashboardService = new DashboardService();
