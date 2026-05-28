"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/db";
import { listings, users } from "@/db/schemas";

export async function changePasswordAction(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) throw new Error("Neoprávněný přístup.");

  const userId = session.user.id;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword) {
    throw new Error("Všechna pole jsou povinná.");
  }

  // 1. Vytáhneme uživatele z DB, abychom získali jeho stávající passwordHash
  const dbUser = await db.select().from(users).where(eq(users.id, userId)).get();

  if (!dbUser?.passwordHash) {
    throw new Error("Uživatel nemá nastavené lokální heslo (přihlášení proběhlo přes Google).");
  }

  // 2. Ověříme, zda zadal správné aktuální heslo
  const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Zadané aktuální heslo je nesprávné.");
  }

  // 3. Zahashujeme nové heslo a uložíme do DB
  const salt = await bcrypt.genSalt(10);
  const newPasswordHash = await bcrypt.hash(newPassword, salt);

  await db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, userId));

  revalidatePath("/accountmanagement");
}

export async function updateUserAction(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) throw new Error("Neoprávněný přístup.");

  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Neoprávněný přístup – chybí ID uživatele.");
  }
  const newName = formData.get("name") as string;
  const newEmail = formData.get("email") as string;
  const newImage = formData.get("image") as string | null;

  if (!newName || !newEmail) throw new Error("Jméno a email jsou povinné.");

  // 1. Aktualizace uživatele v tabulce uživatelů
  await db.update(users).set({ name: newName, email: newEmail, image: newImage }).where(eq(users.id, userId));

  // 2. Aktualizace kontaktních údajů u všech inzerátů tohoto uživatele
  await db
    .update(listings)
    .set({
      NameSurname: newName,
      contact: newEmail,
    })
    .where(eq(listings.userId, userId));

  revalidatePath("/accountmanagement");
}
// Server Actions musí zůstat tady v Server Componentě
export async function deleteInzeratAction(id: string) {
  "use server";
  await db.delete(listings).where(eq(listings.id, id));
  revalidatePath("/accountmanagement");
}

export async function getUserImageAction() {
  "use server";
  const session = await auth();
  if (!session?.user?.id) return null;

  const dbUser = await db.select({ image: users.image }).from(users).where(eq(users.id, session.user.id)).get();

  return dbUser?.image || null;
}

export async function markAsSoldAction(id: string) {
  "use server";
  await db.update(listings).set({ status: "Prodáno" }).where(eq(listings.id, id));
  revalidatePath("/accountmanagement");
}
