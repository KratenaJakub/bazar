"use client";

import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const { setColorScheme } = useMantineColorScheme();

  // computedColorScheme zjistí, jaký režim je reálně aktivní (i když je nastaveno 'auto')
  const computedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <ActionIcon
        size="xl"
        radius="md"
        variant="outline"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "var(--mantine-color-gray-3)",
          color: "var(--mantine-color-blue-6)",
        }}
        disabled
      >
        <IconMoon stroke={1.5} color="blue" />
      </ActionIcon>
    );
  }

  // Jakmile jsme na klientovi, vykreslíme plně funkční tlačítko
  return (
    <ActionIcon
      onClick={() => setColorScheme(computedColorScheme === "dark" ? "light" : "dark")}
      size="xl"
      aria-label="Přepnout tmavý/světlý režim"
      radius="md"
      variant="outline"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "var(--mantine-color-gray-3)",
        color: computedColorScheme === "dark" ? "var(--mantine-color-yellow-6)" : "var(--mantine-color-blue-6)",
      }}
    >
      {computedColorScheme === "dark" ? (
        <IconSun stroke={1.5} color="orange" />
      ) : (
        <IconMoon stroke={1.5} color="blue" />
      )}
    </ActionIcon>
  );
}
