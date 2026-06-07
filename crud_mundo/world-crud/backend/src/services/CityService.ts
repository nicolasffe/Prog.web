import { Prisma } from "@prisma/client";
import { cityRepository } from "../repositories/CityRepository";
import { countryRepository } from "../repositories/CountryRepository";
import { HttpError } from "../utils/HttpError";

export class CityService {
  async create(data: Prisma.CityUncheckedCreateInput) {
    await this.ensureCountry(data.countryId);
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
      throw new HttpError(404, "Cidade nao encontrada.");
    }

    return city;
  }

  async update(id: string, data: Prisma.CityUncheckedUpdateInput) {
    if (typeof data.countryId === "string") {
      await this.ensureCountry(data.countryId);
    }

    return cityRepository.update(id, data);
  }

  delete(id: string) {
    return cityRepository.delete(id);
  }

  private async ensureCountry(countryId: string) {
    const country = await countryRepository.findById(countryId);

    if (!country) {
      throw new HttpError(400, "Pais informado nao existe.");
    }
  }
}

export const cityService = new CityService();
