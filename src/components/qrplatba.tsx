"use client";

import { Group, Paper, Stack, Text, Title } from "@mantine/core";
import { QRCodeSVG } from "qrcode.react";

interface PlatbaQRProps {
  cena: number;
  nazevInzeratu: string;
  cisloUctu: string; // Očekává formát např. "123456789/0100" nebo s předčíslím "12-3456789/0100"
}

// 🌟 Pomocná funkce pro převod českého účtu na IBAN
function prevedNaIban(cisloUctu: string): string | null {
  try {
    // Odstraníme případné mezery
    const cisteCislo = cisloUctu.replace(/\s/g, "");

    // Rozdělíme na část před lomítkem (účet) a za lomítkem (banka)
    const [vsechnoPredLomitkem, kodBanky] = cisteCislo.split("/");
    if (!vsechnoPredLomitkem || !kodBanky || kodBanky.length !== 4) return null;

    // Rozdělíme účet na případné předčíslí a samotné číslo
    let predcisli = "000000";
    let zakladniUcet = vsechnoPredLomitkem;

    if (vsechnoPredLomitkem.includes("-")) {
      const parts = vsechnoPredLomitkem.split("-");
      predcisli = parts[0].padStart(6, "0");
      zakladniUcet = parts[1];
    }

    zakladniUcet = zakladniUcet.padStart(10, "0");

    // Sestavíme základ pro výpočet kontrolních číslic (Kód banky + předčíslí + účet + kód pro CZ (1235) + "00")
    const ibanZaklad = `${kodBanky}${predcisli}${zakladniUcet}123500`;

    // Výpočet kontrolních číslic pomocí modulo 97 (velká čísla musíme zpracovat po částech kvůli JS limitům)
    let zbytek = 0;
    for (let i = 0; i < ibanZaklad.length; i += 7) {
      const blok = zbytek.toString() + ibanZaklad.substring(i, i + 7);
      zbytek = parseInt(blok, 10) % 97;
    }

    const kontrolniCislice = (98 - zbytek).toString().padStart(2, "0");

    // Výsledný IBAN
    return `CZ${kontrolniCislice}${kodBanky}${predcisli}${zakladniUcet}`;
  } catch {
    // 🌟 Závorky s (e) jsme úplně smazali
    return null;
  }
}

export default function PlatbaQR({ cena, nazevInzeratu, cisloUctu }: PlatbaQRProps) {
  if (cena <= 0 || !cisloUctu) return null;

  // 1. Převedeme tvůj účet na validní IBAN
  const iban = prevedNaIban(cisloUctu);

  // Pokud se převod nepovede, QR kód raději nevykreslíme, aby uživatel neposlal peníze jinam
  if (!iban) {
    return (
      <Text size="xs" c="red">
        Chybné číslo bankovního účtu
      </Text>
    );
  }

  // 2. Odstraníme diakritiku z názvu inzerátu
  const cistyNazev = nazevInzeratu.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 3. Sestavení SPAYD řetězce s IBAN formátem
  const qrHodnota = `SPD*1.0*ACC:${iban}*AM:${cena.toFixed(2)}*CC:CZK*MSG:${cistyNazev.substring(0, 20)}`;

  return (
    <Paper withBorder p="md" radius="md" style={{ maxWidth: 300, textAlign: "center" }}>
      <Stack align="center" gap="xs">
        <Title order={5}>Rychlá platba přes QR</Title>
        <Text size="xs" c="dimmed">
          Naskenujte kód ve své bankovní aplikaci
        </Text>

        <Group justify="center" my="xs" style={{ background: "white", padding: 10, borderRadius: 8 }}>
          <QRCodeSVG value={qrHodnota} size={180} bgColor={"#ffffff"} fgColor={"#000000"} level={"M"} />
        </Group>

        <Text size="sm" fw={500}>
          Částka: {cena.toLocaleString()} Kč
        </Text>
      </Stack>
    </Paper>
  );
}
