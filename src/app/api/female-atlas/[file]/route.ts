import { NextRequest, NextResponse } from "next/server";

/**
 * Female Atlas by Mahendra Beniwal (MIT) with anatomical assets adapted from
 * HuBMAP Human Reference Atlas and BodyParts3D (CC BY 4.0).
 * Female Atlas source: https://github.com/HiMahendraBeniwal/female-atlas
 *
 * The upstream revision is pinned, and only the known public model assets
 * can be retrieved. Models are downloaded lazily when the female viewer opens.
 */
const UPSTREAM =
  "https://raw.githubusercontent.com/HiMahendraBeniwal/female-atlas/b0a20fa3a009ca5f6bfa07b7479312e04c862af2/public/models/";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  if (file !== "atlas.json" && !/^female-(?:[0-9]|1[0-9]|2[01])\.bin(?:\.gz)?$/.test(file)) {
    return NextResponse.json({ error: "Archivo no permitido" }, { status: 404 });
  }

  try {
    const upstream = await fetch(UPSTREAM + file, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(45000),
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "El recurso anatómico femenino no está disponible temporalmente." },
        { status: 502 }
      );
    }

    if (file === "atlas.json") {
      const manifest = await upstream.json();
      if (manifest.sex !== "female" || !Array.isArray(manifest.chunks)) {
        return NextResponse.json({ error: "Catálogo incompatible" }, { status: 502 });
      }
      // Female Atlas uses BodyParts3D assets with a few source classification
      // errors: fibularis, tibialis and subscapularis are muscles, not bones.
      // Correct the educational system grouping without changing geometry.
      manifest.parts = manifest.parts.map((part: {
        id: string; name: string; system: string;
      }) => {
        if (part.id.startsWith("BP3D_") && part.system === "skeletal") {
          if (/\\b(fibularis|tibialis|subscapularis|levator scapulae)\\b/i.test(part.name)) {
            return { ...part, system: "muscular" };
          }
          if (/\\biliotibial tract\\b/i.test(part.name)) {
            return { ...part, system: "connective" };
          }
        }
        return part;
      });
      manifest.chunks = manifest.chunks.map((chunk: { url: string; gzip?: string }) => ({
        ...chunk,
        url: "/api/female-atlas/" + chunk.url.split("/").pop(),
        gzip: chunk.gzip ? "/api/female-atlas/" + chunk.gzip.split("/").pop() : undefined,
      }));
      return NextResponse.json(manifest, {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    if (!upstream.body) {
      return NextResponse.json({ error: "El archivo está vacío" }, { status: 502 });
    }
    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo descargar la anatomía femenina. Probá nuevamente." },
      { status: 502 }
    );
  }
}
