import { API_BASE_URL, API_ROUTES } from "@/lib/configs/api";

export async function uploadResume(file: File): Promise<{
  resumeUrl: string;
  pathname?: string;
}> {
  const url = `${API_BASE_URL}${API_ROUTES.RESUMES.UPLOAD}`;
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const json = (await res.json().catch(() => null)) as {
    success?: boolean;
    data?: { resumeUrl?: string; pathname?: string };
    error?: { message?: string };
  } | null;

  if (!res.ok) {
    const msg = json?.error?.message ?? res.statusText ?? "Upload failed";
    throw new Error(msg);
  }

  const resumeUrl = json?.data?.resumeUrl;
  if (!resumeUrl) throw new Error("Invalid upload response");

  return {
    resumeUrl,
    pathname: json.data?.pathname,
  };
}
