import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// Gera hash da senha antes de salvar no banco.
export function criptografarSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

// Compara a senha digitada com o hash salvo.
export function verificarSenha(
  senha: string,
  senhaCriptografada: string
): Promise<boolean> {
  return bcrypt.compare(senha, senhaCriptografada);
}
