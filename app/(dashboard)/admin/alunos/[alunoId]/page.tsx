"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  User,
  Mail,
  BadgeCheck,
} from "lucide-react";

import BackButton from "@/components/BackButton";

import { supabase } from "@/lib/supabase";

type Aluno = {
  id: number;
  nome: string;
  email: string;
  aluno_id: string;
  tipo: string;
};

export default function VerAlunoPage() {
  const params = useParams();

  const [aluno, setAluno] =
    useState<Aluno | null>(null);

  async function carregar() {
    const alunoId =
      params.alunoId;

    const { data, error } =
      await supabase
        .from("alunos")
        .select("*")
        .eq(
          "aluno_id",
          alunoId
        )
        .single();

    if (error) {
      alert(error.message);
      return;
    }

    setAluno(data);
  }

  useEffect(() => {
    carregar();
  }, []);

  if (!aluno) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Carregando...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">

      <BackButton />

      <div className="flex items-center gap-4">

        <div className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center">

          <User
            className="text-black"
            size={42}
          />

        </div>

        <div>

          <h1 className="text-4xl font-black">
            {aluno.nome}
          </h1>

          <p className="text-gray-400 mt-2">
            Perfil do aluno
          </p>

        </div>

      </div>

      <section className="mt-8 space-y-4">

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">

          <div className="flex items-center gap-3">

            <Mail className="text-yellow-400" />

            <div>

              <p className="text-gray-400 text-sm">
                E-mail
              </p>

              <h2 className="font-black text-lg mt-1">
                {aluno.email}
              </h2>

            </div>

          </div>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">

          <div className="flex items-center gap-3">

            <BadgeCheck className="text-yellow-400" />

            <div>

              <p className="text-gray-400 text-sm">
                ID do aluno
              </p>

              <h2 className="font-black text-lg mt-1">
                {aluno.aluno_id}
              </h2>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}