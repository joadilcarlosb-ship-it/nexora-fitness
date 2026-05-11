"use client";

import { useEffect, useState } from "react";

import {
  Camera,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type EvolucaoFoto = {
  id: number;
  foto_antes: string;
  foto_depois: string;
  created_at: string;
};

export default function AntesDepoisPage() {
  const [fotos, setFotos] =
    useState<EvolucaoFoto[]>([]);

  async function buscarFotos() {
    const { data: authData } =
      await supabase.auth.getUser();

    const user = authData.user;

    if (!user?.email) return;

    const { data: alunoData } =
      await supabase
        .from("alunos")
        .select("*")
        .eq("email", user.email)
        .single();

    if (!alunoData) return;

    const { data, error } =
      await supabase
        .from("evolucao_fotos")
        .select("*")
        .eq(
          "aluno_id",
          alunoData.aluno_id
        )
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      alert(error.message);
      return;
    }

    setFotos(data || []);
  }

  useEffect(() => {
    buscarFotos();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-28">

      <div className="flex items-center gap-3">

        <Camera
          className="text-green-500"
          size={32}
        />

        <div>

          <h1 className="text-4xl font-black">
            Antes e Depois
          </h1>

          <p className="text-gray-400 mt-1">
            Sua evolução visual.
          </p>

        </div>

      </div>

      {fotos.length === 0 && (
        <section className="mt-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">

          <Sparkles
            className="text-green-500 mx-auto"
            size={48}
          />

          <h2 className="text-2xl font-black mt-4">
            Nenhuma foto ainda
          </h2>

          <p className="text-gray-400 mt-2">
            Seu personal ainda não
            adicionou fotos de
            evolução.
          </p>

        </section>
      )}

      <section className="mt-8 space-y-8">

        {fotos.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-5"
          >

            <div className="flex items-center justify-between">

              <h2 className="text-2xl font-black">
                Evolução
              </h2>

              <p className="text-gray-400 text-sm">
                {new Date(
                  item.created_at
                ).toLocaleDateString(
                  "pt-BR"
                )}
              </p>

            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">

              <div>

                <p className="text-center font-black text-red-400 mb-3">
                  ANTES
                </p>

                <img
                  src={item.foto_antes}
                  alt="Antes"
                  className="w-full h-[300px] object-cover rounded-3xl border border-zinc-800"
                />

              </div>

              <div>

                <p className="text-center font-black text-green-500 mb-3">
                  DEPOIS
                </p>

                <img
                  src={item.foto_depois}
                  alt="Depois"
                  className="w-full h-[300px] object-cover rounded-3xl border border-zinc-800"
                />

              </div>

            </div>

            <div className="mt-6 flex items-center justify-center gap-3 text-green-500 font-black">

              <span>Transformação</span>

              <ArrowRight size={20} />

              <span>Evolução</span>

            </div>

          </div>
        ))}

      </section>

      <BottomNav />

    </main>
  );
}