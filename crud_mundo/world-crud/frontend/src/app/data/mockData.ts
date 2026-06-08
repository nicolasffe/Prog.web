import { Continent, Country, City } from './types';

export const continents: Continent[] = [
  { id: 'af', name: 'Africa', code: 'AF', description: "The world's second-largest and second-most populous continent, home to 54 countries.", color: '#f59e0b' },
  { id: 'as', name: 'Asia', code: 'AS', description: "Earth's largest and most populous continent, covering 30% of the world's total land area.", color: '#0ea5e9' },
  { id: 'eu', name: 'Europe', code: 'EU', description: 'A continent in the Northern and Eastern Hemispheres, home to 44 sovereign states.', color: '#8b5cf6' },
  { id: 'na', name: 'North America', code: 'NA', description: 'A continent in the Northern and Western Hemispheres, the third-largest by area.', color: '#10b981' },
  { id: 'sa', name: 'South America', code: 'SA', description: 'A continent in the Western Hemisphere, predominantly in the Southern Hemisphere.', color: '#ef4444' },
  { id: 'oc', name: 'Oceania', code: 'OC', description: 'A geographic region comprising Australasia, Melanesia, Micronesia, and Polynesia.', color: '#06b6d4' },
];

export const countries: Country[] = [
  // North America
  { id: 'us', name: 'United States', continentId: 'na', population: 331000000, language: 'English', currency: 'USD', capital: 'Washington D.C.', flag: '🇺🇸', lat: 37.09, lng: -95.71, area: 9833520, timezone: 'UTC-5', isoCode: 'US', isoNumeric: 840 },
  { id: 'ca', name: 'Canada', continentId: 'na', population: 38000000, language: 'English / French', currency: 'CAD', capital: 'Ottawa', flag: '🇨🇦', lat: 56.13, lng: -106.35, area: 9984670, timezone: 'UTC-5', isoCode: 'CA', isoNumeric: 124 },
  { id: 'mx', name: 'Mexico', continentId: 'na', population: 128000000, language: 'Spanish', currency: 'MXN', capital: 'Mexico City', flag: '🇲🇽', lat: 23.63, lng: -102.55, area: 1964375, timezone: 'UTC-6', isoCode: 'MX', isoNumeric: 484 },
  // South America
  { id: 'br', name: 'Brazil', continentId: 'sa', population: 214000000, language: 'Portuguese', currency: 'BRL', capital: 'Brasília', flag: '🇧🇷', lat: -14.24, lng: -51.93, area: 8515767, timezone: 'UTC-3', isoCode: 'BR', isoNumeric: 76 },
  { id: 'ar', name: 'Argentina', continentId: 'sa', population: 45000000, language: 'Spanish', currency: 'ARS', capital: 'Buenos Aires', flag: '🇦🇷', lat: -38.42, lng: -63.62, area: 2780400, timezone: 'UTC-3', isoCode: 'AR', isoNumeric: 32 },
  { id: 'co', name: 'Colombia', continentId: 'sa', population: 51000000, language: 'Spanish', currency: 'COP', capital: 'Bogotá', flag: '🇨🇴', lat: 4.57, lng: -74.30, area: 1141748, timezone: 'UTC-5', isoCode: 'CO', isoNumeric: 170 },
  // Europe
  { id: 'fr', name: 'France', continentId: 'eu', population: 67000000, language: 'French', currency: 'EUR', capital: 'Paris', flag: '🇫🇷', lat: 46.23, lng: 2.21, area: 551695, timezone: 'UTC+1', isoCode: 'FR', isoNumeric: 250 },
  { id: 'de', name: 'Germany', continentId: 'eu', population: 83000000, language: 'German', currency: 'EUR', capital: 'Berlin', flag: '🇩🇪', lat: 51.17, lng: 10.45, area: 357114, timezone: 'UTC+1', isoCode: 'DE', isoNumeric: 276 },
  { id: 'gb', name: 'United Kingdom', continentId: 'eu', population: 67000000, language: 'English', currency: 'GBP', capital: 'London', flag: '🇬🇧', lat: 55.38, lng: -3.44, area: 242495, timezone: 'UTC+0', isoCode: 'GB', isoNumeric: 826 },
  { id: 'it', name: 'Italy', continentId: 'eu', population: 60000000, language: 'Italian', currency: 'EUR', capital: 'Rome', flag: '🇮🇹', lat: 41.87, lng: 12.57, area: 301340, timezone: 'UTC+1', isoCode: 'IT', isoNumeric: 380 },
  { id: 'es', name: 'Spain', continentId: 'eu', population: 47000000, language: 'Spanish', currency: 'EUR', capital: 'Madrid', flag: '🇪🇸', lat: 40.46, lng: -3.75, area: 505990, timezone: 'UTC+1', isoCode: 'ES', isoNumeric: 724 },
  // Asia
  { id: 'cn', name: 'China', continentId: 'as', population: 1400000000, language: 'Mandarin', currency: 'CNY', capital: 'Beijing', flag: '🇨🇳', lat: 35.86, lng: 104.20, area: 9596960, timezone: 'UTC+8', isoCode: 'CN', isoNumeric: 156 },
  { id: 'jp', name: 'Japan', continentId: 'as', population: 125000000, language: 'Japanese', currency: 'JPY', capital: 'Tokyo', flag: '🇯🇵', lat: 36.20, lng: 138.25, area: 377975, timezone: 'UTC+9', isoCode: 'JP', isoNumeric: 392 },
  { id: 'in', name: 'India', continentId: 'as', population: 1380000000, language: 'Hindi', currency: 'INR', capital: 'New Delhi', flag: '🇮🇳', lat: 20.59, lng: 78.96, area: 3287263, timezone: 'UTC+5:30', isoCode: 'IN', isoNumeric: 356 },
  { id: 'kr', name: 'South Korea', continentId: 'as', population: 51000000, language: 'Korean', currency: 'KRW', capital: 'Seoul', flag: '🇰🇷', lat: 35.91, lng: 127.77, area: 100210, timezone: 'UTC+9', isoCode: 'KR', isoNumeric: 410 },
  // Africa
  { id: 'ng', name: 'Nigeria', continentId: 'af', population: 206000000, language: 'English', currency: 'NGN', capital: 'Abuja', flag: '🇳🇬', lat: 9.08, lng: 8.68, area: 923768, timezone: 'UTC+1', isoCode: 'NG', isoNumeric: 566 },
  { id: 'eg', name: 'Egypt', continentId: 'af', population: 102000000, language: 'Arabic', currency: 'EGP', capital: 'Cairo', flag: '🇪🇬', lat: 26.82, lng: 30.80, area: 1001449, timezone: 'UTC+2', isoCode: 'EG', isoNumeric: 818 },
  { id: 'za', name: 'South Africa', continentId: 'af', population: 60000000, language: 'Zulu / English', currency: 'ZAR', capital: 'Cape Town', flag: '🇿🇦', lat: -30.56, lng: 22.94, area: 1219090, timezone: 'UTC+2', isoCode: 'ZA', isoNumeric: 710 },
  // Oceania
  { id: 'au', name: 'Australia', continentId: 'oc', population: 26000000, language: 'English', currency: 'AUD', capital: 'Canberra', flag: '🇦🇺', lat: -25.27, lng: 133.78, area: 7692024, timezone: 'UTC+10', isoCode: 'AU', isoNumeric: 36 },
  { id: 'nz', name: 'New Zealand', continentId: 'oc', population: 5000000, language: 'English / Māori', currency: 'NZD', capital: 'Wellington', flag: '🇳🇿', lat: -40.90, lng: 174.89, area: 268021, timezone: 'UTC+12', isoCode: 'NZ', isoNumeric: 554 },
];

