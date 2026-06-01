import { Elysia } from "elysia";
import { CustomError } from "./errors";
import { usersController } from "./modules/users";
import { DrizzleQueryError } from "drizzle-orm";
import { SQL } from "bun";
import { authController } from "./modules/auth";
import { paymentsController } from "./modules/payment";

const app = new Elysia({
  prefix: "/api",
})
  .onError(({ error, code, path }) => {
    if (error instanceof DrizzleQueryError) {
      if (error.cause instanceof SQL.PostgresError) {
        return {
          message: error.cause.message || error.message,
          code: 400,
          timestamp: new Date().toISOString(),
        };
      }
    }
    if (code === "NOT_FOUND") {
      return "Rota não encontrada";
    }
    if (error instanceof CustomError) {
      return {
        message: error.message,
        status: error.status,
        path,
        timestamp: new Date().toISOString(),
      };
    }
  })
  .use(usersController)
  .use(authController)
  .use(paymentsController)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
