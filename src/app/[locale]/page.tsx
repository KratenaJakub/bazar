import { Button, Stack, Text, Title } from "@mantine/core";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return {
    title: t("page.home.title"),
    description: t("page.home.description"),
  };
}

export default async function Page() {
  const t = await getTranslations();

  return (
    <Stack align="flex-start" gap="md">
      <Title>{t("page.home.title")}</Title>
      <Text>{t("page.home.description")}</Text>
      <Link href="/inzeraty" passHref style={{ textDecoration: "none" }}>
        <Button size="md" color="blue">
          {t("page.home.button")}
        </Button>
      </Link>
    </Stack>
  );
}
