"use client";

import { AppShell, Container, Group } from "@mantine/core";
import type { Session } from "next-auth";
import type { PropsWithChildren } from "react";
import DarkModeToggle from "@/components/DarkMode";
import PageLogo from "@/components/layout/PageLogo";
import UserMenu from "@/components/UserMenu";

interface PageLayoutProps extends PropsWithChildren {
  session: Session | null;
}
const HEADER_HEIGHT = 90;
const BODY_MAX_WIDTH = 1280;

export function PageLayout({ children, session }: PageLayoutProps) {
  return (
    <AppShell header={{ height: HEADER_HEIGHT }} padding="md" withBorder={false}>
      <AppShell.Header px="md">
        <Container size={BODY_MAX_WIDTH} h="100%">
          <Group h="100%" align="center" justify="space-between">
            <PageLogo />
            <Group gap="md">
              <UserMenu session={session} />
              <DarkModeToggle />
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size={BODY_MAX_WIDTH} px="md">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
