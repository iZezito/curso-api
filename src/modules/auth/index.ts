import { jwtService } from "@/plugins/jwt";
import { Elysia } from "elysia";
import { authSchema } from "./model";
import { AuthService } from "./service";
import { redis } from "@/lib/redis";
import { renderOtpEmail } from "@/emails/render";
import { sendEmail } from "@/lib/mail";

export const authController = new Elysia({
  prefix: "/auth",
})
  .use(jwtService)
  .post(
    "/login",
    async ({ status, body, jwt, cookie }) => {
      const user = await AuthService.login(body);

      if (!user.emailVerified) {
        return status(403, { message: "Email não verificado" });
      }

      if (user.twoFactorAuthenticationEnabled) {
        if (!body.code) {
          const code = Math.floor(100000 + Math.random() * 900000);
          console.log("code OTP", code);
          await redis.setex(`2fa:${user.id}`, 60 * 5, code.toString());
          const html = renderOtpEmail(code.toString());
          sendEmail(user.email, "Autenticação em Dois Fatores", html);

          return status(202, { message: "Código de verificação enviado" });
        }
        const code = await redis.get(`2fa:${user.id}`);
        if (code !== body.code) {
          return status(400, {
            message: "Código de verificação inválido ou expirado",
          });
        }
        await redis.del(`2fa:${user.id}`);
      }

      const token = await jwt.sign({ id: user.id, role: user.role });

      cookie.auth.set({
        value: token,
        httpOnly: true,
        secure: Bun.env.NODE_ENV === "production",
        sameSite: Bun.env.NODE_ENV === "production" ? "none" : "strict",
        path: "/",
        maxAge: 60 * 60 * 48,
      });

      await redis.setex(`user:${user.id}`, 60 * 15, JSON.stringify(user));

      return { token };
    },
    {
      body: authSchema,
    },
  )
  .get("/logout", async ({ cookie }) => {
    const token = cookie.auth?.value;
    if (!token) return { message: "Já foi deslogado" };

    cookie.auth.remove();
    return { message: "Deslogado com sucesso!" };
  });
