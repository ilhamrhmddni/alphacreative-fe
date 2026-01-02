// src/lib/api.js
import { getToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const isType = (v, t) => typeof t !== "undefined" && v instanceof t;
const isFormData = (v) => isType(v, FormData);
const isBlob = (v) => isType(v, Blob);
const isArrayBuffer = (v) => isType(v, ArrayBuffer);
const isURLSearchParams = (v) => isType(v, URLSearchParams);

const buildHeaders = (payload, extraHeaders = {}) => {
  const headers = { Accept: "application/json", ...extraHeaders };
  const shouldAttachJson = payload != null && !isFormData(payload) && !isBlob(payload) && !isArrayBuffer(payload) && !isURLSearchParams(payload) && typeof payload !== "string";
  if (shouldAttachJson && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  return headers;
};

const resolveBody = (payload) => {
  if (payload == null) return undefined;
  if (isFormData(payload) || isBlob(payload) || isArrayBuffer(payload) || isURLSearchParams(payload) || typeof payload === "string") return payload;
  return JSON.stringify(payload);
};

const toJson = async (response) => {
  if (!response.headers.get("content-type")?.includes("application/json")) return null;
  try { return await response.json(); } catch { return null; }
};

export class ApiError extends Error {
  constructor(message, { status, data, path, method } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.path = path;
    this.method = method;
  }
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  const { method = "GET", body, headers: extraHeaders, ...rest } = options;
  const headers = buildHeaders(body, extraHeaders);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers["X-Access-Token"] = token;
    headers["X-Auth-Token"] = token;
  }
  
  const response = await fetch(`${API_BASE_URL}${path}`, { method, body: resolveBody(body), headers, ...rest });
  const data = await toJson(response);
  
  if (!response.ok) {
    throw new ApiError(data?.message || response.statusText || `Request gagal (${response.status})`, { status: response.status, data, path, method });
  }
  return data;
}

export const get = (p, o) => apiRequest(p, { ...o, method: "GET" });
export const post = (p, b, o) => apiRequest(p, { ...o, method: "POST", body: b });
export const put = (p, b, o) => apiRequest(p, { ...o, method: "PUT", body: b });
export const patch = (p, b, o) => apiRequest(p, { ...o, method: "PATCH", body: b });
export const del = (p, o) => apiRequest(p, { ...o, method: "DELETE" });
