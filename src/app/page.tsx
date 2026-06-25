import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  // Gäste landen auf Trends (für sie nutzbar), eingeloggte auf ihrer Watchlist.
  redirect(session?.user ? "/watchlist/want-to-watch" : "/trends");
}
