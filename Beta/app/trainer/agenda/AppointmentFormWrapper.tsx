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

function parseEditData(data: NonNullable<AppointmentFormWrapperProps["editData"]>) {
  const d = new Date(data.scheduledAt);
  const date = d.toISOString().slice(0, 10);
  const time = d.toISOString().slice(11, 16);
  return {
    id: data.id,
    studentId: data.studentId,
    date,
    time,
    durationMinutes: data.durationMinutes,
    notes: data.notes,
    recurringRule: data.recurringRule,
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
