"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus2 } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { del, get, post, put } from "@/lib/api";
import { useToast } from "@/components/ui/toast-provider";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DetailPesertaTable } from "@/components/tables/detail-peserta-table";
import DetailPesertaFormDialog from "@/components/form/detail-peserta-form-dialog";

export default function DetailPesertaPage() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const isOperator = user?.role === "operator";
  const operatorFocusEventId = isOperator ? user?.focusEventId : null;
  const needsFocusSelection = isOperator && !operatorFocusEventId;

  const [details, setDetails] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [pesertaList, setPesertaList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterText, setFilterText] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [teamFilter, setTeamFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/auth/login");
    }
  }, [initializing, user, router]);

  const fetchDetails = useCallback(async () => {
    if (!user || initializing) return;
    if (needsFocusSelection) {
      setDetails([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await get("/detail-peserta");
      setDetails(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat detail peserta");
    } finally {
      setLoading(false);
    }
  }, [user, initializing, needsFocusSelection]);

  const fetchPeserta = useCallback(async () => {
    if (!user || initializing || needsFocusSelection) return;
    try {
      const data = await get("/peserta");
      setPesertaList(data);
    } catch (err) {
      console.error(err);
    }
  }, [user, initializing, needsFocusSelection]);

  useEffect(() => {
    fetchDetails();
    fetchPeserta();
  }, [fetchDetails, fetchPeserta]);

  useEffect(() => {
    if (operatorFocusEventId) {
      setEventFilter(String(operatorFocusEventId));
    }
  }, [operatorFocusEventId]);

  const pesertaMap = useMemo(() => {
    const map = new Map();
    pesertaList.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [pesertaList]);

  const enrichedDetails = useMemo(() => {
    return details.map((detail) => {
      const fallbackPeserta = pesertaMap.get(detail.pesertaId);
      if (!fallbackPeserta) return detail;
      if (detail.peserta?.event) return detail;
      return {
        ...detail,
        peserta: detail.peserta
          ? { ...detail.peserta, event: fallbackPeserta.event }
          : fallbackPeserta,
      };
    });
  }, [details, pesertaMap]);

  useEffect(() => {
    let data = [...enrichedDetails];

    if (filterText.trim()) {
      const text = filterText.toLowerCase();
      data = data.filter((item) => {
        return (
          (item.namaDetail || "").toLowerCase().includes(text) ||
          (item.peserta?.namaTim || "").toLowerCase().includes(text) ||
          (item.peserta?.event?.namaEvent || "").toLowerCase().includes(text)
        );
      });
    }

    if (eventFilter !== "all") {
      data = data.filter(
        (item) => String(item.peserta?.event?.id) === eventFilter
      );
    }

    if (teamFilter !== "all") {
      data = data.filter((item) => String(item.pesertaId) === teamFilter);
    }

    setFiltered(data);
  }, [enrichedDetails, filterText, eventFilter, teamFilter]);

  const canManage = user?.role === "admin" || user?.role === "operator";

  const totalDetails = enrichedDetails.length;
  const withBirthDate = enrichedDetails.filter((d) => d.tanggalLahir).length;
  const withAge = enrichedDetails.filter((d) => d.umur != null).length;
  const uniqueTeams = new Set(enrichedDetails.map((d) => d.pesertaId)).size;

  const eventOptions = useMemo(() => {
    const map = new Map();
    enrichedDetails.forEach((detail) => {
      const event = detail.peserta?.event;
      if (event?.id) {
        map.set(String(event.id), event.namaEvent || "Event tidak diketahui");
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [enrichedDetails]);

  const pesertaOptions = useMemo(
    () =>
      pesertaList.map((item) => ({
        value: String(item.id),
        label: `${item.namaTim} • ${item.event?.namaEvent || "Event tidak diketahui"}`,
      })),
    [pesertaList]
  );

  const teamFilterOptions = useMemo(() => {
    const map = new Map();
    enrichedDetails.forEach((detail) => {
      if (detail.pesertaId) {
        map.set(
          String(detail.pesertaId),
          detail.peserta?.namaTim || "Tim tidak diketahui"
        );
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [enrichedDetails]);

  if (initializing || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-slate-500">
        Memeriksa sesi...
      </div>
    );
  }

  if (needsFocusSelection) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
          <Card className="border border-dashed border-slate-300 bg-slate-50">
            <CardContent className="py-6 text-sm text-slate-600">
              Pilih event fokus terlebih dahulu pada tab Profil untuk mengelola detail peserta.
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  function handleAdd() {
    setEditingDetail(null);
    setDialogOpen(true);
  }

  function handleEdit(target) {
    setEditingDetail(target);
    setDialogOpen(true);
  }

  async function handleDelete(target) {
    try {
      await del(`/detail-peserta/${target.id}`);
      setDetails((prev) => prev.filter((item) => item.id !== target.id));
      toastSuccess({
        title: "Anggota dihapus",
        description: target.namaDetail || "Data anggota berhasil dihapus",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal menghapus detail peserta");
      toastError({
        title: "Gagal menghapus anggota",
        description: err.message,
      });
    }
  }

  async function handleSubmitForm(formData) {
    try {
      if (editingDetail) {
        await put(`/detail-peserta/${editingDetail.id}`, formData);
        toastSuccess({
          title: "Anggota diperbarui",
          description: editingDetail?.namaDetail || "Data anggota disimpan",
        });
      } else {
        await post("/detail-peserta", formData);
        toastSuccess({
          title: "Anggota ditambahkan",
          description: "Detail peserta baru berhasil ditambahkan",
        });
      }
      await fetchDetails();
      setDialogOpen(false);
      setEditingDetail(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal menyimpan detail peserta");
      toastError({
        title: "Gagal menyimpan detail peserta",
        description: err.message,
      });
    }
  }

  const filtersActive =
    Boolean(filterText) || eventFilter !== "all" || teamFilter !== "all";

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
        <Card className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 sm:text-lg">
                  Detail Peserta
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {totalDetails > 0
                    ? `${totalDetails} anggota dalam ${uniqueTeams} tim`
                    : "Belum ada anggota tim. Tambahkan detail peserta untuk melengkapi profil."}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatPill label="Total" value={totalDetails} />
                <StatPill label="TTL" value={withBirthDate} color="amber" />
                <StatPill label="Umur" value={withAge} color="emerald" />
                <StatPill label="Tim" value={uniqueTeams} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex w-full flex-col gap-3">
                <div className="w-full">
                  <Input
                    placeholder="Cari anggota, tim, atau event..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="h-9 w-full rounded-md border-slate-200 text-xs placeholder:text-slate-400 sm:text-sm"
                  />
                </div>

                <div className="flex w-full flex-wrap gap-2">
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="h-9 w-full rounded-md border-slate-200 text-xs sm:w-[180px] sm:text-sm">
                      <SelectValue placeholder="Semua event" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border border-slate-200 bg-white shadow-md">
                      <SelectItem value="all">Semua event</SelectItem>
                      {eventOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={teamFilter} onValueChange={setTeamFilter}>
                    <SelectTrigger className="h-9 w-full rounded-md border-slate-200 text-xs sm:w-[160px] sm:text-sm">
                      <SelectValue placeholder="Semua tim" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border border-slate-200 bg-white shadow-md">
                      <SelectItem value="all">Semua tim</SelectItem>
                      {teamFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {filtersActive && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-md text-xs"
                      onClick={() => {
                        setFilterText("");
                        setEventFilter("all");
                        setTeamFilter("all");
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {canManage && (
                <Button
                  size="sm"
                  onClick={handleAdd}
                  className="h-9 rounded-md"
                >
                  <UserPlus2 className="mr-2 h-4 w-4" />
                  Tambah Detail
                </Button>
              )}
            </div>

            {error && <p className="text-[11px] text-red-500">{error}</p>}

            {filtered.length !== totalDetails && (
              <p className="text-[11px] text-slate-500">
                Menampilkan {filtered.length} dari {totalDetails} detail.
              </p>
            )}

            <DetailPesertaTable
              items={filtered}
              loading={loading}
              canEdit={canManage}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      </main>

      {canManage && (
        <DetailPesertaFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={editingDetail}
          pesertaOptions={pesertaOptions}
          onSubmit={handleSubmitForm}
        />
      )}
    </div>
  );
}

function StatPill({ label, value, color = "slate" }) {
  const colorMap = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const classes = colorMap[color] || colorMap.slate;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${classes}`}
    >
      <span className="text-[10px] font-normal text-slate-500">{label}</span>
      <span className="ml-2 text-sm">{value}</span>
    </span>
  );
}
