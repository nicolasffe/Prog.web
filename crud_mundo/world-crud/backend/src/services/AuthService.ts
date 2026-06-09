import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { userRepository } from "../repositories/UserRepository";
import { criptografarSenha, verificarSenha } from "../utils/criptografia";
import { HttpError } from "../utils/HttpError";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export class AuthService {
  async register(input: RegisterInput) {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new HttpError(409, "Email ja cadastrado.");
    }

    const passwordHash = await criptografarSenha(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash
    });

    return this.authResponse(user);
  }

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      throw new HttpError(401, "Credenciais inválidas.");
    }

    const passwordMatches = await verificarSenha(input.password, user.passwordHash);

    if (!passwordMatches) {
      throw new HttpError(401, "Credenciais inválidas.");
    }

    return this.authResponse(user);
  }

  private authResponse(user: { id: string; name: string; email: string }) {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
    });

    return {
      token,
      user: payload
    };
  }
}

export const authService = new AuthService();
