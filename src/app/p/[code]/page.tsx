import { PlatePage, plateMetadata } from "./plate-page";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  return plateMetadata((await params).code);
}

export default async function Page({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ ver?: string; ok?: string }> }) {
  return <PlatePage raw={(await params).code} sp={await searchParams} />;
}
