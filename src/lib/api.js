// src/lib/api.js
import { getToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

async function apiRequest(path, options = {}) {
  const token = getToken();

  const {
    method = "GET",
    body,
    headers: extraHeaders,
    ...restOptions
  } = options;

  const headers = {
    ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(extraHeaders || {}),
  };

  if (token) {
    // kirim 3 gaya sekaligus, biar backend mana pun nggak banyak dramanya
    headers.Authorization = `Bearer ${token}`; // kalau middleware pakai "Bearer ..."
    headers["X-Access-Token"] = token;        // kalau pakai x-access-token
    headers["X-Auth-Token"] = token;          // kalau ada yang sok kreatif
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    body: body
      ? body instanceof FormData
        ? body
        : JSON.stringify(body)
      : undefined,
    headers,
    ...restOptions,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    // kalau bukan JSON, ya sudah
  }

  if (!res.ok) {
    const msg = data?.message || `Request gagal (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

export function get(path, options) {
  return apiRequest(path, { ...options, method: "GET" });
}
export function post(path, body, options) {
  return apiRequest(path, { ...options, method: "POST", body });
}
export function put(path, body, options) {
  return apiRequest(path, { ...options, method: "PUT", body });
}
export function patch(path, body, options) {
  return apiRequest(path, { ...options, method: "PATCH", body });
}
export function del(path, options) {
  return apiRequest(path, { ...options, method: "DELETE" });
}
