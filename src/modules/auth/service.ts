import { db } from "@/lib/db";
import { AuthBody } from "./model";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { BadCredentialsError, NotFoundError } from "@/errors";
import { password } from "bun";

export abstract class AuthService {
  static async login(body: AuthBody) {
    const [userEntity] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email));

    if (!userEntity) throw new BadCredentialsError();

    const verificarSenha = await password.verify(
      body.password,
      userEntity.password,
    );

    if (!verificarSenha) throw new BadCredentialsError();

    return userEntity;
  }
}
