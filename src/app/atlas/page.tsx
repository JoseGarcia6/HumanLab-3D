import type { Metadata } from "next";
import AtlasExplorer from "@/components/AtlasExplorer";
import "./atlas.css";

export const metadata: Metadata = {
  title: "Atlas anatómico detallado 3D | HumanLab 3D",
  description: "Explorá 2,234 piezas anatómicas interactivas de BodyParts3D, buscá estructuras y aislá sistemas del cuerpo humano.",
};

export default function AtlasPage() {
  return <AtlasExplorer />;
}
