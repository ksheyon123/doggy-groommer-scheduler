import { createEmailTransporter, emailConfig } from "../config/email";

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * 이메일 발송 서비스 (직원 초대 전용)
 */
export class EmailService {
  private transporter: ReturnType<typeof createEmailTransporter>;

  constructor() {
    this.transporter = createEmailTransporter();
  }

  /**
   * 직원 초대 이메일 발송
   */
  async sendInvitationEmail(
    to: string,
    invitation: {
      shopName: string;
      inviterName: string;
      role: string;
      token: string;
      expiresAt: Date;
    }
  ): Promise<EmailResult> {
    if (!this.transporter) {
      return {
        success: false,
        error:
          "이메일 트랜스포터가 설정되지 않았습니다. 환경 변수를 확인해주세요.",
      };
    }

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const invitationLink = `${baseUrl}/invite?token=${invitation.token}`;
    const expiresDate = new Date(invitation.expiresAt).toLocaleDateString(
      "ko-KR",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

    const roleText = invitation.role === "owner" ? "관리자" : "직원";

    const subject = `[${invitation.shopName}] ${roleText}으로 초대되었습니다`;

    const html = `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🐕 직원 초대</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            안녕하세요!
          </p>
          
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            <strong>${invitation.inviterName}</strong>님이 <strong style="color: #667eea;">${invitation.shopName}</strong>의 
            <strong>${roleText}</strong>으로 초대했습니다.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 5px 0; color: #666;"><strong>매장:</strong> ${invitation.shopName}</p>
            <p style="margin: 5px 0; color: #666;"><strong>역할:</strong> ${roleText}</p>
            <p style="margin: 5px 0; color: #666;"><strong>만료일:</strong> ${expiresDate}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; 
                      font-size: 16px; font-weight: bold;">
              초대 수락하기
            </a>
          </div>
          
          <p style="font-size: 14px; color: #999; margin-top: 25px;">
            버튼이 작동하지 않으면 아래 링크를 브라우저에 복사해서 붙여넣기 해주세요:
          </p>
          <p style="font-size: 12px; color: #667eea; word-break: break-all;">
            ${invitationLink}
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            이 초대는 ${expiresDate}까지 유효합니다.<br>
            본인이 요청하지 않은 초대라면 이 이메일을 무시해주세요.
          </p>
        </div>
      </div>
    `;

    const text = `
[${invitation.shopName}] ${roleText}으로 초대되었습니다

안녕하세요!

${invitation.inviterName}님이 ${invitation.shopName}의 ${roleText}으로 초대했습니다.

매장: ${invitation.shopName}
역할: ${roleText}
만료일: ${expiresDate}

아래 링크를 클릭하여 초대를 수락해주세요:
${invitationLink}

이 초대는 ${expiresDate}까지 유효합니다.
본인이 요청하지 않은 초대라면 이 이메일을 무시해주세요.
    `;

    try {
      const mailOptions = {
        from: `"${emailConfig.defaultSubject}" <${emailConfig.from}>`,
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("이메일 발송 실패:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "이메일 발송 중 오류가 발생했습니다.",
      };
    }
  }
}

// 싱글톤 인스턴스 export
export const emailService = new EmailService();
