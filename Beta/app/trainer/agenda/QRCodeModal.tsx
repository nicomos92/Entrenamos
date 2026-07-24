"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { X } from "lucide-react";

interface QRCodeModalProps {
  appointmentId: string;
  studentName: string;
  scheduledAt: string;
  onClose: () => void;
}

export function QRCodeModal({ appointmentId, studentName, scheduledAt, onClose }: QRCodeModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const checkinUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/checkin?appointmentId=${appointmentId}`
        : `https://entrenamos.app/checkin?appointmentId=${appointmentId}`;

    QRCode.toDataURL(checkinUrl, { width: 200, margin: 2 }).then(setQrDataUrl);
  }, [appointmentId]);

  const dateStr = new Date(scheduledAt).toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      ref={overlayRef}
    >
      <div className="animate-scale rounded-3xl bg-white p-6 shadow-lift">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-text-muted">Check-in QR</p>
          <button
            className="grid size-8 place-items-center rounded-xl bg-white/50 text-text-muted hover:bg-white/70"
            onClick={onClose}
            type="button"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <p className="mb-1 text-lg font-bold">{studentName}</p>
        <p className="mb-4 text-sm text-text-muted">{dateStr}</p>

        {qrDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="QR de check-in" className="mx-auto w-48 rounded-2xl bg-white p-3 shadow-soft" src={qrDataUrl} />
        )}

        <p className="mt-4 text-center text-xs text-text-muted">
          Escaneá el código con la cámara del teléfono para hacer check-in
        </p>
      </div>
    </div>
  );
}
