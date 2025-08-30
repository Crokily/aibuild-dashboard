import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  decimal,
  date,
  timestamp,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "@auth/core/adapters";

export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// --- Product Table ---
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  productCode: varchar("product_code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
});

// --- Daily Record Table ---
export const dailyRecords = pgTable(
  "daily_records",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    recordDate: date("record_date").notNull(),
    openingInventory: integer("opening_inventory").notNull(),
    procurementQty: integer("procurement_qty").notNull(),
    procurementPrice: decimal("procurement_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    salesQty: integer("sales_qty").notNull(),
    salesPrice: decimal("sales_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    closingInventory: integer("closing_inventory").notNull(),
  },
  (table) => ({
    productDateIdx: index("product_date_idx").on(
      table.productId,
      table.recordDate,
    ),
    productDateUnique: uniqueIndex("product_date_unique").on(
      table.productId,
      table.recordDate,
    ),
  }),
);
