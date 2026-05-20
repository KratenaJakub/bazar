"use client";

import { Button, Group, Image, Modal, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { useState } from "react";

interface DetailProps {
  inzerat: {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    status: string;
    NameSurname: string;
    contact: string;
    Photo: string;
  };
  onDelete: () => Promise<void>;
  onReserve: () => Promise<void>;
  onSell: () => Promise<void>;
}

export default function DetailInzeratu({ inzerat, onDelete, onReserve, onSell }: DetailProps) {
  // Stav pro otevření potvrzovacího okna mazání
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActionPending, setIsActionPending] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setDeleteModalOpen(false);
  };

  return (
    <Stack gap="xl">
      {/* Odkaz zpět */}
      <Link href="/inzeraty" style={{ textDecoration: "none", color: "var(--mantine-color-blue-filled)" }}>
        ← Zpět na přehled
      </Link>

      {/* Dvousloupcový layout: Na mobilu pod sebou, na desktopu vedle sebe */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        {/* LEVÁ ČÁST: Sjednocené informace v jednom Paperu */}
        <Paper withBorder shadow="sm" radius="md" p="xl">
          <Stack gap="md">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Kategorie: {inzerat.category}
              </Text>
              <Title order={1} mt="xs">
                {inzerat.name}
              </Title>
              <Text size="sm" c={inzerat.status === "Aktivní" ? "green" : "orange"} fw={500} mt={4}>
                Stav: {inzerat.status}
              </Text>
            </div>

            <Text style={{ whiteSpace: "pre-line" }}>{inzerat.description}</Text>

            <Group
              justify="space-between"
              mt="xl"
              pt="md"
              style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
            >
              <Text size="lg" fw={700}>
                Cena: {inzerat.price === 0 ? "Zdarma" : `${inzerat.price} Kč`}
              </Text>
            </Group>
          </Stack>
        </Paper>

        {/* PRAVÁ ČÁST: Obrázek (vykreslí se, pouze pokud existuje URL) */}
        {inzerat.Photo && inzerat.Photo.trim() !== "" ? (
          <Paper
            withBorder
            shadow="sm"
            radius="md"
            p="md"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}
          >
            <Image src={inzerat.Photo} alt={inzerat.name} height={400} fit="contain" radius="md" />
          </Paper>
        ) : (
          <Paper
            withBorder
            shadow="sm"
            radius="md"
            p="xl"
            bg="gray.0"
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Text c="dimmed">Inzerát nemá žádný obrázek</Text>
          </Paper>
        )}
      </SimpleGrid>

      {/* AKČNÍ TLAČÍTKA POD DETAILU */}
      <Paper withBorder shadow="sm" radius="md" p="lg" maw={600}>
        <Stack gap="md">
          {/* Rezervovat a Prodat vedle sebe */}
          <SimpleGrid cols={2} spacing="md">
            <Button
              // Pokud je rezervováno, dáme variantu 'filled', jinak 'outline'
              variant={inzerat.status === "Rezervováno" ? "filled" : "outline"}
              color="orange"
              size="md"
              // Tlačítko zakážeme pouze v případě, že je inzerát už prodaný
              disabled={inzerat.status === "Prodáno" || inzerat.status === "sold"}
              loading={isActionPending}
              onClick={async () => {
                setIsActionPending(true);
                await onReserve(); // Zavolá serverovou akci, která sama pozná, co dělat
                setIsActionPending(false);
              }}
            >
              {/* Dynamický text podle aktuálního stavu */}
              {inzerat.status === "Rezervováno" ? "Zrušit rezervaci" : "Rezervovat"}
            </Button>
            <Button
              variant="light"
              color="green"
              size="md"
              disabled={inzerat.status === "Prodáno"}
              loading={isActionPending}
              onClick={async () => {
                setIsActionPending(true);
                await onSell();
                setIsActionPending(false);
              }}
            >
              Prodáno
            </Button>
          </SimpleGrid>

          {/* Úplně dole tlačítko na smazání inzerátu */}
          <Button variant="subtle" color="red" mt="xs" onClick={() => setDeleteModalOpen(true)}>
            Smazat inzerát
          </Button>
        </Stack>
      </Paper>

      {/* POTVRZOVACÍ MODAL PRO SMAZÁNÍ */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Potvrdit smazání"
        centered
        radius="md"
      >
        <Stack gap="md">
          <Text size="sm">
            Opravdu si přejete smazat inzerát <strong>{inzerat.name}</strong>? Tato akce je nevratná.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="transparent" color="gray" onClick={() => setDeleteModalOpen(false)}>
              Zrušit
            </Button>
            <Button color="red" onClick={handleDelete} loading={isDeleting}>
              Smazat
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
