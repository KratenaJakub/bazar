"use client";

import {
  Button,
  Checkbox,
  FileButton, // 🌟 Přidáno pro výběr souborů
  Group,
  Image,
  NumberInput,
  Paper,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconCheck, IconMapPin, IconUpload } from "@tabler/icons-react";
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
  initialData?: InzeratInitialData;
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

  // 🌟 Stavy pro nahrávání obrázku
  const [imageError, setImageError] = useState<string | null>(null);

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

  // 🌟 Funkce pro zpracování vybraného souboru a konverzi na Base64
  const [base64Images, setBase64Images] = useState<string[]>(() => {
    if (initialData?.Photo) {
      try {
        // Zkusíme parsovat JSON pole
        const parsed = JSON.parse(initialData.Photo);
        return Array.isArray(parsed) ? parsed : [initialData.Photo];
      } catch {
        // Pokud to není JSON (starší inzeráty), vrátíme jako jedno položkové pole
        return [initialData.Photo];
      }
    }
    return [];
  });
  // 🌟 Změna: Zpracování více vybraných souborů najednou
  const handleFilesChange = (files: File[] | null) => {
    setImageError(null);
    if (!files || files.length === 0) return;

    // Omezíme celkový počet např. na 5 obrázků
    if (base64Images.length + files.length > 5) {
      setImageError("Můžete nahrát maximálně 5 obrázků.");
      return;
    }

    files.forEach((file) => {
      if (file.size > 4 * 1024 * 1024) {
        setImageError(`Soubor ${file.name} je příliš velký. Maximální velikost je 4 MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setBase64Images((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const smazatObrazek = (indexDosmazani: number) => {
    setBase64Images((prev) => prev.filter((_, idx) => idx !== indexDosmazani));
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
            name="address"
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
              name="showQrCheck"
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

                {isEmailOveren && (
                  <Button variant="light" color="green" disabled leftSection={<IconCheck size={16} />}>
                    Ověřeno
                  </Button>
                )}
              </Group>

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

          {/* 🌟 NOVÁ SEKCE PRO NAHRÁVÁNÍ OBRÁZKU */}
          <Stack gap="xs" mt="sm">
            <Text size="sm" fw={500}>
              {t.labelObrazek} (Max. 5)
            </Text>

            <FileButton onChange={handleFilesChange} accept="image/png,image/jpeg,image/webp" multiple>
              {(props) => (
                <Button
                  {...props}
                  variant="outline"
                  color="orange"
                  leftSection={<IconUpload size={16} />}
                  w="fit-content"
                >
                  Vybrat fotky z počítače
                </Button>
              )}
            </FileButton>

            {base64Images.length > 0 && (
              <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="sm" mt="xs">
                {base64Images.map((img, idx) => (
                  <Stack key={img} gap={4} align="center" style={{ position: "relative" }}>
                    <Image
                      src={img}
                      alt={`Náhled ${idx + 1}`}
                      h={100}
                      w="100%"
                      radius="md"
                      fit="cover"
                      style={{ border: "1px solid var(--mantine-color-gray-3)" }}
                    />
                    <Button size="xs" variant="subtle" color="red" onClick={() => smazatObrazek(idx)}>
                      Smazat
                    </Button>
                  </Stack>
                ))}
              </SimpleGrid>
            )}

            {imageError && (
              <Text size="xs" color="red">
                {imageError}
              </Text>
            )}

            {/* Pole posíláme na server zabalené jako JSON text */}
            <input type="hidden" name="image" value={JSON.stringify(base64Images)} />
          </Stack>

          <Group justify="flex-end" mt="md">
            <Button type="submit" disabled={!isEmailOveren}>
              {initialData ? "Uložit změny" : t.btnSubmit}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </form>
  );
}
