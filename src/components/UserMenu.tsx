"use client";

import { Avatar, Button, Group, Menu, Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconLogout, IconPackage, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { odhlasitUzivatele } from "@/app/[locale]/auth/actions"; // 🌟 Importujeme naši novou akci

interface UserMenuProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  } | null;
}

export default function UserMenu({ session }: UserMenuProps) {
  const { data: clientSession } = useSession();
  const currentSession = clientSession || session;
  // 1. Varianta: Uživatel NENÍ přihlášený
  if (!currentSession?.user) {
    return (
      <Link href="/auth" passHref style={{ textDecoration: "none" }}>
        <Button variant="light" color="orange" size="sm" radius="md">
          Přihlásit se
        </Button>
      </Link>
    );
  }

  const { name, email, image } = currentSession.user;

  // Generování iniciálů pro avatar
  const inicialy = name
    ? name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  // 2. Varianta: Uživatel JE přihlášený
  return (
    <Menu width={200} position="bottom-end" transitionProps={{ transition: "pop-top-right" }}>
      <Menu.Target>
        <UnstyledButton style={{ padding: "var(--mantine-spacing-xs)" }}>
          <Group gap={7}>
            <div style={{ flex: 1, textAlign: "right" }}>
              <Text size="sm" fw={500} style={{ lineHeight: 1 }}>
                {name}
              </Text>
              <Text size="xs" c="dimmed" mt={3} style={{ lineHeight: 1 }}>
                {email}
              </Text>
            </div>

            <Avatar src={image} radius="xl" size="md" color="orange">
              {inicialy}
            </Avatar>
            <IconChevronDown size={14} stroke={1.5} color="var(--mantine-color-dimmed)" />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Můj účet</Menu.Label>

        <Link href="/accountmanagement" passHref style={{ textDecoration: "none", color: "inherit" }}>
          <Menu.Item leftSection={<IconUser size={14} stroke={1.5} />}>Můj profil</Menu.Item>
        </Link>

        <Link href="/accountmanagement?tab=inzeraty" passHref style={{ textDecoration: "none", color: "inherit" }}>
          <Menu.Item leftSection={<IconPackage size={14} stroke={1.5} />}>Moje inzeráty</Menu.Item>
        </Link>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={<IconLogout size={14} stroke={1.5} />}
          onClick={async () => {
            const res = await odhlasitUzivatele();
            if (res?.success) {
              window.location.reload();
            }
          }}
        >
          Odhlásit se
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
