import { Request, Response } from "express";
import axios from "axios";
import { User, AuthProvider } from "../models/User";
import { generateTokens, verifyRefreshToken } from "../utils/jwt";

// Google OAuth Config
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

// Kakao OAuth Config
const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const KAKAO_USERINFO_URL = "https://kapi.kakao.com/v2/user/me";

// Naver OAuth Config
const NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
const NAVER_USERINFO_URL = "https://openapi.naver.com/v1/nid/me";

interface SocialUserInfo {
  id: string;
  email: string;
  name?: string;
  profileImage?: string;
}

// Google 사용자 정보 조회
async function getGoogleUserInfo(accessToken: string): Promise<SocialUserInfo> {
  const response = await axios.get(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return {
    id: response.data.id,
    email: response.data.email,
    name: response.data.name,
    profileImage: response.data.picture,
  };
}

// Kakao 사용자 정보 조회
async function getKakaoUserInfo(accessToken: string): Promise<SocialUserInfo> {
  const response = await axios.get(KAKAO_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const kakaoAccount = response.data.kakao_account;
  return {
    id: String(response.data.id),
    email: kakaoAccount?.email || `kakao_${response.data.id}@kakao.local`,
    name: kakaoAccount?.profile?.nickname,
    profileImage: kakaoAccount?.profile?.profile_image_url,
  };
}

// Naver 사용자 정보 조회
async function getNaverUserInfo(accessToken: string): Promise<SocialUserInfo> {
  const response = await axios.get(NAVER_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const naverResponse = response.data.response;
  return {
    id: naverResponse.id,
    email: naverResponse.email || `naver_${naverResponse.id}@naver.local`,
    name: naverResponse.name || naverResponse.nickname,
    profileImage: naverResponse.profile_image,
  };
}

// 사용자 조회 또는 생성
async function findOrCreateUser(
  provider: AuthProvider,
  userInfo: SocialUserInfo
): Promise<User> {
  let user = await User.findOne({
    where: {
      provider,
      provider_id: userInfo.id,
    },
  });

  if (!user) {
    // 이메일로 기존 사용자 확인 (다른 provider로 가입한 경우)
    const existingUser = await User.findOne({
      where: { email: userInfo.email },
    });

    if (existingUser) {
      // 기존 사용자가 있으면 provider 정보만 업데이트 (선택적)
      // 여기서는 새 계정으로 생성
      user = await User.create({
        email: userInfo.email,
        name: userInfo.name,
        profile_image: userInfo.profileImage,
        provider,
        provider_id: userInfo.id,
      });
    } else {
      user = await User.create({
        email: userInfo.email,
        name: userInfo.name,
        profile_image: userInfo.profileImage,
        provider,
        provider_id: userInfo.id,
      });
    }
  } else {
    // 기존 사용자 정보 업데이트
    await user.update({
      name: userInfo.name,
      profile_image: userInfo.profileImage,
    });
  }

  return user;
}

// Google OAuth 콜백 처리
export const googleCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, redirect_uri } = req.body;
    console.log(code, redirect_uri);

    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    // Google에서 액세스 토큰 발급
    const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_KEY,
      redirect_uri,
      grant_type: "authorization_code",
    });

    const { access_token } = tokenResponse.data;

    // Google 사용자 정보 조회
    const userInfo = await getGoogleUserInfo(access_token);

    // 사용자 조회 또는 생성
    const user = await findOrCreateUser("google", userInfo);

    // JWT 토큰 생성
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      provider: user.provider,
    });

    // Refresh token을 DB에 저장
    await user.update({ refresh_token: tokens.refreshToken });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profile_image,
        provider: user.provider,
      },
      ...tokens,
    });
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.status(500).json({ error: "Google OAuth failed" });
  }
};

// Kakao OAuth 콜백 처리
export const kakaoCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, redirect_uri } = req.body;

    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    // Kakao에서 액세스 토큰 발급
    const tokenResponse = await axios.post(
      KAKAO_TOKEN_URL,
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT_ID || "",
        client_secret: process.env.KAKAO_CLIENT_SECRET || "",
        redirect_uri,
        code,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Kakao 사용자 정보 조회
    const userInfo = await getKakaoUserInfo(access_token);

    // 사용자 조회 또는 생성
    const user = await findOrCreateUser("kakao", userInfo);

    // JWT 토큰 생성
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      provider: user.provider,
    });

    // Refresh token을 DB에 저장
    await user.update({ refresh_token: tokens.refreshToken });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profile_image,
        provider: user.provider,
      },
      ...tokens,
    });
  } catch (error) {
    console.error("Kakao OAuth error:", error);
    res.status(500).json({ error: "Kakao OAuth failed" });
  }
};

// Naver OAuth 콜백 처리
export const naverCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code, state, redirect_uri } = req.body;

    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    // Naver에서 액세스 토큰 발급
    const tokenResponse = await axios.post(
      NAVER_TOKEN_URL,
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.NAVER_CLIENT_ID || "",
        client_secret: process.env.NAVER_CLIENT_SECRET || "",
        redirect_uri,
        code,
        state,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Naver 사용자 정보 조회
    const userInfo = await getNaverUserInfo(access_token);

    // 사용자 조회 또는 생성
    const user = await findOrCreateUser("naver", userInfo);

    // JWT 토큰 생성
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      provider: user.provider,
    });

    // Refresh token을 DB에 저장
    await user.update({ refresh_token: tokens.refreshToken });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profile_image,
        provider: user.provider,
      },
      ...tokens,
    });
  } catch (error) {
    console.error("Naver OAuth error:", error);
    res.status(500).json({ error: "Naver OAuth failed" });
  }
};

// Refresh Token으로 새 Access Token 발급
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    // Refresh token 검증
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    // DB에서 사용자 조회 및 refresh token 일치 확인
    const user = await User.findByPk(payload.userId);
    if (!user || user.refresh_token !== refreshToken) {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    // 새 토큰 발급
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      provider: user.provider,
    });

    // 새 Refresh token을 DB에 저장
    await user.update({ refresh_token: tokens.refreshToken });

    res.json(tokens);
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Token refresh failed" });
  }
};

// 로그아웃
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    if (userId) {
      const user = await User.findByPk(userId);
      if (user) {
        await user.update({ refresh_token: null });
      }
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
};

// 현재 사용자 정보 조회
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // 이 엔드포인트는 authMiddleware를 통과해야 함
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "email",
        "name",
        "profile_image",
        "provider",
        "shop_id",
      ],
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user info" });
  }
};
