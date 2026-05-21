"use client";

import { Button, Checkbox, Group, NumberInput, Paper, Select, Stack, Textarea, TextInput } from "@mantine/core";
import { useState } from "react";

// 1. Přidáme definici dat pro případnou editaci
interface InzeratInitialData {
  name: string;
  description: string;
  category: string;
  price: number;
  nameSurname: string;
  contact: string;
  Photo?: string | null; // Přizpůsobeno tvé DB (Photo / image)
}

interface FormularProps {
  onSubmitAction: (formData: FormData) => Promise<void>;
  kategorieOptions: { value: string; label: string }[];
  initialData?: InzeratInitialData; // 👈 Volitelná data pro editaci
  t: {
    labelNazev: string;
    placeholderNazev: string;
    labelPopis: string;
    placeholderPopis: string;
    labelKategorie: string;
    placeholderKategorie: string;
    labelCena: string;
    placeholderCena: string;
    labelZdarma: string;
    labelJmeno: string;
    placeholderJmeno: string;
    labelKontakt: string;
    placeholderKontakt: string;
    labelObrazek: string;
    placeholderObrazek: string;
    btnSubmit: string;
    btnEditSubmit?: string; // Volitelný překlad pro uložení změn (např. "Uložit změny")
  };
}

export default function NovyInzeratFormular({ onSubmitAction, t, kategorieOptions, initialData }: FormularProps) {
  // 2. Inicializace stavů podle toho, zda upravujeme nebo tvoříme nový
  const [isZdarma, setIsZdarma] = useState(initialData ? initialData.price === 0 : false);
  const [cena, setCena] = useState<number | string>(initialData ? initialData.price : 0);

  const handleZdarmaChange = (checked: boolean) => {
    setIsZdarma(checked);
    if (checked) {
      setCena(0);
    }
  };

  return (
    <form action={onSubmitAction}>
      <Paper withBorder shadow="sm" p="md" radius="md">
        <Stack align="left">
          <TextInput
            label={t.labelNazev}
            placeholder={t.placeholderNazev}
            required
            name="name"
            withAsterisk
            defaultValue={initialData?.name || ""} // 👈 Předvyplnění
          />
          <Textarea
            label={t.labelPopis}
            placeholder={t.placeholderPopis}
            required
            name="description"
            withAsterisk
            defaultValue={initialData?.description || ""} // 👈 Předvyplnění
          />
          <Select
            label={t.labelKategorie}
            name="category"
            placeholder={t.placeholderKategorie}
            data={kategorieOptions}
            required
            withAsterisk
            comboboxProps={{ dropdownPadding: 0, position: "bottom" }}
            defaultValue={initialData?.category || null} // 👈 Předvyplnění
          />
          <Group align="flex-end">
            <NumberInput
              label={t.labelCena}
              placeholder={t.placeholderCena}
              required
              name="price"
              withAsterisk
              min={0}
              step={0.01}
              value={cena}
              onChange={(val) => setCena(val)}
              disabled={isZdarma}
            />
            <Checkbox
              label={t.labelZdarma}
              name="free"
              checked={isZdarma}
              onChange={(e) => handleZdarmaChange(e.currentTarget.checked)}
            />
          </Group>
          <Group align="flex-end">
            <TextInput
              label={t.labelJmeno}
              placeholder={t.placeholderJmeno}
              required
              name="nameSurname"
              withAsterisk
              w="25ch"
              defaultValue={initialData?.nameSurname || ""} // 👈 Předvyplnění
            />
            <TextInput
              label={t.labelKontakt}
              placeholder={t.placeholderKontakt}
              required
              name="contact"
              withAsterisk
              w="30ch"
              defaultValue={initialData?.contact || ""} // 👈 Předvyplnění
            />
          </Group>
          <TextInput
            label={t.labelObrazek}
            placeholder={t.placeholderObrazek}
            name="image"
            w="30ch"
            defaultValue={initialData?.Photo || ""} // 👈 Předvyplnění (pokud v DB používáš Photo)
          />
          <Group justify="flex-end" mt="md">
            {/* 3. Dynamický text tlačítka (Uložit změny vs Vytvořit) */}
            <Button type="submit">{initialData ? t.btnEditSubmit || "Uložit změny" : t.btnSubmit}</Button>
          </Group>
        </Stack>
      </Paper>
    </form>
  );
}
