import { Elysia, t } from "elysia";
import { Service } from "./service";
import { createUser, paramModel, selectUser, updateUser } from "./model";
import { ForbiddenError, UnauthorizedError } from "@/errors";
import { authGuard } from "@/plugins/middleware";
import { redis } from "@/lib/redis";
import { renderResetPasswordEmail } from "@/emails/render";
import { sendEmail } from "@/lib/mail";

export const usersController = new Elysia({
  prefix: "/v1/users",
})
  .post(
    "/",
    async ({ body, status }) => {
      await Service.createUser(body);
      return status(201);
    },
    {
      body: createUser,
    },
  )
  .post(
    "/forgot-password",
    async ({ body, status }) => {
      const userEntity = await Service.findByEmail(body.email);

      if (userEntity !== undefined) {
        const token = await Service.createPasswordResetToken(userEntity.id);
        const html = renderResetPasswordEmail(
          `http://localhost:3000/api/v1/users/password-reset?token=${token}`,
        );
        sendEmail(userEntity.email, "Redefinição de senha", html);
      }
      return "Se uma conta com esse e-mail existir, um token de redefinição de senha será enviado.";
    },
    {
      body: t.Object({
        email: t.String({
          format: "email",
        }),
      }),
      response: t.String(),
    },
  )
  .put(
    "/password-reset",
    async ({ body: { token, newPassword }, status }) => {
      const userId = await redis.get(`password-reset-token:${token}`);
      if (!userId) return status(410, "Token inválido ou expirado.");

      await Service.updatePassword(userId, newPassword);
      await redis.del(`password-reset-token:${token}`);
      return "Senha redefinida com sucesso.";
    },
    {
      body: t.Object({
        token: t.String(),
        newPassword: t.String(),
      }),
    },
  )
  .get(
    "email-verification",
    async ({ query: { token }, status }) => {
      const userId = await redis.get(`verification-token:${token}`);
      if (!userId) return status(410, "Token inválido ou expirado.");

      await Service.updateEmailVerified(userId);
      await redis.del(`verification-token:${token}`);
      return "E-mail verificado com sucesso.";
    },
    {
      query: t.Object({
        token: t.String(),
      }),
    },
  )
  .use(authGuard)
  .get(
    "/:id",
    async ({ params: { id } }) => {
      return Service.findById(id);
    },
    {
      params: paramModel,
      response: selectUser,
    },
  )
  .put(
    "/:id",
    async ({ body, params: { id }, user, status }) => {
      if (id !== user.id)
        return status(
          403,
          "Você não tem permissão para atualizar este usuário!",
        );

      return await Service.update(body, user.id);
    },
    {
      body: updateUser,
      params: paramModel,
    },
  )
  .delete("/", async ({ body, status, user: { id } }) => {
    await Service.delete(id);
    return status(204);
  })
  .get(
    "/",
    async ({ user: { id } }) => {
      return await Service.findById(id);
    },
    {
      response: selectUser,
    },
  )
  .get(
    "/all",
    async () => {
      return await Service.findAll();
    },
    {
      requireRole: "DEFAULT",
    },
  );
