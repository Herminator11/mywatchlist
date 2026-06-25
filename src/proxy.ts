import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Next.js 16: "Middleware" heißt jetzt "Proxy" und muss bei src-Layout in src/ liegen.
// Eigene NextAuth-Instanz nur für den Session-Check – KEIN Prisma-Import (Edge Runtime).
const { auth } = NextAuth({
  providers: [Credentials({})],
  pages: { signIn: "/login" },
});

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  // Gäste dürfen die App browsen (Trends/Suche nutzbar, geschützte Seiten zeigen
  // ein In-Page-Login-Gate). Nur eingeloggte User von den Auth-Seiten wegleiten.
  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL("/watchlist/want-to-watch", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