export const cities: City[] = [
  // USA
  { id: 'nyc', name: 'New York City', countryId: 'us', population: 8400000, lat: 40.71, lng: -74.00, isCapital: false },
  { id: 'la', name: 'Los Angeles', countryId: 'us', population: 4000000, lat: 34.05, lng: -118.24, isCapital: false },
  { id: 'chi', name: 'Chicago', countryId: 'us', population: 2700000, lat: 41.88, lng: -87.63, isCapital: false },
  { id: 'dc', name: 'Washington D.C.', countryId: 'us', population: 705000, lat: 38.91, lng: -77.04, isCapital: true },
  // Canada
  { id: 'tor', name: 'Toronto', countryId: 'ca', population: 2930000, lat: 43.65, lng: -79.38, isCapital: false },
  { id: 'van', name: 'Vancouver', countryId: 'ca', population: 631000, lat: 49.28, lng: -123.12, isCapital: false },
  { id: 'ott', name: 'Ottawa', countryId: 'ca', population: 994000, lat: 45.42, lng: -75.70, isCapital: true },
  // Mexico
  { id: 'mxc', name: 'Mexico City', countryId: 'mx', population: 9200000, lat: 19.43, lng: -99.13, isCapital: true },
  { id: 'gdl', name: 'Guadalajara', countryId: 'mx', population: 1500000, lat: 20.66, lng: -103.35, isCapital: false },
  // Brazil
  { id: 'sao', name: 'São Paulo', countryId: 'br', population: 12325000, lat: -23.55, lng: -46.63, isCapital: false },
  { id: 'rio', name: 'Rio de Janeiro', countryId: 'br', population: 6748000, lat: -22.91, lng: -43.17, isCapital: false },
  { id: 'bsb', name: 'Brasília', countryId: 'br', population: 3055000, lat: -15.78, lng: -47.93, isCapital: true },
  // Argentina
  { id: 'bue', name: 'Buenos Aires', countryId: 'ar', population: 3054000, lat: -34.61, lng: -58.38, isCapital: true },
  { id: 'cba', name: 'Córdoba', countryId: 'ar', population: 1391000, lat: -31.42, lng: -64.18, isCapital: false },
  // Colombia
  { id: 'bog', name: 'Bogotá', countryId: 'co', population: 7413000, lat: 4.71, lng: -74.07, isCapital: true },
  { id: 'med', name: 'Medellín', countryId: 'co', population: 2529000, lat: 6.25, lng: -75.56, isCapital: false },
  // France
  { id: 'par', name: 'Paris', countryId: 'fr', population: 2148000, lat: 48.85, lng: 2.35, isCapital: true },
  { id: 'lyo', name: 'Lyon', countryId: 'fr', population: 522000, lat: 45.75, lng: 4.85, isCapital: false },
  { id: 'mrs', name: 'Marseille', countryId: 'fr', population: 870000, lat: 43.30, lng: 5.37, isCapital: false },
  // Germany
  { id: 'ber', name: 'Berlin', countryId: 'de', population: 3645000, lat: 52.52, lng: 13.41, isCapital: true },
  { id: 'mun', name: 'Munich', countryId: 'de', population: 1472000, lat: 48.14, lng: 11.58, isCapital: false },
  { id: 'ham', name: 'Hamburg', countryId: 'de', population: 1841000, lat: 53.55, lng: 10.00, isCapital: false },
  // UK
  { id: 'lon', name: 'London', countryId: 'gb', population: 8982000, lat: 51.51, lng: -0.13, isCapital: true },
  { id: 'man', name: 'Manchester', countryId: 'gb', population: 553000, lat: 53.48, lng: -2.24, isCapital: false },
  { id: 'bir', name: 'Birmingham', countryId: 'gb', population: 1145000, lat: 52.49, lng: -1.90, isCapital: false },
  // Italy
  { id: 'rom', name: 'Rome', countryId: 'it', population: 2873000, lat: 41.90, lng: 12.50, isCapital: true },
  { id: 'mil', name: 'Milan', countryId: 'it', population: 1352000, lat: 45.46, lng: 9.19, isCapital: false },
  // Spain
  { id: 'mad', name: 'Madrid', countryId: 'es', population: 3223000, lat: 40.42, lng: -3.70, isCapital: true },
  { id: 'bcn', name: 'Barcelona', countryId: 'es', population: 1620000, lat: 41.39, lng: 2.15, isCapital: false },
  // China
  { id: 'bei', name: 'Beijing', countryId: 'cn', population: 21540000, lat: 39.91, lng: 116.39, isCapital: true },
  { id: 'sha', name: 'Shanghai', countryId: 'cn', population: 24280000, lat: 31.23, lng: 121.47, isCapital: false },
  { id: 'gua', name: 'Guangzhou', countryId: 'cn', population: 13500000, lat: 23.13, lng: 113.26, isCapital: false },
  // Japan
  { id: 'tok', name: 'Tokyo', countryId: 'jp', population: 13960000, lat: 35.68, lng: 139.69, isCapital: true },
  { id: 'osa', name: 'Osaka', countryId: 'jp', population: 2725000, lat: 34.69, lng: 135.50, isCapital: false },
  { id: 'kyo', name: 'Kyoto', countryId: 'jp', population: 1468000, lat: 35.01, lng: 135.77, isCapital: false },
  // India
  { id: 'del', name: 'New Delhi', countryId: 'in', population: 32900000, lat: 28.61, lng: 77.21, isCapital: true },
  { id: 'mum', name: 'Mumbai', countryId: 'in', population: 20700000, lat: 19.08, lng: 72.88, isCapital: false },
  { id: 'ban', name: 'Bangalore', countryId: 'in', population: 12400000, lat: 12.97, lng: 77.59, isCapital: false },
  // South Korea
  { id: 'seo', name: 'Seoul', countryId: 'kr', population: 9776000, lat: 37.57, lng: 126.98, isCapital: true },
  { id: 'bus', name: 'Busan', countryId: 'kr', population: 3404000, lat: 35.18, lng: 129.08, isCapital: false },
  // Nigeria
  { id: 'lag', name: 'Lagos', countryId: 'ng', population: 14800000, lat: 6.52, lng: 3.38, isCapital: false },
  { id: 'abu', name: 'Abuja', countryId: 'ng', population: 3464000, lat: 9.08, lng: 7.40, isCapital: true },
  // Egypt
  { id: 'cai', name: 'Cairo', countryId: 'eg', population: 10100000, lat: 30.04, lng: 31.24, isCapital: true },
  { id: 'ale', name: 'Alexandria', countryId: 'eg', population: 5200000, lat: 31.20, lng: 29.92, isCapital: false },
  // South Africa
  { id: 'cap', name: 'Cape Town', countryId: 'za', population: 4618000, lat: -33.93, lng: 18.42, isCapital: true },
  { id: 'joh', name: 'Johannesburg', countryId: 'za', population: 5635000, lat: -26.20, lng: 28.04, isCapital: false },
  // Australia
  { id: 'syd', name: 'Sydney', countryId: 'au', population: 5312000, lat: -33.87, lng: 151.21, isCapital: false },
  { id: 'mel', name: 'Melbourne', countryId: 'au', population: 5078000, lat: -37.81, lng: 144.96, isCapital: false },
  { id: 'can', name: 'Canberra', countryId: 'au', population: 454000, lat: -35.28, lng: 149.13, isCapital: true },
  // New Zealand
  { id: 'auc', name: 'Auckland', countryId: 'nz', population: 1657000, lat: -36.86, lng: 174.76, isCapital: false },
  { id: 'wel', name: 'Wellington', countryId: 'nz', population: 215000, lat: -41.29, lng: 174.78, isCapital: true },
];
