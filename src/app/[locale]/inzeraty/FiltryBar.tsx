"use client";

import { Box, Paper, RangeSlider, Select, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";

interface FiltryBarProps {
  dbMin: number;
  dbMax: number;
}

export default function FiltryBar({ dbMin, dbMax }: FiltryBarProps) {
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

  // Debounce pro text
  const [debouncedSearch] = useDebounce(search, 300);

  // 🌟 2. REFS PRO BEZPEČNOST PROTI PROMAZÁVÁNÍ TEXTU
  const filtryRef = useRef({ kategorie, stav, cenaRange });
  const lastPushedSearch = useRef<string | null>(null); // Sleduje, jaký text jsme naposledy poslali do URL

  // Kdykoliv se stavy změní, tichým způsobem zaktualizujeme jejich reference
  useEffect(() => {
    filtryRef.current = { kategorie, stav, cenaRange };
  }, [kategorie, stav, cenaRange]);

  // 3. CENTRÁLNÍ FUNKCE PRO AKTUALIZACI URL
  const aktualizujUrl = useCallback(
    (novySearch: string, novaKat: string | null, novyStav: string | null, minP: number, maxP: number) => {
      const params = new URLSearchParams();

      if (novySearch) params.set("search", novySearch);
      if (novaKat) params.set("category", novaKat);
      if (novyStav) params.set("status", novyStav);

      if (minP !== dbMin) params.set("minPrice", minP.toString());
      if (maxP !== dbMax) params.set("maxPrice", maxP.toString());

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [dbMin, dbMax, router, pathname],
  );

  // 🌟 4. REAKCE NA TEXTOVÝ DEBOUNCE
  useEffect(() => {
    const { kategorie: k, stav: s, cenaRange: c } = filtryRef.current;
    lastPushedSearch.current = debouncedSearch; // Uložíme si, co odesíláme, aby nás to při zpětné vazbě nepřemazalo
    aktualizujUrl(debouncedSearch, k, s, c[0], c[1]);
  }, [debouncedSearch, aktualizujUrl]);

  // 5. REAKCE NA ZMĚNU KATEGORIE
  const handleKategorieChange = (val: string | null) => {
    setKategorie(val);
    aktualizujUrl(search, val, stav, cenaRange[0], cenaRange[1]);
  };

  // 6. REAKCE NA ZMĚNU STAVU
  const handleStavChange = (val: string | null) => {
    setStav(val);
    aktualizujUrl(search, kategorie, val, cenaRange[0], cenaRange[1]);
  };

  // 7. REAKCE NA PUŠTĚNÍ SLIDERU
  const handleCenaChangeEnd = (val: [number, number]) => {
    aktualizujUrl(search, kategorie, stav, val[0], val[1]);
  };

  // 🌟 8. SYNCHRONIZACE STAVŮ PŘI ZMĚNĚ URL ZVENČÍ (Opraveno)
  useEffect(() => {
    const s = searchParams.get("search") || "";
    const k = searchParams.get("category");
    const st = searchParams.get("status");
    const minP = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : dbMin;
    const maxP = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : dbMax;

    // Pokud hodnota z URL odpovídá tomu, co náš vlastní debounce naposledy vygeneroval,
    // input nepřepisujeme (protože uživatel už mohl mezitím napsat další znaky).
    if (s === lastPushedSearch.current) {
      lastPushedSearch.current = null; // Vyčistíme pro budoucí externí změny
    } else {
      setSearch(s); // Změna přišla zvenčí (např. tlačítko zpět, reset filtrů) -> zaktualizujeme políčko
    }

    setKategorie(k);
    setStav(st);
    setCenaRange([minP, maxP]);
  }, [searchParams, dbMin, dbMax]);

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      bg="light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6))"
      style={{ width: "100%" }}
    >
      <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="md" style={{ alignItems: "end" }}>
        {/* 1. Vyhledávací pole */}
        <TextInput
          label="Hledat"
          placeholder="Hledat nabídku..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          leftSection={<IconSearch size={16} stroke={1.5} />}
        />

        {/* 2. Filtr Kategorie */}
        <Select
          label="Kategorie"
          placeholder="Všechny"
          data={[
            { value: "Dům a zahrada", label: "Dům a zahrada" },
            { value: "Elektronika", label: "Elektro" },
            { value: "Nábytek", label: "Nábytek" },
            { value: "Oblečení", label: "Oblečení" },
            { value: "Dětské zboží", label: "Dětské věci" },
            { value: "Knihy", label: "Knihy" },
            { value: "Sport", label: "Sport" },
            { value: "Vozidla", label: "Vozidla" },
            { value: "Hudba", label: "Hudba" },
            { value: "Ostatní", label: "Ostatní" },
          ]}
          value={kategorie}
          onChange={handleKategorieChange}
          clearable
        />

        {/* 3. Filtr Stav */}
        <Select
          label="Stav"
          placeholder="Všechny"
          data={[
            { value: "Aktivní", label: "Dostupné" },
            { value: "Rezervováno", label: "Rezervováno" },
            { value: "Prodáno", label: "Prodáno" },
          ]}
          value={stav}
          onChange={handleStavChange}
          clearable
        />

        {/* 4. CENOVÝ RANGE SLIDER */}
        <Stack gap={4} style={{ width: "100%", paddingBottom: 6 }}>
          <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text size="sm" fw={500} style={{ color: "var(--mantine-color-text)" }}>
              Cena
            </Text>
            <Text size="xs" fw={700} c="orange">
              {cenaRange[0].toLocaleString()} – {cenaRange[1].toLocaleString()} Kč
            </Text>
          </Box>

          <RangeSlider
            min={dbMin}
            max={dbMax}
            step={dbMax - dbMin > 1000 ? 100 : 10}
            value={cenaRange}
            onChange={setCenaRange}
            onChangeEnd={handleCenaChangeEnd}
            minRange={0}
            color="orange"
            size="sm"
            radius="md"
            label={null}
            marks={[
              { value: dbMin, label: `${dbMin} Kč` },
              { value: dbMax, label: `${dbMax} Kč` },
            ]}
            styles={{
              markLabel: { fontSize: "10px", marginTop: 4 },
              root: { paddingLeft: 8, paddingRight: 8 },
            }}
          />
        </Stack>
      </SimpleGrid>
    </Paper>
  );
}
