import { Container, Text, Title } from "@mantine/core";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm"; // 👈 Potřebujeme pro vyhledání podle ID
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import NovyInzeratFormular from "@/components/form";
import { db } from "@/db";
import { listings } from "@/db/schemas";

interface EditPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pwd?: string }>;
}

export async function generateMetadata({ params }: EditPageProps): Promise<Metadata> {
  const t = await getTranslations();
  const { id } = await params;

  return {
    title: `${t("page.Addlisting.title")} - Editace #${id}`,
    description: t("page.Addlisting.PageDescription"),
  };
}

export default async function Page({ params, searchParams }: EditPageProps) {
  const t = await getTranslations();
  const { id } = await params;
  const session = await auth();

  // 1. Načtení stávajících dat inzerátu z databáze podle ID z URL
  const inzerat = await db.select().from(listings).where(eq(listings.id, id)).get();

  // Pokud inzerát s tímto ID neexistuje, zobrazíme 404
  if (!inzerat) {
    notFound();
  }
  const isOwner = session?.user?.id !== undefined && inzerat.userId === session.user.id;
  const resolvedSearchParams = await searchParams;
  const passwordFromQuery = resolvedSearchParams.pwd;
  const isPasswordValid =
    inzerat.editPassword && passwordFromQuery ? await bcrypt.compare(passwordFromQuery, inzerat.editPassword) : false;
  if (!isOwner && !isPasswordValid) {
    redirect(`/inzeraty/${id}?error=neopravneny_vstup`);
  }

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
    labelHeslo: t("page.Addlisting.password"),
    placeholderHeslo: t("page.Addlisting.passwordPlaceholder"),
    upozorneniHeslo: t("page.Addlisting.passwordWarning"),
    btnSubmit: t("page.Addlisting.button"),
    btnEditSubmit: "Uložit změny", // 👈 Text pro editační tlačítko
  };

  const kategorieOptions = [
    { value: "Elektronika", label: t("page.Categories.Electronics") },
    { value: "Nábytek", label: t("page.Categories.Furniture") },
    { value: "Oblečení", label: t("page.Categories.Clothing") },
    { value: "Vozidla", label: t("page.Categories.Vehicles") },
    { value: "Dětské zboží", label: t("page.Categories.Children") },
    { value: "Zvířata", label: t("page.Categories.Animals") },
    { value: "Dům a zahrada", label: t("page.Categories.Home&Garden") },
    { value: "Hudba", label: t("page.Categories.Music") },
    { value: "Knihy", label: t("page.Categories.Books") },
    { value: "Sport", label: t("page.Categories.Sport") },
    { value: "Ostatní", label: t("page.Categories.Misc") },
  ];

  // SERVER ACTION: Aktualizace inzerátu v databázi (UPDATE)
  async function updateInzerat(formData: FormData) {
    "use server";

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

    const cena = zdarma ? 0 : Number(cenaRaw) || 0;

    if (!nazev || !popis || !kategorie || !jmeno || !kontakt) {
      throw new Error("Všechna povinná pole musí být vyplněna.");
    }

    // 2. Provedeme SQL UPDATE namísto INSERT
    await db
      .update(listings)
      .set({
        name: nazev,
        description: popis,
        category: kategorie,
        price: cena,
        NameSurname: jmeno,
        contact: kontakt,
        Photo: foto || "",
        showQr: showQr,
        bankAccount: showQr ? bankAccount : null,
        address: address || "",
      })
      .where(eq(listings.id, id)); // 👈 Aktualizujeme pouze inzerát s tímto ID

    // Po úspěšné editaci přesměrujeme uživatele zpět na detail inzerátu
    redirect(`/inzeraty/${id}`);
  }

  // 3. Převod dat z DB struktury na strukturu, kterou očekává tvůj formulář v initialData
  const initialDataData = {
    name: inzerat.name ?? "",
    description: inzerat.description ?? "",
    category: inzerat.category ?? "",
    price: inzerat.price ?? 0,
    nameSurname: inzerat.NameSurname ?? "", // Mapování z DB (NameSurname) do formuláře (nameSurname)
    contact: inzerat.contact ?? "",
    Photo: inzerat.Photo ?? "",
    showQr: Boolean(inzerat.showQr), // Ujistíme se, že je to boolean
    bankAccount: inzerat.bankAccount ?? "",
    address: inzerat.address ?? "",
  };

  return (
    <Container size="sm" pt={0} style={{ marginLeft: 0, paddingLeft: 0 }}>
      <Link href={`/inzeraty/${id}`} style={{ textDecoration: "none", color: "var(--mantine-color-blue-filled)" }}>
        ← Zpět na inzerát
      </Link>
      <Title order={1} mt={0} mb="md">
        Upravit inzerát
      </Title>
      <Text c="dimmed" mb="xl">
        Zde můžete upravit parametry vašeho stávajícího inzerátu.
      </Text>

      {/* Vykreslíme tvůj klientský formulář, předáme mu update funkci a stávající data */}
      <NovyInzeratFormular
        onSubmitAction={updateInzerat}
        t={tForm}
        kategorieOptions={kategorieOptions}
        initialData={initialDataData} // 👈 Předání načtených dat pro předvyplnění v form.tsx
      />
    </Container>
  );
}
