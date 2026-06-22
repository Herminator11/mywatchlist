import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

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
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};