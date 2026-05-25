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

  const tForm = {
    labelNazev: t("page.Addlisting.name"),
    placeholderNazev: t("page.Addlisting.namePlaceholder"),
    labelPopis: t("page.Addlisting.description"),
    placeholderPopis: t("page.Addlisting.descriptionPlaceholder"),
    labelKategorie: t("page.Addlisting.category"),
    placeholderKategorie: t("page.Addlisting.categoryPlaceholder"),
    labelCena: t("page.Addlisting.price"),
    placeholderCena: t("page.Addlisting.pricePlaceholder"),
    labelZdarma: t("page.Addlisting.zdarma"),
    labelJmeno: t("page.Addlisting.nameSurname"),
    placeholderJmeno: t("page.Addlisting.nameSurnamePlaceholder"),
    labelKontakt: t("page.Addlisting.contact"),
    placeholderKontakt: t("page.Addlisting.contactPlaceholder"),
    labelObrazek: t("page.Addlisting.Obrazek"),
    placeholderObrazek: t("page.Addlisting.ObrazekPlaceholder"),
    btnSubmit: t("page.Addlisting.button"),
    // 🌟 Nové texty pro heslo (můžeš si je pak přidat do cs.json)
    labelHeslo: "Heslo pro úpravu inzerátu",
    placeholderHeslo: "Zadejte heslo",
    upozorneniHeslo: "Heslo si zapamatujte, budete ho potřebovat, pokud budete chtít inzerát smazat nebo upravit.",
  };

  const kategorieOptions = [
    { value: "Dům a zahrada", label: t("page.Categories.Home&Garden") },
    { value: "Elektronika", label: t("page.Categories.Electronics") },
    { value: "Nábytek", label: t("page.Categories.Furniture") },
    { value: "Oblečení", label: t("page.Categories.Clothing") },
    { value: "Dětské zboží", label: t("page.Categories.Children") },
    { value: "Knihy", label: t("page.Categories.Books") },
    { value: "Sport", label: t("page.Categories.Sport") },
    { value: "Vozidla", label: t("page.Categories.Vehicles") },
    { value: "Hudba", label: t("page.Categories.Music") },
    { value: "Ostatní", label: t("page.Categories.Misc") },
  ];

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
      throw new Error("Všechna povinná pole musí být vyplněna.");
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
        ← Zpět na přehled
      </Link>
      <Title order={1} mt={0} mb="md">
        {t("page.Addlisting.title")}
      </Title>
      <Text c="dimmed" mb="xl">
        {t("page.Addlisting.PageDescription")}
      </Text>

      <NovyInzeratFormular
        onSubmitAction={createInzerat}
        t={tForm}
        kategorieOptions={kategorieOptions}
        // 🌟 Předáme formuláři informaci, že je uživatel přihlášený + jeho údaje
        isLoggedIn={isLoggedIn}
        defaultName={defaultName}
        defaultEmail={defaultEmail}
      />
    </Container>
  );
}
