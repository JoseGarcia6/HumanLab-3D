import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HumanLab 3D | Anatomía 3D avanzada",
  description: "Explorador educativo de anatomía humana con selección de sistemas, búsqueda de estructuras y controles de simulación ilustrativa.",
};

export default function AnatomyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
