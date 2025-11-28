import { Router } from "express";
import {
  googleCallback,
  kakaoCallback,
  naverCallback,
  refreshToken,
  logout,
  getMe,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// SNS OAuth 콜백 엔드포인트
router.post("/google/callback", googleCallback);
router.post("/kakao/callback", kakaoCallback);
router.post("/naver/callback", naverCallback);

// 토큰 갱신
router.post("/refresh", refreshToken);

// 로그아웃
router.post("/logout", logout);

// 현재 사용자 정보 조회 (인증 필요)
router.get("/me", authMiddleware, getMe);

export default router;
