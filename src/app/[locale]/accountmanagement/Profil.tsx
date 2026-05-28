"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  FileButton,
  Group,
  Paper,
  PasswordInput,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArchive,
  IconCheck,
  IconLock,
  IconMessage,
  IconPackage,
  IconSend,
  IconSettings,
  IconTrash,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState, useTransition } from "react";
import { getChatMessagesAction, sendMessageAction } from "@/app/[locale]/accountmanagement/chats/actions";

interface User {
  id: string;
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
  userChats: ChatItem[];
  onMarkAsSold: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdateUser: (formData: FormData) => Promise<void>;
  onChangePassword: (formData: FormData) => Promise<void>;
}
interface ChatItem {
  id: string;
  createdAt: string | null;
  listingName: string;
  listingPrice: number;
  partnerName: string;
  partnerImage: string | null | undefined;
  lastMessage: string;
}

interface MessageItem {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string | null;
}

// Musíme importovat akce, které jsme vytvořili v page.tsx,
// nebo je poslat přes props jako funkce. Nejjednodušší je je sem importovat:
// (pokud jsou v stejném souboru jako akce, musíš je exportovat z page.tsx)
export default function ProfileContent({
  user,
  userListings,
  userChats,
  onMarkAsSold,
  onDelete,
  onUpdateUser,
  onChangePassword,
}: ProfileContentProps) {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "inzeraty";
  const urlChatId = searchParams.get("activeChat");

  const [activeChatId, setActiveChatId] = useState<string | null>(urlChatId);
  const [messagesList, setMessagesList] = useState<MessageItem[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [isSendingMessage, startMessageTransition] = useTransition();
  const [isPending, startTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const { update } = useSession();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false);
  const [base64Image, setBase64Image] = useState<string | null>(user.image || null);

  useEffect(() => {
    if (activeChatId) {
      getChatMessagesAction(activeChatId).then((msgs) => {
        setMessagesList(msgs);
      });

      // Volitelně jednoduchý Polling (obnovení zpráv každé 3 vteřiny pro plynulý chat)
      const interval = setInterval(() => {
        getChatMessagesAction(activeChatId).then((msgs) => {
          setMessagesList(msgs);
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [activeChatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId || !newMessageText.trim()) return;

    const textToSend = newMessageText;
    setNewMessageText(""); // Okamžitě vymažeme input pro lepší UX

    startMessageTransition(async () => {
      await sendMessageAction(activeChatId, textToSend);
      // Ihned dotáhneme nové zprávy
      const updatedMsgs = await getChatMessagesAction(activeChatId);
      setMessagesList(updatedMsgs);
    });
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Kontrola velikosti (volitelné, např. max 2MB, protože Base64 zvětší velikost v DB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Obrázek je příliš velký. Vyberte prosím soubor do 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Výsledkem je string ve formátu data:image/...;base64,XYZ
      const base64String = reader.result as string;
      setBase64Image(base64String); // Uložíme do stavu pro náhled i odeslání
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newName = (formData.get("name") as string) || "";
    const newEmail = (formData.get("email") as string) || "";
    if (base64Image) {
      formData.set("image", base64Image);
    }
    startTransition(async () => {
      try {
        await onUpdateUser(formData);
        await update({
          user: {
            name: newName,
            email: newEmail,
            image: base64Image,
          },
        });
        // Volitelně: zde můžeš vyvolat nějaké oznámení (Notification) o úspěchu
      } catch (error) {
        console.error("Chyba při aktualizaci údajů:", error);
      }
    });
  };
  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const newPass = formData.get("newPassword") as string;
    const confirmPass = formData.get("confirmPassword") as string;

    // Klientská kontrola shody nových hesel
    if (newPass !== confirmPass) {
      setPasswordError("Nová hesla se neshodují.");
      return;
    }

    startPasswordTransition(async () => {
      try {
        await onChangePassword(formData);
        setPasswordSuccess(true);
        form.reset(); // Promaže formulář po úspěchu
      } catch (error) {
        if (error instanceof Error) {
          setPasswordError(error.message);
        } else {
          setPasswordError("Chyba při změně hesla.");
        }
      }
    });
  };
  const aktivniInzeraty = userListings.filter(
    (inz) => inz.status !== "Prodáno" && inz.status !== "sold" && inz.status !== "Prodané",
  );
  const prodaneInzeraty = userListings.filter(
    (inz) => inz.status === "Prodáno" || inz.status === "sold" || inz.status === "Prodané",
  );
  const currentChatDetails = userChats.find((c) => c.id === activeChatId);
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

      <Tabs defaultValue={defaultTab} color="orange" mt="xl">
        <Tabs.List>
          <Tabs.Tab value="inzeraty" leftSection={<IconPackage size={16} />}>
            Moje inzeráty
          </Tabs.Tab>
          <Tabs.Tab value="chaty" leftSection={<IconMessage size={16} />}>
            Zprávy
          </Tabs.Tab>
          <Tabs.Tab value="prodane" leftSection={<IconArchive size={16} />}>
            Prodané ({prodaneInzeraty.length})
          </Tabs.Tab>
          <Tabs.Tab value="nastaveni" leftSection={<IconSettings size={16} />}>
            Nastavení účtu
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="inzeraty" pt="md">
          {aktivniInzeraty.length === 0 ? (
            <Text c="dimmed" py="xl" ta="center">
              Nemáte žádné aktivní inzeráty.
            </Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              {aktivniInzeraty.map((inz: Listing) => (
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
                      <Button
                        type="submit"
                        variant="light"
                        color="green"
                        size="xs"
                        leftSection={<IconCheck size={14} />}
                      >
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
          )}
        </Tabs.Panel>
        <Tabs.Panel value="prodane" pt="md">
          {prodaneInzeraty.length === 0 ? (
            <Text c="dimmed" py="xl" ta="center">
              Zatím jste nic neprodal(a).
            </Text>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              {prodaneInzeraty.map((inz: Listing) => (
                <Card key={inz.id} withBorder radius="md" p="md" shadow="sm" style={{ opacity: 0.8 }}>
                  <Group justify="space-between" mb="xs">
                    <Text fw={600} c="dimmed" style={{ textDecoration: "line-through" }}>
                      {inz.name}
                    </Text>
                    <Badge color="gray">Prodáno</Badge>
                  </Group>
                  <Text fw={700} size="lg" c="dimmed" mb="md">
                    {inz.price} Kč
                  </Text>

                  <Group gap="xs">
                    <form action={onDelete.bind(null, inz.id)}>
                      <Button type="submit" variant="light" color="red" size="xs" leftSection={<IconTrash size={14} />}>
                        Odstranit z historie
                      </Button>
                    </form>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </Tabs.Panel>
        <Tabs.Panel value="chaty" pt="md">
          {userChats.length === 0 ? (
            <Paper withBorder p="xl" radius="md" ta="center">
              <Text c="dimmed">Zatím nemáte žádné aktivní konverzace.</Text>
            </Paper>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              {/* LEVÝ SLOUPEC: SEZNAM CHATŮ */}
              <Stack gap="xs" style={{ borderRight: "1px solid var(--mantine-color-gray-3)", paddingRight: "10px" }}>
                {userChats.map((chat) => (
                  <UnstyledButton
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      backgroundColor: activeChatId === chat.id ? "var(--mantine-color-orange-light)" : "transparent",
                    }}
                  >
                    <Group gap="sm">
                      <Avatar src={chat.partnerImage} radius="xl" color="orange">
                        {chat.partnerName[0]}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Text size="sm" fw={500} truncate>
                          {chat.partnerName}
                        </Text>
                        <Text size="xs" c="orange" fw={500}>
                          {chat.listingName}
                        </Text>
                        <Text size="xs" c="dimmed" truncate>
                          {chat.lastMessage}
                        </Text>
                      </div>
                    </Group>
                  </UnstyledButton>
                ))}
              </Stack>

              {/* PRAVÝ SLOUPEC: OKNO ZPRÁV */}
              <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", height: "450px" }}>
                {activeChatId && currentChatDetails ? (
                  <Paper
                    withBorder
                    radius="md"
                    p="md"
                    style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}
                  >
                    {/* Hlavička aktivního chatu */}
                    <Group
                      justify="space-between"
                      mb="xs"
                      style={{ borderBottom: "1px solid var(--mantine-color-gray-2)", paddingBottom: "8px" }}
                    >
                      <div>
                        <Text fw={600}>{currentChatDetails.partnerName}</Text>
                        <Text size="xs" c="dimmed">
                          Předmět: {currentChatDetails.listingName} ({currentChatDetails.listingPrice} Kč)
                        </Text>
                      </div>
                    </Group>

                    {/* Tělo chatu se zprávami */}
                    <Stack style={{ flex: 1, overflowY: "auto", padding: "10px 0" }} gap="sm">
                      {messagesList.map((msg) => {
                        const jeMoje = msg.senderId === user.id; // Pokud v 'user' prop posíláš ID přihlášeného
                        return (
                          <div
                            key={msg.id}
                            style={{
                              alignSelf: jeMoje ? "flex-end" : "flex-start",
                              backgroundColor: jeMoje
                                ? "var(--mantine-color-orange-filled)"
                                : "var(--mantine-color-gray-1)",
                              color: jeMoje ? "white" : "black",
                              padding: "8px 12px",
                              borderRadius: "12px",
                              maxWidth: "70%",
                            }}
                          >
                            <Text size="sm">{msg.text}</Text>
                          </div>
                        );
                      })}
                    </Stack>

                    {/* Formulář pro odeslání zprávy */}
                    <form onSubmit={handleSendMessage} style={{ marginTop: "auto" }}>
                      <Group gap="xs">
                        <TextInput
                          placeholder="Napište zprávu..."
                          style={{ flex: 1 }}
                          value={newMessageText}
                          onChange={(e) => setNewMessageText(e.currentTarget.value)}
                        />
                        <Button type="submit" color="orange" loading={isSendingMessage}>
                          <IconSend size={16} />
                        </Button>
                      </Group>
                    </form>
                  </Paper>
                ) : (
                  <Paper
                    withBorder
                    radius="md"
                    p="xl"
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                    bg="var(--mantine-color-gray-0)"
                  >
                    <Text c="dimmed">Vyberte konverzaci ze seznamu vlevo.</Text>
                  </Paper>
                )}
              </div>
            </SimpleGrid>
          )}
        </Tabs.Panel>
        <Tabs.Panel value="nastaveni" pt="md">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Paper withBorder p="xl" radius="md" style={{ maxWidth: 500 }}>
              <Title order={4} mb="md">
                Upravit osobní údaje
              </Title>

              <form onSubmit={handleUpdate}>
                <Stack gap="md">
                  <Group align="center" gap="md" my="xs">
                    <Avatar src={base64Image} size={60} radius={60} color="orange" />
                    <FileButton onChange={handleFileChange} accept="image/png,image/jpeg,image/webp">
                      {(props) => (
                        <Button {...props} variant="light" color="orange" leftSection={<IconUpload size={16} />}>
                          Vybrat novou fotku
                        </Button>
                      )}
                    </FileButton>
                    {base64Image && (
                      <Button variant="transparent" color="red" size="xs" onClick={() => setBase64Image(null)}>
                        Odebrat
                      </Button>
                    )}
                  </Group>
                  <TextInput
                    label="Jméno a příjmení"
                    placeholder="Vaše jméno"
                    name="name"
                    defaultValue={user.name || ""}
                    required
                  />

                  <TextInput
                    label="E-mailová adresa"
                    placeholder="vas@email.cz"
                    name="email"
                    type="email"
                    defaultValue={user.email || ""}
                    required
                  />

                  <Button type="submit" color="orange" loading={isPending} leftSection={<IconUser size={16} />} mt="sm">
                    Uložit změny
                  </Button>
                </Stack>
              </form>
            </Paper>
            <Paper withBorder p="xl" radius="md">
              <Title order={4} mb="md">
                Změna hesla
              </Title>
              <form onSubmit={handlePasswordSubmit}>
                <Stack gap="md">
                  <PasswordInput
                    label="Aktuální heslo"
                    placeholder="Zadejte stávající heslo"
                    name="currentPassword"
                    required
                  />
                  <PasswordInput label="Nové heslo" placeholder="Minimálně 6 znaků" name="newPassword" required />
                  <PasswordInput
                    label="Potvrzení nového hesla"
                    placeholder="Zadejte nové heslo znovu"
                    name="confirmPassword"
                    required
                  />

                  {passwordError && (
                    <Text c="red" size="sm" fw={500}>
                      {passwordError}
                    </Text>
                  )}

                  {passwordSuccess && (
                    <Text c="green" size="sm" fw={500}>
                      Heslo bylo úspěšně změněno!
                    </Text>
                  )}

                  <Button
                    type="submit"
                    color="blue"
                    loading={isPasswordPending}
                    leftSection={<IconLock size={16} />}
                    mt="sm"
                  >
                    Změnit heslo
                  </Button>
                </Stack>
              </form>
            </Paper>
          </SimpleGrid>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
