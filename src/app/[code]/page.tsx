import { notFound } from "next/navigation";
import { PlatePage, plateMetadata } from "../p/[code]/plate-page";

export const dynamic = "force-dynamic";

// senanfc.com.br/SNFC1, /SNFC2, ... (aceita minúscula). Qualquer outro endereço: página não encontrada.
const OK = /^snfc\d+$/i;

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return OK.test(code) ? plateMetadata(code) : {};
}

export default async function Page({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ ver?: string; ok?: string }> }) {
  const { code } = await params;
  if (!OK.test(code)) notFound();
  return <PlatePage raw={code} sp={await searchParams} />;
}
