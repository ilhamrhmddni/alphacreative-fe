"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

const SCORE_DETAIL_PAGE_ENABLED = false;

export default function ScoreDetailsPage() {
  if (!SCORE_DETAIL_PAGE_ENABLED) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-3 py-6 sm:px-4 lg:px-6">
          <Card className="border border-dashed border-border bg-muted">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Detail score dinonaktifkan sementara
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Modul detail score tidak tersedia. Silakan hubungi admin untuk mengaktifkannya kembali.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Data sebelumnya tetap aman dalam sistem, namun pengelolaan detail score tidak dapat dilakukan saat ini.
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const router = useRouter();
  const { user, initializing } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const isOperator = user?.role === "operator";
  const operatorFocusEventId = isOperator ? user?.focusEventId : null;
  const needsFocusSelection = isOperator && !operatorFocusEventId;

  const [details, setDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [scores, setScores] = useState([]);
  const [visibleScores, setVisibleScores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterText, setFilterText] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [juriFilter, setJuriFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [presetScore, setPresetScore] = useState(null);
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
    const text = filterText.trim().toLowerCase();

    const matchesBaseFilters = (score) => {
      if (!score) return false;
      if (eventFilter !== "all" && String(score.eventId) !== eventFilter) {
        return false;
      }
      if (juriFilter !== "all" && String(score.juriId) !== juriFilter) {
        return false;
      }
      if (
        participantFilter !== "all" &&
        String(score.pesertaId) !== participantFilter
      ) {
        return false;
      }
      return true;
    };

    const matchesScoreText = (score) => {
      if (!text) return true;
      const eventName = (score?.event?.namaEvent || "").toLowerCase();
      const teamName = (score?.peserta?.namaTim || "").toLowerCase();
      const juriName = (
        score?.juri?.username || score?.juri?.email || ""
      ).toLowerCase();
      const catatan = (score?.catatan || "").toLowerCase();
      return (
        eventName.includes(text) ||
        teamName.includes(text) ||
        juriName.includes(text) ||
        catatan.includes(text)
      );
    };

    const matchesDetailText = (detail, score) => {
      if (!text) return true;
      const kriteria = (detail?.kriteria || "").toLowerCase();
      const catatanDetail = (detail?.catatan || "").toLowerCase();
      if (kriteria.includes(text) || catatanDetail.includes(text)) {
        return true;
      }
      return matchesScoreText(score);
    };

    const scoresById = new Map(scores.map((score) => [score.id, score]));

    const nextVisibleScores = scores.filter(
      (score) => matchesBaseFilters(score) && matchesScoreText(score)
    );

    const nextFilteredDetails = details.filter((detail) => {
      const scoreRef = detail.score || scoresById.get(detail.scoreId);
      if (!matchesBaseFilters(scoreRef)) {
        return false;
      }
      return matchesDetailText(detail, scoreRef);
    });

    setVisibleScores(nextVisibleScores);
    setFilteredDetails(nextFilteredDetails);
  }, [details, scores, filterText, eventFilter, juriFilter, participantFilter]);

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
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Memeriksa sesi...
      </div>
    );
  }

  if (isOperator && needsFocusSelection) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
          <Card className="border border-dashed border-border bg-muted">
            <CardContent className="py-6 text-sm text-muted-foreground">
              Pilih event fokus di tab Profil untuk mengelola detail score.
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  function handleAddForScore(score) {
    if (!score) return;
    setEditingDetail(null);
    setPresetScore(score);
    setDialogOpen(true);
  }

  function handleEdit(target) {
    setEditingDetail(target);
    setPresetScore(null);
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
        <Card className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-foreground sm:text-lg">
                  Detail Penilaian
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
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

                  <Select value={juriFilter} onValueChange={setJuriFilter}>
                    <SelectTrigger className="h-9 w-full rounded-md border-border text-xs sm:w-[160px] sm:text-sm">
                      <SelectValue placeholder="Semua juri" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border border-border bg-card shadow-md">
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
                    <SelectTrigger className="h-9 w-full rounded-md border-border text-xs sm:w-[180px] sm:text-sm">
                      <SelectValue placeholder="Semua peserta" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border border-border bg-card shadow-md">
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

            </div>

            {error && <p className="text-[11px] text-red-500">{error}</p>}

            {filteredDetails.length !== totalDetails && (
              <p className="text-[11px] text-muted-foreground">
                Menampilkan {filteredDetails.length} dari {totalDetails} detail score.
              </p>
            )}

            {filteredDetails.length === 0 && visibleScores.length > 0 && (
              <div className="rounded-lg border border-dashed border-border bg-muted px-4 py-3 text-xs text-muted-foreground">
                Belum ada detail penilaian untuk score yang dipilih. Gunakan tombol{" "}
                <span className="font-semibold">Tambah detail</span>{" "}
                pada kartu score untuk mulai mengisi kriteria.
              </div>
            )}

            <ScoreDetailTable
              items={filteredDetails}
              scores={visibleScores}
              loading={loading}
              canEdit={canManage}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteScore={handleDeleteScore}
              onAddDetail={handleAddForScore}
            />
          </CardContent>
        </Card>
      </main>

      {canManage && (
        <ScoreDetailFormDialog
          open={dialogOpen}
          onOpenChange={(openState) => {
            setDialogOpen(openState);
            if (!openState) {
              setEditingDetail(null);
              setPresetScore(null);
            }
          }}
          initialData={editingDetail}
          scores={scores}
          juriOptions={formJuriOptions}
          presetScore={presetScore}
          onSubmit={handleSubmitForm}
        />
      )}
    </div>
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
