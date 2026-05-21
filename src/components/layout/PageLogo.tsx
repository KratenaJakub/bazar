"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function PageLogo() {
  const t = useTranslations();

  return (
    <Link href="/" passHref>
      <Image src="/blogic-logo.png" alt={t("common.pageLogo.ariaLabel")} width={115} height={46} />
    </Link>
  );
}
