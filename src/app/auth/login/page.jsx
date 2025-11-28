// src/app/auth/login/page.jsx (atau dimana pun)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      const message =
        err?.message &&
        /email atau password salah/i.test(err.message)
          ? "Email atau password salah"
          : err?.message || "Login gagal";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Card className="w-[360px]">
        <CardHeader>
          <CardTitle className="text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-500">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sedang masuk..." : "Masuk"}
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/">
                ← Kembali ke Beranda
              </Link>
            </Button>

            <p className="text-center text-xs text-slate-500">
              Belum punya akun?{" "}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-slate-900"
                onClick={() => router.push("/auth/register")}
              >
                Daftar
              </Button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
