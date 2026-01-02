"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { get, put } from "@/lib/api";
import { useToast } from "@/components/ui/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MerchandiseContactSettings() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const data = await get("/merchandise/config");
        setWhatsappNumber(data.whatsappNumber || "");
        setEdited(false);
      } catch (err) {
        console.error("Error fetching merchandise config:", err);
        toastError({
          title: "Gagal memuat konfigurasi",
          description: err.message,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, [toastError]);

  async function handleSave() {
    try {
      setSaving(true);
      const result = await put("/merchandise/config", {
        whatsappNumber: whatsappNumber.trim() || null,
      });
      setWhatsappNumber(result.whatsappNumber || "");
      setEdited(false);
      toastSuccess({
        title: "Kontak disimpan",
        description: "Nomor WhatsApp merchandise berhasil diperbarui",
      });
    } catch (err) {
      toastError({
        title: "Gagal menyimpan kontak",
        description: err.message,
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="py-6 text-sm text-muted-foreground">
          Memuat...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-5 w-5 text-green-600" />
              Kontak WhatsApp Merchandise
            </CardTitle>
            <CardDescription className="mt-1">
              Nomor WhatsApp yang akan ditampilkan untuk pembelian merchandise
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nomor WhatsApp
            </label>
            <Input
              type="tel"
              placeholder="Contoh: 62812345678 atau +62812345678"
              value={whatsappNumber}
              onChange={(e) => {
                setWhatsappNumber(e.target.value);
                setEdited(true);
              }}
              className="h-10 border-border text-sm"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Masukkan nomor tanpa simbol, hanya angka. Contoh: 62812345678
            </p>
          </div>

          {whatsappNumber && (
            <div className="rounded-md bg-green-50 border border-green-200 p-3">
              <p className="text-xs text-green-700">
                <strong>Preview:</strong> Pesan akan dikirim ke nomor ini
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {edited && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEdited(false);
                  setWhatsappNumber(whatsappNumber);
                }}
                disabled={saving}
              >
                Batal
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!edited || saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? "Menyimpan..." : "Simpan Kontak"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
