import { Container } from "@mantine/core";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { db } from "@/db";
import { listings } from "@/db/schemas";
import DetailInzeratu from "./DetailInzeratu";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InzeratDetailPage({ params }: PageProps) {
  // Rozbalíme params z Promise (v Next.js 15 standardní postup)
  const { id } = await params;

  // Načteme inzerát z databáze podle ID
  const data = await db.select().from(listings).where(eq(listings.id, id)).get();

  if (!data) {
    notFound();
  }

  // SERVER ACTION: Smazání inzerátu
  async function deleteInzeratAction() {
    "use server";
    await db.delete(listings).where(eq(listings.id, id));

    // Invalidujeme mezipaměť přehledu a přesměrujeme uživatele
    revalidatePath("/inzeraty");
    redirect("/inzeraty");
  }

  // SERVER ACTION: Rezervace inzerátu
  async function reserveInzeratAction() {
    "use server";

    // 1. Zjistíme si aktuální stav inzerátu přímo z DB
    const aktualni = await db.select().from(listings).where(eq(listings.id, id)).get();

    if (!aktualni) return;

    // 2. Určíme nový stav: pokud už je rezervovaný, vrátíme ho jako aktivní
    const novyStav = aktualni.status === "Rezervováno" ? "Aktivní" : "Rezervováno";

    // 3. Uložíme změnu do databáze
    await db.update(listings).set({ status: novyStav }).where(eq(listings.id, id));

    // 4. Pročistíme cache, aby Next.js okamžitě načetl nový stav
    revalidatePath(`/inzeraty/${id}`);
    revalidatePath("/inzeraty");
  }

  // SERVER ACTION: Označení za prodané
  async function sellInzeratAction() {
    "use server";
    await db.update(listings).set({ status: "Prodáno" }).where(eq(listings.id, id));

    revalidatePath(`/inzeraty/${id}`);
    revalidatePath("/inzeraty");
  }
  const bezpecnaData = {
    ...data,
    showQr: data.showQr ?? false, // 👈 Pokud je v DB null, podstrčíme false
  };

  return (
    <Container size="xl" py="xl" style={{ marginLeft: 0, paddingLeft: 0 }}>
      <DetailInzeratu
        inzerat={bezpecnaData}
        onDelete={deleteInzeratAction}
        onReserve={reserveInzeratAction}
        onSell={sellInzeratAction}
      />
    </Container>
  );
}
