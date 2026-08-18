import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_ORIGINS = new Set(["https://franvia.com", "https://www.franvia.com"]);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UNIQUE_VIOLATION_CODE = "23505";

// 와일드카드(*) 대신, franvia.com 계열 Origin일 때만 그 Origin을 그대로 돌려준다.
function buildCorsHeaders(origin: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: buildCorsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: NextRequest) {
  const headers = buildCorsHeaders(request.headers.get("origin"));

  let body: { email?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400, headers },
    );
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const source = typeof body.source === "string" ? body.source : null;

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400, headers },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500, headers },
    );
  }

  // RLS를 우회하는 service role key. 이 라우트는 서버에서만 실행되는
  // Route Handler라 브라우저에 노출되지 않는다 — 이메일 형식 검증,
  // CORS 화이트리스트, unique 제약(DB 레벨, RLS와 무관)이 계속 안전장치 역할을 한다.
  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email, source });

  // 이미 구독 중인 이메일(unique 제약 위반)은 에러가 아니라 성공으로 처리한다.
  if (error && error.code !== UNIQUE_VIOLATION_CODE) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500, headers },
    );
  }

  return NextResponse.json({ success: true }, { status: 200, headers });
}
