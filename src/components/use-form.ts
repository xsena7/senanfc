"use client";
import { useActionState, startTransition, type FormEvent } from "react";
import type { FormState } from "@/app/actions/auth";

/** Igual ao useActionState, mas não apaga o que foi digitado quando dá erro. */
export function useKeepForm(action: (s: FormState, f: FormData) => Promise<FormState>) {
  const [state, run, pending] = useActionState(action, undefined);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => run(fd));
  };
  return { state, onSubmit, pending };
}
