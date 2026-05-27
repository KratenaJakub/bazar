import { randomUUID } from "node:crypto";
import { Container, Text, Title } from "@mantine/core";
import bcrypt from "bcryptjs"; // 🌟 Pro bezpečné zahašování hesla pro hosty
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth"; // 🌟 Přidán import auth
import NovyInzeratFormular from "@/components/form";
import { db } from "@/db";
import { listings } from "@/db/schemas";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("page.Addlisting.title"),
    description: t("page.Addlisting.PageDescription"),
  };
}

export default async function Page() {
  const t = await getTranslations();

  // 🌟 Načteme aktuálního uživatele
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const defaultName = session?.user?.name || "";
  const defaultEmail = session?.user?.email || "";

  async function createInzerat(formData: FormData) {
    "use server";

    // 🌟 Znovu zkontrolujeme auth() přímo v server action (bezpečnost!)
    const sessionAction = await auth();

    const nazev = formData.get("name") as string;
    const popis = formData.get("description") as string;
    const kategorie = formData.get("category") as string;
    const cenaRaw = formData.get("price");
    const zdarma = formData.get("free") === "on";
    const jmeno = formData.get("nameSurname") as string;
    const kontakt = formData.get("contact") as string;
    const foto = formData.get("image") as string;
    const showQr = formData.get("showQr") === "true";
    const bankAccount = formData.get("bankAccount") as string;
    const address = formData.get("address") as string;

    // 🌟 Získáme heslo z formuláře (bude tam jen, pokud uživatel není přihlášen)
    const hesloRaw = formData.get("editPassword") as string;

    const cena = zdarma ? 0 : Number(cenaRaw) || 0;

    if (!nazev || !popis || !kategorie || !jmeno || !kontakt) {
      const tAction = await getTranslations();
      throw new Error(tAction("page.Addlisting.name") ? "Vyplňte povinná pole" : "Vyplňte povinná pole");
    }

    // 🌟 Hashování hesla, pokud inzerát vytváří neregistrovaný uživatel
    let hesloHash = null;
    if (!sessionAction?.user && hesloRaw) {
      hesloHash = await bcrypt.hash(hesloRaw, 10);
    }

    await db.insert(listings).values({
      id: randomUUID(),
      name: nazev,
      description: popis,
      category: kategorie,
      price: cena,
      status: "Aktivní",
      NameSurname: jmeno,
      contact: kontakt,
      Photo: foto || "",
      showQr: showQr,
      bankAccount: showQr ? bankAccount : null,
      address: address || "",
      // 🌟 Přidání údajů pro propojení / ochranu
      userId: sessionAction?.user?.id || null,
      editPassword: hesloHash,
    });

    redirect("/inzeraty");
  }

  return (
    <Container size="sm" pt={0} style={{ marginLeft: 0, paddingLeft: 0 }}>
      <Link href="/inzeraty" style={{ textDecoration: "none", color: "var(--mantine-color-blue-filled)" }}>
        {t("page.Detail.Zpet")}
      </Link>
      <Title order={1} mt={0} mb="md">
        {t("page.Addlisting.title")}
      </Title>
      <Text c="dimmed" mb="xl">
        {t("page.Addlisting.PageDescription")}
      </Text>

      <NovyInzeratFormular
        onSubmitAction={createInzerat}
        isLoggedIn={isLoggedIn}
        defaultName={defaultName}
        defaultEmail={defaultEmail}
      />
    </Container>
  );
}
