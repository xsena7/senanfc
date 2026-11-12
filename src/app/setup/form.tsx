"use client";
import { useActionState } from "react";
import { setupAction } from "@/app/actions/auth";
import { Msg, Submit } from "@/components/form-bits";

export function SetupForm() {
  const [state, action] = useActionState(setupAction, undefined);
  return (
    <form action={action} className="card space-y-3">
      <div>
        <label className="label">Seu nome</label>
        <input name="name" className="input" required />
      </div>
      <div>
        <label className="label">Usuário (para entrar)</label>
        <input name="login" className="input" autoCapitalize="none" autoCorrect="off" placeholder="ex.: joao" required />
      </div>
      <div>
        <label className="label">Senha (mín. 8)</label>
        <input name="password" type="password" className="input" autoComplete="new-password" required />
      </div>
      <Msg state={state} />
      <Submit pending="Criando...">Criar conta</Submit>
    </form>
  );
}
