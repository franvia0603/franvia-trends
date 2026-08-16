// MetadataRoute.Robots는 구조화된 rules/sitemap만 지원하고 임의의 raw 텍스트(예:
// 검색엔진 소유확인용 주석 줄)를 추가할 방법이 없어, 대신 Route Handler로 직접 응답한다.
export async function GET() {
  const body = `User-Agent: *
Allow: /

Sitemap: https://trend.franvia.com/sitemap.xml

#DaumWebMasterTool:462c30ae4a07d59525f8ba0c391d235a968b9c7c0473c0124f3114b5877fd033:6N/NZaZlOa+T9gxgCzvnAg==
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
