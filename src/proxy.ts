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
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");

  if (!isLoggedIn && !isLoginPage) {
    return Response.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isLoginPage) {
    return Response.redirect(new URL("/watchlist/want-to-watch", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
