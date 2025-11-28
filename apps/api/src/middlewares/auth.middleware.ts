import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/jwt";

// Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: "Authorization header is required" });
      return;
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
      res.status(401).json({ error: "Invalid authorization format" });
      return;
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

// 선택적 인증 미들웨어 (로그인 안 해도 접근 가능, 하지만 토큰이 있으면 검증)
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer === "Bearer" && token) {
      const payload = verifyAccessToken(token);
      if (payload) {
        req.user = payload;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
