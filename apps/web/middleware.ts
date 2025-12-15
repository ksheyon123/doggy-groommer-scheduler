import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // CSP nonce 생성
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  // 개발 환경 여부 확인
  const isDevelopment = process.env.NODE_ENV === "development";

  // API URL (환경변수에서 가져오거나 기본값 사용)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // CSP 정책 정의
  // 개발 환경에서는 'unsafe-eval'과 'unsafe-inline' 허용 (HMR, Fast Refresh 지원)
  const cspHeader = isDevelopment
    ? `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://k.kakaocdn.net https://ssl.pstatic.net https://phinf.pstatic.net https://lh3.googleusercontent.com https://*.googleusercontent.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' ${apiUrl} ws://localhost:* http://localhost:* https://accounts.google.com https://kauth.kakao.com https://nid.naver.com;
    frame-src 'self' https://accounts.google.com https://kauth.kakao.com https://nid.naver.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `
        .replace(/\s{2,}/g, " ")
        .trim()
    : `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://k.kakaocdn.net https://ssl.pstatic.net https://phinf.pstatic.net https://lh3.googleusercontent.com https://*.googleusercontent.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' ${apiUrl} https://accounts.google.com https://kauth.kakao.com https://nid.naver.com;
    frame-src 'self' https://accounts.google.com https://kauth.kakao.com https://nid.naver.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
        .replace(/\s{2,}/g, " ")
        .trim();

  // Request headers에 nonce 추가
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Response 생성
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // CSP 헤더 설정
  response.headers.set("Content-Security-Policy", cspHeader);

  // 추가 보안 헤더 설정
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
}

// CSP를 적용할 경로 설정 (API 라우트와 정적 파일 제외)
export const config = {
  matcher: [
    /*
     * 다음 경로는 제외:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
