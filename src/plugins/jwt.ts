import { jwt } from "@elysia/jwt";
import Elysia from "elysia";

export const jwtService = new Elysia({
  name: "jwt-plugin",
}).use(
  jwt({
    name: "jwt",
    secret: Bun.env.JWT_SECRET!,
    exp: "4d",
  }),
);
