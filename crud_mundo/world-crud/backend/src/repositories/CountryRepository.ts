import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

type CountryFilters = {
  search?: string;
  continentId?: string;
};

export class CountryRepository {
  create(data: Prisma.CountryUncheckedCreateInput) {
    return prisma.country.create({
      data,
      include: { continent: true, _count: { select: { cities: true } } }
    });
  }

  list(filters: CountryFilters = {}) {
    return prisma.country.findMany({
      where: {
        continentId: filters.continentId || undefined,
        OR: filters.search
          ? [
              { name: { contains: filters.search, mode: "insensitive" } },
              { code: { contains: filters.search, mode: "insensitive" } },
              { capital: { contains: filters.search, mode: "insensitive" } }
            ]
          : undefined
      },
      include: { continent: true, _count: { select: { cities: true } } },
      orderBy: { name: "asc" }
    });
  }

  findById(id: string) {
    return prisma.country.findUnique({
      where: { id },
      include: {
        continent: true,
        cities: { orderBy: { name: "asc" } },
        _count: { select: { cities: true } }
      }
    });
  }

  findByCode(code: string) {
    return prisma.country.findUnique({ where: { code } });
  }

  update(id: string, data: Prisma.CountryUncheckedUpdateInput) {
    return prisma.country.update({
      where: { id },
      data,
      include: { continent: true, _count: { select: { cities: true } } }
    });
  }

  delete(id: string) {
    return prisma.$transaction(async tx => {
      // Cascata manual: remove clima e cidades antes do país.
      await tx.weatherCache.deleteMany({
        where: { city: { countryId: id } }
      });
      await tx.city.deleteMany({
        where: { countryId: id }
      });
      return tx.country.delete({ where: { id } });
    });
  }

  count() {
    return prisma.country.count();
  }
}

export const countryRepository = new CountryRepository();
