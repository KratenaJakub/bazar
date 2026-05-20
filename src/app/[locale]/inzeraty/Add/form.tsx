'use client';

import {
  Button,
  Checkbox,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Textarea,
  TextInput
} from "@mantine/core";
import { useState } from "react";

interface FormularProps {
  onSubmitAction: (formData: FormData) => Promise<void>;
  kategorieOptions: { value: string; label: string }[];
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
  };
}

export default function NovyInzeratFormular({ onSubmitAction, t, kategorieOptions }: FormularProps) {
  const [isZdarma, setIsZdarma] = useState(false);
  const [cena, setCena] = useState<number | string>(0);

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
                label= {t.labelNazev}
                placeholder={t.placeholderNazev}
                required
                name = "name"
                withAsterisk
              />
              <Textarea
                label={t.labelPopis}
                placeholder={t.placeholderPopis}
                required
                name = "description"
                withAsterisk
              />
              <Select
                label={t.labelKategorie}
                name = "category"
                placeholder={t.placeholderKategorie}
                data= {kategorieOptions}
                required
                withAsterisk
                comboboxProps={{ dropdownPadding: 0, position: 'bottom' }}
              />
              <Group align="flex-end">
                <NumberInput
                  label={t.labelCena}
                  placeholder={t.placeholderCena}
                  required
                  name = "price"
                  withAsterisk
                  min={0}
                  step={0.01}
                  value={cena}
                  onChange={(val) => setCena(val)}
                  disabled={isZdarma}
                />
                <Checkbox label={t.labelZdarma} name = "free"
                  checked={isZdarma}
                  onChange={(e) => handleZdarmaChange(e.currentTarget.checked)}
                />
              </Group>
              <Group align="flex-end">
                <TextInput
                  label={t.labelJmeno}
                  placeholder={t.placeholderJmeno}
                  required
                  name = "nameSurname"
                  withAsterisk
                  w="25ch"
                />
                <TextInput
                  label={t.labelKontakt}
                  placeholder={t.placeholderKontakt}
                  required
                  name = "contact"
                  withAsterisk
                  w="30ch"
                />
              </Group>
              <TextInput
                label={t.labelObrazek}
                placeholder={t.placeholderObrazek}
                name = "image"
                w="30ch"
              />
              <Group justify="flex-end" mt="md">
                <Button type="submit">{t.btnSubmit}</Button>
              </Group>
            </Stack>
          </Paper>
        </form>
    );
  }
