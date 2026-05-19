import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { listings } from "@/db/schemas";
import FiltryBar from "./FiltryBar";
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
    zdarma?: string;
  }>;
}
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("listings.home.title"),
    description: t("listings.home.description"),
  };
}

export default async function Page({ searchParams }: PageProps) {
  const t = await getTranslations();
  const dataZDatabaze = await db.select().from(listings);

  const params = await searchParams;
  const filterSearch = params.search?.toLowerCase().trim() || "";
  const filterKategorie = params.category?.toLowerCase().trim() || "";
  const filterStav = params.status?.toLowerCase().trim() || "";
  const filterZdarma = params.zdarma === "true";

  const filtrovaneInzeraty = dataZDatabaze.filter((inzerat) => {
    const dbNazev = inzerat.name?.toLowerCase().trim() || "";
    const dbPopis = inzerat.description?.toLowerCase().trim() || "";
    const dbKategorie = inzerat.category?.toLowerCase().trim() || "";
    const dbStav = inzerat.status?.toLowerCase().trim() || "";

    const odpovidaSearch = filterSearch === "" || dbNazev.includes(filterSearch) || dbPopis.includes(filterSearch);

    const odpovidaKategorie =
      filterKategorie === "" ||
      dbKategorie === filterKategorie ||
      dbKategorie.includes(filterKategorie) ||
      filterKategorie.includes(dbKategorie);

    let stavMatches = dbStav === filterStav;
    if (filterStav === "aktivni" && (dbStav.includes("aktiv") || dbStav.includes("dostup"))) {
      stavMatches = true;
    }
    if (filterStav === "rezervovano" && dbStav.includes("rezerv")) {
      stavMatches = true;
    }
    if (filterStav === "prodano" && (dbStav.includes("prodan") || dbStav.includes("predan"))) {
      stavMatches = true;
    }

    const odpovidaStav = filterStav === "" || stavMatches;

    // D. Pouze zdarma
    const odpovidaZdarma = !filterZdarma || Number(inzerat.price) === 0;

    // Inzerát projde POUZE pokud splní všechny 4 podmínky naráz
    return odpovidaSearch && odpovidaKategorie && odpovidaStav && odpovidaZdarma;
  });
  return (
    <Stack align="flex-start" gap="md">
      <Stack gap="xs">
        <Title order={1} size="h1" fw={900} style={{ letterSpacing: "-1px" }}>
          {t("listings.home.title")}
        </Title>
        <Text c="dimmed" size="lg" maw={500}>
          {t("listings.home.description")}
        </Text>
        <Button
          color="orange"
          size="md"
          radius="md"
          leftSection={<IconPlus size={20} />}
          style={{ boxShadow: "0 4px 10px rgba(255, 145, 0, 0.3)", width: "fit-content" }}
        >
          {t("listings.home.Pridatnabidku")}
        </Button>
        <FiltryBar />

        {/* VÝPIS FILTROVANÝCH INZERÁTŮ */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          {filtrovaneInzeraty.map((inzerat) => {
            // Pomocná proměnná pro bezpečné určení stavu (převedeme na malé pro porovnání)
            const stavLower = inzerat.status?.toLowerCase() || "";
            const jeAktivni = stavLower.includes("aktiv") || stavLower === "dostupné";
            const jeRezervovano = stavLower.includes("rezerv");

            return (
              <Card key={inzerat.id} shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" mt="md" mb="xs">
                  <Text fw={500}>{inzerat.name}</Text>
                  <Badge color={jeAktivni ? "green" : jeRezervovano ? "indigo" : "gray"}>
                    {jeAktivni ? "Dostupné" : jeRezervovano ? "Rezervováno" : "Prodáno"}
                  </Badge>
                </Group>

                <Text size="sm" c="dimmed" lineClamp={2}>
                  {inzerat.description}
                </Text>

                <Group gap="xs" mt="sm">
                  <Badge variant="outline">{inzerat.category}</Badge>
                  <Badge color={inzerat.price > 0 ? "blue" : "green"}>
                    {inzerat.price > 0 ? `${inzerat.price.toLocaleString()} Kč` : "Zdarma"}
                  </Badge>
                </Group>

                <Link href={`/inzerat/${inzerat.id}`} passHref style={{ textDecoration: "none" }}>
                  <Button fullWidth mt="md" radius="md" variant="light">
                    Zobrazit detail
                  </Button>
                </Link>
              </Card>
            );
          })}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
