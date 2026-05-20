import { NextResponse, type NextRequest } from "next/server";

// Protect /admin/* with HTTP Basic Auth. Set ADMIN_USER and ADMIN_PASSWORD
// as Vercel env vars; share that one set of credentials with your editing team.
export const config = {
  matcher: ["/admin/:path*"],
};

export function middleware(req: NextRequest) {
  const expectedUser = process.env.ADMIN_USER || "rcc";
  const expectedPass = process.env.ADMIN_PASSWORD;

  // If no password is set, refuse to serve admin at all — fail closed.
  if (!expectedPass) {
    return new NextResponse(
      "Admin disabled: set ADMIN_PASSWORD in Vercel environment variables.",
      { status: 503, headers: { "Content-Type": "text/plain" } },
    );
  }

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const decoded = atob(auth.slice(6));
    const [user, ...rest] = decoded.split(":");
    const pass = rest.join(":");
    if (user === expectedUser && pass === expectedPass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="RCC Admin", charset="UTF-8"',
      "Content-Type": "text/plain",
    },
  });
}
