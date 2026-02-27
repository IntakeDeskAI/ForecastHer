import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that don't require full admin auth
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

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Skip Supabase session refresh if env vars are not available (e.g. during build)
  if (!url || !key) {
    return supabaseResponse;
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

  const { pathname } = request.nextUrl;

  // ── Admin route protection ────────────────────────────────────────
  if (isAdminRoute(pathname) || isAdminApiRoute(pathname)) {
    // Allow admin login and MFA pages without full auth
    if (isAdminPublicRoute(pathname)) {
      return supabaseResponse;
    }

    // Allow admin auth/mfa API routes (they check auth internally)
    if (pathname.startsWith("/api/admin/auth") || pathname.startsWith("/api/admin/mfa")) {
      return supabaseResponse;
    }

    // Must be authenticated
    if (!user) {
      if (isAdminApiRoute(pathname)) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", request.url);
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
        if (isAdminApiRoute(pathname)) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
        const loginUrl = new URL("/admin/login", request.url);
        return NextResponse.redirect(loginUrl);
      }

      // MFA not enrolled — send to enrollment
      if (!admin.mfa_enabled) {
        if (isAdminApiRoute(pathname)) {
          return NextResponse.json({ error: "MFA enrollment required" }, { status: 403 });
        }
        const enrollUrl = new URL("/admin/mfa/enroll", request.url);
        return NextResponse.redirect(enrollUrl);
      }

      // Check AAL level — must be aal2 for protected admin routes
      const { data: aalData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalData?.currentLevel !== "aal2") {
        if (isAdminApiRoute(pathname)) {
          return NextResponse.json({ error: "MFA verification required" }, { status: 403 });
        }
        const verifyUrl = new URL("/admin/mfa/verify", request.url);
        return NextResponse.redirect(verifyUrl);
      }
    }
  }

  return supabaseResponse;
}
