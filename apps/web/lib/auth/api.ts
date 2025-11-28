import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./token";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface User {
  id: number;
  email: string;
  name?: string;
  profileImage?: string;
  provider: string;
  shopId?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// 기본 fetch 래퍼 (인증 헤더 자동 추가)
async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)["Authorization"] =
      `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  // 401 에러 시 토큰 갱신 시도
  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        // 새 토큰으로 재시도
        const newAccessToken = getAccessToken();
        (headers as Record<string, string>)["Authorization"] =
          `Bearer ${newAccessToken}`;
        response = await fetch(`${API_URL}${url}`, {
          ...options,
          headers,
        });
      }
    }
  }

  return response;
}

// 토큰 갱신
async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      setTokens(data.accessToken, data.refreshToken);
      return true;
    }

    clearTokens();
    return false;
  } catch (error) {
    clearTokens();
    return false;
  }
}

// Google OAuth 콜백 처리
export async function handleGoogleCallback(
  code: string,
  redirectUri: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/google/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirect_uri: redirectUri }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Google 로그인 실패");
  }

  const data: AuthResponse = await response.json();
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

// Kakao OAuth 콜백 처리
export async function handleKakaoCallback(
  code: string,
  redirectUri: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/kakao/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirect_uri: redirectUri }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Kakao 로그인 실패");
  }

  const data: AuthResponse = await response.json();
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

// Naver OAuth 콜백 처리
export async function handleNaverCallback(
  code: string,
  state: string,
  redirectUri: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/naver/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, state, redirect_uri: redirectUri }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Naver 로그인 실패");
  }

  const data: AuthResponse = await response.json();
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

// 현재 사용자 정보 조회
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await authFetch("/api/auth/me");

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    return null;
  }
}

// 로그아웃
export async function logoutUser(userId?: number): Promise<void> {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  } finally {
    clearTokens();
  }
}
