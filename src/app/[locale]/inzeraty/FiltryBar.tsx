"use client";

import { Checkbox, Paper, Select, SimpleGrid, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

// NAPEVNO DEFINOVANÉ KATEGORIE (Uprav si je podle potřeb formuláře)
export default function FiltryBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. LOKÁLNÍ STAVY PRO VŠECHNY ČTYŘI PRVKY
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [kategorie, setKategorie] = useState<string | null>(searchParams.get("kategorie"));
  const [stav, setStav] = useState<string | null>(searchParams.get("stav"));
  const [zdarma, setZdarma] = useState<boolean>(searchParams.get("zdarma") === "true");

  // Debounce pouze pro textové vyhledávání (aby to neblikalo při každém písmenku)
  const [debouncedSearch] = useDebounce(search, 300);

  // 2. AKTUALIZACE URL PŘI ZMĚNĚ FILTRŮ
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (kategorie) params.set("kategorie", kategorie);
    if (stav) params.set("stav", stav);
    if (zdarma) params.set("zdarma", "true");

    // Zápis do URL adresy vyvolá překreslení serverové komponenty s novými daty
    router.push(`?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, kategorie, stav, zdarma, router]);

  return (
    <Paper withBorder radius="md" p="md" bg="var(--mantine-color-gray-0)">
      <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="md">
        {/* 1. Vyhledávací pole (Nalevo) */}
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
            { value: "elektro", label: "Elektro" },
            { value: "nabytek", label: "Nábytek" },
            { value: "obleceni", label: "Oblečení" },
            { value: "detske-veci", label: "Dětské věci" },
            { value: "knihy", label: "Knihy" },
            { value: "sport", label: "Sport" },
            { value: "ostatni", label: "Ostatní" },
            { value: "kuchyne", label: "Kuchyně" },
          ]}
          value={kategorie}
          onChange={setKategorie}
          clearable
        />

        {/* 3. Filtr Stav */}
        <Select
          label="Stav"
          placeholder="Všechny"
          data={[
            { value: "aktivni", label: "Dostupné" },
            { value: "rezervovano", label: "Rezervováno" },
            { value: "prodano", label: "Prodáno" },
          ]}
          value={stav}
          onChange={setStav}
          clearable
        />

        {/* 4. Pouze zadarmo (Napravo, pěkně centrované na výšku) */}
        <Checkbox
          label="Pouze věci zdarma"
          checked={zdarma}
          onChange={(e) => setZdarma(e.currentTarget.checked)}
          styles={{ root: { paddingTop: 20 } }} // Jemný posun dolů, aby to lícovalo s popisky selectů
        />
      </SimpleGrid>
    </Paper>
  );
}
