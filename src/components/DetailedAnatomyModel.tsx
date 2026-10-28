"use client";

import { Clone, useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import type { Group } from "three";

/**
 * Loads a locally hosted glTF/GLB anatomy asset.
 *
 * Keep model files in public/models and pass a URL such as
 * "/models/torso-with-organs.glb". The asset should be reviewed for
 * license, scale, orientation, and mesh names before being enabled in the UI.
 * The parent scene should render this component inside <Suspense>.
 */
export function DetailedAnatomyModel({
  url,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  ...groupProps
}: {
  url: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
} & Omit<ThreeElements["group"], "position" | "rotation" | "scale">) {
  const { scene } = useGLTF(url);

  return (
    <group position={position} rotation={rotation} scale={scale} {...groupProps}>
      <Clone object={scene} />
    </group>
  );
}

/** Preload a known local model when the viewer is ready to display it. */
export function preloadAnatomyModel(url: string) {
  useGLTF.preload(url);
}
