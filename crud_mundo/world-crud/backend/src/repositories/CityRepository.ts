import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

type CityFilters = {
  search?: string;
  countryId?: string;
  continentId?: string;
};

export class CityRepository {
  create(data: Prisma.CityUncheckedCreateInput) {
    return prisma.city.create({
      data,
      include: { country: { include: { continent: true } }, weatherCache: true }
    });
  }

  list(filters: CityFilters = {}) {
    return prisma.city.findMany({
      where: {
        countryId: filters.countryId || undefined,
        country: filters.continentId
          ? { continentId: filters.continentId }
          : undefined,
        OR: filters.search
          ? [
              { name: { contains: filters.search, mode: "insensitive" } },
              { state: { contains: filters.search, mode: "insensitive" } },
              { timezone: { contains: filters.search, mode: "insensitive" } }
            ]
          : undefined
      },
      include: { country: { include: { continent: true } }, weatherCache: true },
      orderBy: { name: "asc" }
    });
  }

  latest(limit = 5) {
    return prisma.city.findMany({
      take: limit,
      include: { country: { include: { continent: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  findById(id: string) {
    return prisma.city.findUnique({
      where: { id },
      include: { country: { include: { continent: true } }, weatherCache: true }
    });
  }

  update(id: string, data: Prisma.CityUncheckedUpdateInput) {
    return prisma.city.update({
      where: { id },
      data,
      include: { country: { include: { continent: true } }, weatherCache: true }
    });
  }

  delete(id: string) {
    return prisma.city.delete({ where: { id } });
  }

  count() {
    return prisma.city.count();
  }
}

export const cityRepository = new CityRepository();
