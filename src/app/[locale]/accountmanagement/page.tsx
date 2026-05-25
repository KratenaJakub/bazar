"use client";

import { Avatar, Badge, Button, Card, Container, Group, Paper, SimpleGrid, Tabs, Text, Title } from "@mantine/core";
import { IconCheck, IconPackage, IconSettings, IconTrash } from "@tabler/icons-react";

export default function ProfilPage() {
  // Simulovaná data přihlášeného uživatele (poté nahradíme session z NextAuth)
  const user = {
    name: "Jakub Podaný",
    email: "kubap@blogic.cz",
    avatar: "",
  };

  // Simulované inzeráty patřící tomuto uživateli
  const mojeInzeraty = [
    { id: "1", name: "Moderní židle", price: 450, status: "Aktivní" },
    { id: "2", name: "Starý Xbox One", price: 2500, status: "Rezervováno" },
  ];

  return (
    <Container size="md" my={40}>
      {/* Horní info karta uživatele */}
      <Paper p="xl" radius="md" withBorder bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))">
        <Group gap="lg">
          <Avatar src={user.avatar} size={80} radius={80} color="orange">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <div>
            <Title order={2}>{user.name}</Title>
            <Text c="dimmed" size="sm">
              {user.email}
            </Text>
          </div>
        </Group>
      </Paper>

      {/* Záložky pro navigaci v profilu */}
      <Tabs defaultValue="inzeraty" color="orange" mt="xl">
        <Tabs.List>
          <Tabs.Tab value="inzeraty" leftSection={<IconPackage size={16} />}>
            Moje inzeráty
          </Tabs.Tab>
          <Tabs.Tab value="nastaveni" leftSection={<IconSettings size={16} />}>
            Nastavení účtu
          </Tabs.Tab>
        </Tabs.List>

        {/* 1. Záložka: Správa inzerátů */}
        <Tabs.Panel value="inzeraty" pt="md">
          <Text size="sm" c="dimmed" mb="md">
            Zde můžete spravovat své nabídky na bazaru.
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {mojeInzeraty.map((inz) => (
              <Card key={inz.id} withBorder radius="md" p="md" shadow="sm">
                <Group justify="space-between" mb="xs">
                  <Text fw={600}>{inz.name}</Text>
                  <Badge color={inz.status === "Aktivní" ? "green" : "indigo"}>{inz.status}</Badge>
                </Group>
                <Text fw={700} size="lg" c="orange" mb="md">
                  {inz.price} Kč
                </Text>

                <Group gap="xs">
                  <Button variant="light" color="green" size="xs" leftSection={<IconCheck size={14} />} flex={1}>
                    Prodáno
                  </Button>
                  <Button variant="light" color="red" size="xs" leftSection={<IconTrash size={14} />}>
                    Smazat
                  </Button>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Tabs.Panel>

        {/* 2. Záložka: Nastavení (Placeholder) */}
        <Tabs.Panel value="nastaveni" pt="md">
          <Paper withBorder p="md" radius="md">
            <Text size="sm">Zde si budete moci změnit heslo nebo kontaktní telefonní číslo.</Text>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
