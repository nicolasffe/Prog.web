import { Prisma } from "@prisma/client";
import { continentRepository } from "../repositories/ContinentRepository";
import { countryRepository } from "../repositories/CountryRepository";
import { HttpError } from "../utils/HttpError";

export class CountryService {
  async create(data: Prisma.CountryUncheckedCreateInput) {
    await this.ensureContinent(data.continentId);
    return countryRepository.create(this.normalize(data));
  }

  list(filters: { search?: string; continentId?: string }) {
    return countryRepository.list(filters);
  }

  async findById(id: string) {
    const country = await countryRepository.findById(id);

    if (!country) {
      throw new HttpError(404, "Pais nao encontrado.");
    }

    return country;
  }

  async update(id: string, data: Prisma.CountryUncheckedUpdateInput) {
    if (typeof data.continentId === "string") {
      await this.ensureContinent(data.continentId);
    }

    return countryRepository.update(id, this.normalize(data));
  }

  delete(id: string) {
    return countryRepository.delete(id);
  }

  private async ensureContinent(continentId: string) {
    const continent = await continentRepository.findById(continentId);

    if (!continent) {
      throw new HttpError(400, "Continente informado nao existe.");
    }
  }

  private normalize<T extends Prisma.CountryUncheckedCreateInput | Prisma.CountryUncheckedUpdateInput>(
    data: T
  ): T {
    return {
      ...data,
      code: typeof data.code === "string" ? data.code.toUpperCase() : data.code,
      flagUrl: data.flagUrl === "" ? null : data.flagUrl
    };
  }
}

export const countryService = new CountryService();
