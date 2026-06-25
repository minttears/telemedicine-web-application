import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Онлайн-консультации с врачами",
    template: "%s | Онлайн-консультации",
  },
  description:
    "Веб-приложение дистанционного медицинского консультирования для записи к врачам, сообщений, файлов и видеозвонков.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
