import { randomUUID } from "node:crypto";
import { Container, Text, Title } from "@mantine/core";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import NovyInzeratFormular from "@/components/form";
import { db } from "@/db";
import { listings } from "@/db/schemas";

// 1. Přidání podpory asynchronních parametrů (pro konzistenci s Next.js 15+)
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("page.Addlisting.title"),
    description: t("page.Addlisting.PageDescription"),
  };
}

export default async function Page() {
  const t = await getTranslations();

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

  async function createInzerat(formData: FormData) {
    "use server";

    const nazev = formData.get("name") as string;
    const popis = formData.get("description") as string;
    const kategorie = formData.get("category") as string;
    const cenaRaw = formData.get("price");
    const zdarma = formData.get("free") === "on";
    const jmeno = formData.get("nameSurname") as string;
    const kontakt = formData.get("contact") as string;
    const foto = formData.get("image") as string;

    const cena = zdarma ? 0 : Number(cenaRaw) || 0;

    if (!nazev || !popis || !kategorie || !jmeno || !kontakt) {
      throw new Error("Všechna povinná pole musí být vyplněna.");
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

      {/* 2. initialData zde záměrně nevyplňujeme, čímž formulář ví, že tvoří prázdný nový inzerát */}
      <NovyInzeratFormular onSubmitAction={createInzerat} t={tForm} kategorieOptions={kategorieOptions} />
    </Container>
  );
}
