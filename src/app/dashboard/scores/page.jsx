"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ScoreTable } from "@/components/tables/score-table";
import ScoreFormDialog from "@/components/form/score-form-dialog";

export default function ScoresPage() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const isOperator = user?.role === "operator";
  const operatorFocusEventId = isOperator ? user?.focusEventId : null;
  const needsFocusSelection = isOperator && !operatorFocusEventId;

  const [scores, setScores] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [events, setEvents] = useState([]);
  const [peserta, setPeserta] = useState([]);
  const [juriList, setJuriList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterText, setFilterText] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [juriFilter, setJuriFilter] = useState("all");
  const [participantFilter, setParticipantFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScore, setEditingScore] = useState(null);
  const [detailViewerScore, setDetailViewerScore] = useState(null);
  const [detailViewerOpen, setDetailViewerOpen] = useState(false);

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/auth/login");
    }
  }, [initializing, user, router]);

  const fetchScores = useCallback(async () => {
    if (!user || initializing) return;
    try {
      setLoading(true);
      setError("");
      const endpoint = operatorFocusEventId
        ? `/scores?eventId=${operatorFocusEventId}`
        : "/scores";
      const data = await get(endpoint);
      setScores(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat score");
    } finally {
      setLoading(false);
    }
  }, [user, initializing, operatorFocusEventId]);

  const fetchEvents = useCallback(async () => {
    if (!user || initializing) return;
    try {
      const data = await get("/events");
      setEvents(
        operatorFocusEventId
          ? data.filter((event) => event.id === operatorFocusEventId)
          : data
      );
    } catch (err) {
      console.error(err);
    }
  }, [user, initializing, operatorFocusEventId]);

  const fetchPeserta = useCallback(async () => {
    if (!user || initializing) return;
    if (user.role === "juri") {
      setPeserta([]);
      return;
    }
    try {
      const endpoint = operatorFocusEventId
        ? `/peserta?eventId=${operatorFocusEventId}`
        : "/peserta";
      const data = await get(endpoint);
      setPeserta(data);
    } catch (err) {
      console.error(err);
    }
  }, [user, initializing, operatorFocusEventId]);

  const fetchJuri = useCallback(async () => {
    if (!user || initializing || (user.role !== "admin" && user.role !== "operator")) return;
    try {
      const data = await get("/users?role=juri");
      setJuriList(data);
    } catch (err) {
      console.error(err);
    }
  }, [user, initializing]);

  useEffect(() => {
    fetchScores();
    fetchEvents();
    fetchPeserta();
    fetchJuri();
  }, [fetchScores, fetchEvents, fetchPeserta, fetchJuri]);

  useEffect(() => {
    if (operatorFocusEventId) {
      setEventFilter(String(operatorFocusEventId));
    } else if (isOperator) {
      setEventFilter("all");
    }
  }, [operatorFocusEventId, isOperator]);

  useEffect(() => {
    let data = [...scores];

    if (filterText.trim()) {
      const text = filterText.toLowerCase();
      data = data.filter((score) => {
        return (
          (score.event?.namaEvent || "").toLowerCase().includes(text) ||
          (score.peserta?.namaTim || "").toLowerCase().includes(text) ||
          (score.juri?.username || score.juri?.email || "")
            .toLowerCase()
            .includes(text) ||
          (score.catatan || "").toLowerCase().includes(text)
        );
      });
    }

    if (eventFilter !== "all") {
      data = data.filter((score) => String(score.eventId) === eventFilter);
    }


    if (juriFilter !== "all") {
      data = data.filter((score) => String(score.juriId) === juriFilter);
    }

    if (participantFilter !== "all") {
      data = data.filter(
        (score) => String(score.pesertaId) === participantFilter
      );
    }

    setFiltered(data);
  }, [scores, filterText, eventFilter, juriFilter, participantFilter]);

  const canManage = user?.role === "admin" || user?.role === "operator";
  const isParticipant = user?.role === "peserta";

  const totalScores = scores.length;
  const avgScore =
    totalScores > 0
      ? Math.round(
          (scores.reduce((sum, item) => sum + Number(item.nilai || 0), 0) /
            totalScores) *
            10
        ) / 10
      : 0;
  const distinctJuri = new Set(scores.map((item) => item.juriId)).size;
  const detailCount = scores.reduce(
    (sum, item) => sum + (item.details?.length || 0),
    0
  );

  const eventOptions = useMemo(
    () =>
      events.map((event) => ({
        value: String(event.id),
        label: event.namaEvent,
      })),
    [events]
  );

  const juriOptions = useMemo(() => {
    const map = new Map();
    scores.forEach((score) => {
      if (!score?.juriId) return;
      map.set(
        String(score.juriId),
        score.juri?.username || score.juri?.email || "Juri tidak diketahui"
      );
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [scores]);

  const juriSelectOptions = useMemo(
    () =>
      juriList.map((juri) => ({
        id: juri.id,
        username: juri.username,
        email: juri.email,
      })),
    [juriList]
  );

  const pesertaOptions = useMemo(() => {
    const map = new Map();
    peserta.forEach((item) => {
      if (!item?.id) return;
      map.set(
        String(item.id),
        item.namaTim || item.user?.email || `Peserta #${item.id}`
      );
    });
    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [peserta]);

  if (initializing || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-slate-500">
        Memeriksa sesi...
      </div>
    );
  }

  if (needsFocusSelection) {
    const message =
      "Pilih event fokus di tab Profil untuk mengelola penilaian.";
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
          <Card className="border border-dashed border-slate-300 bg-slate-50">
            <CardContent className="py-6 text-sm text-slate-600">
              {message}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  function handleAdd() {
    setEditingScore(null);
    setDialogOpen(true);
  }

  function handleEdit(target) {
    setEditingScore(target);
    setDialogOpen(true);
  }

  function handleViewDetails(target) {
    setDetailViewerScore(target);
    setDetailViewerOpen(true);
  }

  async function handleDelete(target) {
    try {
      await del(`/scores/${target.id}`);
      setScores((prev) => prev.filter((item) => item.id !== target.id));
      toastSuccess({
        title: "Score dihapus",
        description: target.peserta?.namaTim || "Score berhasil dihapus",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal menghapus score");
      toastError({
        title: "Gagal menghapus score",
        description: err.message,
      });
    }
  }

  async function handleSubmitForm(formData) {
    try {
      if (editingScore) {
        await put(`/scores/${editingScore.id}`, formData);
        toastSuccess({
          title: "Score diperbarui",
          description: editingScore?.peserta?.namaTim || "Nilai berhasil disimpan",
        });
      } else {
        await post("/scores", formData);
        toastSuccess({
          title: "Score ditambahkan",
          description: "Penilaian baru berhasil dicatat",
        });
      }
      await fetchScores();
      setDialogOpen(false);
      setEditingScore(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal menyimpan score");
      toastError({
        title: "Gagal menyimpan score",
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
                  Penilaian Juri
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {totalScores > 0
                    ? `${totalScores} score tercatat, rata-rata ${avgScore}`
                    : "Belum ada penilaian. Tambahkan score juri pertama."}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatPill label="Score" value={totalScores} />
                <StatPill label="Rata-rata" value={avgScore || 0} color="emerald" />
                <StatPill label="Juri aktif" value={distinctJuri} color="amber" />
                <StatPill label="Detail" value={detailCount} />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
            {!isParticipant && (
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex w-full flex-col gap-3">
                  <div className="w-full">
                    <Input
                      placeholder="Cari event, tim, atau juri..."
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
                      {pesertaOptions.map((option) => (
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
                    Tambah Score
                  </Button>
                )}
              </div>
            )}

            {isParticipant && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                Berikut adalah penilaian untuk tim Anda. Detail kriteria dan
                bobot ditampilkan di setiap kartu score.
              </div>
            )}

            {!isParticipant && filtered.length !== totalScores && (
              <p className="text-[11px] text-slate-500">
                Menampilkan {filtered.length} dari {totalScores} score.
              </p>
            )}

            {isParticipant ? (
              <ParticipantScoreList
                items={filtered}
                loading={loading}
                onViewDetails={handleViewDetails}
              />
            ) : (
              <ScoreTable
                items={filtered}
                loading={loading}
                canEdit={canManage}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewDetails={handleViewDetails}
              />
            )}
          </CardContent>
        </Card>
      </main>

      {canManage && (
        <ScoreFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={editingScore}
          events={events}
          peserta={peserta}
          juriOptions={juriSelectOptions}
          currentUser={user}
          onSubmit={handleSubmitForm}
        />
      )}

      <ScoreDetailViewerDialog
        open={detailViewerOpen}
        score={detailViewerScore}
        onOpenChange={(openState) => {
          setDetailViewerOpen(openState);
          if (!openState) {
            setDetailViewerScore(null);
          }
        }}
      />
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

function ParticipantScoreList({ items, loading, onViewDetails }) {
  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Memuat penilaian tim Anda...
      </p>
    );
  }

  if (!items.length) {
    return (
      <p className="text-sm text-slate-500">
        Belum ada penilaian untuk tim Anda.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((score) => (
        <div
          key={score.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold text-slate-900">
                {score.event?.namaEvent || "Event tidak diketahui"}
              </p>
              <p className="text-xs text-slate-500">
                Juri:{" "}
                {score.juri?.username ||
                  score.juri?.email ||
                  "Tidak diketahui"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase text-slate-400">
                Nilai akhir
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold">
                {score.nilai}
              </span>
            </div>
          </div>
          {score.catatan && (
            <p className="mt-3 text-xs text-slate-500">
              Catatan juri: {score.catatan}
            </p>
          )}

          {score.details?.length ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Detail Penilaian
              </p>
              <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50">
                {score.details.map((detail) => {
                  const weighted =
                    detail.bobot != null
                      ? (
                          Number(detail.nilai || 0) *
                          Number(detail.bobot || 0)
                        ).toFixed(1)
                      : null;
                  return (
                    <div
                      key={detail.id}
                      className="grid grid-cols-2 gap-2 px-3 py-2 text-xs text-slate-600 sm:grid-cols-4"
                    >
                      <span className="font-semibold text-slate-800">
                        {detail.kriteria}
                      </span>
                      <span>Nilai: {detail.nilai}</span>
                      <span>
                        Bobot:{" "}
                        {detail.bobot != null ? detail.bobot : "-"}
                      </span>
                      <span>Poin: {weighted ?? "-"}</span>
                    </div>
                  );
                })}
              </div>

              {onViewDetails && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="px-0 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    onClick={() => onViewDetails(score)}
                  >
                    Lihat catatan lengkap
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-400">
              Tidak ada detail kriteria untuk penilaian ini.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function ScoreDetailViewerDialog({ score, open, onOpenChange }) {
  const details = score?.details || [];
  const teamName = score?.peserta?.namaTim || "Tim tidak diketahui";
  const eventName = score?.event?.namaEvent || "Event tidak diketahui";
  const juriName =
    score?.juri?.username || score?.juri?.email || "Juri tidak diketahui";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl rounded-xl border border-slate-200 bg-white p-0 shadow-lg">
        <DialogHeader className="border-b border-slate-100 px-5 pt-5 pb-3">
          <DialogTitle className="text-base font-semibold text-slate-900 sm:text-lg">
            Detail Penilaian
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-slate-500 sm:text-sm">
            {teamName} • {eventName}
          </DialogDescription>
          <p className="text-[11px] text-slate-400">
            Juri: <span className="font-medium text-slate-700">{juriName}</span>
          </p>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto px-5 py-4">
          {details.length ? (
            details.map((detail) => (
              <div
                key={detail.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">
                    {detail.kriteria}
                  </p>
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-0.5 text-xs font-semibold text-slate-800">
                    {detail.nilai}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  Bobot:{" "}
                  <span className="font-medium">
                    {detail.bobot != null ? detail.bobot : "-"}
                  </span>
                </div>
                {detail.catatan && (
                  <p className="mt-2 rounded-md border border-amber-100 bg-white px-3 py-2 text-xs text-slate-600">
                    {detail.catatan}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Belum ada detail untuk score ini.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
