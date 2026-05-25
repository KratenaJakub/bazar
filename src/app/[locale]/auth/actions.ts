"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schemas/user.schema";

interface RegistraceInput {
  email: string;
  name: string;
  password: string;
}

interface PrihlaseniInput {
  email: string;
  password: string;
}

// 🌟 1. AKCE PRO REGISTRACI
export async function registrovatUzivatele(values: RegistraceInput) {
  try {
    const { email, name, password } = values;

    // Kontrola, zda už uživatel s tímto emailem neexistuje
    const [existujiciUzivatel] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existujiciUzivatel) {
      return { error: "Uživatel s tímto e-mailem již existuje." };
    }

    // Zahashování hesla před uložením do DB
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Vložení nového uživatele do databáze
    await db.insert(users).values({
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash,
    });

    return { success: "Registrace proběhla úspěšně! Nyní se můžete přihlásit." };
  } catch (error) {
    console.error("Chyba při registraci:", error);
    return { error: "Něco se pokazilo. Zkuste to prosím znovu." };
  }
}

// 🌟 2. AKCE PRO PŘIHLÁŠENÍ
export async function prihlasitUzivatele(values: PrihlaseniInput) {
  try {
    const { email, password } = values;

    // Volání vestavěné funkce signIn z NextAuth configu
    await signIn("credentials", {
      email,
      password,
      redirect: false, // Nechceme automatický tvrdý redirect, ošetříme si to v UI
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Nesprávný e-mail nebo heslo." };
        default:
          return { error: "Chyba při přihlašování." };
      }
    }
    throw error;
  }
}

export async function odhlasitUzivatele() {
  await signOut({
    redirect: false, // 🌟 Vypneme automatický serverový redirect
  });

  return { success: true };
}
