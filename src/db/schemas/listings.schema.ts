import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./user.schema";

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
  address: text("address"),
  userId: text("userId").references(() => users.id, { onDelete: "cascade" }),
  editPassword: text("editPassword"),
  reservedByUserId: text("reservedByUserId"),
});
export type Listing = typeof listings.$inferSelect;
