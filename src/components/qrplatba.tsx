"use client";

import { Group, Paper, Stack, Text, Title } from "@mantine/core";
import { QRCodeSVG } from "qrcode.react";

interface PlatbaQRProps {
  cena: number;
  nazevInzeratu: string;
  cisloUctu: string; // 👈 Přidáme prop pro reálný účet
}

export default function PlatbaQR({ cena, nazevInzeratu, cisloUctu }: PlatbaQRProps) {
  if (cena <= 0 || !cisloUctu) return null;

  // Rozdělíme číslo účtu a kód banky (očekáváme formát 123456789/0100)
  const [ucet, banka] = cisloUctu.split("/");

  const cistyNazev = nazevInzeratu.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Sestavení SPAYD řetězce s dynamickým účtem
  const qrHodnota = `SPD*1.0*ACC:${ucet}${banka || ""}*AM:${cena}*CC:CZK*MSG:${cistyNazev.substring(0, 20)}`;

  return (
    <Paper withBorder p="md" radius="md" style={{ maxWidth: 300, textAlign: "center" }}>
      <Stack align="center" gap="xs">
        <Title order={5}>Rychlá platba přes QR</Title>
        <Text size="xs" c="dimmed">
          Ukázkové demo placení pro inzerát
        </Text>

        <Group justify="center" my="xs" style={{ background: "white", padding: 10, borderRadius: 8 }}>
          <QRCodeSVG value={qrHodnota} size={180} bgColor={"#ffffff"} fgColor={"#000000"} level={"L"} />
        </Group>

        <Text size="sm" fw={500}>
          Částka: {cena} Kč
        </Text>
      </Stack>
    </Paper>
  );
}
