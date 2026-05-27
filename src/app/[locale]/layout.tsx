import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { auth } from "@/auth";
import { Providers } from "@/components/infrastructure/Providers";
import { PageLayout } from "@/components/layout/PageLayout";
import { routing } from "@/i18n/routing";

// 🌟 Opravíme typování params přesně podle standardu Next.js, aby neodmlouval TypeScript
interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  // Korektní asynchronní rozbalení locale
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // 🌟 Načtení session přímo tady
  const session = await auth();

  return (
    <html lang={locale} {...mantineHtmlProps} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <NextIntlClientProvider>
          <MantineProvider defaultColorScheme="auto">
            <ModalsProvider>
              <Providers>
                {/* 🌟 Předáme session do PageLayoutu */}
                <PageLayout session={session}>{children}</PageLayout>
              </Providers>
            </ModalsProvider>
          </MantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
