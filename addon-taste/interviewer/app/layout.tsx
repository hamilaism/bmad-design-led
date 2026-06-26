import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Intervieweur de goût",
  description: "Capture le goût d'un profil dans une fiche.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
