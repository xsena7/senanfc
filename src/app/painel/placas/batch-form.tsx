"use client";
import { useActionState } from "react";
import { createBatchAction } from "@/app/actions/plates";
import { Msg, Submit } from "@/components/form-bits";

export function BatchForm() {
  const [state, action] = useActionState(createBatchAction, undefined);
  return (
    <form action={action} className="space-y-2">
      <div className="flex gap-2">
        <input name="qty" type="number" min={1} max={500} defaultValue={10} className="input" />
        <Submit className="btn-primary shrink-0" pending="Gerando...">Gerar</Submit>
      </div>
      <Msg state={state} />
    </form>
  );
}
