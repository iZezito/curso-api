import { t } from "elysia";

import { payments } from "@/drizzle/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

const createPayment = createInsertSchema(payments);
export type CreatePayment = typeof createPayment.static;

export const selectPayment = createSelectSchema(payments);

export const webHookSchema = t.Object({
  id: t.String(),
  event: t.Literal("transparent.completed"),
  apiVersion: t.Integer(),
  devMode: t.Boolean(),
  data: t.Object({
    transparent: t.Object({
      id: t.String(),
      externalId: t.Nullable(t.String()),
      amount: t.Integer(),
      status: t.String(),
    }),
  }),
});

export type WebHook = typeof webHookSchema.static;
