import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nexora Fitness",

  description:
    "Aplicativo da academia Nexora Fitness",

  manifest: "/manifest.json",

  themeColor: "#22c55e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">

      <body>
        {children}
      </body>

    </html>
  );
}