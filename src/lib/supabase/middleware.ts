import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that don't require full admin auth (internal paths with /admin prefix)
const ADMIN_PUBLIC_ROUTES = ["/admin/login", "/admin/mfa/enroll", "/admin/mfa/verify"];

function isAdminRoute(pathname: string) {
  return pathname.startsWith("/admin");
}

function isAdminPublicRoute(pathname: string) {
  return ADMIN_PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

function isAdminApiRoute(pathname: string) {
  return pathname.startsWith("/api/admin");
}

// Detect admin subdomain (admin.forecasther.ai, admin.localhost, admin.localhost:3000, etc.)
function isAdminHost(hostname: string): boolean {
  return hostname === "admin.forecasther.ai" || hostname.startsWith("admin.localhost");
}

export async function updateSession(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const adminHost = isAdminHost(hostname);
  const { pathname } = request.nextUrl;

  // ── Subdomain routing ──────────────────────────────────────────────

  // On admin subdomain: if someone visits /admin/*, strip the prefix to avoid double-mapping
  if (adminHost && pathname.startsWith("/admin")) {
    const cleanPath = pathname.replace(/^\/admin/, "") || "/";
    return NextResponse.redirect(new URL(cleanPath, request.url));
  }

  // On main domain: redirect /admin/* to admin subdomain (skip on localhost for dev convenience)
  if (!adminHost && pathname.startsWith("/admin") && !hostname.startsWith("localhost")) {
    const subdomainPath = pathname.replace(/^\/admin/, "") || "/";
    return NextResponse.redirect(new URL(`https://admin.forecasther.ai${subdomainPath}`));
  }

  // ── Compute effective internal path ────────────────────────────────
  // On admin subdomain, /markets -> /admin/markets internally (except API routes)
  const effectivePath =
    adminHost && !pathname.startsWith("/api/")
      ? `/admin${pathname === "/" ? "" : pathname}`
      : pathname;

  // Will we need to rewrite at the end?
  const needsRewrite = effectivePath !== pathname;
  const rewriteUrl = needsRewrite
    ? (() => {
        const url = request.nextUrl.clone();
        url.pathname = effectivePath;
        return url;
      })()
    : null;

  // Redirect prefix: empty on admin subdomain (browser URLs have no /admin), full on main domain
  const adminPrefix = adminHost ? "" : "/admin";

  // Helper: build final response with rewrite + cookies when on admin subdomain
  function buildFinalResponse() {
    if (rewriteUrl) {
      const res = NextResponse.rewrite(rewriteUrl);
      for (const cookie of supabaseResponse.cookies.getAll()) {
        res.cookies.set(cookie);
      }
      return res;
    }
    return supabaseResponse;
  }

  // ── Supabase session ───────────────────────────────────────────────
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip Supabase session refresh if env vars are not available (e.g. during build)
  if (!url || !key) {
    return buildFinalResponse();
  }

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Admin route protection (uses effectivePath for route matching) ─
  if (isAdminRoute(effectivePath) || isAdminApiRoute(effectivePath)) {
    // Allow admin login and MFA pages without full auth
    if (isAdminPublicRoute(effectivePath)) {
      return buildFinalResponse();
    }

    // Allow admin auth/mfa API routes (they check auth internally)
    if (effectivePath.startsWith("/api/admin/auth") || effectivePath.startsWith("/api/admin/mfa")) {
      return buildFinalResponse();
    }

    // Must be authenticated
    if (!user) {
      if (isAdminApiRoute(effectivePath)) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      const loginUrl = new URL(`${adminPrefix}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin status + MFA via a lightweight server-side check
    // We use the service role key to check the admins table directly
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      const adminCheck = createServerClient(url, serviceKey, {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      });

      const { data: admin } = await adminCheck
        .from("admins")
        .select("role, is_active, mfa_enabled")
        .eq("id", user.id)
        .single();

      // Not an admin or inactive
      if (!admin || !admin.is_active) {
        if (isAdminApiRoute(effectivePath)) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
        const loginUrl = new URL(`${adminPrefix}/login`, request.url);
        return NextResponse.redirect(loginUrl);
      }

      // MFA not enrolled — send to enrollment
      if (!admin.mfa_enabled) {
        if (isAdminApiRoute(effectivePath)) {
          return NextResponse.json({ error: "MFA enrollment required" }, { status: 403 });
        }
        const enrollUrl = new URL(`${adminPrefix}/mfa/enroll`, request.url);
        return NextResponse.redirect(enrollUrl);
      }

      // Check AAL level — must be aal2 for protected admin routes
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalData?.currentLevel !== "aal2") {
        if (isAdminApiRoute(effectivePath)) {
          return NextResponse.json({ error: "MFA verification required" }, { status: 403 });
        }
        const verifyUrl = new URL(`${adminPrefix}/mfa/verify`, request.url);
        return NextResponse.redirect(verifyUrl);
      }
    }
  }

  return buildFinalResponse();
}
