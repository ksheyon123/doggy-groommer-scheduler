import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "멍멍 미용실 - 반려견 미용 예약 시스템",
  description: "반려견 미용 예약을 간편하게 관리하세요",
  openGraph: {
    title: "멍멍 미용실 - 반려견 미용 예약 시스템",
    description: "반려견 미용 예약을 간편하게 관리하세요",
    images: [
      {
        url: "/opengrp-image.png",
        width: 1200,
        height: 630,
        alt: "멍멍 미용실 - 반려견 미용 예약 시스템",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "멍멍 미용실 - 반려견 미용 예약 시스템",
    description: "반려견 미용 예약을 간편하게 관리하세요",
    images: ["/opengrp-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
