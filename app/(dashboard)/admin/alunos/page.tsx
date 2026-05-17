"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, User, BadgeCheck, Pencil, ChartColumn } from "lucide-react";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";

type Aluno = {
  id: number;
  nome: string;
  email: string;
  aluno_id: string;
  tipo: string | null;
  foto_url?: string;
};

export default function AdminAlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  async function carregarAlunos() {
    const { data, error } = await supabase
      .from("alunos")
      .select("*")
      .or("tipo.is.null,tipo.eq.aluno")
      .order("nome", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setAlunos(data || []);
  }

  useEffect(() => {
    carregarAlunos();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <BackButton />

      <div className="flex items-center gap-3">
        <Users className="text-yellow-400" size={34} />

        <div>
          <h1 className="text-4xl font-black">Alunos</h1>
          <p className="text-gray-400 mt-1">Lista de alunos cadastrados.</p>
        </div>
      </div>

      <section className="mt-8 space-y-4">
        {alunos.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center text-gray-400">
            Nenhum aluno cadastrado.
          </div>
        )}

        {alunos.map((aluno) => (
          <div
            key={aluno.id}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-3xl bg-yellow-400 flex items-center justify-center overflow-hidden shrink-0">
                {aluno.foto_url ? (
                  <img
                    src={aluno.foto_url}
                    alt={aluno.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="text-black" size={38} />
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-black">{aluno.nome}</h2>

                <p className="text-gray-400 mt-1">{aluno.email}</p>

                <div className="inline-flex items-center gap-2 mt-3 bg-black border border-yellow-400/30 rounded-2xl px-3 py-2">
                  <BadgeCheck className="text-yellow-400" size={18} />

                  <span className="font-black text-yellow-400">
                    ID: {aluno.aluno_id}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <Link
                href={`/admin/alunos/${aluno.aluno_id}`}
                className="bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-2xl p-4 flex items-center justify-center gap-2"
              >
                <ChartColumn size={18} />
                Evolução
              </Link>

              <Link
                href={`/admin/alunos/editar/${aluno.aluno_id}`}
                className="bg-black border border-zinc-800 hover:border-yellow-400 text-white font-black rounded-2xl p-4 flex items-center justify-center gap-2"
              >
                <Pencil size={18} />
                Editar
              </Link>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}