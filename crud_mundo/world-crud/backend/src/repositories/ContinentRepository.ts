import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

export class ContinentRepository {
  create(data: Prisma.ContinentCreateInput) {
    return prisma.continent.create({ data });
  }

  list(search?: string) {
    return prisma.continent.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } }
            ]
          }
        : undefined,
      include: {
        countries: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, code: true, flagUrl: true }
        },
        _count: { select: { countries: true } }
      },
      orderBy: { name: "asc" }
    });
  }

  findById(id: string) {
    return prisma.continent.findUnique({
      where: { id },
      include: {
        countries: {
          orderBy: { name: "asc" },
          select: { id: true, name: true, code: true, capital: true, flagUrl: true }
        },
        _count: { select: { countries: true } }
      }
    });
  }

  findByCode(code: string) {
    return prisma.continent.findUnique({ where: { code } });
  }

  update(id: string, data: Prisma.ContinentUpdateInput) {
    return prisma.continent.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.$transaction(async tx => {
      // Cascata manual: remove clima, cidades e países antes do continente.
      await tx.weatherCache.deleteMany({
        where: { city: { country: { continentId: id } } }
      });
      await tx.city.deleteMany({
        where: { country: { continentId: id } }
      });
      await tx.country.deleteMany({
        where: { continentId: id }
      });
      return tx.continent.delete({ where: { id } });
    });
  }

  countCountries(id: string) {
    return prisma.country.count({ where: { continentId: id } });
  }

  count() {
    return prisma.continent.count();
  }
}

export const continentRepository = new ContinentRepository();
