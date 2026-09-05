import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) {
    return new NextResponse("Document ID is required", { status: 400 });
  }

  const doc = await prisma.userDocument.findUnique({
    where: { id },
  });

  if (!doc) {
    return new NextResponse("Document not found", { status: 404 });
  }

  // Security check: owner, or any authenticated faculty, industry, institution, or admin user
  const isOwner = doc.userId === user.id;
  const isAuthorizedViewer = [
    "ACADEMICIAN",
    "FACULTY",
    "INDUSTRY",
    "INSTITUTION",
    "ADMIN",
    "STUDENT",
  ].includes(user.role.toUpperCase());

  if (!isOwner && !isAuthorizedViewer) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const urlObj = new URL(req.url);
  const isDownload =
    urlObj.searchParams.get("download") === "1" ||
    urlObj.searchParams.get("download") === "true";

  // If document is stored as a remote URL (http/https)
  if (doc.dataUrl.startsWith("http://") || doc.dataUrl.startsWith("https://")) {
    return NextResponse.redirect(doc.dataUrl);
  }

  // Parse dataUrl: data:[<mediatype>][;base64],<data>
  let contentType = "application/octet-stream";
  let buffer: Buffer;

  if (doc.dataUrl.startsWith("data:")) {
    const commaIndex = doc.dataUrl.indexOf(",");
    if (commaIndex === -1) {
      return new NextResponse("Malformed document data", { status: 400 });
    }

    const meta = doc.dataUrl.substring(5, commaIndex);
    const rawData = doc.dataUrl.substring(commaIndex + 1);

    const isBase64 = meta.includes(";base64");
    contentType = meta.split(";")[0] || "";

    if (!contentType || contentType === "application/octet-stream") {
      const ext = doc.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf") contentType = "application/pdf";
      else if (ext === "png") contentType = "image/png";
      else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
      else if (ext === "svg") contentType = "image/svg+xml";
      else if (ext === "webp") contentType = "image/webp";
      else if (ext === "txt") contentType = "text/plain";
      else contentType = "application/pdf"; // Default fallback for documents
    }

    if (isBase64) {
      buffer = Buffer.from(rawData, "base64");
    } else {
      buffer = Buffer.from(decodeURIComponent(rawData), "utf-8");
    }
  } else {
    // If raw base64 or other text
    const ext = doc.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") contentType = "application/pdf";
    else contentType = "application/octet-stream";
    buffer = Buffer.from(doc.dataUrl, "base64");
  }

  const disposition = isDownload ? "attachment" : "inline";
  const cleanFilename = doc.name.replace(/[^\w.-]/g, "_");

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `${disposition}; filename="${cleanFilename}"`,
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
