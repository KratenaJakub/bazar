"use client";

import { Avatar, Badge, Button, Card, Container, Group, Paper, SimpleGrid, Tabs, Text, Title } from "@mantine/core";
import { IconCheck, IconPackage, IconSettings, IconTrash } from "@tabler/icons-react";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface Listing {
  id: string;
  name: string;
  price: number;
  status: string;
}

interface ProfileContentProps {
  user: User;
  userListings: Listing[];
  onMarkAsSold: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// Musíme importovat akce, které jsme vytvořili v page.tsx,
// nebo je poslat přes props jako funkce. Nejjednodušší je je sem importovat:
// (pokud jsou v stejném souboru jako akce, musíš je exportovat z page.tsx)

export default function ProfileContent({ user, userListings, onMarkAsSold, onDelete }: ProfileContentProps) {
  return (
    <Container size="md" my={40}>
      <Paper p="xl" radius="md" withBorder bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))">
        <Group gap="lg">
          <Avatar src={user.image} size={80} radius={80} color="orange">
            {user.name
              ?.split(" ")
              .map((n: string) => n[0])
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

      <Tabs defaultValue="inzeraty" color="orange" mt="xl">
        <Tabs.List>
          <Tabs.Tab value="inzeraty" leftSection={<IconPackage size={16} />}>
            Moje inzeráty
          </Tabs.Tab>
          <Tabs.Tab value="nastaveni" leftSection={<IconSettings size={16} />}>
            Nastavení účtu
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="inzeraty" pt="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {userListings.map((inz: Listing) => (
              <Card key={inz.id} withBorder radius="md" p="md" shadow="sm">
                <Group justify="space-between" mb="xs">
                  <Text fw={600}>{inz.name}</Text>
                  <Badge color={inz.status === "Aktivní" ? "green" : "indigo"}>{inz.status}</Badge>
                </Group>
                <Text fw={700} size="lg" c="orange" mb="md">
                  {inz.price} Kč
                </Text>

                <Group gap="xs">
                  <form action={onMarkAsSold.bind(null, inz.id)}>
                    <Button type="submit" variant="light" color="green" size="xs" leftSection={<IconCheck size={14} />}>
                      Prodáno
                    </Button>
                  </form>
                  <form action={onDelete.bind(null, inz.id)}>
                    <Button type="submit" variant="light" color="red" size="xs" leftSection={<IconTrash size={14} />}>
                      Smazat
                    </Button>
                  </form>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
