import { getSupabaseClient } from "@/lib/supabase/client";

export const RESUME_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_RESUME_BUCKET || "resume-files";

function slugifyFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/\.pdf$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function uploadResumePdf(file: File) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error("Supabase is not configured yet.");
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    throw new Error("Please upload a PDF file.");
  }

  const safeName = slugifyFileName(file.name) || "resume";
  const path = `resume-versions/${Date.now()}-${safeName}.pdf`;

  const { error } = await client.storage.from(RESUME_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: "application/pdf",
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = client.storage.from(RESUME_BUCKET).getPublicUrl(path);

  return {
    path,
    url: data.publicUrl,
  };
}
