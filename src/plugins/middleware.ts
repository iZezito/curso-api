import Elysia from "elysia";
import { jwtService } from "./jwt";
import bearer from "@elysia/bearer";
import { type UserRole } from "@/drizzle/schema";

import { UnauthorizedError, ForbiddenError } from "@/errors";

export const authGuard = new Elysia({
  name: "auth-guard",
})
  .use(jwtService)
  .use(bearer())
  .derive({ as: "scoped" }, async ({ bearer, jwt, cookie }) => {
    const token = (cookie.auth?.value as string) || bearer;
    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    const payload = await jwt.verify(token);

    if (!payload) {
      throw new UnauthorizedError("Invalid token or expired");
    }

    return {
      user: { id: payload.id, role: payload.role },
    };
  })
  .macro({
    requireRole: (role: UserRole) => ({
      async resolve({ user }) {
        if (!user) {
          throw new UnauthorizedError("Você precisa estar autenticado");
        }
        if (user.role !== role) {
          throw new ForbiddenError(
            "Você não tem permissão para acessar este recurso",
          );
        }
      },
    }),
  });
