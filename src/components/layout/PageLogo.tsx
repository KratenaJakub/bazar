"use client";

import { useMantineColorScheme } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function PageLogo() {
  const t = useTranslations();
  const { colorScheme } = useMantineColorScheme();

  // Dynamicky zvolíme správný soubor podle režimu
  const logoSrc = colorScheme === "dark" ? "/blogic-logo-dark.png" : "/blogic-logo.png";

  return (
    <Link href="/" passHref>
      <Image
        src={logoSrc} // 🌟 Tady se mění obrázek
        alt={t("common.pageLogo.ariaLabel")}
        width={115}
        height={46}
        style={{ transition: "all 0.3s ease" }}
      />
    </Link>
  );
}
