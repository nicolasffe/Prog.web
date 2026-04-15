// Define a estrutura de dados usada para representar um filme no sistema.
export interface Filme {
  titulo: string;
  anoLancamento: number;
  genero: string;
  duracaoMinutos: number;
  avaliacao?: number;
}

// Define quais campos podem ser usados nas buscas de filmes.
export type CampoBusca = "titulo" | "genero";

// Define quais campos podem ser usados para ordenar a lista de filmes.
export type CampoOrdenacao = "titulo" | "anoLancamento" | "avaliacao";
