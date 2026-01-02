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

function EventListItem({ event, registration, onRegister, onCancel, onViewDetail }) {
  const isRegistered = !!registration;
  const memberCount = registration?.detailPeserta?.length || 0;
  const photoUrl = event.photoPath ? resolveMediaUrl(event.photoPath) : null;

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
    <div className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <button
          onClick={onViewDetail}
          className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted transition-transform hover:scale-105"
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={event.namaEvent}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Trophy className="h-8 w-8 text-muted-foreground/40" />
            </div>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <button
              onClick={onViewDetail}
              className="flex-1 text-left min-w-0"
            >
              <h3 className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {event.namaEvent}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                {event.tanggalMulai && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(event.tanggalMulai)}
                  </span>
                )}
                {event.lokasi && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.lokasi}
                    </span>
                  </>
                )}
              </div>
            </button>

            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}>
              {statusConfig.icon}
              {statusConfig.text}
            </div>
          </div>

          {/* Registration Info */}
          {isRegistered && (
            <div className="mb-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{registration.namaTim}</span>
              {" • "}
              <span>{memberCount} anggota</span>
              {registration.eventCategory && (
                <>
                  {" • "}
                  <span>{registration.eventCategory.name}</span>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onViewDetail}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
            >
              <Info className="mr-1 h-3 w-3" />
              Detail
            </Button>
            
            {isRegistered ? (
              <Button
                onClick={() => onCancel(registration)}
                variant="outline"
                size="sm"
                className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                <X className="mr-1 h-3 w-3" />
                Batalkan
              </Button>
            ) : (
              <Button
                onClick={() => onRegister(event)}
                size="sm"
                className="h-8 text-xs"
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Daftar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ParticipantEventList({ events, registrations, onRegister, onCancel }) {
  const [filter, setFilter] = useState("all"); // all, registered, available
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const filteredEvents = events.filter((event) => {
    const registration = registrations.find((r) => r.eventId === event.id);
    if (filter === "registered") return !!registration;
    if (filter === "available") return !registration;
    return true;
  });

  const registeredCount = registrations.length;
  const availableCount = events.length - registeredCount;
  const pendingCount = registrations.filter((r) => r.status === "pending").length;
  const approvedCount = registrations.filter((r) => r.status === "approved").length;

  const handleViewDetail = (event) => {
    setSelectedEvent(event);
    setDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-muted p-1">
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
            filter === "all"
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            Semua Event
            <Badge variant="outline" className={filter === "all" ? "border-primary/20 bg-primary/10 text-primary" : ""}>
              {events.length}
            </Badge>
          </span>
        </button>
        <button
          onClick={() => setFilter("registered")}
          className={`flex-1 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
            filter === "registered"
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Terdaftar
            <Badge variant="outline" className={filter === "registered" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>
              {registeredCount}
            </Badge>
          </span>
        </button>
        <button
          onClick={() => setFilter("available")}
          className={`flex-1 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-semibold transition-all ${
            filter === "available"
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4" />
            Tersedia
            <Badge variant="outline" className={filter === "available" ? "border-primary/20 bg-primary/10 text-primary" : ""}>
              {availableCount}
            </Badge>
          </span>
        </button>
      </div>

      {/* Event List */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-3">
          {filteredEvents.map((event) => {
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
      ) : (
        <div className="rounded-xl border-2 border-dashed border-border bg-muted p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            {filter === "registered" ? (
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            ) : filter === "available" ? (
              <Trophy className="h-8 w-8 text-muted-foreground" />
            ) : (
              <Calendar className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <p className="text-base font-semibold text-foreground mb-1">
            {filter === "registered"
              ? "Belum Ada Pendaftaran"
              : filter === "available"
              ? "Semua Event Sudah Diikuti"
              : "Belum Ada Event"}
          </p>
          <p className="text-sm text-muted-foreground">
            {filter === "registered"
              ? "Anda belum mendaftar di event manapun. Pilih event yang tersedia dan daftar sekarang!"
              : filter === "available"
              ? "Selamat! Anda sudah terdaftar di semua event yang tersedia."
              : "Belum ada event yang dibuka. Tunggu pengumuman dari panitia."}
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
