import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function renderPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Newsletter</title>
<style>
  body {
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: #0a0a0a;
    color: #ffffff;
    font-family: system-ui, sans-serif;
  }
  p { font-size: 1.1rem; }
</style>
</head>
<body>
<p>${message}</p>
</body>
</html>`;
}

function htmlResponse(message: string, status: number): NextResponse {
  return new NextResponse(renderPage(message), {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!email) {
    return htmlResponse("Missing email address.", 400);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return htmlResponse("Something went wrong. Please try again.", 500);
  }

  // RLS를 우회하는 service role key. 이 라우트는 서버에서만 실행되는
  // Route Handler라 브라우저에 노출되지 않는다 — email 쿼리 파라미터로
  // 정확히 그 한 행만 업데이트하므로 노출 범위가 이메일 링크 자체로 제한된다.
  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("email", email);

  if (error) {
    return htmlResponse("Something went wrong. Please try again.", 500);
  }

  return htmlResponse("You&rsquo;ve been unsubscribed.", 200);
}
