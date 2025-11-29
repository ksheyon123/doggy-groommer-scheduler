import { Request, Response } from "express";
import crypto from "crypto";
import { ShopInvitation, Shop, User, Employee } from "../models";
import { emailService } from "../utils/email";

/**
 * 초대 컨트롤러
 */
export const InvitationController = {
  /**
   * 직원 초대 발송
   * POST /api/invitations
   */
  async createInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { shop_id, email, role = "staff" } = req.body;
      const invitedByUserId = (req as any).user?.id;

      if (!shop_id || !email) {
        res.status(400).json({
          success: false,
          message: "shop_id와 email은 필수입니다.",
        });
        return;
      }

      if (!invitedByUserId) {
        res.status(401).json({
          success: false,
          message: "인증이 필요합니다.",
        });
        return;
      }

      // 샵 존재 확인
      const shop = await Shop.findByPk(shop_id);
      if (!shop) {
        res.status(404).json({
          success: false,
          message: "샵을 찾을 수 없습니다.",
        });
        return;
      }

      // 초대자 정보 조회
      const inviter = await User.findByPk(invitedByUserId);
      if (!inviter) {
        res.status(404).json({
          success: false,
          message: "초대자 정보를 찾을 수 없습니다.",
        });
        return;
      }

      // 이미 직원인지 확인
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        const existingEmployee = await Employee.findOne({
          where: { shop_id, user_id: existingUser.id },
        });
        if (existingEmployee) {
          res.status(400).json({
            success: false,
            message: "이미 해당 샵의 직원입니다.",
          });
          return;
        }
      }

      // 이미 대기 중인 초대가 있는지 확인
      const existingInvitation = await ShopInvitation.findOne({
        where: { shop_id, email, status: "pending" },
      });
      if (existingInvitation) {
        res.status(400).json({
          success: false,
          message: "이미 대기 중인 초대가 있습니다.",
        });
        return;
      }

      // 토큰 생성 (32바이트 = 64자 hex)
      const token = crypto.randomBytes(32).toString("hex");

      // 만료일 설정 (7일 후)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // 초대 레코드 생성
      const invitation = await ShopInvitation.create({
        shop_id,
        invited_by_user_id: invitedByUserId,
        email,
        token,
        role,
        status: "pending",
        expires_at: expiresAt,
      });

      // 이메일 발송
      const emailResult = await emailService.sendInvitationEmail(email, {
        shopName: shop.name,
        inviterName: inviter.name || inviter.email,
        role,
        token,
        expiresAt,
      });

      if (!emailResult.success) {
        // 이메일 발송 실패 시 초대 레코드 삭제
        await invitation.destroy();
        res.status(500).json({
          success: false,
          message: "초대 이메일 발송에 실패했습니다.",
          error: emailResult.error,
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: "초대가 발송되었습니다.",
        data: {
          id: invitation.id,
          email,
          role,
          expires_at: expiresAt,
        },
      });
    } catch (error) {
      console.error("초대 생성 오류:", error);
      res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다.",
      });
    }
  },

  /**
   * 초대 정보 조회 (토큰으로)
   * GET /api/invitations/:token
   */
  async getInvitationByToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      const invitation = await ShopInvitation.findOne({
        where: { token },
        include: [{ model: Shop, as: "shop" }],
      });

      if (!invitation) {
        res.status(404).json({
          success: false,
          message: "초대를 찾을 수 없습니다.",
        });
        return;
      }

      // 만료 확인
      if (new Date() > new Date(invitation.expires_at)) {
        await invitation.update({ status: "expired" });
        res.status(400).json({
          success: false,
          message: "만료된 초대입니다.",
        });
        return;
      }

      if (invitation.status !== "pending") {
        res.status(400).json({
          success: false,
          message: `이미 ${invitation.status === "accepted" ? "수락된" : "처리된"} 초대입니다.`,
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          email: invitation.email,
          role: invitation.role,
          expires_at: invitation.expires_at,
          shop: {
            id: invitation.shop.id,
            name: invitation.shop.name,
          },
        },
      });
    } catch (error) {
      console.error("초대 조회 오류:", error);
      res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다.",
      });
    }
  },

  /**
   * 초대 수락
   * POST /api/invitations/:token/accept
   */
  async acceptInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "인증이 필요합니다.",
        });
        return;
      }

      const invitation = await ShopInvitation.findOne({
        where: { token },
        include: [{ model: Shop, as: "shop" }],
      });

      if (!invitation) {
        res.status(404).json({
          success: false,
          message: "초대를 찾을 수 없습니다.",
        });
        return;
      }

      // 만료 확인
      if (new Date() > new Date(invitation.expires_at)) {
        await invitation.update({ status: "expired" });
        res.status(400).json({
          success: false,
          message: "만료된 초대입니다.",
        });
        return;
      }

      if (invitation.status !== "pending") {
        res.status(400).json({
          success: false,
          message: `이미 ${invitation.status === "accepted" ? "수락된" : "처리된"} 초대입니다.`,
        });
        return;
      }

      // 사용자 이메일 확인
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "사용자를 찾을 수 없습니다.",
        });
        return;
      }

      // 초대받은 이메일과 로그인한 사용자 이메일 비교
      if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
        res.status(403).json({
          success: false,
          message: "초대받은 이메일과 로그인한 계정의 이메일이 다릅니다.",
        });
        return;
      }

      // 이미 직원인지 확인
      const existingEmployee = await Employee.findOne({
        where: { shop_id: invitation.shop_id, user_id: userId },
      });
      if (existingEmployee) {
        await invitation.update({ status: "accepted" });
        res.status(400).json({
          success: false,
          message: "이미 해당 샵의 직원입니다.",
        });
        return;
      }

      // Employee 레코드 생성
      await Employee.create({
        shop_id: invitation.shop_id,
        user_id: userId,
        role: invitation.role,
      });

      // 사용자의 shop_id 업데이트
      await user.update({ shop_id: invitation.shop_id });

      // 초대 상태 업데이트
      await invitation.update({ status: "accepted" });

      res.status(200).json({
        success: true,
        message: "초대를 수락했습니다.",
        data: {
          shop: {
            id: invitation.shop.id,
            name: invitation.shop.name,
          },
          role: invitation.role,
        },
      });
    } catch (error) {
      console.error("초대 수락 오류:", error);
      res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다.",
      });
    }
  },

  /**
   * 샵의 초대 목록 조회
   * GET /api/invitations/shop/:shopId
   */
  async getShopInvitations(req: Request, res: Response): Promise<void> {
    try {
      const { shopId } = req.params;

      const invitations = await ShopInvitation.findAll({
        where: { shop_id: shopId },
        include: [
          {
            model: User,
            as: "invitedByUser",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: invitations,
      });
    } catch (error) {
      console.error("초대 목록 조회 오류:", error);
      res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다.",
      });
    }
  },

  /**
   * 초대 취소
   * DELETE /api/invitations/:id
   */
  async cancelInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const invitation = await ShopInvitation.findByPk(id);

      if (!invitation) {
        res.status(404).json({
          success: false,
          message: "초대를 찾을 수 없습니다.",
        });
        return;
      }

      if (invitation.status !== "pending") {
        res.status(400).json({
          success: false,
          message: "대기 중인 초대만 취소할 수 있습니다.",
        });
        return;
      }

      await invitation.update({ status: "cancelled" });

      res.status(200).json({
        success: true,
        message: "초대가 취소되었습니다.",
      });
    } catch (error) {
      console.error("초대 취소 오류:", error);
      res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다.",
      });
    }
  },

  /**
   * 초대 재발송
   * POST /api/invitations/:id/resend
   */
  async resendInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const invitation = await ShopInvitation.findByPk(id, {
        include: [
          { model: Shop, as: "shop" },
          { model: User, as: "invitedByUser" },
        ],
      });

      if (!invitation) {
        res.status(404).json({
          success: false,
          message: "초대를 찾을 수 없습니다.",
        });
        return;
      }

      if (invitation.status !== "pending") {
        res.status(400).json({
          success: false,
          message: "대기 중인 초대만 재발송할 수 있습니다.",
        });
        return;
      }

      // 새 토큰 생성
      const newToken = crypto.randomBytes(32).toString("hex");

      // 만료일 연장 (7일 후)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // 토큰 및 만료일 업데이트
      await invitation.update({
        token: newToken,
        expires_at: expiresAt,
      });

      // 이메일 재발송
      const emailResult = await emailService.sendInvitationEmail(
        invitation.email,
        {
          shopName: invitation.shop.name,
          inviterName:
            invitation.invitedByUser.name || invitation.invitedByUser.email,
          role: invitation.role,
          token: newToken,
          expiresAt,
        }
      );

      if (!emailResult.success) {
        res.status(500).json({
          success: false,
          message: "초대 이메일 재발송에 실패했습니다.",
          error: emailResult.error,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "초대가 재발송되었습니다.",
        data: {
          expires_at: expiresAt,
        },
      });
    } catch (error) {
      console.error("초대 재발송 오류:", error);
      res.status(500).json({
        success: false,
        message: "서버 오류가 발생했습니다.",
      });
    }
  },
};
