import { Filme } from "../types/filme";

export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

export function validarTextoNaoVazio(valor: string, campo: string): string {
  const valorTratado = valor.trim();

  if (!valorTratado) {
    throw new Error(`O campo "${campo}" não pode ficar vazio.`);
  }

  return valorTratado;
}

export function validarNumeroInteiroPositivo(valor: number, campo: string): number {
  if (!Number.isInteger(valor) || valor <= 0) {
    throw new Error(`O campo "${campo}" deve ser um número inteiro positivo.`);
  }

  return valor;
}

export function validarAvaliacao(avaliacao?: number): number | undefined {
  if (avaliacao === undefined) {
    return undefined;
  }

  if (!Number.isFinite(avaliacao) || avaliacao < 0 || avaliacao > 10) {
    throw new Error("A avaliação deve estar entre 0 e 10.");
  }

  return avaliacao;
}

export function validarFilme(filme: Filme): Filme {
  return {
    titulo: validarTextoNaoVazio(filme.titulo, "título"),
    anoLancamento: validarNumeroInteiroPositivo(filme.anoLancamento, "ano de lançamento"),
    genero: validarTextoNaoVazio(filme.genero, "gênero"),
    duracaoMinutos: validarNumeroInteiroPositivo(filme.duracaoMinutos, "duração em minutos"),
    avaliacao: validarAvaliacao(filme.avaliacao)
  };
}
