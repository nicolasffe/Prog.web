import { City, Country } from '../data/types';

export function validateCityPopulation(
  city: Pick<City, 'countryId' | 'population'>,
  countries: Country[]
) {
  const country = countries.find(item => item.id === city.countryId);
  if (!country) return 'Selecione um país válido para a cidade.';
  if (city.population > country.population) {
    return `A população da cidade não pode ser maior que a população de ${country.name} (${country.population.toLocaleString('pt-BR')} habitantes).`;
  }
  return null;
}
