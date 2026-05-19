import { Badge, Button, Card, CardSection, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { inzeraty } from "@/db/schemas";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("listings.home.title"),
    description: t("listings.home.description"),
  };
}

export default async function Page() {
  const t = await getTranslations();
  const dataZDatabaze = await db.select().from(inzeraty);
  return (
    <Stack align="flex-start" gap="md">
      <Title>{t("listings.home.title")}</Title>
      <Text>{t("listings.home.description")}</Text>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        {dataZDatabaze.map((inzerat) => (
          <Card key={inzerat.id} shadow="sm" padding="lg" radius="md" withBorder>
            {/* Sekce pro obrázek (pokud inzerát nemá foto, dáme tam prázdný string nebo defaultní obrázek) */}
            <CardSection style={{ position: "relative", height: 160 }}>
              <Image
                src={inzerat.photo || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500"}
                fill
                style={{ objectFit: "cover" }}
                alt={inzerat.name}
                unoptimized
              />
            </CardSection>

            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500}>{inzerat.name}</Text>
              <Badge color="pink">{inzerat.category}</Badge>
            </Group>

            <Text size="sm" c="dimmed" lineClamp={2}>
              {inzerat.description}
            </Text>

            <Text size="xl" fw={700} c={inzerat.price > 0 ? "blue" : "green"} mt="sm">
              {inzerat.price > 0
                ? `${inzerat.price.toLocaleString()} ${t("listings.home.Kč")}`
                : t("listings.home.zdarma")}
            </Text>

            <Text size="xs" c="dimmed" mt="xs">
              {t("listings.home.stav")} {inzerat.status}
            </Text>

            <Link href={`/inzerat/${inzerat.id}`} passHref style={{ textDecoration: "none" }}>
              <Button fullWidth mt="md" radius="md" variant="light">
                {t("listings.home.button")}
              </Button>
            </Link>
          </Card>
        ))}
      </SimpleGrid>

      {dataZDatabaze.length === 0 && (
        <Text c="dimmed" ta="center" my="xl">
          V databázi zatím nejsou žádné inzeráty.
        </Text>
      )}
    </Stack>
  );
}
