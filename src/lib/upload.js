// src/lib/upload.js
import { getToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000/api";

async function uploadGeneric({ file, endpoint, expectFullPayload = false }) {
  if (!file) throw new Error("File tidak ditemukan");

  const form = new FormData();
  form.append("file", file);

  const token = getToken();
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
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
  if (expectFullPayload) {
    return data;
  }
  if (!data?.url) {
    throw new Error("URL foto tidak ditemukan di respons backend");
  }
  return data.url;
}

export async function uploadEventPhoto(file) {
  return uploadGeneric({ file, endpoint: "/upload/event-photo" });
}

export async function uploadNewsPhoto(file) {
  return uploadGeneric({ file, endpoint: "/upload/news-photo" });
}

export async function uploadMerchPhoto(file) {
  return uploadGeneric({ file, endpoint: "/upload/merch-photo" });
}

export async function uploadGalleryPhoto(file) {
  return uploadGeneric({ file, endpoint: "/upload/gallery-photo" });
}

export async function uploadPartnerLogo(file) {
  return uploadGeneric({ file, endpoint: "/upload/partner-logo" });
}

export async function uploadProfilePhoto(file, { assignToUser = true } = {}) {
  if (!file) throw new Error("File tidak ditemukan");

  const form = new FormData();
  form.append("file", file);
  if (assignToUser === false) {
    form.append("assignToUser", "false");
  }

  const token = getToken();
  const headers = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  const res = await fetch(`${API_BASE_URL}/upload/profile-photo`, {
    method: "POST",
    body: form,
    headers,
  });

  if (!res.ok) {
    let msg = "Gagal upload foto";
    try {
      const errBody = await res.json();
      if (errBody?.message) msg = errBody.message;
      if (errBody?.bodySnippet) {
        console.error("[Upload backend bodySnippet]:", errBody.bodySnippet);
      }
    } catch {
      // bukan JSON, abaikan
    }
    throw new Error(msg);
  }

  const data = await res.json();
  if (!data?.url) {
    throw new Error("URL foto tidak ditemukan di respons backend");
  }
  return data;
}
