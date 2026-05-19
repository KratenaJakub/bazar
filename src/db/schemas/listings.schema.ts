import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const inzeraty = sqliteTable("inzeraty", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("active"),
  photo: text("photo"),
});

export type Inzerat = typeof inzeraty.$inferSelect;
