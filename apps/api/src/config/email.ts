import nodemailer from "nodemailer";

/**
 * Google SMTP 설정을 사용한 이메일 트랜스포터 생성
 *
 * 환경 변수 설정 필요:
 * - GMAIL_USER: Gmail 주소 (예: your-email@gmail.com)
 * - GMAIL_APP_PASSWORD: Gmail 앱 비밀번호 (2단계 인증 후 생성)
 *
 * Gmail 앱 비밀번호 생성 방법:
 * 1. Google 계정 설정 > 보안 > 2단계 인증 활성화
 * 2. Google 계정 설정 > 보안 > 앱 비밀번호 생성
 * 3. "메일" 앱과 기기 선택 후 생성된 16자리 비밀번호 사용
 */
export const createEmailTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn(
      "Warning: GMAIL_USER 또는 GMAIL_APP_PASSWORD 환경 변수가 설정되지 않았습니다."
    );
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // TLS 사용
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

export const emailConfig = {
  from: process.env.GMAIL_USER || "noreply@example.com",
  defaultSubject: "Doggy Groomer Scheduler",
};
