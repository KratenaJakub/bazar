"use client";

import { Checkbox, Paper, Select, SimpleGrid, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

export default function FiltryBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    if (kategorie) params.set("category", kategorie);
    if (stav) params.set("status", stav);
    if (zdarma) params.set("zdarma", "true");

    // Zápis do URL adresy vyvolá překreslení serverové komponenty s novými daty
    router.push(`?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, kategorie, stav, zdarma, router]);

  return (
    <Paper withBorder radius="md" p="md" bg="light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6))">
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
          onChange={setKategorie}
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
          onChange={setStav}
          clearable
        />

        {/* 4. Pouze zadarmo (Napravo, pěkně centrované na výšku) */}
        <Checkbox
          label="Pouze věci zdarma"
          checked={zdarma}
          onChange={(e) => setZdarma(e.currentTarget.checked)}
          styles={{ root: { paddingTop: 40 } }} // Jemný posun dolů, aby to lícovalo s popisky selectů
        />
      </SimpleGrid>
    </Paper>
  );
}
