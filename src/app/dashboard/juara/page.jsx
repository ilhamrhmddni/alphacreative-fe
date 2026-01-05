"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { del, get, post, put } from "@/lib/api";
import { useToast } from "@/components/ui/toast-provider";
import PageContainer from "@/components/layout/page-container";
import PageHeader from "@/components/layout/page-header";

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

import { JuaraTable } from "@/components/tables/juara-table";
import JuaraFormDialog from "@/components/form/juara-form-dialog";
import { resolveScoreValue } from "@/lib/utils";

const SYSTEM_USER = {
  username: "Sistem",
  email: "system@auto",
};

const SCORE_FEATURE_ENABLED = false;

function resolveScorePoint(score) {
  const resolved = resolveScoreValue(score);
  return resolved != null ? resolved : 0;
}

export default function JuaraPage() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const isOperator = user?.role === "operator";
  const operatorFocusEventId = isOperator ? user?.focusEventId : null;
  const needsFocusSelection = isOperator && !operatorFocusEventId;

  const [juara, setJuara] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [events, setEvents] = useState([]);
  const [peserta, setPeserta] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterText, setFilterText] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJuara, setEditingJuara] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/auth/login");
    }
  }, [initializing, user, router]);

  const fetchJuara = useCallback(async () => {
    if (!user || initializing) return;
    try {
      setLoading(true);
      setError("");
      const endpoint = operatorFocusEventId
        ? `/juara?eventId=${operatorFocusEventId}`
        : "/juara";
      const data = await get(endpoint);
      setJuara(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat data juara");
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
      const pesertaEndpoint = operatorFocusEventId
        ? `/peserta?eventId=${operatorFocusEventId}`
        : "/peserta";
      const data = await get(pesertaEndpoint);
      setPeserta(data);
    } catch (err) {
      console.error(err);
    }
  }, [user, initializing, operatorFocusEventId]);

  const fetchScores = useCallback(async () => {
    if (!user || initializing) return;
    if (!SCORE_FEATURE_ENABLED) {
      setScores([]);
      return;
    }
    try {
      const scoresEndpoint = operatorFocusEventId
        ? `/scores?eventId=${operatorFocusEventId}`
        : "/scores";
      const data = await get(scoresEndpoint);
      setScores(data);
    } catch (err) {
      console.error(err);
    }
  }, [user, initializing, operatorFocusEventId]);

  useEffect(() => {
    fetchJuara();
    fetchEvents();
    fetchPeserta();
    fetchScores();
  }, [fetchJuara, fetchEvents, fetchPeserta, fetchScores]);

  useEffect(() => {
    if (operatorFocusEventId) {
      setEventFilter(String(operatorFocusEventId));
    } else if (isOperator) {
      setEventFilter("all");
    }
  }, [operatorFocusEventId, isOperator]);

  const manualParticipantsByEvent = useMemo(() => {
    const map = new Map();
    juara.forEach((item) => {
      if (!item.eventId || !item.pesertaId) return;
      const key = item.eventId;
      const set = map.get(key) || new Set();
      set.add(item.pesertaId);
      map.set(key, set);
    });
    return map;
  }, [juara]);

  const combinedJuara = useMemo(() => {
    const groupedByEvent = new Map();

    scores.forEach((score) => {
      if (!score.eventId || !score.pesertaId) return;
      const bucket = groupedByEvent.get(score.eventId) || [];
      bucket.push(score);
      groupedByEvent.set(score.eventId, bucket);
    });

    const fallback = [];
    groupedByEvent.forEach((scoreList, eventId) => {
      const pesertaAggregate = new Map();
      scoreList.forEach((score) => {
        if (!score.pesertaId) return;
        const key = String(score.pesertaId);
        const record = pesertaAggregate.get(key) || {
          total: 0,
          count: 0,
          peserta: score.peserta,
          event: score.event,
          criteria: new Set(),
        };
        const point = resolveScorePoint(score);
        record.total += point;
        record.count += 1;
        record.peserta = record.peserta || score.peserta;
        record.event = record.event || score.event;
        if (Array.isArray(score.details)) {
          score.details.forEach((detail) => {
            if (detail?.kriteria) {
              record.criteria.add(detail.kriteria);
            }
          });
        }
        pesertaAggregate.set(key, record);
      });

      const ranked = Array.from(pesertaAggregate.entries())
        .map(([pesertaId, record]) => {
          const nilaiRata =
            record.count > 0 ? record.total / record.count : record.total;
          return {
            pesertaId: Number(pesertaId),
            eventId,
            nilaiRata,
            nilaiDisplay: Math.round((nilaiRata || 0) * 10) / 10,
            peserta: record.peserta,
            event: record.event,
            kategori: record.criteria.size
              ? Array.from(record.criteria).join(", ")
              : "Penilaian otomatis",
          };
        })
        .sort((a, b) => Number(b.nilaiRata || 0) - Number(a.nilaiRata || 0))
        .slice(0, 3);

      ranked.forEach((entry, idx) => {
        const manualSet = manualParticipantsByEvent.get(eventId);
        if (manualSet && manualSet.has(entry.pesertaId)) {
          return;
        }
        fallback.push({
          id: `auto-${eventId}-${entry.pesertaId}-${idx}`,
          eventId,
          pesertaId: entry.pesertaId,
          juara: `Juara ${idx + 1}`,
          kategori: entry.kategori,
          event: entry.event,
          peserta: entry.peserta,
          autoGenerated: true,
          nilai: entry.nilaiDisplay,
          setByUser: SYSTEM_USER,
        });
      });
    });

    return [...juara, ...fallback];
  }, [juara, scores, manualParticipantsByEvent]);

  useEffect(() => {
    let data = [...combinedJuara];

    if (filterText.trim()) {
      const text = filterText.toLowerCase();
      data = data.filter((item) => {
        return (
          (item.event?.namaEvent || "").toLowerCase().includes(text) ||
          (item.peserta?.namaTim || "").toLowerCase().includes(text) ||
          (item.kategori || "").toLowerCase().includes(text) ||
          (item.juara || "").toLowerCase().includes(text)
        );
      });
    }

    if (eventFilter !== "all") {
      data = data.filter((item) => String(item.eventId) === eventFilter);
    }

    if (rankFilter !== "all") {
      data = data.filter(
        (item) => (item.juara || "").toLowerCase() === rankFilter
      );
    }

    setFiltered(data);
  }, [combinedJuara, filterText, eventFilter, rankFilter]);

  const canManage = user?.role === "admin" || user?.role === "operator";
  const isParticipant = user?.role === "peserta";

  const totalJuara = combinedJuara.length;
  const uniqueEvents = new Set(combinedJuara.map((item) => item.eventId)).size;
  const kategoriCount = combinedJuara.filter((item) => item.kategori).length;
  const pesertaMenang = new Set(
    combinedJuara.map((item) => item.pesertaId)
  ).size;
  const participantAwards = filtered.length;
  const participantEvents = new Set(filtered.map((item) => item.eventId)).size;

  const eventOptions = useMemo(
    () =>
      events.map((event) => ({
        value: String(event.id),
        label: event.namaEvent,
      })),
    [events]
  );

  const rankOptions = useMemo(() => {
    const set = new Map();
    combinedJuara.forEach((item) => {
      const normalized = (item.juara || "").toLowerCase();
      if (!normalized) return;
      if (!set.has(normalized)) {
        set.set(normalized, item.juara);
      }
    });
    return Array.from(set.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [combinedJuara]);

  if (initializing || !user) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Memeriksa sesi...
      </div>
    );
  }

  if (needsFocusSelection) {
    const message =
      "Pilih event fokus di tab Profil untuk meninjau data juara.";
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
          <Card className="border border-dashed border-border bg-muted">
            <CardContent className="py-6 text-sm text-muted-foreground">
              {message}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  function handleAdd() {
    setEditingJuara(null);
    setDialogOpen(true);
  }

  function handleEdit(target) {
    setEditingJuara(target);
    setDialogOpen(true);
  }

  async function deleteScoreBundle(eventId, pesertaId) {
    if (!eventId || !pesertaId) return;
    const parsedEvent = Number(eventId);
    const parsedPeserta = Number(pesertaId);
    if (
      Number.isNaN(parsedEvent) ||
      Number.isNaN(parsedPeserta) ||
      parsedEvent <= 0 ||
      parsedPeserta <= 0
    ) {
      return;
    }

    const relatedScoreIds = scores
      .filter(
        (score) =>
          Number(score.eventId) === parsedEvent &&
          Number(score.pesertaId) === parsedPeserta
      )
      .map((score) => score.id);

    if (relatedScoreIds.length > 0) {
      await Promise.all(
        relatedScoreIds.map((scoreId) => del(`/scores/${scoreId}`))
      );
      setScores((prev) =>
        prev.filter(
          (score) =>
            Number(score.eventId) !== parsedEvent ||
            Number(score.pesertaId) !== parsedPeserta
        )
      );
      return;
    }

    const params = new URLSearchParams({
      eventId: String(parsedEvent),
      pesertaId: String(parsedPeserta),
    });
    await del(`/scores/by-peserta?${params.toString()}`);
    setScores((prev) =>
      prev.filter(
        (score) =>
          Number(score.eventId) !== parsedEvent ||
          Number(score.pesertaId) !== parsedPeserta
      )
    );
  }

  async function handleDelete(target) {
    try {
      if (!target.autoGenerated) {
        await del(`/juara/${target.id}`);
        setJuara((prev) => prev.filter((item) => item.id !== target.id));
      }

      await deleteScoreBundle(target.eventId, target.pesertaId);

      toastSuccess({
        title: "Data penilaian dibersihkan",
        description: target.peserta?.namaTim
          ? `${target.peserta.namaTim} tidak lagi memiliki score pada event ini`
          : "Seluruh score untuk tim ini pada event tersebut sudah dihapus",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal menghapus data juara");
      toastError({
        title: "Gagal menghapus data juara",
        description: err.message,
      });
    }
  }

  async function handleSubmitForm(formData) {
    try {
      if (editingJuara) {
        await put(`/juara/${editingJuara.id}`, formData);
        toastSuccess({
          title: "Data juara diperbarui",
          description: editingJuara?.peserta?.namaTim || "Data berhasil disimpan",
        });
      } else {
        await post("/juara", formData);
        toastSuccess({
          title: "Data juara ditambahkan",
          description: "Penanda juara baru berhasil dibuat",
        });
      }
      await fetchJuara();
      setDialogOpen(false);
      setEditingJuara(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal menyimpan data juara");
      toastError({
        title: "Gagal menyimpan data juara",
        description: err.message,
      });
    }
  }

  const handleConfirmAuto = useCallback(
    async (target) => {
      if (!target?.autoGenerated || !canManage) return;
      try {
        setConfirmingId(target.id);
        await post("/juara", {
          eventId: Number(target.eventId),
          pesertaId: Number(target.pesertaId),
          juara: target.juara,
          kategori:
            target.kategori ||
            "Penilaian otomatis berdasarkan rata-rata nilai juri",
          berkasLink: target.berkasLink || null,
        });
        toastSuccess({
          title: "Juara dikonfirmasi",
          description: `${target.peserta?.namaTim || "Tim"} ditandai sebagai ${target.juara}`,
        });
        await fetchJuara();
      } catch (err) {
        console.error(err);
        setError(err.message || "Gagal menyimpan juara otomatis");
        toastError({
          title: "Gagal konfirmasi juara",
          description: err.message,
        });
      } finally {
        setConfirmingId(null);
      }
    },
    [canManage, toastSuccess, toastError, fetchJuara]
  );

  const filtersActive =
    Boolean(filterText) || eventFilter !== "all" || rankFilter !== "all";

  return (
    <PageContainer>
      <PageHeader
        title={isParticipant ? "Pencapaian Tim Saya" : "Data Juara"}
        description={
          isParticipant
            ? participantAwards > 0
              ? `${participantAwards} penghargaan untuk tim Anda`
              : "Belum ada penghargaan. Tetap semangat!"
            : totalJuara > 0
            ? `${totalJuara} penghargaan dicatat pada ${uniqueEvents} event`
            : "Belum ada data juara. Tambahkan hasil lomba atau pertandingan."
        }
      />

      <Card className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <CardContent className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex w-full flex-col gap-3">
                <div className="w-full">
                  <Input
                    placeholder="Cari event, tim, atau kategori..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="h-9 w-full rounded-md border-border text-xs placeholder:text-muted-foreground sm:text-sm"
                  />
                </div>

                <div className="flex w-full flex-wrap gap-2">
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="h-9 w-full rounded-md border-border text-xs sm:w-[180px] sm:text-sm">
                      <SelectValue placeholder="Semua event" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border border-border bg-card shadow-md">
                      <SelectItem value="all">Semua event</SelectItem>
                      {eventOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={rankFilter} onValueChange={setRankFilter}>
                    <SelectTrigger className="h-9 w-full rounded-md border-border text-xs sm:w-[150px] sm:text-sm">
                      <SelectValue placeholder="Semua juara" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border border-border bg-card shadow-md">
                      <SelectItem value="all">Semua juara</SelectItem>
                      {rankOptions.map((option) => (
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
                        setRankFilter("all");
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
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tambah Juara
                </Button>
              )}
            </div>

            {error && <p className="text-[11px] text-red-500">{error}</p>}

            {filtered.length !== totalJuara && !isParticipant && (
              <p className="text-[11px] text-muted-foreground">
                Menampilkan {filtered.length} dari {totalJuara} data juara.
              </p>
            )}

            {isParticipant && !filtered.length && (
              <p className="text-sm text-muted-foreground">
                Belum ada hasil juara yang tercatat untuk tim Anda.
              </p>
            )}

            <JuaraTable
              items={filtered}
              loading={loading}
              canEdit={canManage}
              onEdit={canManage ? handleEdit : undefined}
              onDelete={canManage ? handleDelete : undefined}
              onConfirmAuto={canManage ? handleConfirmAuto : undefined}
              confirmingId={confirmingId}
            />
          </CardContent>
        </Card>

        {canManage && (
          <JuaraFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            initialData={editingJuara}
            events={events}
            peserta={peserta}
            onSubmit={handleSubmitForm}
          />
        )}
      </PageContainer>
  );
}

function StatPill({ label, value, color = "slate" }) {
  const colorMap = {
    slate: "bg-muted text-foreground border-border",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const classes = colorMap[color] || colorMap.slate;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${classes}`}
    >
      <span className="text-[10px] font-normal text-muted-foreground">{label}</span>
      <span className="ml-2 text-sm">{value}</span>
    </span>
  );
}
