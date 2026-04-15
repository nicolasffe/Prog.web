import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { CatalogoFilmes } from "./classes/CatalogoFilmes";
import { filmesIniciais } from "./data/filmes-iniciais";
import {
  pausar,
  perguntarAvaliacaoOpcional,
  perguntarInteiroPositivo,
  perguntarLinha,
  perguntarTextoObrigatorio
} from "./utils/console";
import { Filme } from "./types/filme";

const leitor = createInterface({ input, output });
const catalogo = new CatalogoFilmes(filmesIniciais);
const formatadorAvaliacao = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});

function exibirMenu(): void {
  // Mostra no terminal as opções principais disponíveis para o usuário
  console.clear();
  console.log("=== CATÁLOGO DE FILMES ===");
  console.log("1. Adicionar novo filme");
  console.log("2. Listar todos os filmes");
  console.log("3. Buscar filme por título");
  console.log("4. Buscar filme por gênero");
  console.log("5. Remover filme por título");
  console.log("6. Encerrar");
}

function formatarFilme(filme: Filme, indice?: number): string {
  // Monta uma string padronizada com os dados de um filme para exibição
  const prefixo = indice !== undefined ? `${indice + 1}. ` : "- ";
  const avaliacao =
    filme.avaliacao !== undefined
      ? formatadorAvaliacao.format(filme.avaliacao)
      : "Não informada";

  return (
    `${prefixo}${filme.titulo} (${filme.anoLancamento}) | ` +
    `${filme.genero} | ${filme.duracaoMinutos} min | Avaliação: ${avaliacao}`
  );
}

function exibirFilmes(filmes: Filme[]): void {
  // Exibe a lista de filmes formatada ou avisa quando não há resultados para mostrar
  if (filmes.length === 0) {
    console.log("\nNenhum filme encontrado.\n");
    return;
  }

  console.log("");
  filmes
    .map((filme, indice) => formatarFilme(filme, indice))
    .forEach((linha) => console.log(linha));
  console.log("");
}

async function adicionarFilme(): Promise<void> {
  // Coleta os dados de um novo filme pelo terminal e salva no catálogo
  console.log("\n=== Adicionar Filme ===\n");

  const titulo = await perguntarTextoObrigatorio(leitor, "Título: ", "título");
  const anoLancamento = await perguntarInteiroPositivo(
    leitor,
    "Ano de lançamento: ",
    "ano de lançamento"
  );
  const genero = await perguntarTextoObrigatorio(leitor, "Gênero: ", "gênero");
  const duracaoMinutos = await perguntarInteiroPositivo(
    leitor,
    "Duração em minutos: ",
    "duração em minutos"
  );
  const avaliacao = await perguntarAvaliacaoOpcional(
    leitor,
    "Avaliação (0 a 10, opcional): "
  );

  catalogo.adicionarFilme({
    titulo,
    anoLancamento,
    genero,
    duracaoMinutos,
    avaliacao
  });

  console.log("\nFilme adicionado com sucesso.\n");
}

async function listarFilmes(): Promise<void> {
  // Busca todos os filmes do catálogo em ordem alfabética e mostra na tela
  console.log("\n=== Lista de Filmes ===");
  exibirFilmes(catalogo.ordenarFilmesPor("titulo"));
}

async function buscarPorTitulo(): Promise<void> {
  // Pede um título, faz a busca no catálogo e exibe os resultados encontrados
  console.log("\n=== Buscar por Título ===\n");
  const termo = await perguntarTextoObrigatorio(leitor, "Digite o título: ", "título");
  const resultados = catalogo.buscarFilmes(termo, "titulo");
  exibirFilmes(resultados);
}

async function buscarPorGenero(): Promise<void> {
  // Pede um gênero, consulta o catálogo e mostra os filmes correspondentes
  console.log("\n=== Buscar por Gênero ===\n");
  const termo = await perguntarTextoObrigatorio(leitor, "Digite o gênero: ", "gênero");
  const resultados = catalogo.buscarFilmes(termo, "genero");
  exibirFilmes(resultados);
}

async function removerPorTitulo(): Promise<void> {
  // Solicita um título e remove o filme correspondente do catálogo
  console.log("\n=== Remover Filme ===\n");
  const titulo = await perguntarTextoObrigatorio(leitor, "Título do filme: ", "título");
  const filmeFoiRemovido = catalogo.removerFilmePorTitulo(titulo);

  if (!filmeFoiRemovido) {
    console.log("\nNenhum filme com esse título foi encontrado.\n");
    return;
  }

  console.log("\nFilme removido com sucesso.\n");
}

async function executarOpcao(opcao: string): Promise<boolean> {
  // Decide qual ação executar e retorna se a aplicação deve continuar aberta
  switch (opcao) {
    case "1":
      await adicionarFilme();
      await pausar(leitor);
      return true;
    case "2":
      await listarFilmes();
      await pausar(leitor);
      return true;
    case "3":
      await buscarPorTitulo();
      await pausar(leitor);
      return true;
    case "4":
      await buscarPorGenero();
      await pausar(leitor);
      return true;
    case "5":
      await removerPorTitulo();
      await pausar(leitor);
      return true;
    case "6":
      console.log("\nAplicação encerrada.");
      return false;
    default:
      console.log("\nOpção inválida.\n");
      await pausar(leitor);
      return true;
  }
}

async function main(): Promise<void> {
  // Mantém o loop principal da aplicação até o usuário escolher encerrar
  let emExecucao = true;

  while (emExecucao) {
    exibirMenu();
    const opcao = await perguntarLinha(leitor, "\nEscolha uma opção: ");
    emExecucao = await executarOpcao(opcao);
  }
}

main()
  .catch((error: unknown) => {
    // Trata erros inesperados e exibe uma mensagem 
    const mensagem =
      error instanceof Error ? error.message : "Erro inesperado ao executar a aplicação.";
    console.error(`\n${mensagem}`);
  })
  .finally(() => {
    // Fecha a interface de leitura 
    leitor.close();
  });
