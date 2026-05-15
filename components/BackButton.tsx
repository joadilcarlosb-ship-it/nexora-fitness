"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  texto?: string;
};

export default function BackButton({
  texto = "Voltar",
}: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="
        mb-6
        inline-flex
        items-center
        gap-2
        bg-zinc-900
        border
        border-zinc-800
        hover:border-yellow-400
        hover:bg-zinc-800
        transition-all
        duration-200
        text-yellow-400
        font-black
        rounded-2xl
        px-5
        py-3
        shadow-lg
      "
    >
      <ArrowLeft size={20} />

      <span>{texto}</span>
    </button>
  );
}