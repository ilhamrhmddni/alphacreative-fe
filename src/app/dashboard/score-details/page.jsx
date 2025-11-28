"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

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

import { ScoreDetailTable } from "@/components/tables/score-detail-table";
import ScoreDetailFormDialog from "@/components/form/score-detail-form-dialog";

export default function ScoreDetailsPage() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const isOperator = user?.role === "operator";
  const operatorFocusEventId = isOperator ? user?.focusEventId : null;
  const needsFocusSelection = isOperator && !operatorFocusEventId;

  const [details, setDetails] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [scores, setScores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterText, setFilterText] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [juriFilter, setJuriFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [participantFilter, setParticipantFilter] = useState("all");

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/auth/login");
    }
  }, [initializing, user, router]);

  const fetchDetails = useCallback(async () => {
    if (!user || initializing) return;
    if (isOperator && !operatorFocusEventId) return;
    try {
      setLoading(true);
      setError("");
      const endpoint = operatorFocusEventId
        ? `/score-details?eventId=${operatorFocusEventId}`
        : "/score-details";
      const data = await get(endpoint);
      setDetails(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat detail score");
    } finally {
      setLoading(false);
    }
  }, [user, initializing, operatorFocusEventId, isOperator]);

  const fetchScores = useCallback(async () => {
    if (!user || initializing) return;
    if (isOperator && !operatorFocusEventId) return;
    try {
      const endpoint = operatorFocusEventId
        ? `/scores?eventId=${operatorFocusEventId}`
        : "/scores";
      const data = await get(endpoint);
      setScores(data);
    } catch (err) {
      console.error(err);
    }
  }, [user, initializing, operatorFocusEventId, isOperator]);

  useEffect(() => {
    fetchDetails();
    fetchScores();
  }, [fetchDetails, fetchScores]);

  useEffect(() => {
    if (operatorFocusEventId) {
      setEventFilter(String(operatorFocusEventId));
    } else if (isOperator) {
      setEventFilter("all");
    }
  }, [operatorFocusEventId, isOperator]);

  useEffect(() => {
    if (operatorFocusEventId) {
      setEventFilter(String(operatorFocusEventId));
    } else if (isOperator) {
      setEventFilter("all");
    }
  }, [operatorFocusEventId, isOperator]);

  useEffect(() => {
    let data = [...details];

    if (filterText.trim()) {
      const text = filterText.toLowerCase();
      data = data.filter((item) => {
        return (
          (item.kriteria || "").toLowerCase().includes(text) ||
          (item.score?.event?.namaEvent || "").toLowerCase().includes(text) ||
          (item.score?.peserta?.namaTim || "").toLowerCase().includes(text) ||
          (item.score?.juri?.username || item.score?.juri?.email || "")
            .toLowerCase()
            .includes(text)
        );
      });
    }

    if (eventFilter !== "all") {
      data = data.filter(
        (item) => String(item.score?.eventId) === eventFilter
      );
    }

    if (juriFilter !== "all") {
      data = data.filter(
        (item) => String(item.score?.juriId) === juriFilter
      );
    }

    if (participantFilter !== "all") {
      data = data.filter(
        (item) => String(item.score?.pesertaId) === participantFilter
      );
    }

    setFiltered(data);
  }, [details, filterText, eventFilter, juriFilter, participantFilter]);

  const canManage =
    user?.role === "admin" || user?.role === "juri" || user?.role === "operator";

  const totalDetails = details.length;
  const uniqueScores = new Set(details.map((item) => item.scoreId)).size;
  const filledWeights = details.filter((item) => item.bobot != null).length;
  const criteriaPerScore =
    uniqueScores > 0 ? Math.round((totalDetails / uniqueScores) * 10) / 10 : 0;

  const eventOptions = useMemo(() => {
    const map = new Map();
    details.forEach((item) => {
      if (item.score?.eventId) {
        map.set(
          String(item.score.eventId),
          item.score.event?.namaEvent || "Event tidak diketahui"
        );
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [details]);

  const juriOptions = useMemo(() => {
    const map = new Map();
    details.forEach((item) => {
      const juriId = item.score?.juriId;
      if (juriId) {
        map.set(
          String(juriId),
          item.score?.juri?.username ||
            item.score?.juri?.email ||
            "Juri tidak diketahui"
        );
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [details]);
  const formJuriOptions = useMemo(() => {
    const map = new Map();
    scores.forEach((score) => {
      if (score.juriId && !map.has(score.juriId)) {
        map.set(score.juriId, {
          id: score.juriId,
          username: score.juri?.username || null,
          email: score.juri?.email || null,
        });
      }
    });
    return Array.from(map.values());
  }, [scores]);

  const participantOptions = useMemo(() => {
    const map = new Map();
    scores.forEach((score) => {
      if (score.pesertaId) {
        map.set(
          String(score.pesertaId),
          score.peserta?.namaTim ||
            score.peserta?.namaPerwakilan ||
            `Peserta #${score.pesertaId}`
        );
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [scores]);

  if (initializing || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-slate-500">
        Memeriksa sesi...
      </div>
    );
  }

  if (isOperator && needsFocusSelection) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
          <Card className="border border-dashed border-slate-300 bg-slate-50">
            <CardContent className="py-6 text-sm text-slate-600">
              Pilih event fokus di tab Profil untuk mengelola detail score.
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
      await del(`/score-details/${target.id}`);
      setDetails((prev) => prev.filter((item) => item.id !== target.id));
      toastSuccess({
        title: "Detail score dihapus",
        description: target.kriteria || "Detail penilaian berhasil dihapus",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal menghapus detail score");
      toastError({
        title: "Gagal menghapus detail score",
        description: err.message,
      });
    }
  }

  async function handleSubmitForm(formData) {
    try {
      if (editingDetail) {
        await put(`/score-details/${editingDetail.id}`, formData);
        toastSuccess({
          title: "Detail diperbarui",
          description: editingDetail?.kriteria || "Detail score disimpan",
        });
      } else {
        await post("/score-details", formData);
        toastSuccess({
          title: "Detail ditambahkan",
          description: "Kriteria penilaian baru berhasil ditambahkan",
        });
      }
      await fetchDetails();
      setDialogOpen(false);
      setEditingDetail(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal menyimpan detail score");
      toastError({
        title: "Gagal menyimpan detail score",
        description: err.message,
      });
    }
  }

  async function handleDeleteScore(score) {
    if (!score?.id) return;
    try {
      await del(`/scores/${score.id}`);
      toastSuccess({
        title: "Score dihapus",
        description:
          score.peserta?.namaTim || score.event?.namaEvent || "Score berhasil dihapus",
      });
      await Promise.all([fetchDetails(), fetchScores()]);
    } catch (err) {
      console.error(err);
      toastError({
        title: "Gagal menghapus score",
        description: err.message,
      });
    }
  }

  const filtersActive =
    Boolean(filterText) ||
    eventFilter !== "all" ||
    juriFilter !== "all" ||
    participantFilter !== "all";

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
        <Card className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 sm:text-lg">
                  Detail Penilaian
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {totalDetails > 0
                    ? `${totalDetails} kriteria dari ${uniqueScores} score`
                    : "Belum ada detail score. Tambahkan kriteria penilaian."}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatPill label="Detail" value={totalDetails} />
                <StatPill label="Score unik" value={uniqueScores} color="emerald" />
                <StatPill label="Bobot terisi" value={filledWeights} color="amber" />
                <StatPill label="Rata2/score" value={criteriaPerScore} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex w-full flex-col gap-3">
                <div className="w-full">
                  <Input
                    placeholder="Cari kriteria, tim, atau event..."
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

                  <Select value={juriFilter} onValueChange={setJuriFilter}>
                    <SelectTrigger className="h-9 w-full rounded-md border-slate-200 text-xs sm:w-[160px] sm:text-sm">
                      <SelectValue placeholder="Semua juri" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border border-slate-200 bg-white shadow-md">
                      <SelectItem value="all">Semua juri</SelectItem>
                      {juriOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={participantFilter}
                    onValueChange={setParticipantFilter}
                  >
                    <SelectTrigger className="h-9 w-full rounded-md border-slate-200 text-xs sm:w-[180px] sm:text-sm">
                      <SelectValue placeholder="Semua peserta" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border border-slate-200 bg-white shadow-md">
                      <SelectItem value="all">Semua peserta</SelectItem>
                      {participantOptions.map((option) => (
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
                        setJuriFilter("all");
                        setParticipantFilter("all");
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
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Detail
                </Button>
              )}
            </div>

            {error && <p className="text-[11px] text-red-500">{error}</p>}

            {filtered.length !== totalDetails && (
              <p className="text-[11px] text-slate-500">
                Menampilkan {filtered.length} dari {totalDetails} detail score.
              </p>
            )}

            <ScoreDetailTable
              items={filtered}
              loading={loading}
              canEdit={canManage}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteScore={handleDeleteScore}
            />
          </CardContent>
        </Card>
      </main>

      {canManage && (
        <ScoreDetailFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={editingDetail}
          scores={scores}
          juriOptions={formJuriOptions}
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
