"use client";

import { Box, Stack, Text } from "@mantine/core";
import { IconMap } from "@tabler/icons-react";

interface InzeratMapaProps {
  adresa: string | null | undefined;
}

export default function InzeratMapa({ adresa }: InzeratMapaProps) {
  // Pokud inzerát nemá vyplněnou adresu, nebudeme mapu vůbec vykreslovat
  if (!adresa || adresa.trim() === "") return null;

  // Google Maps Embed URL (nevyžaduje API klíč, t= určuje typ mapy, z= přiblížení)
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(adresa)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <Stack gap="xs" mt="xl" style={{ width: "100%", maxWidth: 600 }}>
      <Box style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <IconMap size={18} color="var(--mantine-color-orange-6)" />
        <Text size="sm" fw={600} c="dimmed">
          Lokalita: <span style={{ color: "var(--mantine-color-text)" }}>{adresa}</span>
        </Text>
      </Box>

      {/* Rámeček mapy ladící s Mantine designem */}
      <Box
        style={{
          overflow: "hidden",
          borderRadius: "var(--mantine-radius-md)",
          border: "1px solid var(--mantine-color-border)",
          boxShadow: "var(--mantine-shadow-sm)",
          height: "300px",
          width: "100%",
        }}
      >
        <iframe
          width="100%"
          height="100%"
          src={mapUrl}
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Mapa lokality ${adresa}`}
        />
      </Box>
    </Stack>
  );
}
