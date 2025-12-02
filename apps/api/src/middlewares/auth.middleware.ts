import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/jwt";
import { Employee } from "../models/Employee";

// Request 타입 확장
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
      employeeRole?: string;
      shopId?: number;
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
  } catch {
    next();
  }
};

// 샵 Owner 권한 검증 미들웨어
// shopId는 req.params.shopId 또는 req.body.shop_id에서 가져옴
export const ownerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "인증이 필요합니다." });
      return;
    }

    // shopId를 다양한 소스에서 가져옴
    const shopId = req.params.shopId || req.body.shop_id || req.query.shopId;

    if (!shopId) {
      res.status(400).json({ error: "샵 ID가 필요합니다." });
      return;
    }

    // 해당 샵에서 사용자의 역할 확인 (활성 직원만)
    const employee = await Employee.findOne({
      where: {
        shop_id: Number(shopId),
        user_id: userId,
        is_active: true,
      },
    });

    if (!employee) {
      res.status(403).json({ error: "해당 샵에 대한 접근 권한이 없습니다." });
      return;
    }

    if (employee.role !== "owner") {
      res.status(403).json({ error: "Owner 권한이 필요합니다." });
      return;
    }

    // 역할 정보를 request에 저장
    req.employeeRole = employee.role;
    req.shopId = Number(shopId);

    next();
  } catch (error) {
    console.error("Owner middleware error:", error);
    res.status(500).json({ error: "권한 확인 중 오류가 발생했습니다." });
  }
};

// 샵 멤버(Owner 또는 Staff) 권한 검증 미들웨어
export const shopMemberMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: "인증이 필요합니다." });
      return;
    }

    const shopId = req.params.shopId || req.body.shop_id || req.query.shopId;

    if (!shopId) {
      res.status(400).json({ error: "샵 ID가 필요합니다." });
      return;
    }

    const employee = await Employee.findOne({
      where: {
        shop_id: Number(shopId),
        user_id: userId,
        is_active: true,
      },
    });

    if (!employee) {
      res.status(403).json({ error: "해당 샵에 대한 접근 권한이 없습니다." });
      return;
    }

    req.employeeRole = employee.role;
    req.shopId = Number(shopId);

    next();
  } catch (error) {
    console.error("Shop member middleware error:", error);
    res.status(500).json({ error: "권한 확인 중 오류가 발생했습니다." });
  }
};
