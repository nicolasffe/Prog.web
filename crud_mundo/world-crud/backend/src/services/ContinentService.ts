import { Prisma } from "@prisma/client";
import { continentRepository } from "../repositories/ContinentRepository";
import { HttpError } from "../utils/HttpError";

export class ContinentService {
  create(data: Prisma.ContinentCreateInput) {
    return continentRepository.create({
      ...data,
      code: data.code.toUpperCase()
    });
  }

  list(search?: string) {
    return continentRepository.list(search);
  }

  async findById(id: string) {
    const continent = await continentRepository.findById(id);

    if (!continent) {
      throw new HttpError(404, "Continente não encontrado.");
    }

    return continent;
  }

  update(id: string, data: Prisma.ContinentUpdateInput) {
    return continentRepository.update(id, {
      ...data,
      code: typeof data.code === "string" ? data.code.toUpperCase() : data.code
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return continentRepository.delete(id);
  }
}

export const continentService = new ContinentService();
