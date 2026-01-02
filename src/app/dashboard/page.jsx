// src/app/dashboard/page.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";
import { get } from "@/lib/api";
import { formatDate } from "@/lib/formatters";
import {
  calculateDetailScore,
  formatScoreDisplay,
  resolveScoreValue,
} from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PageContainer from "@/components/layout/page-container";
import PageHeader from "@/components/layout/page-header";

const SCORE_FEATURE_ENABLED = false;

export default function DashboardPage() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const isParticipant = user?.role === "peserta";
  const isJuri = user?.role === "juri";
  const isOperator = user?.role === "operator";
  const operatorFocusEventId = isOperator ? user?.focusEventId : null;
  const needsOperatorFocusSelection = isOperator && !operatorFocusEventId;

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    events: 0,
    peserta: 0,
    berita: 0,
    users: 0,
    merchandise: 0,
    partnerships: 0,
    gallery: 0,
  });
  const [eventsData, setEventsData] = useState([]);
  const [pesertaData, setPesertaData] = useState([]);
  const [beritaData, setBeritaData] = useState([]);
  const [scoresData, setScoresData] = useState([]);
  const [juaraData, setJuaraData] = useState([]);
  const [merchandiseData, setMerchandiseData] = useState([]);
  const [partnershipsData, setPartnershipsData] = useState([]);
  const [galleryData, setGalleryData] = useState([]);
  const [scoreDetailsData, setScoreDetailsData] = useState([]);
  const [scoreDetailsLoading, setScoreDetailsLoading] = useState(false);
  const [scoreDetailsError, setScoreDetailsError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initializing) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }

    async function fetchStats() {
      try {
        setError("");
        setLoading(true);

        const canFetchUsers =
          user?.role === "admin" || user?.role === "operator";

        const userPromise = canFetchUsers
          ? get("/users")
          : Promise.resolve([]);

        const scopedEventId = operatorFocusEventId || null;

        const pesertaPromise = (() => {
          if (operatorFocusEventId) {
            return get(`/peserta?eventId=${operatorFocusEventId}`);
          }
          if (isJuri) {
            return Promise.resolve([]);
          }
          return get("/peserta");
        })();

        const scoresUrl = scopedEventId
          ? `/scores?eventId=${scopedEventId}`
          : "/scores";
        const juaraUrl = scopedEventId
          ? `/juara?eventId=${scopedEventId}`
          : "/juara";

        const scoresPromise = SCORE_FEATURE_ENABLED
          ? get(scoresUrl)
          : Promise.resolve([]);

        const [events, peserta, berita, users, scores, juara, merchandise, partnerships, gallery] =
          await Promise.all([
            get("/events"),
            pesertaPromise,
            get("/berita"),
            userPromise,
            scoresPromise,
            get(juaraUrl),
            get("/merchandise").catch((err) => {
              console.error('Failed to fetch merchandise:', err);
              return [];
            }),
            get("/partnerships").catch((err) => {
              console.error('Failed to fetch partnerships:', err);
              return [];
            }),
            get("/gallery").catch((err) => {
              console.error('Failed to fetch gallery:', err);
              return [];
            }),
          ]);

        const scopedEvents = scopedEventId
          ? (events || []).filter((event) => event.id === scopedEventId)
          : events || [];

        const beritaList = Array.isArray(berita)
          ? berita
          : Array.isArray(berita?.data)
          ? berita.data
          : [];

        const pesertaList = Array.isArray(peserta) ? peserta : [];
        const usersList = Array.isArray(users) ? users : [];
        const scoresList = SCORE_FEATURE_ENABLED && Array.isArray(scores) ? scores : [];
        const juaraList = Array.isArray(juara) ? juara : [];
        // Handle merchandise with pagination structure
        const merchandiseList = Array.isArray(merchandise) 
          ? merchandise 
          : Array.isArray(merchandise?.data)
          ? merchandise.data
          : [];
        const partnershipsList = Array.isArray(partnerships) ? partnerships : [];
        const galleryList = Array.isArray(gallery) ? gallery : [];

        console.log('Dashboard data:', {
          merchandise: merchandiseList.length,
          partnerships: partnershipsList.length,
          gallery: galleryList.length
        });

        setStats({
          events: scopedEvents.length ?? 0,
          peserta: pesertaList.length,
          berita: Array.isArray(berita)
            ? berita.length
            : berita?.meta?.total ?? beritaList.length,
          users: usersList.length,
          merchandise: merchandiseList.length,
          partnerships: partnershipsList.length,
          gallery: galleryList.length,
        });
        setEventsData(scopedEvents || []);
        setPesertaData(pesertaList);
        setBeritaData(beritaList);
        setScoresData(scoresList);
        setJuaraData(juaraList);
        setMerchandiseData(merchandiseList);
        setPartnershipsData(partnershipsList);
        setGalleryData(galleryList);
      } catch (err) {
        console.error(err);
        setError(err.message || "Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [initializing, user, router, operatorFocusEventId]);

  useEffect(() => {
    if (!SCORE_FEATURE_ENABLED) {
      setScoreDetailsData([]);
      setScoreDetailsError("");
      setScoreDetailsLoading(false);
      return;
    }

    if (!user || user.role !== "juri") {
      setScoreDetailsData([]);
      setScoreDetailsError("");
      setScoreDetailsLoading(false);
      return;
    }

    let active = true;

    async function fetchDetailScores() {
      try {
        setScoreDetailsLoading(true);
        setScoreDetailsError("");
        const data = await get("/score-details");
        if (active) {
          setScoreDetailsData(data || []);
        }
      } catch (err) {
        if (active) {
          setScoreDetailsError(err.message || "Gagal memuat detail score");
        }
      } finally {
        if (active) {
          setScoreDetailsLoading(false);
        }
      }
    }

    fetchDetailScores();

    return () => {
      active = false;
    };
  }, [user]);

  const participantLeaders = useMemo(() => {
    const map = new Map();
    pesertaData.forEach((p) => {
      const key = p.eventId || "unknown";
      if (!map.has(key)) {
        map.set(key, {
          eventId: p.eventId,
          eventName: p.event?.namaEvent || "Event tidak diketahui",
          total: 0,
        });
      }
      map.get(key).total += 1;
    });
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);
  }, [pesertaData]);

  const topScores = useMemo(() => {
    if (!SCORE_FEATURE_ENABLED) return [];
    return [...scoresData]
      .sort(
        (a, b) => Number(b.nilai || 0) - Number(a.nilai || 0)
      )
      .slice(0, 5);
  }, [scoresData]);

  const latestActivities = useMemo(() => {
    const normalize = (items, type, titleKey, dateKey, extra) =>
      items
        .map((item) => {
          const date =
            new Date(item[dateKey] || item.createdAt || item.updatedAt || Date.now());
          return {
            type,
            title: item[titleKey] || `Tanpa judul`,
            date,
            meta: extra?.(item),
          };
        })
        .filter((item) => !Number.isNaN(item.date.getTime()));

    const combined = [
      ...normalize(eventsData.slice(0, 5), "Event", "namaEvent", "tanggalEvent", (item) =>
        item.tempatEvent || "Event Baru"
      ),
      ...normalize(beritaData.slice(0, 5), "Berita", "title", "tanggal", () =>
        "Berita"
      ),
      ...normalize(pesertaData.slice(0, 5), "Peserta", "namaTim", "createdAt", (item) =>
        item.event?.namaEvent || "Peserta Baru"
      ),
      ...normalize(juaraData.slice(0, 5), "Juara", "juara", "createdAt", (item) =>
        item.event?.namaEvent || "Hasil Lomba"
      ),
    ];

    return combined
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 6);
  }, [eventsData, beritaData, pesertaData, juaraData]);

  const scoreDistribution = useMemo(() => {
    const buckets = [
      { label: "0-25", min: 0, max: 25, value: 0 },
      { label: "26-50", min: 26, max: 50, value: 0 },
      { label: "51-75", min: 51, max: 75, value: 0 },
      { label: "76-100", min: 76, max: 100, value: 0 },
    ];

    if (!SCORE_FEATURE_ENABLED) {
      return buckets;
    }

    scoresData.forEach((score) => {
      const resolved = resolveScoreValue(score);
      const nilai = resolved != null ? resolved : 0;
      const bucket = buckets.find((b) => nilai >= b.min && nilai <= b.max);
      if (bucket) bucket.value += 1;
    });
    return buckets;
  }, [scoresData]);

  if (initializing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Memeriksa sesi login...</p>
      </div>
    );
  }

  if (!user) return null;

  if (isParticipant) {
    return (
      <ParticipantDashboard
        user={user}
        loading={loading}
        teams={pesertaData}
        events={eventsData}
        berita={beritaData}
        juara={juaraData}
        scores={scoresData}
        scoreFeatureEnabled={SCORE_FEATURE_ENABLED}
      />
    );
  }

  if (isJuri) {
    return (
      <JuriDashboard
        user={user}
        loading={loading}
        scores={scoresData}
        juara={juaraData}
        details={scoreDetailsData}
        detailsLoading={scoreDetailsLoading}
        detailsError={scoreDetailsError}
        generalError={error}
        scoreFeatureEnabled={SCORE_FEATURE_ENABLED}
      />
    );
  }

  if (needsOperatorFocusSelection) {
    return (
      <PageContainer>
        <PageHeader
          title={`Halo, ${user.username || user.email}`}
          description="Pilih event fokus terlebih dahulu untuk melihat panel operator."
        />
        <FocusEventNotice />
      </PageContainer>
    );
  }

  // Calculate comprehensive stats
  const comprehensiveStats = useMemo(() => {
    // Events stats
    const openEvents = eventsData.filter(e => e.status === 'open').length;
    const draftEvents = eventsData.filter(e => e.status === 'draft').length;
    const closedEvents = eventsData.filter(e => e.status === 'closed').length;
    const featuredEvents = eventsData.filter(e => e.isFeatured).length;
    
    // Peserta stats
    const pendingPeserta = pesertaData.filter(p => p.status === 'pending').length;
    const approvedPeserta = pesertaData.filter(p => p.status === 'approved').length;
    const rejectedPeserta = pesertaData.filter(p => p.status === 'rejected').length;
    const totalMembers = pesertaData.reduce((sum, p) => sum + (p.detailPeserta?.length || 0), 0);
    
    // Partnerships stats
    const mediaPartners = partnershipsData.filter(p => p.type === 'media_partner').length;
    const sponsors = partnershipsData.filter(p => p.type === 'sponsor').length;
    const supportedBy = partnershipsData.filter(p => p.type === 'supported_by').length;
    
    return {
      events: {
        total: eventsData.length,
        open: openEvents,
        draft: draftEvents,
        closed: closedEvents,
        featured: featuredEvents,
      },
      peserta: {
        total: pesertaData.length,
        pending: pendingPeserta,
        approved: approvedPeserta,
        rejected: rejectedPeserta,
        totalMembers,
      },
      berita: {
        total: stats.berita,
        recent: beritaData.slice(0, 5).length,
      },
      users: {
        total: stats.users,
      },
      juara: {
        total: juaraData.length,
      },
      merchandise: merchandiseData.length,
      partnerships: {
        total: partnershipsData.length,
        mediaPartners,
        sponsors,
        supportedBy,
      },
      gallery: galleryData.length,
    };
  }, [eventsData, pesertaData, stats, beritaData, juaraData, merchandiseData, partnershipsData, galleryData]);

  return (
    <PageContainer>
      <PageHeader
        title={`Dashboard Admin`}
        description="Ringkasan lengkap semua data sistem"
      />
      {user && user.isActive === false && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Akun Anda sedang menunggu aktivasi admin. Anda tetap dapat melihat
          dashboard, namun beberapa aksi mungkin dibatasi sampai akun aktif.
        </div>
      )}

      {error && (
        <div className="text-sm text-red-500 border border-red-200 rounded-md px-3 py-2 bg-red-50 mb-4">
          {error}
        </div>
      )}

      {/* Statistik Utama */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Statistik Utama</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/events" className="block">
          <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Event
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[80px]">
              <p className="text-3xl font-bold text-foreground">
                {loading ? "…" : comprehensiveStats.events.total}
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {comprehensiveStats.events.open} Open
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {comprehensiveStats.events.draft} Draft
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground border border-border">
                  {comprehensiveStats.events.closed} Closed
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/peserta" className="block">
          <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Peserta
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[80px]">
              <p className="text-3xl font-bold text-foreground">
                {loading ? "…" : comprehensiveStats.peserta.total}
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {comprehensiveStats.peserta.approved} Approved
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {comprehensiveStats.peserta.pending} Pending
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/berita" className="block">
          <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Berita
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[80px] flex flex-col justify-between">
              <p className="text-3xl font-bold text-foreground">
                {loading ? "…" : comprehensiveStats.berita.total}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Artikel & pengumuman
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/users" className="block">
          <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Users
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[80px] flex flex-col justify-between">
              <p className="text-3xl font-bold text-foreground">
                {loading ? "…" : comprehensiveStats.users.total}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Admin, operator, juri, peserta
              </p>
            </CardContent>
          </Card>
        </Link>
        </div>
      </section>

      {/* Statistik Lainnya */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Statistik Lainnya</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/juara" className="block">
          <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all cursor-pointer border-amber-200 bg-amber-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-900">
                Juara
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[80px] flex flex-col justify-between">
              <p className="text-3xl font-bold text-amber-900">
                {loading ? "…" : comprehensiveStats.juara.total}
              </p>
              <p className="text-xs text-amber-700 mt-2">
                Pemenang terdaftar
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/detail-peserta" className="block">
          <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Anggota Tim
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[80px] flex flex-col justify-between">
              <p className="text-3xl font-bold text-foreground">
                {loading ? "…" : comprehensiveStats.peserta.totalMembers}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Total anggota dari semua tim
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/merchandise" className="block">
          <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Merchandise
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[80px] flex flex-col justify-between">
              <p className="text-3xl font-bold text-foreground">
                {loading ? "…" : comprehensiveStats.merchandise}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Produk tersedia
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/gallery" className="block">
          <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Galeri
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-[80px] flex flex-col justify-between">
              <p className="text-3xl font-bold text-foreground">
                {loading ? "…" : comprehensiveStats.gallery}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Foto & dokumentasi
              </p>
            </CardContent>
          </Card>
        </Link>
        </div>
      </section>

      {/* Detail & Widgets */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Detail & Analisis</h2>
        <div className="grid gap-4 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-4">
          <Link href="/dashboard/partnerships" className="block">
            <Card className="h-full hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Kolaborasi
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[80px]">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <p className="text-3xl font-bold text-foreground">
                    {loading ? "…" : comprehensiveStats.partnerships.total}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {comprehensiveStats.partnerships.mediaPartners} Media Partner
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {comprehensiveStats.partnerships.sponsors} Sponsor
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                      {comprehensiveStats.partnerships.supportedBy} Supported By
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Event Terpopuler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {participantLeaders.length ? (
                participantLeaders.map((event) => (
                  <div
                    key={event.eventId}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {event.eventName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.total} tim peserta
                      </p>
                    </div>
                    <TrendBadge value={event.total} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  Belum ada event dengan peserta.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Status Event Saat Ini
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {loading ? "Menghitung..." : "Realtime"}
              </span>
            </CardHeader>
            <CardContent>
              <EventStatusChart data={eventsData} />
            </CardContent>
          </Card>
        </div>
        </div>

        {/* Bottom Row - Juara & Ringkasan Grid */}
        <div className="grid gap-4 lg:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Juara & Penghargaan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {juaraData.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.peserta?.namaTim || "Tim tidak diketahui"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.event?.namaEvent || "Event tidak diketahui"}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs px-2 py-0.5">
                    {item.juara}
                  </span>
                </div>
              ))}
              {!juaraData.length && (
                <p className="text-xs text-muted-foreground">
                  Belum ada data juara.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Ringkasan Peserta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {comprehensiveStats.peserta.total} peserta aktif
              </p>
              <p className="text-xs text-muted-foreground">
                {participantLeaders.length} event populer
              </p>
              <p className="text-xs text-muted-foreground">
                {juaraData.length} juara tercatat
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Full Width Aktivitas */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {latestActivities.length ? (
              <ul className="divide-y divide-border">
                {latestActivities.map((item, idx) => (
                  <li
                    key={`${item.type}-${idx}`}
                    className="flex flex-col gap-1 px-4 py-3 text-sm text-foreground sm:flex-row sm:items-center sm:gap-4"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:w-32">
                      {item.type}
                    </p>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.meta || "-"}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground sm:text-right">
                      {formatDate(item.date, { day: "2-digit", month: "short" })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                Belum ada aktivitas terbaru.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
}

function EventStatusChart({ data }) {
  const colorMap = {
    open: "rgb(16, 185, 129)",
    draft: "rgb(251, 191, 36)",
    closed: "rgb(248, 113, 113)",
    default: "rgb(148, 163, 184)",
  };

  const counts = data.reduce((acc, item) => {
    const key = (item.status || "Belum diatur").toLowerCase();
    const label = item.status || "Belum diatur";
    if (!acc[key]) {
      acc[key] = { label, value: 0 };
    }
    acc[key].value += 1;
    return acc;
  }, {});

  const statuses = Object.values(counts);
  const total = statuses.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return (
      <div className="text-xs text-muted-foreground">
        Belum ada event untuk ditampilkan.
      </div>
    );
  }

  let currentAngle = 0;
  const segments = statuses.map((status) => {
    const percentage = (status.value / total) * 100;
    const startAngle = currentAngle;
    const endAngle = currentAngle + percentage;
    currentAngle = endAngle;
    const color =
      colorMap[status.label.toLowerCase()] || colorMap.default;

    return {
      ...status,
      color,
      start: startAngle,
      end: endAngle,
      percentage: Math.round(percentage),
    };
  });

  const gradient = segments
    .map(
      (segment) =>
        `${segment.color} ${segment.start}% ${segment.end}%`
    )
    .join(", ");

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="flex-1 flex items-center justify-center">
        <div className="relative h-48 w-48">
          <div
            className="h-full w-full rounded-full"
            style={{ background: `conic-gradient(${gradient})` }}
          />
          <div className="absolute inset-6 rounded-full bg-card flex flex-col items-center justify-center">
            <p className="text-2xl font-semibold">{total}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Total Event
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {segment.label}
              </p>
              <div className="flex items-center text-xs text-muted-foreground gap-2">
                <span>{segment.value} event</span>
                <span>•</span>
                <span>{segment.percentage}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreDistributionChart({ data }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="space-y-3">
      {data.map((bucket) => (
        <div key={bucket.label}>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{bucket.label}</span>
            <span>{bucket.value} score</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-slate-900 to-slate-500"
              style={{ width: `${(bucket.value / maxValue) * 100 || 4}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendBadge({ value }) {
  return (
    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-semibold text-emerald-700">
      {value}
    </span>
  );
}

function FocusEventNotice() {
  return (
    <Card className="border border-dashed border-border bg-muted">
      <CardContent className="py-6 text-sm text-muted-foreground space-y-3">
        <p>
          Anda belum memilih event fokus. Operator harus memilih satu event agar
          panel menampilkan informasi yang relevan.
        </p>
        <p>
          Buka tab <span className="font-semibold">Profil</span> dan pilih event
          fokus yang ingin Anda kelola.
        </p>
      </CardContent>
    </Card>
  );
}

function JuriDashboard({
  user,
  loading,
  scores,
  juara,
  details,
  detailsLoading,
  detailsError,
  generalError,
  scoreFeatureEnabled,
}) {
  if (!scoreFeatureEnabled) {
    return (
      <PageContainer>
        <PageHeader
          title={`Halo, ${user.username || user.email}`}
          description="Panel penilaian sedang dinonaktifkan sementara."
        />
        {generalError && (
          <p className="mb-4 text-sm text-red-500">{generalError}</p>
        )}
        <Card className="border border-dashed border-border bg-muted">
          <CardContent className="py-6 text-sm text-muted-foreground">
            Fitur score dan detail score sedang tidak tersedia. Silakan hubungi admin
            bila memerlukan akses kembali.
          </CardContent>
        </Card>
      </PageContainer>
    );
  }
  const [selectedScore, setSelectedScore] = useState(null);

  const assignedEvents = useMemo(() => {
    const map = new Map();
    scores.forEach((score) => {
      if (!score?.eventId) return;
      if (!map.has(score.eventId)) {
        map.set(score.eventId, {
          id: score.eventId,
          name: score.event?.namaEvent || "Event tidak diketahui",
          date: score.event?.tanggalEvent,
        });
      }
    });
    return Array.from(map.values());
  }, [scores]);

  const assignedEventIds = useMemo(
    () => new Set(assignedEvents.map((event) => event.id).filter(Boolean)),
    [assignedEvents]
  );

  const scopedJuara = useMemo(() => {
    if (!assignedEventIds.size) return [];
    return juara.filter((item) => assignedEventIds.has(item.eventId));
  }, [juara, assignedEventIds]);

  const groupedDetails = useMemo(() => {
    const map = new Map();
    details.forEach((detail) => {
      const scoreId = detail.scoreId || detail.score?.id;
      if (!scoreId) return;
      const eventId = detail.score?.eventId;
      if (eventId && assignedEventIds.size && !assignedEventIds.has(eventId)) {
        return;
      }
      if (!map.has(scoreId)) {
        map.set(scoreId, {
          score: detail.score,
          items: [],
        });
      }
      map.get(scoreId).items.push(detail);
    });
    return Array.from(map.values());
  }, [details, assignedEventIds]);

  const viewerDetails = useMemo(() => {
    if (!selectedScore) return [];
    return details.filter((detail) => detail.scoreId === selectedScore.id);
  }, [selectedScore, details]);

  const stats = [
    { label: "Event ditugaskan", value: assignedEvents.length },
    { label: "Score Anda", value: scores.length },
    { label: "Detail isi", value: details.length },
    { label: "Juara tercatat", value: scopedJuara.length },
  ];

  const latestScores = useMemo(
    () => (Array.isArray(scores) ? scores.slice(0, 5) : []),
    [scores]
  );
  const recentAwards = useMemo(
    () => (Array.isArray(scopedJuara) ? scopedJuara.slice(0, 5) : []),
    [scopedJuara]
  );

  return (
    <PageContainer>
      <PageHeader
        title={`Halo, ${user.username || user.email}`}
        description="Panel khusus juri untuk meninjau hasil penilaian dan menuju tab Score Detail jika perlu melengkapi kriteria."
      />

      {generalError && (
        <p className="mb-4 text-sm text-red-500">{generalError}</p>
      )}

      <div className="space-y-6">
        <section>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => (
              <Card
                key={stat.label}
                className="border border-border shadow-none"
              >
                <CardContent className="py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Card className="border border-border shadow-none">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Aksi penilaian
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Tinjau score yang telah dibuat admin/operator dan lengkapi detail kriteria jika diperlukan.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm text-muted-foreground">
                {assignedEvents.length ? (
                  assignedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-lg border border-border bg-muted px-3 py-2"
                    >
                      <p className="font-semibold text-foreground">
                        {event.name}
                      </p>
                      {event.date && (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(event.date)}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Belum ada event yang ditugaskan untuk Anda.
                  </p>
                )}
              </div>

              <div className="space-y-3 border-t border-border pt-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Score terbaru
                </p>
                {latestScores.length ? (
                  <div className="space-y-3">
                    {latestScores.map((score) => {
                      const resolvedValue = resolveScoreValue(score);
                      const manualUsed = Boolean(
                        score.useManualNilai && score.nilai != null
                      );
                      const detailScore = manualUsed
                        ? null
                        : calculateDetailScore(score.details);
                      const detailUsed = !manualUsed && detailScore != null;
                      const displayValue =
                        resolvedValue != null
                          ? formatScoreDisplay(resolvedValue, { decimals: 1 })
                          : manualUsed && score.nilai != null
                          ? formatScoreDisplay(score.nilai, { decimals: 1 })
                          : "-";

                      return (
                        <div
                          key={score.id}
                          className="rounded-lg border border-border bg-card p-3"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="font-semibold text-foreground">
                                {score.peserta?.namaTim || "Tim tidak diketahui"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {score.event?.namaEvent || "Event tidak diketahui"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-semibold text-foreground">
                                {displayValue}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {formatDate(score.createdAt)}
                                {manualUsed && (
                                  <span className="ml-2 text-muted-foreground">
                                    Manual
                                  </span>
                                )}
                                {detailUsed && (
                                  <span className="ml-2 text-emerald-600">
                                    Otomatis
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          {score.catatan && (
                            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                              Catatan: {score.catatan}
                            </p>
                          )}
                          <div className="mt-3 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => setSelectedScore(score)}
                            >
                              Detail & catatan
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Belum ada score yang dicatat.
                  </p>
                )}

                <div>
                  <p className="text-xs text-muted-foreground">Penghargaan:</p>
                  {recentAwards.length ? (
                    <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                      {recentAwards.map((award) => (
                        <li key={award.id}>
                          {award.event?.namaEvent || "Event"} • {award.juara}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground">Belum ada juara.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Card className="border border-border shadow-none">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Detail score aktif
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ringkasan kriteria per tim/event.
              </p>
            </CardHeader>
            <CardContent>
              {detailsLoading ? (
                <p className="text-sm text-muted-foreground">
                  Memuat detail score...
                </p>
              ) : groupedDetails.length ? (
                <div className="max-h-[360px] space-y-4 overflow-y-auto pr-1">
                  {groupedDetails.map((group) => (
                    <div
                      key={group.score?.id}
                      className="rounded-xl border border-border bg-card p-3"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-foreground">
                          {group.score?.peserta?.namaTim || "Tim tidak diketahui"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {group.score?.event?.namaEvent || "Event tidak diketahui"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {group.items.length} kriteria
                        </p>
                      </div>
                      <div className="mt-2 divide-y divide-border">
                        {group.items.map((detail) => (
                          <div key={detail.id} className="py-2">
                            <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">
                                {detail.kriteria}
                              </span>
                              <span>Nilai: {detail.nilai}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Bobot: {detail.bobot ?? "-"}
                            </p>
                            {detail.catatan && (
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                {detail.catatan}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada detail score yang tercatat.
                </p>
              )}
              {detailsError && (
                <p className="mt-3 text-[11px] text-red-500">{detailsError}</p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border shadow-none">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Juara yang ditetapkan
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ditetapkan oleh admin/operator berdasarkan penilaian Anda.
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Memuat data juara...
                </p>
              ) : scopedJuara.length ? (
                <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                  {scopedJuara.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-foreground">
                          {item.peserta?.namaTim || "Tim tidak diketahui"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.event?.namaEvent || "Event tidak diketahui"}
                        </p>
                        <p className="text-sm font-semibold text-emerald-600">
                          {item.juara}
                        </p>
                        {item.kategori && (
                          <p className="text-[11px] text-muted-foreground">
                            Kategori: {item.kategori}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Belum ada data juara pada event Anda.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <Dialog
        open={Boolean(selectedScore)}
        onOpenChange={(open) => {
          if (!open) setSelectedScore(null);
        }}
      >
        <DialogContent className="w-[95vw] max-w-lg rounded-xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle>Detail penilaian</DialogTitle>
            <DialogDescription>
              {selectedScore
                ? `${selectedScore.peserta?.namaTim || "Tim"} • ${
                    selectedScore.event?.namaEvent || "Event"
                  }`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {viewerDetails.length ? (
              viewerDetails.map((detail) => (
                <div
                  key={detail.id}
                  className="rounded-md border border-border bg-card p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">
                      {detail.kriteria}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      Nilai: {detail.nilai}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Bobot: {detail.bobot ?? "-"}
                  </p>
                  {detail.catatan && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {detail.catatan}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Detail belum tersedia untuk score ini.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function ParticipantDashboard({
  user,
  loading,
  teams,
  events,
  berita,
  juara,
  scores,
  scoreFeatureEnabled,
}) {
  const statusCounts = teams.reduce(
    (acc, team) => {
      acc.total += 1;
      acc[team.status] = (acc[team.status] || 0) + 1;
      return acc;
    },
    { total: 0 }
  );

  const joinedTeamIds = new Set(teams.map((team) => team.id));
  const joinedEventIds = new Set(teams.map((team) => team.eventId));
  const availableEvents = events
    .filter(
      (event) =>
        (event.status || "").toLowerCase() === "open" &&
        !joinedEventIds.has(event.id)
    );
  const latestNews = berita.slice(0, 3);
  const myAwards = juara.filter((item) => joinedTeamIds.has(item.pesertaId));
  const myScores = scoreFeatureEnabled
    ? scores
        .filter((item) => joinedTeamIds.has(item.pesertaId))
        .slice(0, 5)
    : [];

  return (
    <PageContainer>
      <PageHeader
        title={`Halo, ${user.username || user.email}`}
        description="Pantau status pendaftaran event dan perkembangan tim Anda."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Status Akun
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {user.isActive ? "Aktif" : "Menunggu"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {user.isActive
                ? "Anda dapat mengikuti event tanpa batasan."
                : "Akun masih menunggu aktivasi admin."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pendaftaran Event
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-semibold">{statusCounts.total}</p>
              <span className="text-xs text-muted-foreground">
                event yang Anda ikuti
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Pending: {statusCounts.pending || 0} • Disetujui:{" "}
              {statusCounts.approved || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Event yang Diikuti
          </h2>
          <Link
            href="/dashboard/peserta"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Kelola detail
          </Link>
        </div>
        {teams.length ? (
          <div className="space-y-3">
            {teams.map((team) => (
              <Card key={team.id} className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-foreground">
                    {team.namaTim}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {team.event?.namaEvent || "Event belum diketahui"}
                  </p>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-1">
                  <p>Status: {team.status}</p>
                  <p>
                    Anggota: {team.detailPeserta?.length || 0} • Juara:{" "}
                    {team.juara?.length || 0}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">
            Memuat daftar event yang Anda ikuti...
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Belum ada pendaftaran event. Gunakan tab Event untuk mendaftar.
          </p>
        )}
      </section>

      <section className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Event yang Bisa Diikuti
          </h2>
          <Link
            href="/dashboard/events"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Lihat semua
          </Link>
        </div>
        {availableEvents.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {availableEvents.map((event) => (
              <Card key={event.id} className="border border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-foreground">
                    {event.namaEvent}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {event.tempatEvent} •{" "}
                    {formatDate(event.tanggalEvent, {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Kuota {event.kuota ?? "-"} • Biaya{" "}
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(event.biaya || 0)}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Semua event yang terbuka sudah Anda ikuti.
          </p>
        )}
      </section>

      <section className="mt-6 space-y-4">
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Berita Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {latestNews.length ? (
              latestNews.map((item) => (
                <div key={item.id}>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.tanggal)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                Belum ada berita terbaru.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Score & Penghargaan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {myScores.length ? (
              myScores.map((score) => (
                <div key={score.id}>
                  <p className="font-semibold text-foreground">
                    {score.event?.namaEvent}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const resolvedValue = resolveScoreValue(score);
                      const manualUsed = Boolean(
                        score.useManualNilai && score.nilai != null
                      );
                      const detailScore = manualUsed
                        ? null
                        : calculateDetailScore(score.details);
                      const detailUsed = !manualUsed && detailScore != null;
                      const displayValue =
                        resolvedValue != null
                          ? formatScoreDisplay(resolvedValue, {
                              decimals: 1,
                            })
                          : "-";
                      const sourceLabel = manualUsed
                        ? "manual"
                        : detailUsed
                        ? "otomatis"
                        : null;
                      return (
                        <>
                          Nilai: {displayValue}
                          {sourceLabel && ` (${sourceLabel})`} • Juri: {" "}
                          {score.juri?.username || score.juri?.email}
                        </>
                      );
                    })()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                Belum ada penilaian untuk tim Anda.
              </p>
            )}
            {myAwards.length > 0 && (
              <div className="rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Penghargaan terbaru:{" "}
                {myAwards
                  .slice(0, 2)
                  .map(
                    (award) =>
                      `${award.juara} - ${
                        award.event?.namaEvent || "Event"
                      }`
                  )
                  .join(", ")}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
}
