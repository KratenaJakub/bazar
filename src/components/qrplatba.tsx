"use client";

import { Group, Paper, Stack, Text, Title } from "@mantine/core";
import { QRCodeSVG } from "qrcode.react";

interface PlatbaQRProps {
  cena: number;
  nazevInzeratu: string;
}

export default function PlatbaQR({ cena, nazevInzeratu }: PlatbaQRProps) {
  // Pokud je věc zdarma, QR kód nedává smysl
  if (cena <= 0) return null;

  // Formát pro reálnou českou QR platbu (SPAYD)
  // Účet a kód banky jsou vymyšlené (1234567890/0100)
  const ucet = "1234567890";
  const banka = "0100";

  // Sestavení textu pro QR kód. Diakritiku raději odstraníme pomocí normalize
  const cistyNazev = nazevInzeratu.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const qrHodnota = `SPD*1.0*ACC:${ucet}${banka}*AM:${cena}*CC:CZK*MSG:${cistyNazev.substring(0, 20)}`;

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
