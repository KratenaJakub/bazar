"use server";

import { and, asc, desc, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { chats, listings, messages, users } from "@/db/schemas";

// 1. Akce pro zahájení chatu z detailu inzerátu
export interface StartChatResponse {
  success: boolean;
  chatId?: string;
  error?: string;
}

export async function startChatAction(listingId: string, sellerId: string): Promise<StartChatResponse> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Musíte být přihlášen." };

  const buyerId = session.user.id;
  if (buyerId === sellerId) return { success: false, error: "Nemůžete psát sami sobě." };

  // Zkontrolujeme, zda už chat pro tento inzerát mezi těmito lidmi existuje
  const existingChat = await db
    .select()
    .from(chats)
    .where(and(eq(chats.listingId, listingId), eq(chats.buyerId, buyerId), eq(chats.sellerId, sellerId)))
    .get();

  if (existingChat) {
    return { success: true, chatId: existingChat.id };
  }

  // Pokud neexistuje, vytvoříme nový
  const [newChat] = await db.insert(chats).values({ listingId, buyerId, sellerId }).returning();

  return { success: true, chatId: newChat.id };
}

// 2. Akce pro odeslání zprávy
export async function sendMessageAction(chatId: string, textContent: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Neoprávněný přístup.");
  if (!textContent.trim()) return;

  await db.insert(messages).values({
    chatId,
    senderId: session.user.id,
    text: textContent.trim(),
  });

  revalidatePath("/accountmanagement");
}

// 3. Pomocná funkce pro načtení chatů uživatele (použijeme v profilu v page.tsx)
export async function getUserChats(userId: string) {
  // Vyhledáme chaty, kde je uživatel kupující NEBO prodejce
  const userChats = await db
    .select({
      id: chats.id,
      createdAt: chats.createdAt,
      listingName: listings.name,
      listingPrice: listings.price,
      buyerName: users.name, // Do budoucna pro zobrazení jména protistrany
      sellerId: chats.sellerId,
      buyerId: chats.buyerId,
    })
    .from(chats)
    .innerJoin(listings, eq(chats.listingId, listings.id))
    .innerJoin(users, eq(chats.buyerId, users.id)) // Tady se dají dotáhnout relace pro jména
    .where(or(eq(chats.buyerId, userId), eq(chats.sellerId, userId)))
    .all();

  // Pro každý chat dotáhneme jméno toho druhého a poslední zprávu
  const enrichedChats = await Promise.all(
    userChats.map(async (c) => {
      const druhyId = c.buyerId === userId ? c.sellerId : c.buyerId;
      const druhyUser = await db.select().from(users).where(eq(users.id, druhyId)).get();

      const posledniZprava = await db
        .select()
        .from(messages)
        .where(eq(messages.chatId, c.id))
        .orderBy(desc(messages.createdAt))
        .limit(1)
        .get();

      return {
        ...c,
        partnerName: druhyUser?.name || "Uživatel",
        partnerImage: druhyUser?.image,
        lastMessage: posledniZprava?.text || "Zatím žádné zprávy",
      };
    }),
  );

  return enrichedChats;
}

// 4. Akce pro načtení zpráv konkrétního chatu
export async function getChatMessagesAction(chatId: string) {
  return await db.select().from(messages).where(eq(messages.chatId, chatId)).orderBy(asc(messages.createdAt)).all();
}
