import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { listings } from "@/db/schemas";
import FiltryBar from "./FiltryBar";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("page.listings.title"),
    description: t("page.listings.description"),
  };
}

export default async function Page() {
  const t = await getTranslations();
  const dataZDatabaze = await db.select().from(listings);
  return (
    <Stack align="flex-start" gap="md">
      <Stack gap="xs">
        <Title order={1} size="h1" fw={900} style={{ letterSpacing: "-1px" }}>
          {t("page.listings.title")}
        </Title>
        <Text c="dimmed" size="lg" maw={500}>
          {t("page.listings.description")}
        </Text>
        <Link href="/inzeraty/Add" passHref style={{ textDecoration: "none" }}>
          <Button
            color="orange"
            size="md"
            radius="md"
            leftSection={<IconPlus size={20} />}
            style={{ boxShadow: "0 4px 10px rgba(255, 145, 0, 0.3)", width: "fit-content" }}        >
            {t("page.listings.Pridatnabidku")}
          </Button>
        </Link>
        <FiltryBar />

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          {dataZDatabaze.map((inzerat) => {
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
                    {inzerat.price > 0 ? `${inzerat.price.toLocaleString()} ${t("page.listings.Kc")} ` : "zdarma"}
                  </Badge>
                </Group>

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
