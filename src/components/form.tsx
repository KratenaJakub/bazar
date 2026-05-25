"use client";

import {
  Button,
  Checkbox,
  Group,
  NumberInput,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconCheck, IconMapPin } from "@tabler/icons-react";
import { useState } from "react";
import { overitKodAction, poslatOverovaciEmail } from "@/app/actions/authactions";

interface InzeratInitialData {
  name: string;
  description: string;
  category: string;
  price: number;
  nameSurname: string;
  contact: string;
  Photo?: string | null;
  showQr?: boolean;
  bankAccount?: string | null;
  address?: string | null;
}
interface FormularProps {
  onSubmitAction: (formData: FormData) => Promise<void>;
  kategorieOptions: { value: string; label: string }[];
  initialData?: InzeratInitialData; // Přidáno pro editační režim z předchozího kroku
  isLoggedIn?: boolean;
  defaultName?: string;
  defaultEmail?: string;
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
    labelHeslo: string;
    placeholderHeslo: string;
    upozorneniHeslo: string;
  };
}

export default function NovyInzeratFormular({
  onSubmitAction,
  t,
  kategorieOptions,
  initialData,
  defaultEmail,
  defaultName,
  isLoggedIn,
}: FormularProps) {
  const [isZdarma, setIsZdarma] = useState(initialData ? initialData.price === 0 : false);
  const [cena, setCena] = useState<number | string>(initialData ? initialData.price : 0);
  const [showQr, setShowQr] = useState<boolean>(initialData?.showQr ?? false);
  // --- STAVY PRO VERIFIKACI E-MAILU ---
  const [email, setEmail] = useState(initialData?.contact || defaultEmail || "");
  const [posilaSeEmail, setPosilaSeEmail] = useState(false);
  const [kodOdeslan, setKodOdeslan] = useState(false);
  const [serverovyHash, setServerovyHash] = useState("");
  const [zadanyKod, setZadanyKod] = useState("");
  const [isEmailOveren, setIsEmailOveren] = useState(Boolean(initialData) || Boolean(isLoggedIn));
  const [verifikaceError, setVerifikaceError] = useState<string | null>(null);

  const handleZdarmaChange = (checked: boolean) => {
    setIsZdarma(checked);
    if (checked) {
      setCena(0);
    }
  };

  // 1. Spuštění odeslání e-mailu
  const handlePoslatKod = async () => {
    setVerifikaceError(null);
    setPosilaSeEmail(true);

    const res = await poslatOverovaciEmail(email);
    setPosilaSeEmail(false);

    if (res.success && res.hash) {
      setKodOdeslan(true);
      setServerovyHash(res.hash);
    } else {
      setVerifikaceError(res.error || "Chyba při odesílání.");
    }
  };

  // 2. Ověření přepsaného kódu uživatelem
  const handleOveritKod = async () => {
    setVerifikaceError(null);
    const res = await overitKodAction(email, zadanyKod, serverovyHash);

    if (res.success) {
      setIsEmailOveren(true);
      setKodOdeslan(false);
    } else {
      setVerifikaceError(res.error || "Nesprávný kód.");
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
            defaultValue={initialData?.name || ""}
          />
          <Textarea
            label={t.labelPopis}
            placeholder={t.placeholderPopis}
            required
            name="description"
            withAsterisk
            defaultValue={initialData?.description || ""}
          />
          <Select
            label={t.labelKategorie}
            name="category"
            placeholder={t.placeholderKategorie}
            data={kategorieOptions}
            required
            withAsterisk
            comboboxProps={{ dropdownPadding: 0, position: "bottom" }}
            defaultValue={initialData?.category || null}
          />
          <TextInput
            label="Lokalita / Adresa"
            placeholder="Např. Zlín, Brno-střed, nebo konkrétní ulice..."
            name="address" // klíčové pro FormData
            defaultValue={initialData?.address || ""}
            leftSection={<IconMapPin size={16} stroke={1.5} />}
            radius="md"
            mt="md"
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
          <Stack gap="xs" mt="sm">
            <Checkbox
              label="Povolit platbu QR kódem"
              name="showQrCheck" // name pro checkbox (Next ho pošle jako "on" nebo null)
              checked={showQr}
              onChange={(e) => setShowQr(e.currentTarget.checked)}
            />

            {showQr && (
              <TextInput
                label="Číslo bankovního účtu"
                placeholder="Např. 123456789/0100"
                name="bankAccount"
                required
                withAsterisk
                w="30ch"
                defaultValue={initialData?.bankAccount || ""}
              />
            )}
            {/* Skrytý input pro boolean hodnotu showQr, aby se snadno posílala */}
            <input type="hidden" name="showQr" value={showQr ? "true" : "false"} />
          </Stack>
          <Group align="flex-end">
            <TextInput
              label={t.labelJmeno}
              placeholder={t.placeholderJmeno}
              required
              name="nameSurname"
              withAsterisk
              w="25ch"
              defaultValue={initialData?.nameSurname || defaultName || ""}
            />

            {/* SEKCE PRO E-MAIL A JEHO VERIFIKACI */}
            <Stack gap={2} align="flex-start">
              <Group align="flex-end" gap="xs">
                <TextInput
                  label={t.labelKontakt}
                  placeholder={t.placeholderKontakt}
                  required
                  withAsterisk
                  w="30ch"
                  type="email"
                  value={email}
                  disabled={isEmailOveren || kodOdeslan || isLoggedIn}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  error={verifikaceError}
                />
                <input type="hidden" name="contact" value={email} />

                {/* Tlačítko pro zaslání kódu */}
                {!isEmailOveren && !kodOdeslan && (
                  <Button
                    onClick={handlePoslatKod}
                    loading={posilaSeEmail}
                    disabled={!email.includes("@")}
                    variant="light"
                    color="blue"
                  >
                    Ověřit e-mail
                  </Button>
                )}

                {/* Indikátor úspěšného ověření */}
                {isEmailOveren && (
                  <Button variant="light" color="green" disabled leftSection={<IconCheck size={16} />}>
                    Ověřeno
                  </Button>
                )}
              </Group>

              {/* Políčko pro zadání kódu, které vyskočí po odeslání */}
              {kodOdeslan && (
                <Group align="flex-end" gap="xs" mt="xs">
                  <TextInput
                    placeholder="Zadejte 6místný kód"
                    w="18ch"
                    value={zadanyKod}
                    onChange={(e) => setZadanyKod(e.currentTarget.value)}
                  />
                  <Button color="green" onClick={handleOveritKod}>
                    Potvrdit kód
                  </Button>
                  <Button variant="subtle" color="dimmed" onClick={() => setKodOdeslan(false)}>
                    Zrušit
                  </Button>
                </Group>
              )}
            </Stack>
          </Group>
          {!isLoggedIn && !initialData && (
            <PasswordInput
              label={t.labelHeslo}
              description={t.upozorneniHeslo}
              placeholder={t.placeholderHeslo}
              required
              withAsterisk
              name="editPassword"
              w={{ base: "100%", sm: "50%" }}
              mt="sm"
            />
          )}
          <TextInput
            label={t.labelObrazek}
            placeholder={t.placeholderObrazek}
            name="image"
            w="30ch"
            defaultValue={initialData?.Photo || ""}
          />

          <Group justify="flex-end" mt="md">
            {/* BUTTON SE ODPOUTÁ A BUDE KLIKACÍ POUZE POKUD JE EMAIL OVĚŘENÝ */}
            <Button type="submit" disabled={!isEmailOveren}>
              {initialData ? "Uložit změny" : t.btnSubmit}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </form>
  );
}
