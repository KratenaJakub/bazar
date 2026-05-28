import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core"; // Případně pg-core podle tvé DB
import { chats, users } from "@/db/schemas"; // Importuj tvé stávající tabulky
export const messages = sqliteTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  chatId: text("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
export type Message = typeof messages.$inferSelect;
