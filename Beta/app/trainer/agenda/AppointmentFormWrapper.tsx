"use client";

import { useState, useCallback } from "react";
import { AppointmentForm } from "@/app/trainer/agenda/AppointmentForm";

interface AppointmentFormWrapperProps {
  studentOptions: { id: string; name: string }[];
  editData?: {
    id: string;
    studentId: string;
    scheduledAt: string;
    durationMinutes: number;
    notes: string;
    recurringRule?: string | null;
  } | null;
  renderTrigger?: (onClick: () => void) => React.ReactNode;
}

function diaSemanaFromDate(dateStr: string): string {
  return String(new Date(dateStr).getDay());
}

function timeFromDate(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function parseEditData(data: NonNullable<AppointmentFormWrapperProps["editData"]>) {
  const time = timeFromDate(data.scheduledAt);
  return {
    id: data.id,
    studentId: data.studentId,
    diaSemana: diaSemanaFromDate(data.scheduledAt),
    time,
    durationMinutes: data.durationMinutes,
    notes: data.notes,
  };
}

export function AppointmentFormWrapper({ studentOptions, editData: initialEditData, renderTrigger }: AppointmentFormWrapperProps) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(() => (initialEditData ? parseEditData(initialEditData) : null));

  const handleEdit = useCallback(() => {
    if (initialEditData) {
      setEditData(parseEditData(initialEditData));
      setEditing(true);
    }
  }, [initialEditData]);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setEditData(null);
  }, []);

  if (editing && editData) {
    return <AppointmentForm editData={editData} onCancelEdit={handleCancel} studentOptions={studentOptions} />;
  }

  if (renderTrigger && initialEditData) {
    return <>{renderTrigger(handleEdit)}</>;
  }

  return <AppointmentForm studentOptions={studentOptions} />;
}
