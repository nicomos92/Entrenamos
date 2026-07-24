import { CheckCircle2, AlertCircle } from "lucide-react";

interface FormFeedbackProps {
  error: string | null;
  success?: boolean;
  message?: string;
}

export function FormFeedback({ error, success, message }: FormFeedbackProps) {
  if (error) {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-status-urgent/10 px-4 py-3 text-sm font-bold text-status-urgent">
        <AlertCircle size={16} strokeWidth={2.5} className="shrink-0" />
        {error}
      </p>
    );
  }

  if (success && message) {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-status-active/10 px-4 py-3 text-sm font-bold text-status-active">
        <CheckCircle2 size={16} strokeWidth={2.5} className="shrink-0" />
        {message}
      </p>
    );
  }

  return null;
}
