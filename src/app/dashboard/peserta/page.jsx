"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Pencil, Trash2 } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { del, get, post, put, patch } from "@/lib/api";
import { useToast } from "@/components/ui/toast-provider";
import { formatDate } from "@/lib/formatters";

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

import { PesertaTable } from "@/components/tables/peserta-table";
import PesertaFormDialog from "@/components/form/peserta-form-dialog";
import DetailPesertaFormDialog from "@/components/form/detail-peserta-form-dialog";

const STATUS_FILTERS = [
  { value: "all", label: "Semua status" },
  { value: "juara", label: "Sudah juara" },
  { value: "belum", label: "Belum juara" },
  { value: "lengkap", label: "Profil lengkap" },
];

export default function PesertaPage() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const isParticipant = user?.role === "peserta";
  const isOperator = user?.role === "operator";
  const operatorFocusEventId = isOperator ? user?.focusEventId : null;
  const needsFocusSelection = isOperator && !operatorFocusEventId;

  const [peserta, setPeserta] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [events, setEvents] = useState([]);
  const [pesertaUsers, setPesertaUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterText, setFilterText] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPeserta, setEditingPeserta] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailEditing, setDetailEditing] = useState(null);
  const [detailTargetTeam, setDetailTargetTeam] = useState(null);

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/auth/login");
    }
  }, [initializing, user, router]);

  const fetchPeserta = useCallback(async () => {
    if (!user || initializing) return;
    try {
      setLoading(true);
      setError("");
      const endpoint = operatorFocusEventId
        ? `/peserta?eventId=${operatorFocusEventId}`
        : "/peserta";
      const data = await get(endpoint);
      setPeserta(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal memuat peserta");
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

  const fetchUsers = useCallback(async () => {
    if (!user || initializing || isParticipant) return;
    try {
      const data = await get("/users?role=peserta");
      setPesertaUsers(data);
    } catch (err) {
      console.error(err);
    }
  }, [user, initializing, isParticipant]);

  useEffect(() => {
    fetchPeserta();
  }, [fetchPeserta]);

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, [fetchEvents, fetchUsers]);

  useEffect(() => {
    if (operatorFocusEventId) {
      setEventFilter(String(operatorFocusEventId));
    } else if (isOperator) {
      setEventFilter("all");
    }
  }, [operatorFocusEventId, isOperator]);

  useEffect(() => {
    let data = [...peserta];

    if (filterText.trim()) {
      const text = filterText.toLowerCase();
      data = data.filter((item) => {
        return (
          (item.namaTim || "").toLowerCase().includes(text) ||
          (item.namaPerwakilan || "").toLowerCase().includes(text) ||
          (item.noPeserta || "").toLowerCase().includes(text) ||
          (item.user?.email || "").toLowerCase().includes(text) ||
          (item.event?.namaEvent || "").toLowerCase().includes(text)
        );
      });
    }

    if (eventFilter !== "all") {
      data = data.filter((item) => String(item.eventId) === eventFilter);
    }

    if (statusFilter === "juara") {
      data = data.filter((item) => (item.juara?.length || 0) > 0);
    } else if (statusFilter === "belum") {
      data = data.filter((item) => (item.juara?.length || 0) === 0);
    } else if (statusFilter === "lengkap") {
      data = data.filter((item) => (item.detailPeserta?.length || 0) > 0);
    }

    setFiltered(data);
  }, [peserta, filterText, eventFilter, statusFilter]);

  const canManage = user?.role === "admin" || user?.role === "operator";

  const totalPeserta = peserta.length;
  const juaraCount =
    peserta.filter((item) => (item.juara?.length || 0) > 0).length;
  const lengkapCount =
    peserta.filter((item) => (item.detailPeserta?.length || 0) > 0).length;
  const eventCount = new Set(peserta.map((item) => item.eventId)).size;
  const participantTeams = isParticipant ? peserta : [];
  const totalParticipantMembers = participantTeams.reduce(
    (sum, team) => sum + (team.detailPeserta?.length || 0),
    0
  );
  const pendingParticipant = participantTeams.filter(
    (team) => team.status === "pending"
  ).length;

  const eventOptions = useMemo(
    () =>
      events.map((event) => ({
        value: String(event.id),
        label: event.namaEvent,
      })),
    [events]
  );
  const participantTeam = useMemo(() => {
    if (!isParticipant || !user) return null;
    const owned = peserta.find((item) => item.userId === user.id);
    return owned || peserta[0] || null;
  }, [isParticipant, peserta, user]);

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
              Pilih event fokus di tab Profil untuk mengelola peserta.
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  function handleAdd() {
    setEditingPeserta(null);
    setDialogOpen(true);
  }

  function handleEdit(target) {
    setEditingPeserta(target);
    setDialogOpen(true);
  }

  async function handleDelete(target) {
    try {
      await del(`/peserta/${target.id}`);
      setPeserta((prev) => prev.filter((item) => item.id !== target.id));
      toastSuccess({
        title: "Peserta dihapus",
        description: target.namaTim || "Peserta berhasil dihapus",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal menghapus peserta");
      toastError({
        title: "Gagal menghapus peserta",
        description: err.message,
      });
    }
  }

  async function handleSubmitForm(formData) {
    const { linkDrive, ...participantPayload } = formData;
    const normalizedLink =
      typeof linkDrive === "string" ? linkDrive.trim() : undefined;

    try {
      if (editingPeserta) {
        await put(`/peserta/${editingPeserta.id}`, participantPayload);
        if (typeof normalizedLink !== "undefined") {
          if (editingPeserta.partisipasi?.id) {
            await put(`/partisipasi/${editingPeserta.partisipasi.id}`, {
              linkDrive: normalizedLink,
            });
          } else if (normalizedLink) {
            await post("/partisipasi", {
              pesertaId: editingPeserta.id,
              eventId: editingPeserta.eventId,
              linkDrive: normalizedLink,
            });
          }
        }
        toastSuccess({
          title: "Peserta diperbarui",
          description: editingPeserta?.namaTim || "Data peserta disimpan",
        });
      } else {
        await post("/peserta", participantPayload);
        toastSuccess({
          title: "Peserta ditambahkan",
          description: "Tim baru berhasil ditambahkan",
        });
      }
      await fetchPeserta();
      setDialogOpen(false);
      setEditingPeserta(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal menyimpan peserta");
      toastError({
        title: "Gagal menyimpan peserta",
        description: err.message,
      });
    }
  }

  async function handleUpdateStatus(target, nextStatus) {
    try {
      const response = await patch(`/peserta/${target.id}/status`, {
        status: nextStatus,
      });
      const updated = response.peserta || response;
      setPeserta((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      toastSuccess({
        title: "Status diperbarui",
        description: `${target.namaTim || "Peserta"} kini berstatus ${updated.status}.`,
      });
    } catch (err) {
      toastError({
        title: "Gagal memperbarui status",
        description: err.message,
      });
    }
  }

  function handleAddDetail(team) {
    setDetailTargetTeam(team);
    setDetailEditing(null);
    setDetailDialogOpen(true);
  }

  function handleEditDetail(team, detail) {
    setDetailTargetTeam(team || detail?.peserta || null);
    setDetailEditing(detail);
    setDetailDialogOpen(true);
  }

  async function handleDeleteDetail(detail) {
    try {
      await del(`/detail-peserta/${detail.id}`);
      toastSuccess({
        title: "Anggota dihapus",
        description: detail.namaDetail || "Data anggota dihapus",
      });
      await fetchPeserta();
    } catch (err) {
      toastError({
        title: "Gagal menghapus anggota",
        description: err.message,
      });
    }
  }

  async function handleSubmitDetail(payload) {
    try {
      if (detailEditing) {
        await put(`/detail-peserta/${detailEditing.id}`, payload);
        toastSuccess({
          title: "Anggota diperbarui",
          description: detailEditing.namaDetail || "Data disimpan",
        });
      } else {
        await post("/detail-peserta", payload);
        toastSuccess({
          title: "Anggota ditambahkan",
          description: "Data anggota baru disimpan",
        });
      }
      await fetchPeserta();
      setDetailDialogOpen(false);
      setDetailEditing(null);
      setDetailTargetTeam(null);
    } catch (err) {
      toastError({
        title: "Gagal menyimpan anggota",
        description: err.message,
      });
    }
  }

  async function handleUpdateLinkDrive(team, draftLink) {
    if (!team?.partisipasi?.id) {
      const message = "Data partisipasi belum tersedia. Hubungi panitia untuk pengecekan.";
      toastError({
        title: "Tidak bisa menyimpan link",
        description: message,
      });
      throw new Error(message);
    }

    const payload = {
      linkDrive: typeof draftLink === "string" ? draftLink : "",
    };

    try {
      const updated = await put(
        `/partisipasi/${team.partisipasi.id}`,
        payload
      );
      setPeserta((prev) =>
        prev.map((item) =>
          item.id === team.id
            ? {
                ...item,
                partisipasi: updated,
              }
            : item
        )
      );
      toastSuccess({
        title: "Link drive tersimpan",
        description: "Tautan folder foto berhasil diperbarui.",
      });
      return updated;
    } catch (err) {
      toastError({
        title: "Gagal menyimpan link drive",
        description: err.message,
      });
      throw err;
    }
  }

  const filtersActive =
    Boolean(filterText) || eventFilter !== "all" || statusFilter !== "all";

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
        <Card className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 sm:text-lg">
                  {isParticipant ? "Tim Saya" : "Peserta"}
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {isParticipant
                    ? "Lihat ringkasan tim Anda dan anggota yang terdaftar."
                    : totalPeserta > 0
                    ? `${totalPeserta} tim aktif pada ${eventCount} event`
                    : "Belum ada peserta. Tambahkan tim untuk event yang berjalan."}
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {isParticipant ? (
                  <>
                    <StatPill
                      label="Event diikuti"
                      value={participantTeams.length}
                    />
                    <StatPill
                      label="Anggota"
                      value={totalParticipantMembers}
                      color="emerald"
                    />
                    <StatPill
                      label="Pending"
                      value={pendingParticipant}
                      color="amber"
                    />
                  </>
                ) : (
                  <>
                    <StatPill label="Total" value={totalPeserta} />
                    <StatPill label="Juara" value={juaraCount} color="amber" />
                    <StatPill
                      label="Profil lengkap"
                      value={lengkapCount}
                      color="emerald"
                    />
                    <StatPill label="Event" value={eventCount} color="slate" />
                  </>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
            {error && <p className="text-[11px] text-red-500">{error}</p>}

            {isParticipant ? (
              <ParticipantTeamPanel
                teams={participantTeams}
                loading={loading}
                onAddDetail={handleAddDetail}
                onEditDetail={handleEditDetail}
                onDeleteDetail={handleDeleteDetail}
                canManageDetails
                onUpdateLinkDrive={handleUpdateLinkDrive}
              />
            ) : (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex w-full flex-col gap-3">
                    <div className="w-full">
                      <Input
                        placeholder="Cari tim, perwakilan, atau email..."
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

                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 w-full rounded-md border-slate-200 text-xs sm:w-[150px] sm:text-sm">
                          <SelectValue placeholder="Semua status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border border-slate-200 bg-white shadow-md">
                          {STATUS_FILTERS.map((option) => (
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
                            setStatusFilter("all");
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
                      <UserPlus className="mr-2 h-4 w-4" />
                      Tambah Peserta
                    </Button>
                  )}
                </div>

                {filtered.length !== totalPeserta && (
                  <p className="text-[11px] text-slate-500">
                    Menampilkan {filtered.length} dari {totalPeserta} peserta.
                  </p>
                )}

                <PesertaTable
                  items={filtered}
                  loading={loading}
                  canEdit={canManage}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onChangeStatus={canManage ? handleUpdateStatus : undefined}
                />
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {canManage && (
        <PesertaFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={editingPeserta}
          onSubmit={handleSubmitForm}
          events={events}
          users={pesertaUsers}
        />
      )}
      {isParticipant && (
        <DetailPesertaFormDialog
          open={detailDialogOpen}
          onOpenChange={(val) => {
            if (!val) {
              setDetailEditing(null);
              setDetailTargetTeam(null);
            }
            setDetailDialogOpen(val);
          }}
          initialData={detailEditing}
          pesertaOptions={
            detailTargetTeam
              ? [
                  {
                    value: String(detailTargetTeam.id),
                    label: detailTargetTeam.namaTim,
                  },
                ]
              : []
          }
          presetPesertaId={detailTargetTeam?.id}
          presetPesertaLabel={detailTargetTeam?.namaTim}
          onSubmit={handleSubmitDetail}
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

function ParticipantTeamPanel({
  teams = [],
  loading,
  onAddDetail,
  onEditDetail,
  onDeleteDetail,
  canManageDetails,
  onUpdateLinkDrive,
}) {
  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Memuat informasi tim Anda...
      </p>
    );
  }

  if (!teams.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
        Tim Anda belum terdaftar. Hubungi admin untuk memastikan data peserta
        sudah dimasukkan ke sistem.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {teams.map((team) => (
        <ParticipantTeamCard
          key={team.id}
          team={team}
          onAddDetail={onAddDetail}
          onEditDetail={onEditDetail}
          onDeleteDetail={onDeleteDetail}
          canManageDetails={canManageDetails}
          onUpdateLinkDrive={onUpdateLinkDrive}
        />
      ))}
    </div>
  );
}

function renderParticipantStatus(status) {
  const normalized = (status || "pending").toLowerCase();
  const classes = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  };
  const label = {
    pending: "Menunggu persetujuan",
    approved: "Disetujui",
    rejected: "Ditolak",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${classes[normalized] || classes.pending}`}
    >
      {label[normalized] || normalized}
    </span>
  );
}

function ParticipantTeamCard({
  team,
  onAddDetail,
  onEditDetail,
  onDeleteDetail,
  canManageDetails,
  onUpdateLinkDrive,
}) {
  const detailList = team.detailPeserta || [];
  const registrationDate = team.createdAt || team.tanggalPendaftaran;
  const gelar = team.juara?.map((item) => item.juara).join(", ");
  const hasPartisipasi = Boolean(team.partisipasi?.id);
  const storedLink = (team.partisipasi?.linkDrive || "").trim();

  const [linkDraft, setLinkDraft] = useState(storedLink);
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setLinkDraft(storedLink);
    setLocalError("");
  }, [storedLink, team.partisipasi?.id]);

  const normalizedDraft = linkDraft.trim();
  const hasChanges = normalizedDraft !== storedLink;

  async function handleSaveLink() {
    if (!onUpdateLinkDrive || !hasPartisipasi || saving || !hasChanges) return;
    try {
      setSaving(true);
      setLocalError("");
      await onUpdateLinkDrive(team, normalizedDraft);
    } catch (err) {
      setLocalError(err.message || "Gagal menyimpan link drive");
    } finally {
      setSaving(false);
    }
  }

  function handleResetLink() {
    setLinkDraft(storedLink);
    setLocalError("");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-br from-white to-slate-50 px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Nama Tim
            </p>
            <p className="text-xl font-semibold text-slate-900">
              {team.namaTim || "-"}
            </p>
            <p className="text-xs text-slate-500">
              Perwakilan: {team.namaPerwakilan || "-"}
            </p>
          </div>
          <div className="space-y-1 text-right text-slate-600">
            {renderParticipantStatus(team.status)}
            <div className="text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Event
              </p>
              <p className="font-semibold text-slate-900">
                {team.event?.namaEvent || "-"}
              </p>
              <p className="text-xs text-slate-500">
                {team.event?.kategori || "Kategori belum diatur"}
              </p>
            </div>
          </div>
        </div>
        <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">
              Akun Peserta
            </dt>
            <dd className="text-slate-900">{team.user?.email || "-"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">
              Tanggal Daftar
            </dt>
            <dd className="text-slate-900">{formatDate(registrationDate)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">
              Gelar / Juara
            </dt>
            <dd className="text-slate-900">
              {gelar || "Belum memperoleh gelar"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">
              Kuota anggota
            </dt>
            <dd className="text-slate-900">
              {detailList.length} anggota terdaftar
            </dd>
          </div>
        </dl>
      </div>

      <div className="px-5 py-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900">
              Detail Anggota
            </p>
            <p className="text-xs text-slate-500">
              Lengkapi profil anggota untuk mempermudah verifikasi data.
            </p>
          </div>
          {canManageDetails && (
            <Button
              size="sm"
              className="h-8 rounded-full"
              onClick={() => onAddDetail?.(team)}
            >
              Tambah Anggota
            </Button>
          )}
        </div>

        {detailList.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {detailList.map((detail, idx) => (
              <article
                key={detail.id ?? idx}
                className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold uppercase tracking-wide text-slate-400">
                    Anggota #{idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    {detail.umur != null && (
                      <span className="text-slate-900">{detail.umur} tahun</span>
                    )}
                    {canManageDetails && (
                      <>
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 p-1 text-slate-500 hover:bg-white"
                          onClick={() => onEditDetail?.(team, detail)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 p-1 text-rose-600 hover:bg-white"
                          onClick={() => onDeleteDetail?.(detail)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {detail.namaDetail || "Belum diisi"}
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px] uppercase tracking-wide text-slate-400">
                  <div>
                    <dt>Tanggal lahir</dt>
                    <dd className="text-sm normal-case text-slate-800">
                      {formatDate(detail.tanggalLahir)}
                    </dd>
                  </div>
                  <div>
                    <dt>Catatan usia</dt>
                    <dd className="text-sm normal-case text-slate-800">
                      {detail.umur != null ? `${detail.umur} tahun` : "-"}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Belum ada detail anggota yang tercatat. Gunakan tombol &quot;Tambah
            Anggota&quot; untuk melengkapi data tim.
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 px-5 py-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div>
              <p className="text-base font-semibold text-slate-900">
                Link Drive Foto
              </p>
              <p className="text-xs text-slate-500">
                Tambahkan tautan folder foto tim Anda untuk mempermudah panitia.
              </p>
            </div>
            {storedLink && (
              <a
                href={storedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
              >
                Buka tautan saat ini
              </a>
            )}
            {!hasPartisipasi && (
              <p className="text-[11px] text-amber-600">
                Menunggu panitia membuat partisipasi sebelum tautan bisa diisi.
              </p>
            )}
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-[320px]">
            <Input
              type="url"
              placeholder="https://drive.google.com/..."
              value={linkDraft}
              onChange={(event) => {
                setLinkDraft(event.target.value);
                if (localError) {
                  setLocalError("");
                }
              }}
              disabled={!hasPartisipasi || saving}
              className="h-9 rounded-md border-slate-200 text-xs sm:text-sm"
            />
            <div className="flex justify-end gap-2">
              {hasChanges && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={handleResetLink}
                  disabled={saving}
                >
                  Batal
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                className="h-8"
                onClick={handleSaveLink}
                disabled={!hasPartisipasi || saving || !hasChanges}
              >
                {saving ? "Menyimpan..." : "Simpan Link"}
              </Button>
            </div>
            {localError && (
              <p className="text-[11px] text-red-500">{localError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
