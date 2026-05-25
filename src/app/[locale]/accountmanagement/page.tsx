import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { listings } from "@/db/schemas";
import ProfileContent from "./Profil";

// Server Actions musí zůstat tady v Server Componentě
async function deleteInzeratAction(id: string) {
  "use server";
  await db.delete(listings).where(eq(listings.id, id));
  revalidatePath("/accountmanagement");
}

async function markAsSoldAction(id: string) {
  "use server";
  await db.update(listings).set({ status: "Prodáno" }).where(eq(listings.id, id));
  revalidatePath("/accountmanagement");
}

export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userListings = await db
    .select()
    .from(listings)
    .where(eq(listings.userId, session.user.id || ""));

  return (
    <ProfileContent
      user={session.user}
      userListings={userListings}
      onMarkAsSold={markAsSoldAction}
      onDelete={deleteInzeratAction}
    />
  );
}
