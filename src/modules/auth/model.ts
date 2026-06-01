import { t } from "elysia";

export const authSchema = t.Object({
  email: t.String({
    format: "email",
  }),
  password: t.String({
    minLength: 6,
  }),
  code: t.Optional(
    t.String({
      minLength: 6,
    }),
  ),
});

export type AuthBody = typeof authSchema.static;

export type AuthContext = {
  id: string;
  role: string;
};
