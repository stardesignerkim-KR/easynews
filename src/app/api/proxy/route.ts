import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return new NextResponse('Missing url', { status: 400 });

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'Referer': 'https://news.naver.com',
      },
    });

    if (!res.ok) {
      return new NextResponse(`기사를 불러오지 못했어요 (${res.status})`, { status: res.status });
    }

    let html = await res.text();

    // 상대 URL을 절대 URL로 변환하기 위해 base 태그 주입
    const origin = new URL(url).origin;
    html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${origin}">`);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // X-Frame-Options, CSP 헤더를 설정하지 않아 iframe에서 표시 가능
      },
    });
  } catch {
    return new NextResponse('기사를 불러오지 못했어요', { status: 500 });
  }
}
