import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HumanLab 3D — Anatomía y simulación humana",
  description: "Explora la anatomía humana en 3D y aprende con simulaciones fisiológicas educativas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
