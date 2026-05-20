import { Button, Container, Stack, Text, Title } from "@mantine/core";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { listings } from "@/db/schemas";

interface DetailPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("page.home.title"),
    description: t("page.home.description"),
  };
}

export default async function InzeratDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const t = await getTranslations();
  // Dotaz do DB: Vyber inzerát, kde se ID rovná ID z URL adresy
  const [inzerat] = await db.select().from(listings).where(eq(listings.id, id)); // Pokud máš ID v DB jako text/uuid, smaž to Number()

  // Pokud inzerát s tímto ID neexistuje, ukaž 404
  if (!inzerat) {
    notFound();
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="md">
        <Link href="/inzeraty">
          <Button variant="subtle">{t("page.Detail.Zpet")}</Button>
        </Link>

        <Title order={1}>{inzerat.name}</Title>
        <Text size="lg" c="dimmed">
          {t("page.Detail.Kategorie")} {inzerat.category}
        </Text>

        <Text my="xl">
          {t("page.Detail.Popis")} {inzerat.description}
        </Text>

        <Text fw={700} size="xl">
          {t("page.Detail.Cena")} {inzerat.price > 0 ? `${inzerat.price} Kč` : "Zdarma"}
        </Text>
      </Stack>
    </Container>
  );
}
