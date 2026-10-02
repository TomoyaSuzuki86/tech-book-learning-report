import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voice Studio",
  description: "ElevenLabs APIで読み上げとボイスチェンジャーを使う個人向け音声ツール",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
