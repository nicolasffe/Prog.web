import { Interface } from "node:readline/promises";

import {
  validarAvaliacao,
  validarNumeroInteiroPositivo,
  validarTextoNaoVazio
} from "./validacoes";

export async function perguntarLinha(leitor: Interface, mensagem: string): Promise<string> {
  return (await leitor.question(mensagem)).trim();
}

export async function perguntarTextoObrigatorio(
  leitor: Interface,
  mensagem: string,
  campo: string
): Promise<string> {
  while (true) {
    try {
      const resposta = await perguntarLinha(leitor, mensagem);
      return validarTextoNaoVazio(resposta, campo);
    } catch (error) {
      exibirErro(error);
    }
  }
}

export async function perguntarInteiroPositivo(
  leitor: Interface,
  mensagem: string,
  campo: string
): Promise<number> {
  while (true) {
    try {
      const resposta = await perguntarLinha(leitor, mensagem);
      const numero = Number(resposta);
      return validarNumeroInteiroPositivo(numero, campo);
    } catch (error) {
      exibirErro(error);
    }
  }
}

export async function perguntarAvaliacaoOpcional(
  leitor: Interface,
  mensagem: string
): Promise<number | undefined> {
  while (true) {
    try {
      const resposta = await perguntarLinha(leitor, mensagem);

      if (!resposta) {
        return undefined;
      }

      const numero = Number(resposta.replace(",", "."));
      return validarAvaliacao(numero);
    } catch (error) {
      exibirErro(error);
    }
  }
}

export async function pausar(leitor: Interface): Promise<void> {
  await leitor.question("\nPressione Enter para continuar...");
}

function exibirErro(error: unknown): void {
  const mensagem = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
  console.log(`\n[Erro] ${mensagem}\n`);
}
