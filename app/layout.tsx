import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prospects Pellets — Jefferco Pellets Grand Est",
  description:
    "Outil interne de prospection : industriels et collectivités susceptibles d'utiliser une chaudière granulés bois.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
