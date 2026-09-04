"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export interface PostSabbaticalResult {
  ok: boolean;
  error?: string;
}

export async function postSabbaticalListing(input: {
  title: string;
  description: string;
  domain?: string | null;
  duration?: string | null;
  location?: string | null;
  compensation?: string | null;
}): Promise<PostSabbaticalResult> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "INDUSTRIES" && user.role !== "INDUSTRY")) {
    return { ok: false, error: "Only industry partners can post sabbatical opportunities." };
  }

  const title = input.title.trim();
  const description = input.description.trim();
  if (!title || !description || description.length < 20) {
    return { ok: false, error: "Title and a description of at least 20 characters are required." };
  }

  await prisma.sabbaticalListing.create({
    data: {
      companyId: user.id,
      title,
      description,
      domain: input.domain || null,
      duration: input.duration || null,
      location: input.location || null,
      compensation: input.compensation || null,
    },
  });

  revalidatePath("/sabbaticals");
  return { ok: true };
}
