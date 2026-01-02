"use client";

import { CheckCircle2, Circle, AlertCircle, Users, FileText, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function ProgressStep({ number, title, description, status, icon: Icon, onClick }) {
  const isComplete = status === "complete";
  const isActive = status === "active";
  const isPending = status === "pending";

  return (
    <div className="flex gap-4">
      {/* Icon Circle */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
            isComplete
              ? "border-emerald-500 bg-emerald-50 text-emerald-600"
              : isActive
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-muted text-muted-foreground"
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        {/* Connector Line */}
        <div className="mt-1 h-full w-0.5 bg-muted" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          {isComplete && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Selesai
            </span>
          )}
        </div>
        {onClick && (
          <Button
            size="sm"
            variant={isActive && !isComplete ? "default" : "outline"}
            onClick={onClick}
            className="mt-2"
          >
            {isComplete ? "Lihat Detail" : isActive ? "Lengkapi Sekarang" : "Lihat"}
          </Button>
        )}
      </div>
    </div>
  );
}

export function RegistrationProgress({ pesertaData, detailPesertaData, onAddDetail, onViewDetail, onGoToEvents }) {
  // Determine progress steps
  const hasTeamRegistration = !!pesertaData;
  const hasMembers = detailPesertaData && detailPesertaData.length > 0;
  const hasPartisipasi = pesertaData?.partisipasi?.linkDrive;
  const isJuara = pesertaData?.juara?.length > 0;

  const steps = [
    {
      number: 1,
      title: "Pendaftaran Event",
      description: hasTeamRegistration
        ? `Tim "${pesertaData.namaTim}" terdaftar untuk ${pesertaData.event?.namaEvent}`
        : "Daftar event terlebih dahulu di halaman Event",
      status: hasTeamRegistration ? "complete" : "active",
      icon: FileText,
      onClick: hasTeamRegistration ? null : onGoToEvents,
    },
    {
      number: 2,
      title: "Anggota Tim",
      description: hasMembers
        ? `${detailPesertaData.length} anggota sudah ditambahkan`
        : "Tambahkan detail anggota tim Anda",
      status: hasTeamRegistration
        ? hasMembers
          ? "complete"
          : "active"
        : "pending",
      icon: Users,
      onClick: hasMembers ? onViewDetail : onAddDetail,
    },
    {
      number: 3,
      title: "Upload Karya",
      description: hasPartisipasi
        ? "Link Google Drive sudah diupload"
        : "Upload link Google Drive berisi karya Anda",
      status: hasMembers
        ? hasPartisipasi
          ? "complete"
          : "active"
        : "pending",
      icon: FileText,
      onClick: null,
    },
    {
      number: 4,
      title: "Hasil Perlombaan",
      description: isJuara
        ? `Selamat! Tim Anda meraih ${pesertaData.juara[0].juara}`
        : "Menunggu pengumuman hasil perlombaan",
      status: isJuara ? "complete" : "pending",
      icon: Award,
      onClick: null,
    },
  ];

  const completedSteps = steps.filter((s) => s.status === "complete").length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Progress Pendaftaran</CardTitle>
            <CardDescription>
              Ikuti langkah-langkah berikut untuk menyelesaikan pendaftaran
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{completedSteps}/{steps.length}</div>
            <div className="text-xs text-muted-foreground">Langkah Selesai</div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <ProgressStep key={index} {...step} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
