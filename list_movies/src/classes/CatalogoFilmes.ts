import { CampoBusca, CampoOrdenacao, Filme } from "../types/filme";
import { normalizarTexto, validarFilme, validarTextoNaoVazio } from "../utils/validacoes";

export class CatalogoFilmes {
  private filmes: Filme[];

  constructor(filmesIniciais: Filme[] = []) {
    // Inicializa o catálogo validando os filmes recebidos
    this.filmes = filmesIniciais.map((filme) => validarFilme(filme));
  }

  adicionarFilme(filme: Filme): Filme {
    // Valida o filme e adiciona ao catálogo se n tiver titulos duplicados
    const filmeValidado = validarFilme(filme);
    const filmeExistente = this.buscarPorTituloExato(filmeValidado.titulo);

    if (filmeExistente) {
      throw new Error("Já existe um filme cadastrado com esse título.");
    }

    this.filmes.push(filmeValidado);
    return filmeValidado;
  }

  listarFilmes(): Filme[] {
    // Retorna uma cópia da lista de filmes cadastrados
    return [...this.filmes];
  }

  buscarFilmes(termo: string, campo: CampoBusca): Filme[] {
    // Procura filmes por título ou gênero
    const termoNormalizado = normalizarTexto(validarTextoNaoVazio(termo, campo));

    return this.filmes.filter((filme) =>
      normalizarTexto(filme[campo]).includes(termoNormalizado)
    );
  }

  removerFilmePorTitulo(titulo: string): boolean {
    // Remove do catálogo o filme com o título informado e mostra se a remoção funcionou
    const tituloNormalizado = normalizarTexto(validarTextoNaoVazio(titulo, "título"));
    const quantidadeAntes = this.filmes.length;

    this.filmes = this.filmes.filter(
      (filme) => normalizarTexto(filme.titulo) !== tituloNormalizado
    );

    return this.filmes.length < quantidadeAntes;
  }

  ordenarFilmesPor(campo: CampoOrdenacao): Filme[] {
    // Retorna uma nova lista de filmes ordenada pelo campo escolhido (título, ano de lançamento ou avaliação)
    const filmesOrdenados = [...this.filmes];

    filmesOrdenados.sort((filmeA, filmeB) => {
      if (campo === "titulo") {
        return filmeA.titulo.localeCompare(filmeB.titulo, "pt-BR");
      }

      if (campo === "avaliacao") {
        return (filmeB.avaliacao ?? -1) - (filmeA.avaliacao ?? -1);
      }

      return filmeA.anoLancamento - filmeB.anoLancamento;
    });

    return filmesOrdenados;
  }

  private buscarPorTituloExato(titulo: string): Filme | undefined {
    // Busca um filme com título exatamente igual
    const tituloNormalizado = normalizarTexto(titulo);

    return this.filmes.find((filme) => normalizarTexto(filme.titulo) === tituloNormalizado);
  }
}
