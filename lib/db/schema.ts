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
  } from 'drizzle-orm/pg-core';
  
  // --- User Table ---
  export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: text('email').notNull().unique(),
    hashedPassword: text('hashed_password').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  });
  
  // --- Product Table ---
  export const products = pgTable('products', {
    id: serial('id').primaryKey(),
    productCode: varchar('product_code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
  });
  
  // --- Daily Record Table ---
  export const dailyRecords = pgTable('daily_records', {
    id: serial('id').primaryKey(),
    productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    recordDate: date('record_date').notNull(),
    openingInventory: integer('opening_inventory').notNull(), 
    procurementQty: integer('procurement_qty').notNull(),
    procurementPrice: decimal('procurement_price', { precision: 10, scale: 2 }).notNull(),
    salesQty: integer('sales_qty').notNull(),
    salesPrice: decimal('sales_price', { precision: 10, scale: 2 }).notNull(),
    closingInventory: integer('closing_inventory').notNull(),// Although it can be calculated, explicit storage can improve query performance
  }, (table) => {
    return {
      // Composite index for product and date, which can improve query performance
      productDateIdx: index("product_date_idx").on(table.productId, table.recordDate),
  
      // This constraint ensures that "one product can only have one record per day"
      // It prevents data pollution caused by program bugs or repeated uploads
      productDateUnique: uniqueIndex("product_date_unique").on(table.productId, table.recordDate),
    };
  });