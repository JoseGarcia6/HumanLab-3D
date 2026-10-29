import { NextRequest, NextResponse } from "next/server";

/**
 * Read-only, allowlisted proxy for the BodyParts3D 4.0 assets used by Human Atlas.
 * The original application code is MIT (ashemag/human-atlas), anatomy CC BY 4.0.
 * Pinned upstream revision to avoid silently changing the data contract.
 */
const UPSTREAM = "https://raw.githubusercontent.com/ashemag/human-atlas/1c38bf35c254a891200d3cedecfd57abebe83d8d/public/models/";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  if (file !== "atlas.json" && !/^body-(?:[0-9]|1[0-4])\.bin(?:\.gz)?$/.test(file)) {
    return NextResponse.json({ error: "Archivo no permitido" }, { status: 404 });
  }

  try {
    const upstream = await fetch(UPSTREAM + file, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(30000),
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: "No se pudo obtener el modelo anatómico de su fuente." },
        { status: 502 }
      );
    }

    if (file === "atlas.json") {
      const manifest = await upstream.json();
      // Keep models on this app's origin, avoiding browser CORS issues.
      manifest.chunks = manifest.chunks.map((chunk: { url: string; gzip?: string }) => ({
        ...chunk,
        url: "/api/atlas/" + chunk.url.split("/").pop(),
        gzip: chunk.gzip ? "/api/atlas/" + chunk.gzip.split("/").pop() : undefined,
      }));
      return NextResponse.json(manifest, {
        headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
      });
    }

    if (!upstream.body) {
      return NextResponse.json({ error: "El archivo está vacío." }, { status: 502 });
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
      { error: "El atlas no está disponible temporalmente. Probá nuevamente." },
      { status: 502 }
    );
  }
}
