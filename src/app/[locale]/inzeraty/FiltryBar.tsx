"use client";

import { Box, Group, NumberInput, Paper, RangeSlider, Select, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

interface FiltryBarProps {
  dbMin: number;
  dbMax: number;
}

export default function FiltryBar({ dbMin, dbMax }: FiltryBarProps) {
  const t = useTranslations("FiltryBar");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Lokální stavy pro UI
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [kategorie, setKategorie] = useState<string | null>(searchParams.get("category"));
  const [stav, setStav] = useState<string | null>(searchParams.get("status"));

  const urlMin = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : dbMin;
  const urlMax = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : dbMax;
  const [cenaRange, setCenaRange] = useState<[number, number]>([urlMin, urlMax]);
  const cenaRangeRef = useRef<[number, number]>(cenaRange);

  // 🌟 PŘIDÁNO: Pokaždé, když se změní cenaRange, jen si ji potichu uložíme do refu
  useEffect(() => {
    cenaRangeRef.current = cenaRange;
  }, [cenaRange]);

  // Debounce pro text
  const [debouncedSearch] = useDebounce(search, 300);

  // 🌟 REFS PRO BEZPEČNOST PROTI PROMAZÁVÁNÍ TEXTU
  const isInitialMount = useRef(true);

  // 🌟 SPOLEČNÁ FUNKCE PRO SYNCHRONIZACI URL ADRESY
  const aktualizujUrl = useCallback(
    (novySearch: string, novaKat: string | null, novyStav: string | null, novyMin: number, novyMax: number) => {
      const params = new URLSearchParams(searchParams.toString());

      if (novySearch.trim()) params.set("search", novySearch);
      else params.delete("search");

      if (novaKat) params.set("category", novaKat);
      else params.delete("category");

      if (novyStav) params.set("status", novyStav);
      else params.delete("status");

      // Ukládáme jen pokud se hodnoty liší od absolutního minima/maxima z DB
      if (novyMin > dbMin) params.set("minPrice", novyMin.toString());
      else params.delete("minPrice");

      if (novyMax < dbMax) params.set("maxPrice", novyMax.toString());
      else params.delete("maxPrice");

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router, dbMin, dbMax],
  );

  // 3. EFFECT PRO REAGOVÁNÍ NA ZMĚNY TEXTU (DEBOUNCED) A SELECTŮ
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // 🌟 Změna: Čteme hodnotu z refu (cenaRangeRef.current) místo přímo ze stavu.
    // Linter je spokojený, protože refy se do závislostí psát nemusí!
    aktualizujUrl(debouncedSearch, kategorie, stav, cenaRangeRef.current[0], cenaRangeRef.current[1]);
  }, [debouncedSearch, kategorie, stav, aktualizujUrl]); // 🌟 Pole má pevnou velikost, chyba zmizí!
  const handleKategorieChange = (val: string | null) => {
    setKategorie(val);
  };

  const handleStavChange = (val: string | null) => {
    setStav(val);
  };

  // Handlery pro změnu ceny z inputů
  const handleMinInputPropsChange = (val: string | number) => {
    const cislo = typeof val === "string" ? Number(val) : val;
    const bezpecneCislo = Number.isNaN(cislo) ? dbMin : Math.max(dbMin, Math.min(cislo, cenaRange[1]));
    const novyRange: [number, number] = [bezpecneCislo, cenaRange[1]];
    setCenaRange(novyRange);
    aktualizujUrl(search, kategorie, stav, novyRange[0], novyRange[1]);
  };

  const handleMaxInputPropsChange = (val: string | number) => {
    const cislo = typeof val === "string" ? Number(val) : val;
    const bezpecneCislo = Number.isNaN(cislo) ? dbMax : Math.min(dbMax, Math.max(cislo, cenaRange[0]));
    const novyRange: [number, number] = [cenaRange[0], bezpecneCislo];
    setCenaRange(novyRange);
    aktualizujUrl(search, kategorie, stav, novyRange[0], novyRange[1]);
  };

  // Konec tažení slideru – propíšeme do URL
  const handleCenaChangeEnd = (val: [number, number]) => {
    aktualizujUrl(search, kategorie, stav, val[0], val[1]);
  };

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      bg="light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))"
      style={{ width: "100%" }}
    >
      <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="md">
        {/* 1. TEXTOVÉ VYHLEDÁVÁNÍ */}
        <TextInput
          placeholder={t("searchPlaceholder")}
          leftSection={<IconSearch size={16} />}
          value={search}
          label={t("hledatLabel")}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />

        {/* 2. KATEGORIE */}
        <Select
          label={t("kategorieLabel")}
          placeholder={t("kategorieLabel")}
          data={[
            { value: "Dům a zahrada", label: t("Categories.Home_Garden") },
            { value: "Elektronika", label: t("Categories.Electronics") },
            { value: "Nábytek", label: t("Categories.Furniture") },
            { value: "Oblečení", label: t("Categories.Clothing") },
            { value: "Dětské zboží", label: t("Categories.Children") },
            { value: "Knihy", label: t("Categories.Books") },
            { value: "Sport", label: t("Categories.Sport") },
            { value: "Vozidla", label: t("Categories.Vehicles") },
            { value: "Hudba", label: t("Categories.Music") },
            { value: "Ostatní", label: t("Categories.Misc") },
          ]}
          value={kategorie}
          onChange={handleKategorieChange}
          clearable
        />

        {/* 3. STAV INZERÁTU */}
        <Select
          label={t("stavLabel")}
          placeholder={t("stavLabel")}
          data={[
            { value: "Aktivní", label: t("Status.Active") },
            { value: "Rezervováno", label: t("Status.Reserved") },
            { value: "Prodáno", label: t("Status.Sold") },
          ]}
          value={stav}
          onChange={handleStavChange}
          clearable
        />

        {/* 4. CENOVÝ SELEKTOR (SLIDER + RUČNÍ INPUTY) */}
        <Stack gap={8} style={{ width: "100%", paddingBottom: 6 }}>
          <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text size="sm" fw={500} style={{ color: "var(--mantine-color-text)" }}>
              {t("dbRangeLabel")}
            </Text>
          </Box>

          {/* 🌟 Přidaná textová políčka pro přesné zadání od-do */}
          <Group gap="xs" grow>
            <NumberInput
              placeholder={t("minPricePlaceholder")}
              size="xs"
              min={dbMin}
              max={dbMax}
              value={cenaRange[0]}
              onChange={handleMinInputPropsChange}
              thousandSeparator=" "
              suffix={t("suffix")}
            />
            <NumberInput
              placeholder={t("maxPricePlaceholder")}
              size="xs"
              min={dbMin}
              max={dbMax}
              value={cenaRange[1]}
              onChange={handleMaxInputPropsChange}
              thousandSeparator=" "
              suffix={t("suffix")}
            />
          </Group>

          <Box px={4} mt={4}>
            <RangeSlider
              min={dbMin}
              max={dbMax}
              step={dbMax - dbMin > 1000 ? 100 : 1}
              value={cenaRange}
              onChange={setCenaRange}
              onChangeEnd={handleCenaChangeEnd}
              minRange={0}
              color="orange"
              size="sm"
              radius="md"
              label={null}
              suppressHydrationWarning
              marks={[
                { value: dbMin, label: `${dbMin.toLocaleString()} Kč` },
                { value: dbMax, label: `${dbMax.toLocaleString()} Kč` },
              ]}
              styles={{
                markLabel: { fontSize: "10px", marginTop: "4px" },
              }}
            />
          </Box>
        </Stack>
      </SimpleGrid>
    </Paper>
  );
}
