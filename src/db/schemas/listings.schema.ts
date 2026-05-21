import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const listings = sqliteTable("listings", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("active"),
  NameSurname: text("NameSurname").notNull(),
  contact: text("contact").notNull(),
  Photo: text("Photo").notNull(),
  showQr: integer("show_qr", { mode: "boolean" }).default(false),
  bankAccount: text("bank_account"),
});
export type Listing = typeof listings.$inferSelect;
