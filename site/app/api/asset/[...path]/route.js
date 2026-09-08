import { NextResponse } from "next/server";
import { promises as fsp } from "fs";
import { accessSync } from "fs";
import path from "path";

function findSamplesDir() {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, "content", "samples");
    try { accessSync(candidate); return candidate; } catch { /* next */ }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export async function GET(_req, { params }) {
  const { path: segs } = await params;
  const dir = findSamplesDir();
  if (!dir) return NextResponse.json({ error: "not found" }, { status: 500 });
  const rel = (Array.isArray(segs) ? segs : []).join("/");
  const allowed = /^audio\/[A-Za-z0-9._\-\/]+\.mp3$/.test(rel);
  if (!allowed || rel.includes("..")) {
    return NextResponse.json({ error: "bad path" }, { status: 400 });
  }
  const base = path.resolve(dir);
  const file = path.resolve(dir, rel);
  if (!file.startsWith(base + path.sep)) {
    return NextResponse.json({ error: "bad path" }, { status: 400 });
  }
  try {
    const buf = await fsp.readFile(file);
    return new NextResponse(new Uint8Array(buf), {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}