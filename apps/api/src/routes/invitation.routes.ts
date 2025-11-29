import { Router } from "express";
import { InvitationController } from "../controllers/invitation.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * 초대 API 라우트
 *
 * POST   /api/invitations              - 직원 초대 발송 (인증 필요)
 * GET    /api/invitations/token/:token - 초대 정보 조회 (토큰으로, 인증 불필요)
 * POST   /api/invitations/token/:token/accept - 초대 수락 (인증 필요)
 * GET    /api/invitations/shop/:shopId - 샵의 초대 목록 조회 (인증 필요)
 * DELETE /api/invitations/:id          - 초대 취소 (인증 필요)
 * POST   /api/invitations/:id/resend   - 초대 재발송 (인증 필요)
 */

// 직원 초대 발송 (인증 필요)
router.post("/", authMiddleware, InvitationController.createInvitation);

// 초대 정보 조회 (토큰으로, 인증 불필요 - 초대 페이지에서 정보 표시용)
router.get("/token/:token", InvitationController.getInvitationByToken);

// 초대 수락 (인증 필요)
router.post(
  "/token/:token/accept",
  authMiddleware,
  InvitationController.acceptInvitation
);

// 샵의 초대 목록 조회 (인증 필요)
router.get(
  "/shop/:shopId",
  authMiddleware,
  InvitationController.getShopInvitations
);

// 초대 취소 (인증 필요)
router.delete("/:id", authMiddleware, InvitationController.cancelInvitation);

// 초대 재발송 (인증 필요)
router.post(
  "/:id/resend",
  authMiddleware,
  InvitationController.resendInvitation
);

export default router;
