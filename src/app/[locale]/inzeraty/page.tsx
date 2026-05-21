import { Badge, Button, Card, CardSection, Group, Image, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { and, eq, like, or } from "drizzle-orm";
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
    zdarma?: string;
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
  const t = await getTranslations();
  const params = await searchParams;
  const conditions = [];
  if (params.search) {
    conditions.push(or(like(listings.name, `%${params.search}%`), like(listings.description, `%${params.search}%`)));
  }

  // B. Filtrování podle kategorie
  if (params.category) {
    conditions.push(eq(listings.category, params.category));
  }

  if (params.status) {
    if (params.status === "active") {
      conditions.push(or(eq(listings.status, "active"), eq(listings.status, "Aktivní")));
    } else {
      conditions.push(eq(listings.status, params.status));
    }
  }

  // D. BONUS: Pokud bys tam přece jen vracel to políčko "Pouze věci zdarma" (např. params.zdarma === "true")
  if (params.zdarma === "true") {
    conditions.push(eq(listings.price, 0));
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
        <FiltryBar />

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
      </Stack>
    </Stack>
  );
}
