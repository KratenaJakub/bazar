import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getUserChats } from "@/app/[locale]/accountmanagement/chats/actions";
import { auth } from "@/auth";
import { db } from "@/db";
import { listings, users } from "@/db/schemas";
import { changePasswordAction, deleteInzeratAction, markAsSoldAction, updateUserAction } from "./actions";
import ProfileContent from "./Profil";

export default async function ProfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth");
  const currentUserId = session.user.id || "";

  const dbUser = await db.select().from(users).where(eq(users.id, currentUserId)).get();
  if (!dbUser) redirect("/auth");
  const userListings = await db.select().from(listings).where(eq(listings.userId, currentUserId));
  const userChats = await getUserChats(currentUserId);

  return (
    <ProfileContent
      user={dbUser}
      userListings={userListings}
      userChats={userChats}
      onMarkAsSold={markAsSoldAction}
      onDelete={deleteInzeratAction}
      onUpdateUser={updateUserAction}
      onChangePassword={changePasswordAction}
    />
  );
}
