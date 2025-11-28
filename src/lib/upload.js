// src/lib/upload.js
import { getToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export async function uploadEventPhoto(file) {
  if (!file) throw new Error("File tidak ditemukan");

  const form = new FormData();
  form.append("file", file);

  const token = getToken();
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  const res = await fetch(`${API_BASE_URL}/upload/event-photo`, {
    method: "POST",
    body: form,
    headers,
  });

  if (!res.ok) {
    let msg = "Gagal upload foto";
    try {
      const errBody = await res.json();
      if (errBody?.message) msg = errBody.message;
      // kalau kita kirim bodySnippet dari backend, bisa bantu debugging:
      if (errBody?.bodySnippet) {
        console.error("[Upload backend bodySnippet]:", errBody.bodySnippet);
      }
    } catch {
      // kalau bukan JSON, ya sudah
    }
    throw new Error(msg);
  }

  const data = await res.json();
  if (!data?.url) {
    throw new Error("URL foto tidak ditemukan di respons backend");
  }
  return data.url;
}
