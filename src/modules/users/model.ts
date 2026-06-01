import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-typebox";
import { users } from "@/drizzle/schema";
import { t } from "elysia";

export const _createUser = createInsertSchema(users, {
  email: t.String({
    format: "email",
  }),
  password: t.String({
    minLength: 6,
  }),
});

export const createUser = t.Omit(_createUser, ["role"]);

export const _selectUser = createSelectSchema(users);

export const selectUser = t.Omit(_selectUser, ["password", "createdAt"]);

export const updateUser = createUpdateSchema(users);

export type User = typeof selectUser.static;
export type UserPlain = typeof _selectUser.static;
export type CreateUser = typeof createUser.static;
export type UpdateUser = typeof updateUser.static;

export const paramModel = t.Object({
  id: t.String({
    minLength: 1,
  }),
});

export type ParamModel = typeof paramModel.static;
