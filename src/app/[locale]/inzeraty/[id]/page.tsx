import { Container } from "@mantine/core";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { listings } from "@/db/schemas";
import DetailInzeratu from "./DetailInzeratu";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InzeratDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const currentUserId = session?.user?.id || null;

  const rawData = await db.select().from(listings).where(eq(listings.id, id)).get();
  if (!rawData) return notFound();

  const data = rawData;
  const isOwner = currentUserId !== null && data.userId === currentUserId;
  const requiresPassword = !data.userId && !!data.editPassword;

  // SERVER ACTION: Smazání
  async function deleteInzeratAction(heslo?: string) {
    "use server";
    // Logika ověření je nyní přímo zde (v rámci Server Action)
    const maPristup = isOwner || (requiresPassword && heslo && (await bcrypt.compare(heslo, data.editPassword || "")));

    if (!maPristup) {
      throw new Error("Nedostatečná oprávnění.");
    }

    await db.delete(listings).where(eq(listings.id, id));
    revalidatePath("/inzeraty");
    redirect("/inzeraty");
  }

  // SERVER ACTION: Označení za prodané
  async function sellInzeratAction(heslo?: string) {
    "use server";
    const maPristup = isOwner || (requiresPassword && heslo && (await bcrypt.compare(heslo, data.editPassword || "")));

    if (!maPristup) {
      throw new Error("Nedostatečná oprávnění.");
    }

    await db.update(listings).set({ status: "Prodáno" }).where(eq(listings.id, id));
    revalidatePath(`/inzeraty/${id}`);
    revalidatePath("/inzeraty");
  }

  async function reserveInzeratAction() {
    "use server";
    const aktualni = await db.select().from(listings).where(eq(listings.id, id)).get();
    if (!aktualni) return;
    const novyStav = aktualni.status === "Rezervováno" ? "Aktivní" : "Rezervováno";
    await db.update(listings).set({ status: novyStav }).where(eq(listings.id, id));
    revalidatePath(`/inzeraty/${id}`);
    revalidatePath("/inzeraty");
  }

  const bezpecnaData = { ...data, showQr: data.showQr ?? false };

  return (
    <Container size="xl" py="xl" style={{ marginLeft: 0, paddingLeft: 0 }}>
      <DetailInzeratu
        inzerat={bezpecnaData}
        jeVlastnikHned={isOwner}
        musiZadatHeslo={requiresPassword}
        onDelete={deleteInzeratAction}
        onReserve={reserveInzeratAction}
        onSell={sellInzeratAction}
      />
    </Container>
  );
}
