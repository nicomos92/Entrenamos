import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";
import { roleHome } from "@/lib/roleHome";

const PUBLIC_PATHS = ["/login", "/auth"];
const ROLE_AREAS = ["/admin", "/trainer", "/student"] as const;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && path === "/login") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const url = request.nextUrl.clone();
    url.pathname = roleHome(profile.role);
    return NextResponse.redirect(url);
  }

  // Proteger rutas por rol: /admin solo admin, /trainer solo entrenador, /student solo alumno.
  if (user && ROLE_AREAS.some((area) => path.startsWith(area))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const wantsArea = ROLE_AREAS.find((area) => path.startsWith(area));
    const allowed =
      (wantsArea === "/admin" && profile.role === "admin") ||
      (wantsArea === "/trainer" && profile.role === "trainer") ||
      (wantsArea === "/student" && profile.role === "student");

    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = roleHome(profile.role);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
