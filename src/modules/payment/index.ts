import { Elysia, t } from "elysia";
import { webHookSchema } from "./model";
import { PaymentService } from "./service";
import { authGuard } from "@/plugins/middleware";

export const paymentsController = new Elysia({
  prefix: "/payments",
})
  .post(
    "/webhook",
    async ({ query: { webhookSecret }, body }) => {
      if (webhookSecret !== "12345678") {
        return new Response("Unauthorized", { status: 401 });
      }

      await PaymentService.updatePayment(body);
    },
    {
      body: webHookSchema,
      query: t.Object({
        webhookSecret: t.String(),
      }),
    },
  )
  .use(authGuard)
  .post(
    "/",
    async ({ body, user }) => {
      await PaymentService.createPayment(body.amount, user.id);
    },
    {
      body: t.Object({
        amount: t.Integer(),
      }),
    },
  )
  .get("/", async ({ user }) => {
    return await PaymentService.getPayments(user.id);
  });
