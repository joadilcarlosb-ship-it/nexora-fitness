"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="mb-6 flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:border-yellow-400 transition rounded-2xl px-5 py-3 text-yellow-400 font-black text-lg"
    >
      <ArrowLeft size={22} />

      Voltar
    </button>
  );
}