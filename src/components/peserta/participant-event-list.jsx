"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, Users, CheckCircle2, Clock, ArrowRight, MapPin, Trophy, Tag, AlertCircle, X, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { resolveMediaUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default: "bg-primary/10 text-primary border-primary/20",
    outline: "bg-card border-border text-foreground",
  };
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";
  return (
    <span className={`${baseClasses} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}

function EventDetailDialog({ event, open, onOpenChange }) {
  if (!event) return null;
  
  const photoUrl = event.photoPath ? resolveMediaUrl(event.photoPath) : null;
  const categories = event.categories || [];
  const hasPrize = event.hadiah && parseFloat(event.hadiah) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{event.namaEvent}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Image */}
          {photoUrl && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={photoUrl}
                alt={event.namaEvent}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                unoptimized
              />
            </div>
          )}

          {/* Event Info Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted p-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Tanggal</p>
                <p className="text-sm font-semibold text-foreground">
                  {event.tanggalMulai ? formatDate(event.tanggalMulai) : "Belum ditentukan"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted p-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Lokasi</p>
                <p className="text-sm font-semibold text-foreground">
                  {event.lokasi || "Belum ditentukan"}
                </p>
              </div>
            </div>

            {hasPrize && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <Trophy className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-700">Total Hadiah</p>
                  <p className="text-sm font-bold text-amber-900">
                    {formatCurrency(event.hadiah)}
                  </p>
                </div>
              </div>
            )}

            {event.pesertaCount > 0 && (
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted p-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Peserta</p>
                  <p className="text-sm font-semibold text-foreground">
                    {event.pesertaCount} tim terdaftar
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Kategori</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5">
                    <p className="text-sm font-medium text-primary">{cat.name}</p>
                    {cat.quota && (
                      <p className="text-xs text-muted-foreground">Kuota: {cat.quota}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {event.deskripsi && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">Deskripsi</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {event.deskripsi}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProgressBar({ current, total, className = "" }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-muted-foreground min-w-fit">{current}/{total}</span>
    </div>
  );
}

function EventListItem({ event, registration, onRegister, onCancel, onViewDetail }) {
  const isRegistered = !!registration;
  const memberCount = registration?.detailPeserta?.length || 0;
  
  // Count members with complete profile (namaLengkap filled)
  const completedMembers = registration?.detailPeserta?.filter(
    (d) => d.namaLengkap && d.namaLengkap.trim().length > 0
  )?.length || 0;
  
  const photoUrl = event.photoPath ? resolveMediaUrl(event.photoPath) : null;
  const hasPrize = event.hadiah && parseFloat(event.hadiah) > 0;

  const getStatusConfig = () => {
    if (!isRegistered) {
      return {
        text: "Belum Daftar",
        className: "bg-muted text-foreground border-border",
        icon: null,
      };
    }
    
    if (registration.status === "pending") {
      return {
        text: "Menunggu",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <Clock className="h-3.5 w-3.5" />,
      };
    }
    
    if (registration.status === "approved") {
      return {
        text: "Dikonfirmasi",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      };
    }
    
    if (registration.status === "rejected") {
      return {
        text: "Ditolak",
        className: "bg-rose-50 text-rose-700 border-rose-200",
        icon: <AlertCircle className="h-3.5 w-3.5" />,
      };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="group rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-lg overflow-hidden">
      {/* Header dengan foto dan status */}
      <div className="relative">
        {/* Photo */}
        <button
          onClick={onViewDetail}
          className="relative h-32 w-full bg-muted overflow-hidden transition-transform group-hover:scale-105 block"
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={event.namaEvent}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Trophy className="h-12 w-12 text-primary/30" />
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </button>

        {/* Status badge positioned over image */}
        <div className="absolute top-3 right-3 z-10">
          <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm bg-card/90 ${statusConfig.className}`}>
            {statusConfig.icon}
            {statusConfig.text}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title and date/location */}
        <div>
          <button
            onClick={onViewDetail}
            className="text-left w-full"
          >
            <h3 className="font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {event.namaEvent}
            </h3>
          </button>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
            {event.tanggalMulai && (
              <span className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(event.tanggalMulai)}
              </span>
            )}
            {event.lokasi && (
              <span className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md">
                <MapPin className="h-3.5 w-3.5" />
                {event.lokasi}
              </span>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          {isRegistered && (
            <StatCard
              label="Anggota"
              value={memberCount}
              icon={Users}
              color="primary"
            />
          )}
          {event.pesertaCount > 0 && (
            <StatCard
              label="Peserta"
              value={event.pesertaCount}
              icon={Users}
              color="slate"
            />
          )}
          {hasPrize && (
            <StatCard
              label="Hadiah"
              value={formatCurrency(event.hadiah)}
              icon={Trophy}
              color="amber"
            />
          )}
        </div>

        {/* Registration details */}
        {isRegistered && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-3 border border-border/50">
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Tim Anda</p>
              <p className="font-semibold text-sm text-foreground break-words">
                {registration.namaTim || "-"}
              </p>
              {registration.eventCategory && (
                <p className="text-xs text-muted-foreground mt-2">
                  <Tag className="h-3 w-3 inline mr-1" />
                  {registration.eventCategory.name}
                </p>
              )}
            </div>

            {/* Member progress - only show if there are members */}
            {memberCount > 0 && (
              <div className="space-y-2 pt-1 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium">Progress Anggota</p>
                  <span className="text-xs font-bold text-primary">{completedMembers}/{memberCount}</span>
                </div>
                <ProgressBar
                  current={completedMembers}
                  total={memberCount}
                />
                {completedMembers < memberCount && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1">
                    {memberCount - completedMembers} anggota belum mengisi profil lengkap
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Description preview */}
        {event.deskripsi && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {event.deskripsi}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border/50">
          <Button
            onClick={onViewDetail}
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs"
          >
            <Info className="mr-1.5 h-3.5 w-3.5" />
            Detail Lengkap
          </Button>
          
          {isRegistered && registration.status !== "approved" ? (
            <Button
              onClick={() => onCancel(registration)}
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Batalkan
            </Button>
          ) : !isRegistered ? (
            <Button
              onClick={() => onRegister(event)}
              size="sm"
              className="flex-1 h-9 text-xs"
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Daftar Sekarang
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ParticipantEventList({ events, registrations, onRegister, onCancel }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const now = new Date();

  // Separate upcoming and finished events
  const upcomingEvents = events
    .filter((event) => event.tanggalMulai && new Date(event.tanggalMulai) > now)
    .sort((a, b) => new Date(a.tanggalMulai) - new Date(b.tanggalMulai));

  const finishedEvents = events
    .filter((event) => !event.tanggalMulai || new Date(event.tanggalMulai) <= now)
    .sort((a, b) => new Date(b.tanggalMulai || 0) - new Date(a.tanggalMulai || 0));

  const handleViewDetail = (event) => {
    setSelectedEvent(event);
    setDetailDialogOpen(true);
  };

  const renderEventSection = (title, eventList) => {
    if (eventList.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventList.map((event) => {
            const registration = registrations.find((r) => r.eventId === event.id);
            return (
              <EventListItem
                key={event.id}
                event={event}
                registration={registration}
                onRegister={onRegister}
                onCancel={onCancel}
                onViewDetail={() => handleViewDetail(event)}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Upcoming Events Section */}
      {renderEventSection("Event Mendatang", upcomingEvents)}

      {/* Finished Events Section */}
      {renderEventSection("Event Selesai", finishedEvents)}

      {/* Empty State */}
      {events.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-border bg-muted p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-base font-semibold text-foreground mb-1">
            Belum Ada Event
          </p>
          <p className="text-sm text-muted-foreground">
            Belum ada event yang dibuka. Tunggu pengumuman dari panitia.
          </p>
        </div>
      )}

      {/* Event Detail Dialog */}
      <EventDetailDialog
        event={selectedEvent}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}
