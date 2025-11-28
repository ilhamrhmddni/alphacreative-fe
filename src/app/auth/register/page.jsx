// src/app/auth/register/page.jsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { post } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-provider";

const DEFAULT_MESSAGE =
  "Akun Anda telah dibuat dan menunggu aktivasi admin. Anda tetap bisa masuk ke dashboard, namun beberapa fitur akan terbatas sampai akun aktif.";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak sesuai.");
      return;
    }

    try {
      setLoading(true);
      await post("/auth/register", {
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
      });
      setSuccess(DEFAULT_MESSAGE);
      await login(form.email.trim(), form.password);
      router.push("/dashboard/profile");
    } catch (err) {
      setError(err.message || "Gagal mendaftar. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Daftar Akun Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Email</label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Username</label>
              <Input
                required
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="Nama tim atau pengguna"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Password</label>
              <Input
                type="password"
                required
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Minimal 8 karakter"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Konfirmasi Password</label>
              <Input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                placeholder="Ulangi password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {success && (
              <p className="text-sm text-emerald-600">{success}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Mendaftar..." : "Daftar"}
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                ← Kembali ke Beranda
              </Link>
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Sudah punya akun?{" "}
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto"
              onClick={() => router.push("/auth/login")}
            >
              Masuk
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
