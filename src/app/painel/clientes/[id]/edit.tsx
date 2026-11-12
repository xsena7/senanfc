"use client";
import { updateClientAction } from "@/app/actions/clients";
import { ClientFields, type ClientValues } from "@/components/client-fields";
import { Msg } from "@/components/form-bits";
import { useKeepForm } from "@/components/use-form";

export function EditClient({ c }: { c: ClientValues & { id: string } }) {
  const { state, onSubmit, pending } = useKeepForm(updateClientAction);
  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <input type="hidden" name="clientId" value={c.id} />
      <ClientFields v={c} />
      <Msg state={state} />
      <button disabled={pending} className="btn-primary w-full">{pending ? "Salvando..." : "Salvar"}</button>
    </form>
  );
}
