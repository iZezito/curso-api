import {
  integer,
  pgTable,
  varchar,
  serial,
  timestamp,
  pgEnum,
  text,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const userRole = pgEnum("user_role", ["DEFAULT", "ADMIN"]);

export type UserRole = (typeof userRole.enumValues)[number];

export const users = pgTable(
  "users",
  {
    id: text("id")
      .$defaultFn(() => createId())
      .primaryKey()
      .notNull(),
    name: varchar({ length: 120 }).notNull(),
    plan: text("plan").default("FREE").notNull(),
    email: text().notNull().unique(),
    role: userRole().default("DEFAULT").notNull(),
    password: text().notNull(),
    oauth2provider: text(),
    emailVerified: boolean().default(false),
    twoFactorAuthenticationEnabled: boolean().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_email_key").using(
      "btree",
      table.email.asc().nullsLast().op("text_ops"),
    ),
  ],
);

export const payments = pgTable("payment", {
  id: text("id")
    .$defaultFn(() => createId())
    .primaryKey()
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  amount: integer("amount").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
    .defaultNow()
    .notNull(),
  status: text("status").default("PENDING").notNull(),
  externalId: text("external_id").unique().notNull(),
  pixQrCode: text("pix_qr_code").notNull(),
  pixText: text("pix_text").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true, precision: 3 }),
  expiresAt: timestamp("expires_at", { withTimezone: true, precision: 3 }),
});
