"use client";
import { useActionState, useState } from "react";
import { createUserAction, resetPasswordAction } from "@/app/actions/team";
import { Msg, Submit } from "@/components/form-bits";

export function NewUser() {
  const [state, action] = useActionState(createUserAction, undefined);
  return (
    <form action={action} className="space-y-2">
      <input name="name" className="input" placeholder="Nome" required />
      <input name="login" className="input" placeholder="Usuário para entrar (ex.: joao)" autoCapitalize="none" required />
      <input name="password" type="password" className="input" placeholder="Senha (mín. 8)" autoComplete="new-password" required />
      <select name="role" className="input" defaultValue="SELLER">
        <option value="SELLER">Vendedor (ativa e configura placas)</option>
        <option value="ADMIN">Dono (tudo, inclusive lotes e equipe)</option>
      </select>
      <Msg state={state} />
      <Submit pending="Criando...">Adicionar</Submit>
    </form>
  );
}

export function ResetPassword({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(resetPasswordAction, undefined);
  if (!open) return <button onClick={() => setOpen(true)} className="text-xs font-semibold text-brand-600">trocar senha</button>;
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex gap-2">
        <input name="password" type="password" className="input" placeholder="Nova senha" autoComplete="new-password" />
        <Submit className="btn-primary shrink-0" pending="...">Trocar</Submit>
      </div>
      <Msg state={state} />
    </form>
  );
}
