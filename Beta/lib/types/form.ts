export interface FormState {
  error: string | null;
  success?: boolean;
  message?: string;
}

export const emptyFormState: FormState = { error: null };
