"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarPlus, PlusCircle } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { useToast } from "@/components/ui/toast-provider";
import { del, get, post, put } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";

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

import { EventsTable } from "@/components/tables/event-table";
import { SubEventsTable } from "@/components/tables/sub-event-table";
import EventFormDialog from "@/components/form/event-form-dialog";
import EventCategoryFormDialog from "@/components/form/event-category-form-dialog";
import EventRegistrationDialog from "@/components/form/event-registration-dialog";
import DetailPesertaFormDialog from "@/components/form/detail-peserta-form-dialog";
import { ParticipantEventList } from "@/components/peserta/participant-event-list";

// Normalize category data with consistent structure
function normalizeCategory(category) {
  if (!category) {
    return {
      id: null,
      name: "",
      description: "",
      quota: null,
      _count: { peserta: 0 },
    };
  }

  const pesertaCount =
    category._count?.peserta ?? category.pesertaCount ?? 0;

  return {
    ...category,
    _count: { peserta: pesertaCount },
  };
}

// Normalize event data with sorted categories and boolean flags
function normalizeEventData(event) {
  if (!event) return event;

  const categories = Array.isArray(event.categories)
    ? event.categories.map(normalizeCategory)
    : [];

  categories.sort((a, b) => {
    const nameA = (a.name || "").toLowerCase();
    const nameB = (b.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return {
    ...event,
    categories,
    isFeatured: Boolean(event.isFeatured),
  };
}

export default function EventsPage() {
  const { user, initializing } = useAuth();
  const { success, error: toastError } = useToast();

  const isAdmin = user?.role === "admin";
  const isOperator = user?.role === "operator";
  const isParticipant = user?.role === "peserta";
  const operatorFocusEventId = isOperator ? user?.focusEventId : null;
  const needsFocusSelection = isOperator && !operatorFocusEventId;
  const canManageCategories = isAdmin || isOperator;
  const showCategoryTab = canManageCategories;

  const pathname = usePathname();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const isSubEventRoute = pathname?.startsWith("/dashboard/sub-events");

  const [selectedSubEventEventId, setSelectedSubEventEventId] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryEditing, setCategoryEditing] = useState(null);
  const [categoryEventTarget, setCategoryEventTarget] = useState(null);
  const [categoryError, setCategoryError] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationCategoriesLoading, setRegistrationCategoriesLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailTargetTeam, setDetailTargetTeam] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!user || initializing) return;
    if (isOperator && !operatorFocusEventId) return;

    try {
      setLoading(true);
      setPageError("");
      const data = await get("/events");
      const list = Array.isArray(data)
        ? data.map((event) => normalizeEventData(event))
        : [];
      const scopedList =
        operatorFocusEventId != null
          ? list.filter((event) => event.id === operatorFocusEventId)
          : list;
      setEvents(scopedList);
    } catch (err) {
      console.error(err);
      const message = err?.message || "Gagal memuat event";
      setPageError(message);
      toastError({
        title: "Gagal memuat event",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }, [user, initializing, isOperator, operatorFocusEventId, toastError]);

  const fetchRegistrations = useCallback(async () => {
    if (!user || initializing || !isParticipant) return;

    try {
      const data = await get("/peserta");
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toastError({
        title: "Gagal memuat pendaftaran",
        description:
          err?.message || "Terjadi kesalahan saat memuat data pendaftaran",
      });
    }
  }, [user, initializing, isParticipant, toastError]);

  useEffect(() => {
    if (!user || initializing) return;
    fetchEvents();
  }, [user, initializing, fetchEvents]);

  useEffect(() => {
    if (!user || initializing || !isParticipant) return;
    fetchRegistrations();
  }, [user, initializing, isParticipant, fetchRegistrations]);

  useEffect(() => {
    if (!isSubEventRoute) {
      if (selectedSubEventEventId) {
        setSelectedSubEventEventId("");
      }
      if (categoryError) {
        setCategoryError("");
      }
      return;
    }

    if (!selectedSubEventEventId) return;

    const exists = events.some(
      (event) => String(event.id) === String(selectedSubEventEventId)
    );
    if (!exists) {
      setSelectedSubEventEventId("");
    }
  }, [events, isSubEventRoute, selectedSubEventEventId, categoryError]);

  useEffect(() => {
    let data = Array.isArray(events) ? [...events] : [];
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

  const subEvents = useMemo(() => {
    const list = [];

    events.forEach((event) => {
      const categories = Array.isArray(event.categories) ? event.categories : [];
      categories.forEach((category) => {
        list.push({
          id: category.id,
          name: category.name,
          description: category.description,
          quota: category.quota,
          participantCount: category._count?.peserta ?? 0,
          eventId: event.id,
          eventName: event.namaEvent,
          eventStatus: event.status,
          eventDate: event.tanggalEvent,
          eventLocation: event.tempatEvent,
          eventVenue: event.venue,
          eventRef: event,
          categoryRef: category,
        });
      });
    });

    return list.sort((a, b) => {
      const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
      const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      const eventNameA = (a.eventName || "").toLowerCase();
      const eventNameB = (b.eventName || "").toLowerCase();
      if (eventNameA < eventNameB) return -1;
      if (eventNameA > eventNameB) return 1;
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }, [events]);

  const selectedSubEventEvent = useMemo(() => {
    if (!selectedSubEventEventId) return null;
    return (
      events.find(
        (event) => String(event.id) === String(selectedSubEventEventId)
      ) || null
    );
  }, [events, selectedSubEventEventId]);

  const filteredSubEvents = useMemo(() => {
    if (isSubEventRoute) {
      if (!selectedSubEventEventId) return [];

      let data = subEvents.filter(
        (item) => String(item.eventId) === String(selectedSubEventEventId)
      );

      if (categorySearch.trim()) {
        const text = categorySearch.toLowerCase();
        data = data.filter((item) =>
          (item.name || "").toLowerCase().includes(text)
        );
      }

      return data;
    }

    return subEvents;
  }, [isSubEventRoute, selectedSubEventEventId, subEvents, categorySearch]);

  const baseSubEventList = useMemo(() => {
    if (!isSubEventRoute || !selectedSubEventEventId) return [];
    return subEvents.filter(
      (item) => String(item.eventId) === String(selectedSubEventEventId)
    );
  }, [isSubEventRoute, selectedSubEventEventId, subEvents]);

  const totalSubEvents = isSubEventRoute
    ? baseSubEventList.length
    : subEvents.length;
  const totalSubEventQuota = (isSubEventRoute ? baseSubEventList : subEvents).reduce(
    (sum, item) => sum + (typeof item.quota === "number" ? item.quota : 0),
    0
  );
  const totalSubEventParticipants = (isSubEventRoute ? baseSubEventList : subEvents).reduce(
    (sum, item) =>
      sum + (typeof item.participantCount === "number" ? item.participantCount : 0),
    0
  );
  const filteredSubEventCount = filteredSubEvents.length;
  const noFilteredSubEventResults =
    isSubEventRoute && Boolean(categorySearch.trim()) && filteredSubEvents.length === 0;

  const eventFilterOptions = useMemo(
    () =>
      events.map((event) => ({
        value: String(event.id),
        label: event.namaEvent || `Event ${event.id}`,
      })),
    [events]
  );

  function updateEventCategories(eventId, mutator) {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        const currentCategories = Array.isArray(event.categories)
          ? event.categories.map(normalizeCategory)
          : [];

        const nextCategories = mutator(currentCategories);
        return {
          ...event,
          categories: Array.isArray(nextCategories)
            ? nextCategories.map(normalizeCategory)
            : currentCategories,
        };
      })
    );
  }

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
          prev.map((item) => {
            if (item.id !== updated.id) return item;
            const normalizedUpdated = normalizeEventData(updated);
            return {
              ...normalizedUpdated,
              categories: item.categories ?? normalizedUpdated.categories,
            };
          })
        );
        setPageError("");
        success({
          title: "Event diperbarui",
          description: updated.namaEvent || "Data event berhasil disimpan",
        });
      } else {
        const created = await post("/events", formData);
        const normalizedCreated = normalizeEventData(created);
        setEvents((prev) => [normalizedCreated, ...prev]);
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

  function openCategoryDialog(eventData, category = null) {
    if (!eventData) return;
    setCategoryEventTarget(eventData);
    setCategoryEditing(category);
    setCategoryDialogOpen(true);
    setCategoryError("");
  }

  async function handleSubmitCategory(formData) {
    const targetEvent = categoryEventTarget;
    if (!targetEvent) return;

    try {
      if (categoryEditing) {
        const updatePayload = { ...formData };
        delete updatePayload.eventId;
        const updated = await put(
          `/event-categories/${categoryEditing.id}`,
          updatePayload
        );
        updateEventCategories(targetEvent.id, (categories) => {
          const existing = categories.find((cat) => cat.id === updated.id);
          const count = existing?._count ?? { peserta: 0 };
          return categories.map((cat) =>
            cat.id === updated.id
              ? {
                  ...existing,
                  ...updated,
                  _count: count,
                }
              : cat
          );
        });
        success({
          title: "Kategori diperbarui",
          description: updated.name,
        });
      } else {
        const created = await post("/event-categories", formData);
        updateEventCategories(formData.eventId, (categories) => [
          {
            ...created,
            _count: { peserta: 0 },
          },
          ...categories,
        ]);
        success({
          title: "Kategori ditambahkan",
          description: created.name,
        });
      }

      setCategoryDialogOpen(false);
      setCategoryEditing(null);
      setCategoryEventTarget(null);
      setCategoryError("");
    } catch (err) {
      const message = err.message || "Gagal menyimpan kategori";
      setCategoryError(message);
      toastError({
        title: categoryEditing ? "Gagal menyimpan kategori" : "Gagal menambah kategori",
        description: err.message,
      });
    }
  }

  async function handleDeleteCategory(category, eventData) {
    if (!category || !eventData) return;

    try {
      await del(`/event-categories/${category.id}`);
      updateEventCategories(eventData.id, (categories) =>
        categories.filter((item) => item.id !== category.id)
      );
      setCategoryError("");
      success({
        title: "Kategori dihapus",
        description: category.name,
      });
    } catch (err) {
      const message = err.message || "Gagal menghapus kategori";
      setCategoryError(message);
      toastError({
        title: "Gagal menghapus kategori",
        description: err.message,
      });
    }
  }

  function handleAddCategoryFromList() {
    if (!selectedSubEventEventId) {
      setCategoryError("Pilih event terlebih dahulu sebelum menambah sub event.");
      return;
    }

    const targetEvent = events.find(
      (event) => String(event.id) === String(selectedSubEventEventId)
    );

    if (!targetEvent) {
      setCategoryError("Event induk tidak ditemukan.");
      return;
    }

    setCategoryError("");
    openCategoryDialog(targetEvent);
  }

  function resolveCategoryContext(subEvent) {
    if (!subEvent) return { eventData: null, categoryData: null };

    const eventData =
      events.find((event) => event.id === subEvent.eventId) ||
      subEvent.eventRef ||
      null;
    const categoryData = eventData
      ? eventData.categories.find((category) => category.id === subEvent.id) ||
        subEvent.categoryRef ||
        null
      : subEvent.categoryRef || null;

    return { eventData, categoryData };
  }

  function handleEditCategoryFromList(subEvent) {
    const { eventData, categoryData } = resolveCategoryContext(subEvent);
    if (!eventData) {
      setCategoryError("Event induk tidak ditemukan untuk sub event ini.");
      return;
    }
    openCategoryDialog(eventData, categoryData);
  }

  function handleDeleteCategoryFromList(subEvent) {
    const { eventData, categoryData } = resolveCategoryContext(subEvent);
    if (!eventData || !categoryData) {
      setCategoryError("Event atau sub event tidak ditemukan.");
      return;
    }
    handleDeleteCategory(categoryData, eventData);
  }

  async function handleFeature(ev) {
    try {
      await post(`/events/${ev.id}/feature`);
      setEvents((prev) =>
        prev.map((item) => ({ ...item, isFeatured: item.id === ev.id }))
      );
      success({
        title: "Event dipilih sebagai unggulan",
        description: ev.namaEvent,
      });
    } catch (err) {
      toastError({
        title: "Gagal set featured",
        description: err.message,
      });
    }
  }

  async function handleOpenRegistration(eventData) {
    if (!eventData) return;

    const normalized = normalizeEventData(eventData);
    setSelectedEvent(normalized);
    setRegisterDialogOpen(true);

    if (normalized.categories?.length) {
      return;
    }

    try {
      setRegistrationCategoriesLoading(true);
      const detail = await get(`/events/${eventData.id}`);
      const enriched = normalizeEventData(detail);
      setSelectedEvent(enriched);
      setEvents((prev) =>
        prev.map((item) =>
          item.id === enriched.id
            ? {
                ...item,
                categories: enriched.categories,
              }
            : item
        )
      );
    } catch (err) {
      toastError({
        title: "Gagal memuat kategori event",
        description: err?.message || "Terjadi kesalahan saat memuat data event",
      });
    } finally {
      setRegistrationCategoriesLoading(false);
    }
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
        eventCategoryId: values.eventCategoryId,
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

  async function handleCancelRegistration(registration) {
    if (!registration) return;
    
    const confirmCancel = window.confirm(
      `Batalkan pendaftaran "${registration.namaTim}"?\n\nSemua data anggota tim akan ikut terhapus.`
    );
    
    if (!confirmCancel) return;

    try {
      await del(`/peserta/${registration.id}`);
      setPageError("");
      success({
        title: "Pendaftaran dibatalkan",
        description: `${registration.namaTim} telah dibatalkan`,
      });
      await fetchRegistrations();
    } catch (err) {
      setPageError(err.message || "Gagal membatalkan pendaftaran");
      toastError({
        title: "Gagal membatalkan pendaftaran",
        description: err.message,
      });
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
          <Card className="border border-dashed border-border bg-muted">
            <CardContent className="py-6 text-sm text-muted-foreground">
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

  const eventHeaderDescription =
    totalEvents > 0
      ? `${totalEvents} event terdaftar`
      : "Belum ada event terdaftar. Tambahkan event untuk mengisi kalender.";
  const subEventHeaderDescription = totalEvents
    ? "Kelola sub event untuk setiap event."
    : "Buat event terlebih dahulu sebelum menambah sub event.";
  const headerTitle = isSubEventRoute ? "Sub Event" : "Event";
  const headerDescription = isSubEventRoute
    ? subEventHeaderDescription
    : eventHeaderDescription;

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-3 sm:px-4 lg:px-2 py-4 sm:py-2 lg:py-2">
        <Card className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <CardHeader className="px-4 sm:px-6 py-4 border-b border-border space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-semibold text-foreground">
                  {headerTitle}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {headerDescription}
                </CardDescription>
              </div>

              {!isSubEventRoute && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <StatPill label="Total" value={totalEvents} />
                  <StatPill label="Open" value={openEventsCount} color="emerald" />
                  <StatPill label="Draft" value={draftEventsCount} color="amber" />
                  <StatPill label="Closed" value={closedEventsCount} color="rose" />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">
            {isSubEventRoute && showCategoryTab ? (
              <>
                {categoryError && (
                  <p className="text-[11px] text-red-500">{categoryError}</p>
                )}
                {loading ? (
                  <p className="text-sm text-muted-foreground">
                    Memuat data sub event...
                  </p>
                ) : events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada event untuk dikelola. Tambahkan event terlebih dahulu.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                      <div className="w-full md:max-w-sm">
                        <p className="text-xs font-medium text-foreground">
                          Event Induk <span className="text-red-500">*</span>
                        </p>
                        <Select
                          value={selectedSubEventEventId || undefined}
                          onValueChange={(value) => {
                            setSelectedSubEventEventId(value);
                            setCategorySearch("");
                            setCategoryError("");
                          }}
                        >
                          <SelectTrigger className="mt-1 h-9 w-full rounded-md border-border bg-card text-xs sm:text-sm">
                            <SelectValue placeholder="Pilih event terlebih dahulu" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border border-border shadow-md rounded-md">
                            {eventFilterOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedSubEventEventId && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-9 rounded-md text-xs"
                            onClick={() => {
                              setSelectedSubEventEventId("");
                              setCategorySearch("");
                              setCategoryError("");
                            }}
                          >
                            Reset
                          </Button>
                        )}
                        {canManageCategories && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddCategoryFromList}
                            disabled={!selectedSubEventEventId}
                            className="h-9 flex items-center gap-2 rounded-md text-xs sm:text-sm"
                          >
                            <PlusCircle className="h-4 w-4" />
                            Tambah Sub Event
                          </Button>
                        )}
                      </div>
                    </div>

                    {selectedSubEventEvent ? (
                      <>
                        <div className="rounded-lg border border-border bg-muted px-4 py-3 space-y-2">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {selectedSubEventEvent.namaEvent}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {selectedSubEventEvent.tempatEvent || "-"} • {formatDate(selectedSubEventEvent.tanggalEvent)}
                              </p>
                            </div>
                            <span className="inline-flex items-center justify-center rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold capitalize text-muted-foreground">
                              {selectedSubEventEvent.status || "-"}
                            </span>
                          </div>
                          {selectedSubEventEvent.deskripsiEvent && (
                            <p className="text-xs text-muted-foreground">
                              {selectedSubEventEvent.deskripsiEvent}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <Input
                            placeholder="Cari sub event..."
                            value={categorySearch}
                            onChange={(e) => {
                              setCategorySearch(e.target.value);
                              setCategoryError("");
                            }}
                            className="h-9 w-full sm:w-[240px] rounded-md border-border bg-card text-xs sm:text-sm placeholder:text-muted-foreground"
                          />

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <StatPill label="Total Sub Event" value={totalSubEvents} />
                            <StatPill label="Total Kuota" value={totalSubEventQuota} color="amber" />
                            <StatPill label="Total Peserta" value={totalSubEventParticipants} color="emerald" />
                          </div>
                        </div>

                        {noFilteredSubEventResults ? (
                          <p className="text-xs text-muted-foreground">
                            Tidak ada sub event yang cocok dengan pencarian.
                          </p>
                        ) : (
                          <>
                            {filteredSubEventCount !== totalSubEvents && filteredSubEvents.length > 0 && (
                              <p className="text-[11px] text-muted-foreground">
                                Menampilkan <span className="font-medium">{filteredSubEventCount}</span> dari{" "}
                                <span className="font-medium">{totalSubEvents}</span> sub event.
                              </p>
                            )}

                            <SubEventsTable
                              items={filteredSubEvents}
                              loading={false}
                              canEdit={canManageCategories}
                              onEdit={handleEditCategoryFromList}
                              onDelete={handleDeleteCategoryFromList}
                            />
                          </>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Pilih event untuk melihat dan mengelola daftar sub event.
                      </p>
                    )}
                  </>
                )}
              </>
            ) : isParticipant ? (
              <>
                {pageError && (
                  <p className="text-[11px] text-red-500">{pageError}</p>
                )}
                <ParticipantEventList
                  events={events}
                  registrations={registrations}
                  onRegister={handleOpenRegistration}
                  onCancel={handleCancelRegistration}
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
                        className="h-9 w-full rounded-md border-border bg-card text-xs sm:text-sm placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="flex gap-2 w-full flex-wrap">
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="h-9 w-full sm:w-[180px] rounded-md border-border bg-card text-xs sm:text-sm">
                          <SelectValue placeholder="Semua status" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border shadow-md rounded-md">
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
                  <p className="text-[11px] text-muted-foreground">
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
      {showCategoryTab && (
        <EventCategoryFormDialog
          open={categoryDialogOpen}
          onOpenChange={(val) => {
            if (!val) {
              setCategoryDialogOpen(false);
              setCategoryEditing(null);
              setCategoryEventTarget(null);
            } else {
              setCategoryDialogOpen(true);
            }
          }}
          eventContext={categoryEventTarget}
          initialData={categoryEditing}
          onSubmit={handleSubmitCategory}
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
          loadingCategories={registrationCategoriesLoading}
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
          teamData={detailTargetTeam}
          onSubmit={handleSubmitDetail}
        />
      )}
    </div>
  );
}

function StatPill({ label, value, color }) {
  let base =
    "inline-flex flex-col justify-center rounded-md border px-2.5 py-1 min-w-[60px]";
  let tone = "bg-muted text-foreground border-border";

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
      <p className="text-sm text-muted-foreground">
        Memuat daftar event untuk peserta...
      </p>
    );
  }

  function renderEventList(items, type) {
    if (!items.length) {
      return (
        <p className="text-sm text-muted-foreground">
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
              className="flex h-full flex-col rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
                <div>
                  <p className="text-base font-semibold text-foreground line-clamp-1">
                    {event.namaEvent}
                  </p>
                  <p className="text-xs text-muted-foreground">
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

              <div className="flex flex-1 flex-col justify-between px-4 py-4 text-sm text-muted-foreground">
                <div className="space-y-2">
                  {registration?.eventCategory ? (
                    <p className="text-xs text-muted-foreground">
                      Kategori terdaftar:{" "}
                      <span className="font-semibold text-foreground">
                        {registration.eventCategory.name}
                      </span>
                    </p>
                  ) : event.categories?.length ? (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Kategori tersedia:
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        {event.categories.map((category) => category.name).join(", ")}
                      </p>
                    </div>
                  ) : null}

                  <p className="text-xs text-muted-foreground">
                    Kuota{" "}
                    <span className="font-semibold text-foreground">
                      {event.kuota ?? "-"}
                    </span>{" "}
                    • Biaya{" "}
                    <span className="font-semibold text-foreground">
                      {formatCurrency(event.biaya)}
                    </span>
                  </p>
                  {registration ? (
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div>
                        Detail peserta terisi:{" "}
                        <span className="font-semibold text-foreground">
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
                          className="inline-flex h-8 items-center rounded-full border border-border px-3 text-xs font-semibold text-foreground hover:bg-card"
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
                    <p className="text-[11px] text-muted-foreground">
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
        <div className="flex items center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Event Terbuka
            </p>
            <p className="text-xs text-muted-foreground">
              Pilih event dan lengkapi data peserta Anda.
            </p>
          </div>
        </div>
        {renderEventList(openEvents, "open")}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Event Selesai
            </p>
            <p className="text-xs text-muted-foreground">
              Arsip event yang sudah berakhir. Draft tidak ditampilkan.
            </p>
          </div>
        </div>
        {renderEventList(closedEvents, "closed")}
      </section>
    </div>
  );
}
