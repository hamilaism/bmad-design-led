import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Taste interviewer · Intervieweur de goût",
  description: "Capture a profile's taste into a fiche.",
};

// Pose le thème + la langue AVANT le premier paint (zéro flash).
const boot = `(function(){try{
  var t=localStorage.getItem('theme');
  if(t!=='light'&&t!=='dark'){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark';}
  document.documentElement.dataset.theme=t;
  var l=localStorage.getItem('lang');
  if(l==='fr'||l==='en'){document.documentElement.lang=l;}
}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
