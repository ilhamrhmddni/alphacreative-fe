"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { get, post, put, del } from "@/lib/api";
import { useToast } from "@/components/ui/toast-provider";
import { formatDate, formatCurrency } from "@/lib/formatters";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { EventsTable } from "@/components/tables/event-table";
import EventFormDialog from "@/components/form/event-form-dialog";
import EventRegistrationDialog from "@/components/form/event-registration-dialog";
import DetailPesertaFormDialog from "@/components/form/detail-peserta-form-dialog";

export default function EventsPage() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const { success, error: toastError } = useToast();
  const isParticipant = user?.role === "peserta";
  const isOperator = user?.role === "operator";
  const operatorFocusEventId = isOperator ? user?.focusEventId : null;
  const needsFocusSelection = isOperator && !operatorFocusEventId;

  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [pageError, setPageError] = useState("");

  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailTargetTeam, setDetailTargetTeam] = useState(null);

  useEffect(() => {
    if (!initializing && !user) {
      router.push("/auth/login");
    }
  }, [initializing, user, router]);

  const fetchEvents = useCallback(async () => {
    if (!user || initializing) return;

    try {
      setLoading(true);
      const data = await get("/events");
      const scoped = operatorFocusEventId
        ? data.filter((event) => event.id === operatorFocusEventId)
        : data;
      setEvents(scoped);
    } finally {
      setLoading(false);
    }
  }, [user, initializing, operatorFocusEventId]);

  const fetchRegistrations = useCallback(async () => {
    if (!user || initializing || !isParticipant) return;
    try {
      const pesertaEndpoint = operatorFocusEventId
        ? `/peserta?eventId=${operatorFocusEventId}`
        : "/peserta";
      const data = await get(pesertaEndpoint);
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    }
  }, [user, initializing, isParticipant, operatorFocusEventId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (isParticipant) {
      fetchRegistrations();
    }
  }, [fetchRegistrations, isParticipant]);

  useEffect(() => {
    let data = [...events];

    if (filterText.trim()) {
      const text = filterText.toLowerCase();
      data = data.filter((ev) =>
        (ev.namaEvent || "").toLowerCase().includes(text)
      );
    }

    if (statusFilter !== "all") {
      data = data.filter(
        (ev) => (ev.status || "").toLowerCase() === statusFilter
      );
    }

    setFiltered(data);
  }, [events, filterText, statusFilter]);

  function handleAdd() {
    setEditingEvent(null);
    setDialogOpen(true);
  }

  function handleEdit(ev) {
    setEditingEvent(ev);
    setDialogOpen(true);
  }

  async function handleDelete(ev) {
    try {
      await del(`/events/${ev.id}`);
      setEvents((prev) => prev.filter((item) => item.id !== ev.id));
      setPageError("");
      success({
        title: "Event dihapus",
        description: ev.namaEvent || "Event berhasil dihapus",
      });
    } catch (err) {
      setPageError(err.message || "Gagal menghapus event");
      toastError({
        title: "Gagal menghapus event",
        description: err.message,
      });
    }
  }

  async function handleSubmitForm(formData) {
    try {
      if (editingEvent) {
        const updated = await put(`/events/${editingEvent.id}`, formData);
        setEvents((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setPageError("");
        success({
          title: "Event diperbarui",
          description: updated.namaEvent || "Data event berhasil disimpan",
        });
      } else {
        const created = await post("/events", formData);
        setEvents((prev) => [created, ...prev]);
         setPageError("");
        success({
          title: "Event ditambahkan",
          description: created.namaEvent || "Event baru berhasil dibuat",
        });
      }
      setDialogOpen(false);
      setEditingEvent(null);
    } catch (err) {
      setPageError(err.message || "Gagal menyimpan event");
      toastError({
        title: editingEvent ? "Gagal menyimpan event" : "Gagal menambah event",
        description: err.message,
      });
    }
  }

  async function handleFeature(ev) {
    if (!ev) return;
    try {
      await post(`/events/${ev.id}/feature`);
      // update local state: unset others, set this one
      setEvents((prev) => prev.map((item) => ({ ...item, isFeatured: item.id === ev.id })));
      success({ title: "Event dipilih sebagai unggulan", description: ev.namaEvent });
    } catch (err) {
      toastError({ title: "Gagal set featured", description: err.message });
    }
  }

  const registrationMap = useMemo(() => {
    const map = new Map();
    registrations.forEach((reg) => {
      map.set(reg.eventId, reg);
    });
    return map;
  }, [registrations]);

  const openEvents = useMemo(
    () =>
      filtered.filter(
        (event) => (event.status || "").toLowerCase() === "open"
      ),
    [filtered]
  );
  const closedEvents = useMemo(
    () =>
      filtered.filter(
        (event) => (event.status || "").toLowerCase() === "closed"
      ),
    [filtered]
  );

  function handleOpenRegistration(eventData) {
    setSelectedEvent(eventData);
    setRegisterDialogOpen(true);
  }

  async function handleSubmitRegistration(values) {
    if (!selectedEvent) return;
    if (registrationLoading) return;
    try {
      setRegistrationLoading(true);
      await post("/peserta", {
        eventId: selectedEvent.id,
        namaTim: values.namaTim,
        namaPerwakilan: values.namaPerwakilan,
      });
      setPageError("");
      success({
        title: "Pendaftaran terkirim",
        description: `${values.namaTim} menunggu persetujuan admin`,
      });
      setRegisterDialogOpen(false);
      setSelectedEvent(null);
      await fetchRegistrations();
    } catch (err) {
      setPageError(err.message || "Gagal mendaftarkan event");
      toastError({
        title: "Gagal daftar event",
        description: err.message,
      });
    } finally {
      setRegistrationLoading(false);
    }
  }

  function handleOpenDetailDialog(team) {
    if (!team) return;
    setDetailTargetTeam(team);
    setDetailDialogOpen(true);
  }

  async function handleSubmitDetail(payload) {
    try {
      await post("/detail-peserta", payload);
      setPageError("");
      success({
        title: "Detail peserta ditambahkan",
        description: payload.namaDetail || "Data anggota disimpan",
      });
      await fetchRegistrations();
      setDetailDialogOpen(false);
      setDetailTargetTeam(null);
    } catch (err) {
      setPageError(err.message || "Gagal menambah detail peserta");
      toastError({
        title: "Gagal menambah detail",
        description: err.message,
      });
    }
  }

  if (initializing || !user) {
    return (
      <div className="h-screen flex items-center justify-center text-sm text-gray-500">
        Memeriksa sesi...
      </div>
    );
  }

  const canEditEvents = user.role === "admin";
  if (isOperator && needsFocusSelection) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-3 py-4 sm:px-4 lg:px-2">
          <Card className="border border-dashed border-slate-300 bg-slate-50">
            <CardContent className="py-6 text-sm text-slate-600">
              Pilih event fokus terlebih dahulu pada tab Profil untuk mengelola event.
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const totalEvents = events.length;
  const openEventsCount = events.filter(
    (ev) => (ev.status || "").toLowerCase() === "open"
  ).length;
  const draftEventsCount = events.filter(
    (ev) => (ev.status || "").toLowerCase() === "draft"
  ).length;
  const closedEventsCount = events.filter(
    (ev) => (ev.status || "").toLowerCase() === "closed"
  ).length;

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-3 sm:px-4 lg:px-2 py-4 sm:py-2 lg:py-2">
        <Card className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="px-4 sm:px-6 py-4 border-b border-slate-100">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">
                  Event
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-slate-500 mt-1">
                  {totalEvents > 0
                    ? `${totalEvents} event terdaftar`
                    : "Belum ada event terdaftar. Tambahkan event untuk mengisi kalender."}
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatPill label="Total" value={totalEvents} />
                <StatPill label="Open" value={openEventsCount} color="emerald" />
                <StatPill label="Draft" value={draftEventsCount} color="amber" />
                <StatPill label="Closed" value={closedEventsCount} color="rose" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
            {isParticipant ? (
              <>
                {pageError && (
                  <p className="text-[11px] text-red-500">{pageError}</p>
                )}
                <ParticipantEventCards
                  openEvents={openEvents}
                  closedEvents={closedEvents}
                  registrations={registrationMap}
                  onRegister={handleOpenRegistration}
                  onAddDetail={handleOpenDetailDialog}
                  loading={loading}
                />
              </>
            ) : (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex w-full flex-col gap-3">
                    <div className="w-full">
                      <Input
                        placeholder="Cari nama event..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="h-9 w-full rounded-md border-slate-200 bg-white text-xs sm:text-sm placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex gap-2 w-full flex-wrap">
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="h-9 w-full sm:w-[180px] rounded-md border-slate-200 bg-white text-xs sm:text-sm">
                          <SelectValue placeholder="Semua status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-slate-200 shadow-md rounded-md">
                          <SelectItem value="all">Semua status</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>

                      {(filterText || statusFilter !== "all") && (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 rounded-md text-xs"
                          onClick={() => {
                            setFilterText("");
                            setStatusFilter("all");
                          }}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>

                  {canEditEvents && (
                    <Button
                      size="sm"
                      onClick={handleAdd}
                      className="h-9 mt-1 md:mt-0 flex items-center gap-2 rounded-md text-xs sm:text-sm"
                    >
                      <CalendarPlus className="h-4 w-4" />
                      Tambah Event
                    </Button>
                  )}
                </div>

                {pageError && (
                  <p className="text-[11px] text-red-500">{pageError}</p>
                )}

                {filtered.length !== totalEvents && (
                  <p className="text-[11px] text-slate-500">
                    Menampilkan{" "}
                    <span className="font-medium">{filtered.length}</span> dari{" "}
                    <span className="font-medium">{totalEvents}</span> event.
                  </p>
                )}

                <div className="mt-1">
                  <EventsTable
                    events={filtered}
                    loading={loading}
                    canEdit={canEditEvents}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onFeature={handleFeature}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {canEditEvents && (
        <EventFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={editingEvent}
          onSubmit={handleSubmitForm}
        />
      )}
      {isParticipant && (
        <EventRegistrationDialog
          open={registerDialogOpen}
          onOpenChange={(val) => {
            if (!val) {
              setSelectedEvent(null);
            }
            setRegisterDialogOpen(val);
          }}
          eventData={selectedEvent}
          onSubmit={handleSubmitRegistration}
        />
      )}
      {isParticipant && detailTargetTeam && (
        <DetailPesertaFormDialog
          open={detailDialogOpen}
          onOpenChange={(val) => {
            if (!val) {
              setDetailDialogOpen(false);
              setDetailTargetTeam(null);
            } else {
              setDetailDialogOpen(true);
            }
          }}
          initialData={null}
          pesertaOptions={[
            {
              value: String(detailTargetTeam.id),
              label: detailTargetTeam.namaTim || detailTargetTeam.event?.namaEvent || "Tim peserta",
            },
          ]}
          presetPesertaId={detailTargetTeam.id}
          presetPesertaLabel={
            detailTargetTeam.namaTim || detailTargetTeam.event?.namaEvent
          }
          onSubmit={handleSubmitDetail}
        />
      )}
    </div>
  );
}

function StatPill({ label, value, color }) {
  let base =
    "inline-flex flex-col justify-center rounded-md border px-2.5 py-1 min-w-[60px]";
  let tone =
    "bg-slate-50 text-slate-800 border-slate-200";

  if (color === "emerald")
    tone = "bg-emerald-50 text-emerald-800 border-emerald-200";
  if (color === "amber")
    tone = "bg-amber-50 text-amber-800 border-amber-200";
  if (color === "rose")
    tone = "bg-rose-50 text-rose-800 border-rose-200";

  return (
    <div className={`${base} ${tone}`}>
      <span className="text-[10px] uppercase tracking-wide opacity-75">
        {label}
      </span>
      <span className="text-sm font-semibold leading-tight">{value}</span>
    </div>
  );
}

function ParticipantEventCards({
  openEvents,
  closedEvents,
  registrations,
  onRegister,
  onAddDetail,
  loading,
}) {
  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Memuat daftar event untuk peserta...
      </p>
    );
  }

  function renderEventList(items, type) {
    if (!items.length) {
      return (
        <p className="text-sm text-slate-500">
          {type === "open"
            ? "Tidak ada event terbuka saat ini."
            : "Belum ada event yang sudah ditutup."}
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        {items.map((event) => {
          const registration = registrations.get(event.id);
          const normalizedStatus = (registration?.status || "").toLowerCase();
          const statusTone = {
            pending: "bg-amber-50 text-amber-700 border-amber-200",
            approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
            rejected: "bg-rose-50 text-rose-700 border-rose-200",
          };
          const statusLabel = {
            pending: "Menunggu persetujuan",
            approved: "Sudah disetujui",
            rejected: "Pendaftaran ditolak",
          };
          return (
            <article
              key={event.id}
              className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-base font-semibold text-slate-900 line-clamp-1">
                    {event.namaEvent}
                  </p>
                  <p className="text-xs text-slate-500">
                    {event.tempatEvent || "-"} •{" "}
                    {formatDate(event.tanggalEvent, {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
                {registration && (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      statusTone[normalizedStatus] || statusTone.pending
                    }`}
                  >
                    {statusLabel[normalizedStatus] || registration.status}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between px-4 py-4 text-sm text-slate-600">
                <div className="space-y-2">
                  <p className="text-xs text-slate-500">
                    Kuota{" "}
                    <span className="font-semibold text-slate-900">
                      {event.kuota ?? "-"}
                    </span>{" "}
                    • Biaya{" "}
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(event.biaya)}
                    </span>
                  </p>
                  {registration ? (
                    <div className="space-y-2 text-xs text-slate-500">
                      <div>
                        Detail peserta terisi:{" "}
                        <span className="font-semibold text-slate-900">
                          {registration.detailPeserta?.length || 0}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 rounded-full"
                          onClick={() => onAddDetail?.(registration)}
                        >
                          Tambah Detail Peserta
                        </Button>
                        <Link
                          href="/dashboard/peserta"
                          className="inline-flex h-8 items-center rounded-full border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-white"
                        >
                          Lihat semua anggota
                        </Link>
                      </div>
                    </div>
                  ) : (
                    type === "open" && (
                      <Button
                        size="sm"
                        className="h-8 rounded-full"
                        onClick={() => onRegister?.(event)}
                      >
                        Daftar Event
                      </Button>
                    )
                  )}
                  {type === "closed" && !registration && (
                    <p className="text-[11px] text-slate-400">
                      Pendaftaran event ini sudah ditutup.
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Event Terbuka
            </p>
            <p className="text-xs text-slate-500">
              Pilih event dan lengkapi data peserta Anda.
            </p>
          </div>
        </div>
        {renderEventList(openEvents, "open")}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Event Selesai
            </p>
            <p className="text-xs text-slate-500">
              Arsip event yang sudah berakhir. Draft tidak ditampilkan.
            </p>
          </div>
        </div>
        {renderEventList(closedEvents, "closed")}
      </section>
    </div>
  );
}
