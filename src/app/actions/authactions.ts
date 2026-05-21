"use server";

import { createHash } from "node:crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Pomocná funkce pro vytvoření hashe z kódu a e-mailu
function vygenerujHash(email: string, kod: string): string {
  return createHash("sha256")
    .update(`${email}-${kod}-tajnaSol123`) // 'tajnaSol123' je tajný řetězec pro bezpečnost
    .digest("hex");
}

// 1. AKCE: Vygenerování kódu a odeslání na e-mail
export async function poslatOverovaciEmail(email: string) {
  if (!email?.includes("@")) {
    return { success: false, error: "Neplatný e-mail" };
  }

  // Vygenerujeme 6místný náhodný kód
  const kod = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Odešleme e-mail přes Resend
    await resend.emails.send({
      from: "onboarding@resend.dev", // Výchozí testovací adresa v Resendu
      to: email, // V bezplatné verzi sem zadej svůj registrační e-mail
      subject: "Ověření e-mailu - MůjBazar",
      html: `<p>Dobrý den,</p><p>váš ověřovací kód pro přidání inzerátu je: <strong>${kod}</strong></p><p>Kód platí do zavření okna prohlížeče.</p>`,
    });

    // Vytvoříme hash, který pošleme klientovi (klient z něj kód zpětně nepřečte, ale server ho pak umí ověřit)
    const serverovyHash = vygenerujHash(email, kod);

    return { success: true, hash: serverovyHash };
  } catch (error) {
    console.error("Chyba při odesílání e-mailu:", error);
    return { success: false, error: "Nepodařilo se odeslat e-mail." };
  }
}

// 2. AKCE: Kontrola, zda uživatel zadal správný kód
export async function overitKodAction(email: string, zadanyKod: string, ulozenyHash: string) {
  const kalkulovanyHash = vygenerujHash(email, zadanyKod);

  if (kalkulovanyHash === ulozenyHash) {
    return { success: true };
  }
  return { success: false, error: "Zadaný kód je nesprávný." };
}
