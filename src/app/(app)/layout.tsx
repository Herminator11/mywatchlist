import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Header } from "@/components/layout/Header";
import { AppGate } from "@/components/layout/AppGate";
import { Toaster } from "@/components/ui/sonner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-4xl">
          <Header />
          <AppGate>{children}</AppGate>
        </main>
        <MobileNav />
      </div>
      <Toaster />
    </SessionProvider>
  );
}