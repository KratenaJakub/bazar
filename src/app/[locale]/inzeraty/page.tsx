import { Alert, Badge, Button, Card, CardSection, Group, Image, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconFilterOff, IconInfoCircle, IconPlus } from "@tabler/icons-react";
import { and, eq, gte, like, lte, max, min, or } from "drizzle-orm"; // 🌟 Přidán gte a lte
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { listings } from "@/db/schemas";
import FiltryBar from "./FiltryBar";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    status?: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("page.listings.title"),
    description: t("page.listings.description"),
  };
}

export default async function Page({ searchParams }: PageProps) {
  // 1. Zjistíme absolutní min a max cenu ze všech inzerátů v DB
  const [cenyDb] = await db
    .select({
      absolutniMin: min(listings.price),
      absolutniMax: max(listings.price),
    })
    .from(listings);

  const minCenaZDb = cenyDb?.absolutniMin ?? 0;
  const maxCenaZDb = cenyDb?.absolutniMax ?? 10000;

  const t = await getTranslations();
  const params = await searchParams;
  const conditions = [];

  // A. Vyhledávání textu
  if (params.search) {
    const text = params.search;

    // Vytvoříme varianty textu pro vyhledávání
    const textLower = `%${text.toLowerCase()}%`; // např. "%židle%"
    const textOriginal = `%${text}%`; // např. "%Židle%"

    // Vygenerujeme variantu s velkým prvním písmenem (pro případ, že uživatel zadal malé)
    const textCapitalized = `%${text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()}%`; // např. "%Židle%"

    conditions.push(
      or(
        // Prohledáváme Název inzerátu všemi variantami
        like(listings.name, textOriginal),
        like(listings.name, textLower),
        like(listings.name, textCapitalized),

        // Prohledáváme Popis inzerátu všemi variantami
        like(listings.description, textOriginal),
        like(listings.description, textLower),
        like(listings.description, textCapitalized),
      ),
    );
  }

  // B. Filtrování podle kategorie
  if (params.category) {
    conditions.push(eq(listings.category, params.category));
  }

  // C. Filtrování podle stavu
  if (params.status) {
    if (params.status === "active") {
      conditions.push(or(eq(listings.status, "active"), eq(listings.status, "Aktivní")));
    } else {
      conditions.push(eq(listings.status, params.status));
    }
  }

  // 🌟 D. Nové filtrování rozsahem cen ze Slideru
  const vybranaMinCena = params.minPrice ? Number(params.minPrice) : minCenaZDb;
  const vybranaMaxCena = params.maxPrice ? Number(params.maxPrice) : maxCenaZDb;

  if (!Number.isNaN(vybranaMinCena)) {
    conditions.push(gte(listings.price, vybranaMinCena));
  }
  if (!Number.isNaN(vybranaMaxCena)) {
    conditions.push(lte(listings.price, vybranaMaxCena));
  }

  const filtrovaneInzeraty = await db
    .select()
    .from(listings)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .all();

  return (
    <Stack align="flex-start" gap="md">
      <Stack gap="xs">
        <Title order={1} size="h1" fw={900} style={{ letterSpacing: "-1px" }}>
          {t("page.listings.title")}
        </Title>
        <Text c="dimmed" size="lg" maw={500}>
          {t("page.listings.description")}
        </Text>
        <Link href="/inzeraty/Add" passHref style={{ textDecoration: "none", display: "block", width: "fit-content" }}>
          <Button
            color="orange"
            size="md"
            radius="md"
            leftSection={<IconPlus size={20} />}
            style={{ boxShadow: "0 4px 10px rgba(255, 145, 0, 0.3)", width: "fit-content" }}
          >
            {t("page.listings.Pridatnabidku")}
          </Button>
        </Link>

        {/* 🌟 2. Předáme mezní hodnoty z DB přímo komponentě s filtry */}
        <FiltryBar dbMin={minCenaZDb} dbMax={maxCenaZDb} />
        {filtrovaneInzeraty.length === 0 ? (
          // 🌟 HLÁŠKA PŘI PRÁZDNÉM VÝSLEDKU
          <Alert
            variant="light"
            color="orange"
            title="Žádné inzeráty neodpovídají filtrům"
            icon={<IconInfoCircle size={18} />}
            radius="md"
            mt="xl"
            style={{ width: "100%", maxWidth: 500, margin: "20px auto" }}
          >
            <Stack gap="xs" align="flex-start">
              <Text size="sm">
                Zkuste prosím změnit text vyhledávání, vybrat jinou kategorii nebo roztáhnout cenový slider na větší
                rozsah.
              </Text>
              <Link href="/inzeraty" passHref style={{ textDecoration: "none" }}>
                <Button variant="subtle" color="orange" size="xs" leftSection={<IconFilterOff size={14} />} mt="xs">
                  Vymazat všechny filtry
                </Button>
              </Link>
            </Stack>
          </Alert>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {filtrovaneInzeraty.map((inzerat) => {
              const stav = inzerat.status;
              const jeAktivni = stav === "Aktivní";
              const jeRezervovano = stav === "Rezervováno";

              return (
                <Card key={inzerat.id} shadow="sm" padding="lg" radius="md" withBorder>
                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500} lineClamp={1}>
                      {inzerat.name}{" "}
                    </Text>
                    <Badge color={jeAktivni ? "green" : jeRezervovano ? "indigo" : "gray"}>
                      {jeAktivni ? "Dostupné" : jeRezervovano ? "Rezervováno" : "Prodáno"}
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed" lineClamp={2} h={40}>
                    {inzerat.description}
                  </Text>

                  <Group gap="xs" mt="sm">
                    <Badge variant="outline">{inzerat.category}</Badge>
                    {inzerat.price === 0 && <Badge color="green">zdarma</Badge>}
                  </Group>
                  <CardSection mx="md" mb="md">
                    <Image
                      src={inzerat.Photo && inzerat.Photo.trim() !== "" ? inzerat.Photo : "/blogic-logo.png"}
                      alt={inzerat.name || "Obrázek inzerátu"}
                      h={180}
                      fit="contain"
                      mt="md"
                      bg="gray.0"
                    />
                  </CardSection>
                  <Text fw={700}> {`${inzerat.price.toLocaleString()} ${t("page.listings.Kc")}`}</Text>
                  <Link href={`/inzeraty/${inzerat.id}`} passHref style={{ textDecoration: "none" }}>
                    <Button fullWidth mt="md" radius="md" variant="light">
                      {t("page.listings.button")}
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>
    </Stack>
  );
}
