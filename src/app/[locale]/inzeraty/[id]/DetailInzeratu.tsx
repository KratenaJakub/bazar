"use client";

import { Button, Group, Image, Modal, Paper, PasswordInput, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import InzeratMapa from "@/components/inzeratmapa";
import PlatbaQR from "@/components/qrplatba";

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
    showQr: boolean;
    bankAccount: string | null;
    address: string | null | undefined;
    reservedByUserId: string | null;
  };
  currentUserId: string | null;
  onDelete: (heslo?: string) => Promise<void>;
  onReserve: () => Promise<void>;
  onSell: (heslo?: string) => Promise<void>;
  jeVlastnikHned: boolean;
  musiZadatHeslo: boolean;
}

export default function DetailInzeratu({
  inzerat,
  currentUserId,
  onDelete,
  onReserve,
  onSell,
  jeVlastnikHned,
  musiZadatHeslo,
}: DetailProps) {
  const fotky = useMemo(() => {
    if (!inzerat.Photo) return ["/blogic-logo.png"];
    try {
      const parsed = JSON.parse(inzerat.Photo);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [inzerat.Photo];
    } catch {
      return [inzerat.Photo];
    }
  }, [inzerat.Photo]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false); //
  const [isDeleting, setIsDeleting] = useState(false); //
  const [isActionPending, setIsActionPending] = useState(false); //
  const [aktivniFoto, setAktivniFoto] = useState(fotky[0]);
  useEffect(() => {
    setAktivniFoto(fotky[0]);
  }, [fotky]);

  // Stavy pro dialogové okno s heslem (pro anonymní inzeráty)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [zadaneHeslo, setZadaneHeslo] = useState("");
  const [akceTyp, setAkceTyp] = useState<"delete" | "sell" | "edit" | null>(null);
  const [chybaHesla, setChybaHesla] = useState<string | null>(null);

  // Funkce, která rozhodne, zda spustit akci rovnou, nebo chtít heslo
  const spustitChranenouAkci = (typ: "delete" | "sell" | "edit") => {
    if (jeVlastnikHned) {
      if (typ === "sell") vyriditProdej();
      if (typ === "delete") setDeleteModalOpen(true);
      if (typ === "edit") window.location.href = `/inzeraty/${inzerat.id}/edit`;
    } else if (musiZadatHeslo) {
      setAkceTyp(typ);
      setZadaneHeslo("");
      setChybaHesla(null);
      setPasswordModalOpen(true);
    }
  };

  // Volání serveru pro označení jako prodané
  const vyriditProdej = async (heslo?: string) => {
    setIsActionPending(true); //
    try {
      await onSell(heslo);
      setPasswordModalOpen(false);
    } catch {
      setChybaHesla("Nesprávné heslo k inzerátu.");
    } finally {
      setIsActionPending(false); //
    }
  };

  // Volání serveru pro smazání
  const handleDelete = async () => {
    setIsDeleting(true); //
    try {
      await onDelete(musiZadatHeslo ? zadaneHeslo : undefined);
      setDeleteModalOpen(false); //
      setPasswordModalOpen(false);
    } catch {
      alert("Chyba při mazání. Zkontrolujte zadané heslo.");
    } finally {
      setIsDeleting(false); //
    }
  };
  const handleEditClick = () => {
    if (jeVlastnikHned) {
      // Pokud jsem majitel, jdu rovnou na editaci
      window.location.href = `/inzeraty/${inzerat.id}/edit`;
    } else {
      // Pokud nejsem, chci heslo
      setAkceTyp("edit");
      setPasswordModalOpen(true);
    }
  };
  const handleReserveClick = async () => {
    if (!currentUserId) {
      alert("Pro rezervaci inzerátu se musíte přihlásit.");
      return;
    }
    setIsActionPending(true);
    await onReserve();
    setIsActionPending(false);
  };
  const isReserved = inzerat.status === "Rezervováno";
  const isMyReservation = currentUserId !== null && inzerat.reservedByUserId === currentUserId;

  const potvrditHesloZDialogu = () => {
    if (akceTyp === "sell") {
      vyriditProdej(zadaneHeslo);
    } else if (akceTyp === "delete") {
      setDeleteModalOpen(true);
    } else if (akceTyp === "edit") {
      // Tady uložíme heslo pro editační formulář
      sessionStorage.setItem(`pwd_${inzerat.id}`, zadaneHeslo);
      window.location.href = `/inzeraty/${inzerat.id}/edit?pwd=${encodeURIComponent(zadaneHeslo)}`;
    }
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Link href="/inzeraty" style={{ textDecoration: "none", color: "var(--mantine-color-blue-filled)" }}>
          ← Zpět na přehled
        </Link>
        {/* Tlačítko upravit se zobrazí jen lidem, co mají teoreticky práva */}
        {(jeVlastnikHned || musiZadatHeslo) && (
          <>
            <Button color="orange" onClick={handleEditClick} leftSection={<IconEdit size={20} />}>
              Upravit inzerát
            </Button>

            {/* MODAL PRO HESLO */}
            <Modal
              opened={passwordModalOpen}
              onClose={() => setPasswordModalOpen(false)}
              title="Ověření hesla k inzerátu"
              centered
            >
              <Stack gap="md">
                <Text size="sm">Pro úpravu anonymního inzerátu zadejte heslo:</Text>
                <PasswordInput value={zadaneHeslo} onChange={(e) => setZadaneHeslo(e.currentTarget.value)} />
                <Button onClick={potvrditHesloZDialogu}>Potvrdit</Button>
              </Stack>
            </Modal>
          </>
        )}
      </Group>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        <Paper withBorder shadow="sm" radius="md" p="xl">
          <Stack gap="md">
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Kategorie: {inzerat.category}
              </Text>{" "}
              {/* */}
              <Title order={1} mt="xs">
                {inzerat.name}
              </Title>{" "}
              {/* */}
              <Text>{inzerat.status}</Text> {/* */}
            </div>

            <Text style={{ whiteSpace: "pre-line" }}>{inzerat.description}</Text>
            <InzeratMapa adresa={inzerat.address} />
            <Stack gap="0" c="dimmed">
              <Text>Kontakt:</Text> {/* */}
              <Text>Jméno a příjmení: {inzerat.NameSurname}</Text> {/* */}
              <Text>Kontakt: {inzerat.contact}</Text> {/* */}
            </Stack>
            <Group
              justify="space-between"
              mt="xl"
              pt="md"
              style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
            >
              <Text size="lg" fw={700}>
                Cena: {inzerat.price === 0 ? "Zdarma" : `${inzerat.price} Kč`}
              </Text>{" "}
              {/* */}
              {inzerat.showQr && inzerat.bankAccount && (
                <div style={{ marginTop: "20px" }}>
                  <PlatbaQR cena={inzerat.price} nazevInzeratu={inzerat.name} cisloUctu={inzerat.bankAccount} />
                </div>
              )}
            </Group>
          </Stack>
        </Paper>
        <Stack gap="md" align="center" style={{ width: "100%" }}>
          <Image
            src={aktivniFoto}
            alt={inzerat.name}
            mah={420}
            fit="contain"
            radius="md"
            style={{
              width: "100%",
              // Přidá moderní jemný stín přímo pod samotné tělo obrázku
              filter: "drop-shadow(0px 6px 16px rgba(0, 0, 0, 0.06))",
            }}
          />

          {/* Miniatury pod hlavním obrázkem (zobrazeny pouze při více fotkách, key={foto} řeší varování linteru) */}
          {fotky.length > 1 && (
            <Group gap="xs" justify="center" mt="xs">
              {fotky.map((foto) => (
                <Image
                  key={foto}
                  src={foto}
                  alt="Náhled"
                  h={62}
                  w={62}
                  radius="md"
                  fit="cover"
                  style={{
                    cursor: "pointer",
                    border:
                      aktivniFoto === foto
                        ? "2px solid var(--mantine-color-orange-6)"
                        : "1px solid var(--mantine-color-gray-3)",
                    opacity: aktivniFoto === foto ? 1 : 0.6,
                    transition: "all 0.15s ease",
                  }}
                  onClick={() => setAktivniFoto(foto)}
                />
              ))}
            </Group>
          )}
        </Stack>
      </SimpleGrid>

      <Paper withBorder shadow="sm" radius="md" p="lg" maw={600}>
        <Stack gap="md">
          <SimpleGrid cols={2} spacing="md">
            {!jeVlastnikHned && (
              <Button
                variant={isReserved ? "filled" : "outline"}
                color={isMyReservation ? "red" : "orange"}
                size="md"
                disabled={inzerat.status === "Prodáno" || (isReserved && !isMyReservation)}
                loading={isActionPending}
                onClick={handleReserveClick}
              >
                {isMyReservation ? "Zrušit rezervaci" : isReserved ? "Již rezervováno" : "Rezervovat"}
              </Button>
            )}

            {/* Zobrazíme / povolíme "Prodáno" jen pokud uživatel může inzerát spravovat */}
            {(jeVlastnikHned || musiZadatHeslo) && (
              <Button
                variant="light"
                color="green"
                size="md"
                disabled={inzerat.status === "Prodáno"} //
                loading={isActionPending} //
                onClick={() => spustitChranenouAkci("sell")}
              >
                Prodáno
              </Button>
            )}
          </SimpleGrid>

          {/* Tlačítko na smazání inzerátu */}
          {(jeVlastnikHned || musiZadatHeslo) && (
            <Button variant="subtle" color="red" mt="xs" onClick={() => spustitChranenouAkci("delete")}>
              Smazat inzerát
            </Button>
          )}
        </Stack>
      </Paper>

      {/* DIALOGOVÉ OKNO PRO ZADÁNÍ HESLA (Zobrazí se pouze hostům) */}
      <Modal
        opened={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Ověření hesla k inzerátu"
        centered
        radius="md"
      >
        <Stack gap="md">
          <Text size="sm">Tento inzerát byl vytvořen bez registrace. Pro pokračování zadejte heslo.</Text>
          <PasswordInput
            label="Heslo k inzerátu"
            placeholder="Zadejte své heslo"
            value={zadaneHeslo}
            onChange={(e) => setZadaneHeslo(e.currentTarget.value)}
            error={chybaHesla}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="transparent" color="gray" onClick={() => setPasswordModalOpen(false)}>
              Zrušit
            </Button>
            <Button color="blue" onClick={potvrditHesloZDialogu} loading={isActionPending}>
              Potvrdit
            </Button>
          </Group>
        </Stack>
      </Modal>

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
