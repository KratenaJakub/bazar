"use client";

import { Button, Container, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { prihlasitUzivatele, registrovatUzivatele } from "./actions";

export default function AuthPage() {
  const [type, setType] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
    },
    validate: {
      email: (val) => (/^\S+@\S+\.\S+$/.test(val) ? null : "Neplatný e-mail"),
      password: (val) => (val.length < 6 ? "Heslo musí mít aspoň 6 znaků" : null),
      name: (val) => (type === "register" && val.length < 2 ? "Jméno je příliš krátké" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (type === "register") {
      // 📝 Registrace
      const res = await registrovatUzivatele(values);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(res.success || null);
        setType("login"); // Přepneme uživatele rovnou na přihlášení
        form.setValues({ ...form.values, password: "" }); // Vyčistíme políčko pro heslo
      }
    } else {
      // 🔑 Přihlášení
      const res = await prihlasitUzivatele({ email: values.email, password: values.password });
      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        // Úspěšně přihlášeno, obnovíme router a pošleme uživatele na inzeráty/profil
        router.push("/inzeraty");
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900} style={{ letterSpacing: "-1px" }}>
        {type === "login" ? "Vítejte zpět!" : "Vytvořte si účet"}
      </Title>

      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {type === "login" ? "Ještě nemáte účet? " : "Již máte účet? "}
        <Text
          span
          size="sm"
          fw={600}
          c="orange"
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => {
            form.reset();
            setErrorMsg(null);
            setSuccessMsg(null);
            setType(type === "login" ? "register" : "login");
          }}
        >
          {type === "login" ? "Registrovat se" : "Přihlásit se"}
        </Text>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {/* Zobrazení chybových nebo úspěšných hlášek */}
        {errorMsg && (
          <Text c="red" size="sm" ta="center" mb="md" fw={500}>
            {errorMsg}
          </Text>
        )}
        {successMsg && (
          <Text c="green" size="sm" ta="center" mb="md" fw={500}>
            {successMsg}
          </Text>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            {type === "register" && (
              <TextInput
                label="Jméno a příjmení"
                placeholder="Vaše jméno"
                required
                {...form.getInputProps("name")}
                radius="md"
              />
            )}

            <TextInput
              label="E-mailová adresa"
              placeholder="ujec@blogic.cz"
              required
              {...form.getInputProps("email")}
              radius="md"
            />

            <PasswordInput
              label="Heslo"
              placeholder="Vaše heslo"
              required
              {...form.getInputProps("password")}
              radius="md"
            />
          </Stack>

          <Button type="submit" fullWidth mt="xl" color="orange" radius="md" loading={loading}>
            {type === "login" ? "Přihlásit se" : "Zaregistrovat se"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
