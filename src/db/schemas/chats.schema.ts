import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core"; // Případně pg-core podle tvé DB
import { listings, users } from "@/db/schemas"; // Importuj tvé stávající tabulky
export const chats = sqliteTable("chats", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  listingId: text("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  buyerId: text("buyer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sellerId: text("seller_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
export type Chat = typeof chats.$inferSelect;
