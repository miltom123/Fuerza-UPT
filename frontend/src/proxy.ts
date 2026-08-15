import { NextResponse, type NextRequest } from "next/server";

interface ProxySession {
  user?: {
    roles?: string[];
  };
}

function loginRedirect(request: NextRequest, reason?: "expired" | "forbidden") {
  const loginUrl = new URL("/administracion/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  loginUrl.searchParams.set("next", nextPath);
  if (reason) {
    loginUrl.searchParams.set("reason", reason);
  }

  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/administracion/login") {
    return NextResponse.next();
  }

  const cookies = request.headers.get("cookie");
  if (!cookies) {
    return loginRedirect(request);
  }

  const backendUrl = (process.env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");

  try {
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Cookie: cookies,
      },
      signal: AbortSignal.timeout(3500),
    });

    if (response.status === 401) {
      return loginRedirect(request, "expired");
    }

    if (response.status === 403) {
      return loginRedirect(request, "forbidden");
    }

    if (!response.ok) {
      return loginRedirect(request);
    }

    const session = (await response.json()) as ProxySession;
    if (!session.user?.roles?.includes("ADMIN")) {
      return loginRedirect(request, "forbidden");
    }

    return NextResponse.next();
  } catch {
    return loginRedirect(request);
  }
}

export const config = {
  matcher: "/administracion/:path*",
};
