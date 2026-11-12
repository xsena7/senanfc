"use client";
import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Msg, Submit } from "@/components/form-bits";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="card space-y-3">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label">Usuário</label>
        <input name="login" className="input" autoCapitalize="none" autoCorrect="off" autoComplete="username" required />
      </div>
      <div>
        <label className="label">Senha</label>
        <input name="password" type="password" className="input" autoComplete="current-password" required />
      </div>
      <Msg state={state} />
      <Submit pending="Entrando...">Entrar</Submit>
    </form>
  );
}
