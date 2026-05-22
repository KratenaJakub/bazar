"use client";

import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

export default function DarkModeToggle() {
  const { setColorScheme } = useMantineColorScheme();

  // computedColorScheme zjistí, jaký režim je reálně aktivní (i když je nastaveno 'auto')
  const computedColorScheme = useComputedColorScheme("light", { getInitialValueInEffect: true });

  return (
    <ActionIcon
      onClick={() => setColorScheme(computedColorScheme === "dark" ? "light" : "dark")}
      variant="default"
      size="xl"
      aria-label="Přepnout tmavý/světlý režim"
      radius="md"
      style={{
        // Pozadí bude vždycky bílé nebo jemně šedé, když na něj najedeš
        backgroundColor: "#FFFFFF",
        // Ohraničení bude mít stabilní barvu, která sedí k bílému podkladu
        borderColor: "var(--mantine-color-gray-3)",
        color: computedColorScheme === "dark" ? "var(--mantine-color-yellow-6)" : "var(--mantine-color-blue-6)",
      }}
    >
      {computedColorScheme === "dark" ? (
        <IconSun stroke={1.5} color="black" />
      ) : (
        <IconMoon stroke={1.5} color="black" />
      )}
    </ActionIcon>
  );
}
