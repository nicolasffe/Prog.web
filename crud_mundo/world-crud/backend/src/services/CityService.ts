import { Prisma } from "@prisma/client";
import { cityRepository } from "../repositories/CityRepository";
import { countryRepository } from "../repositories/CountryRepository";
import { HttpError } from "../utils/HttpError";

export class CityService {
  async create(data: Prisma.CityUncheckedCreateInput) {
    await this.ensurePopulationFitsCountry(data.countryId, Number(data.population));
    return cityRepository.create(data);
  }

  list(filters: { search?: string; countryId?: string; continentId?: string }) {
    return cityRepository.list(filters);
  }

  latest(limit?: number) {
    return cityRepository.latest(limit);
  }

  async findById(id: string) {
    const city = await cityRepository.findById(id);

    if (!city) {
      throw new HttpError(404, "Cidade não encontrada.");
    }

    return city;
  }

  async update(id: string, data: Prisma.CityUncheckedUpdateInput) {
    const currentCity = await this.findById(id);
    const countryId = typeof data.countryId === "string" ? data.countryId : currentCity.countryId;
    const population = this.getPopulationValue(data.population, currentCity.population);

    await this.ensurePopulationFitsCountry(countryId, population);

    return cityRepository.update(id, data);
  }

  delete(id: string) {
    return cityRepository.delete(id);
  }

  private async ensurePopulationFitsCountry(countryId: string, cityPopulation: number) {
    const country = await countryRepository.findById(countryId);

    if (!country) {
      throw new HttpError(400, "País informado não existe.");
    }

    if (cityPopulation > country.population) {
      throw new HttpError(
        400,
        `A população da cidade não pode ser maior que a população do país (${country.population.toLocaleString("pt-BR")} habitantes).`
      );
    }
  }

  private getPopulationValue(value: Prisma.CityUncheckedUpdateInput["population"], fallback: number) {
    if (typeof value === "number") return value;
    if (value && typeof value === "object" && "set" in value && typeof value.set === "number") {
      return value.set;
    }
    return fallback;
  }
}

export const cityService = new CityService();
