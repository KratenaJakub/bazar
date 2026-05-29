"use client";

import { useComputedColorScheme } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PageLogo() {
  const computedColorScheme = useComputedColorScheme("light");
  const [mounted, setMounted] = useState(false);

  // Počkáme, až se komponenta připojí na klientovi
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🌟 URČENÍ LOGA:
  // Dokud nejsme na klientovi (mounted je false), použijeme VŽDY výchozí světlé logo.
  // Tím zajistíme, že server i klient vyrenderují při prvním průchodu naprosto stejné HTML.
  const isDark = mounted && computedColorScheme === "dark";
  const logoSrc = isDark ? "/blogic-logo-dark.png" : "/blogic-logo.png";

  return (
    <Link href="/inzeraty" passHref style={{ display: "block" }}>
      <Image
        src={logoSrc}
        alt="Logo značky Blogic"
        width={115}
        height={46}
        style={{ transition: "all 0.3s ease" }}
        priority // Volitelné: pokud je logo v hlavičce, načte se rychleji
      />
    </Link>
  );
}
