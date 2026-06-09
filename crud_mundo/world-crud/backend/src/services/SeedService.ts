import { prisma } from "../prisma/client";

const continents = [
  {
    name: "América do Sul",
    code: "SA",
    description: "Continente ao sul das Américas, com grande diversidade natural."
  },
  {
    name: "América do Norte",
    code: "NA",
    description: "Região continental com Canadá, Estados Unidos, México e territórios."
  },
  {
    name: "Europa",
    code: "EU",
    description: "Continente histórico com alta densidade urbana e cultural."
  },
  {
    name: "Ásia",
    code: "AS",
    description: "Maior continente do planeta em área e população."
  },
  {
    name: "África",
    code: "AF",
    description: "Continente de enorme diversidade geográfica, cultural e climática."
  },
  {
    name: "Oceania",
    code: "OC",
    description: "Região formada por Austrália, Nova Zelândia e ilhas do Pacífico."
  },
  {
    name: "Antártida",
    code: "AN",
    description: "Continente polar dedicado majoritariamente a pesquisa científica."
  }
];

const countries = [
  {
    name: "Brasil",
    officialName: "República Federativa do Brasil",
    code: "BR",
    capital: "Brasília",
    region: "Americas",
    subregion: "South America",
    population: 203080756,
    language: "Português",
    currency: "BRL",
    area: 8515767,
    latitude: -10,
    longitude: -55,
    flagUrl: "https://flagcdn.com/br.svg",
    continentCode: "SA",
    cities: [
      {
        name: "Sao Paulo",
        state: "Sao Paulo",
        latitude: -23.5505,
        longitude: -46.6333,
        population: 11451245,
        timezone: "America/Sao_Paulo"
      },
      {
        name: "Rio de Janeiro",
        state: "Rio de Janeiro",
        latitude: -22.9068,
        longitude: -43.1729,
        population: 6211223,
        timezone: "America/Sao_Paulo"
      },
      {
        name: "Brasilia",
        state: "Distrito Federal",
        latitude: -15.7939,
        longitude: -47.8828,
        population: 2817381,
        timezone: "America/Sao_Paulo"
      },
      {
        name: "Manaus",
        state: "Amazonas",
        latitude: -3.119,
        longitude: -60.0217,
        population: 2063689,
        timezone: "America/Manaus"
      },
      {
        name: "Salvador",
        state: "Bahia",
        latitude: -12.9777,
        longitude: -38.5016,
        population: 2417678,
        timezone: "America/Bahia"
      },
      {
        name: "Recife",
        state: "Pernambuco",
        latitude: -8.0476,
        longitude: -34.877,
        population: 1488920,
        timezone: "America/Recife"
      },
      {
        name: "Porto Alegre",
        state: "Rio Grande do Sul",
        latitude: -30.0346,
        longitude: -51.2177,
        population: 1332845,
        timezone: "America/Sao_Paulo"
      }
    ]
  },
  {
    name: "Estados Unidos",
    officialName: "United States of America",
    code: "US",
    capital: "Washington",
    region: "Americas",
    subregion: "North America",
    population: 334914895,
    language: "Inglês",
    currency: "USD",
    area: 9833517,
    latitude: 38,
    longitude: -97,
    flagUrl: "https://flagcdn.com/us.svg",
    continentCode: "NA",
    cities: [
      {
        name: "New York",
        state: "New York",
        latitude: 40.7128,
        longitude: -74.006,
        population: 8804190,
        timezone: "America/New_York"
      },
      {
        name: "Los Angeles",
        state: "California",
        latitude: 34.0522,
        longitude: -118.2437,
        population: 3898747,
        timezone: "America/Los_Angeles"
      },
      {
        name: "Washington",
        state: "District of Columbia",
        latitude: 38.9072,
        longitude: -77.0369,
        population: 689545,
        timezone: "America/New_York"
      },
      {
        name: "Chicago",
        state: "Illinois",
        latitude: 41.8781,
        longitude: -87.6298,
        population: 2746388,
        timezone: "America/Chicago"
      },
      {
        name: "Houston",
        state: "Texas",
        latitude: 29.7604,
        longitude: -95.3698,
        population: 2304580,
        timezone: "America/Chicago"
      },
      {
        name: "Miami",
        state: "Florida",
        latitude: 25.7617,
        longitude: -80.1918,
        population: 442241,
        timezone: "America/New_York"
      },
      {
        name: "Seattle",
        state: "Washington",
        latitude: 47.6062,
        longitude: -122.3321,
        population: 737015,
        timezone: "America/Los_Angeles"
      }
    ]
  },
  {
    name: "França",
    officialName: "République française",
    code: "FR",
    capital: "Paris",
    region: "Europe",
    subregion: "Western Europe",
    population: 68042591,
    language: "Frances",
    currency: "EUR",
    area: 551695,
    latitude: 46.2276,
    longitude: 2.2137,
    flagUrl: "https://flagcdn.com/fr.svg",
    continentCode: "EU",
    cities: [
      {
        name: "Paris",
        state: "Ile-de-France",
        latitude: 48.8566,
        longitude: 2.3522,
        population: 2102650,
        timezone: "Europe/Paris"
      },
      {
        name: "Lyon",
        state: "Auvergne-Rhone-Alpes",
        latitude: 45.764,
        longitude: 4.8357,
        population: 522969,
        timezone: "Europe/Paris"
      },
      {
        name: "Marseille",
        state: "Provence-Alpes-Cote d'Azur",
        latitude: 43.2965,
        longitude: 5.3698,
        population: 873076,
        timezone: "Europe/Paris"
      },
      {
        name: "Nice",
        state: "Provence-Alpes-Cote d'Azur",
        latitude: 43.7102,
        longitude: 7.262,
        population: 343477,
        timezone: "Europe/Paris"
      },
      {
        name: "Toulouse",
        state: "Occitanie",
        latitude: 43.6047,
        longitude: 1.4442,
        population: 504078,
        timezone: "Europe/Paris"
      },
      {
        name: "Lille",
        state: "Hauts-de-France",
        latitude: 50.6292,
        longitude: 3.0573,
        population: 236234,
        timezone: "Europe/Paris"
      }
    ]
  },
  {
    name: "Japão",
    officialName: "Japan",
    code: "JP",
    capital: "Tokyo",
    region: "Ásia",
    subregion: "Eastern Asia",
    population: 124516650,
    language: "Japonês",
    currency: "JPY",
    area: 377975,
    latitude: 36.2048,
    longitude: 138.2529,
    flagUrl: "https://flagcdn.com/jp.svg",
    continentCode: "AS",
    cities: [
      {
        name: "Tokyo",
        state: "Tokyo",
        latitude: 35.6762,
        longitude: 139.6503,
        population: 13960000,
        timezone: "Asia/Tokyo"
      },
      {
        name: "Osaka",
        state: "Osaka",
        latitude: 34.6937,
        longitude: 135.5023,
        population: 2752000,
        timezone: "Asia/Tokyo"
      },
      {
        name: "Sapporo",
        state: "Hokkaido",
        latitude: 43.0618,
        longitude: 141.3545,
        population: 1973395,
        timezone: "Asia/Tokyo"
      },
      {
        name: "Kyoto",
        state: "Kyoto",
        latitude: 35.0116,
        longitude: 135.7681,
        population: 1463723,
        timezone: "Asia/Tokyo"
      },
      {
        name: "Fukuoka",
        state: "Fukuoka",
        latitude: 33.5902,
        longitude: 130.4017,
        population: 1612392,
        timezone: "Asia/Tokyo"
      },
      {
        name: "Naha",
        state: "Okinawa",
        latitude: 26.2124,
        longitude: 127.6792,
        population: 317625,
        timezone: "Asia/Tokyo"
      }
    ]
  },
  {
    name: "Argentina",
    officialName: "República Argentina",
    code: "AR",
    capital: "Buenos Aires",
    region: "Americas",
    subregion: "South America",
    population: 46044703,
    language: "Espanhol",
    currency: "ARS",
    area: 2780400,
    latitude: -38.4161,
    longitude: -63.6167,
    flagUrl: "https://flagcdn.com/ar.svg",
    continentCode: "SA",
    cities: [
      {
        name: "Buenos Aires",
        state: "Buenos Aires",
        latitude: -34.6037,
        longitude: -58.3816,
        population: 3120612,
        timezone: "America/Argentina/Buenos_Aires"
      },
      {
        name: "Cordoba",
        state: "Cordoba",
        latitude: -31.4201,
        longitude: -64.1888,
        population: 1565112,
        timezone: "America/Argentina/Cordoba"
      },
      {
        name: "Rosario",
        state: "Santa Fe",
        latitude: -32.9442,
        longitude: -60.6505,
        population: 1342369,
        timezone: "America/Argentina/Cordoba"
      },
      {
        name: "Mendoza",
        state: "Mendoza",
        latitude: -32.8895,
        longitude: -68.8458,
        population: 115041,
        timezone: "America/Argentina/Mendoza"
      },
      {
        name: "Ushuaia",
        state: "Tierra del Fuego",
        latitude: -54.8019,
        longitude: -68.303,
        population: 82000,
        timezone: "America/Argentina/Ushuaia"
      }
    ]
  },
  {
    name: "Alemanha",
    officialName: "Federal Republic of Germany",
    code: "DE",
    capital: "Berlin",
    region: "Europe",
    subregion: "Western Europe",
    population: 84482267,
    language: "Alemão",
    currency: "EUR",
    area: 357114,
    latitude: 51.1657,
    longitude: 10.4515,
    flagUrl: "https://flagcdn.com/de.svg",
    continentCode: "EU",
    cities: [
      {
        name: "Berlin",
        state: "Berlin",
        latitude: 52.52,
        longitude: 13.405,
        population: 3850809,
        timezone: "Europe/Berlin"
      },
      {
        name: "Hamburg",
        state: "Hamburg",
        latitude: 53.5511,
        longitude: 9.9937,
        population: 1892122,
        timezone: "Europe/Berlin"
      },
      {
        name: "Munich",
        state: "Bavaria",
        latitude: 48.1351,
        longitude: 11.582,
        population: 1512491,
        timezone: "Europe/Berlin"
      },
      {
        name: "Cologne",
        state: "North Rhine-Westphalia",
        latitude: 50.9375,
        longitude: 6.9603,
        population: 1084831,
        timezone: "Europe/Berlin"
      },
      {
        name: "Frankfurt",
        state: "Hesse",
        latitude: 50.1109,
        longitude: 8.6821,
        population: 773068,
        timezone: "Europe/Berlin"
      }
    ]
  }
];

export class SeedService {
  async seedContinents() {
    const results = [];

    for (const continent of continents) {
      results.push(
        await prisma.continent.upsert({
          where: { code: continent.code },
          update: continent,
          create: continent
        })
      );
    }

    return results;
  }

  async seedCountries() {
    await this.seedContinents();
    const results = [];

    for (const countrySeed of countries) {
      const continent = await prisma.continent.findUniqueOrThrow({
        where: { code: countrySeed.continentCode }
      });

      const { cities, continentCode: _continentCode, ...countryData } = countrySeed;

      const country = await prisma.country.upsert({
        where: { code: countryData.code },
        update: {
          ...countryData,
          continentId: continent.id
        },
        create: {
          ...countryData,
          continentId: continent.id
        }
      });

      for (const citySeed of cities) {
        const existingCity = await prisma.city.findFirst({
          where: { name: citySeed.name, countryId: country.id }
        });

        if (existingCity) {
          await prisma.city.update({
            where: { id: existingCity.id },
            data: citySeed
          });
        } else {
          await prisma.city.create({
            data: {
              ...citySeed,
              countryId: country.id
            }
          });
        }
      }

      results.push(country);
    }

    return results;
  }
}

export const seedService = new SeedService();
