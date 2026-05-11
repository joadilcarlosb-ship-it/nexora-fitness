"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Dumbbell,
  Trash2,
  BadgeCheck,
  User,
  Pencil,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Treino = {
  id: number;
  aluno: string;
  aluno_id: string;
  nome_treino: string;
  exercicios: string;
  dia_semana: string;
  data_treino: string;
};

type Aluno = {
  aluno_id: string;
  foto_url?: string;
};

export default function VerTreinosPage() {
  const [treinos, setTreinos] =
    useState<Treino[]>([]);

  const [alunos, setAlunos] =
    useState<Aluno[]>([]);

  async function buscarDados() {
    const {
      data: treinosData,
      error: treinosError,
    } = await supabase
      .from("treinos")
      .select("*")
      .order("data_treino", {
        ascending: true,
      });

    if (treinosError) {
      alert(treinosError.message);
      return;
    }

    const { data: alunosData } =
      await supabase
        .from("alunos")
        .select(
          "aluno_id, foto_url"
        );

    setTreinos(treinosData || []);
    setAlunos(alunosData || []);
  }

  function fotoDoAluno(
    alunoId: string
  ) {
    return alunos.find(
      (aluno) =>
        aluno.aluno_id ===
        alunoId
    )?.foto_url;
  }

  async function excluirTreino(
    id: number
  ) {
    const confirmar = confirm(
      "Deseja excluir este treino?"
    );

    if (!confirmar) return;

    const { error } =
      await supabase
        .from("treinos")
        .delete()
        .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    buscarDados();
  }

  useEffect(() => {
    buscarDados();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">

      <div className="flex items-center gap-3">

        <Dumbbell
          className="text-green-500"
          size={32}
        />

        <div>
          <h1 className="text-4xl font-black">
            Treinos
          </h1>

          <p className="text-gray-400 mt-1">
            Treinos enviados aos
            alunos.
          </p>
        </div>

      </div>

      <section className="mt-8 space-y-5">

        {treinos.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center text-gray-400">
            Nenhum treino cadastrado.
          </div>
        )}

        {treinos.map((treino) => {
          const fotoUrl =
            fotoDoAluno(
              treino.aluno_id
            );

          return (
            <div
              key={treino.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
            >

              <div className="flex items-start gap-4">

                <div className="w-20 h-20 rounded-3xl bg-green-500 flex items-center justify-center overflow-hidden shrink-0">

                  {fotoUrl ? (
                    <img
                      src={fotoUrl}
                      alt={
                        treino.aluno
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User
                      className="text-black"
                      size={38}
                    />
                  )}

                </div>

                <div className="flex-1">

                  <h2 className="text-2xl font-black">
                    {treino.aluno}
                  </h2>

                  <div className="mt-2 inline-flex items-center gap-2 bg-black border border-green-500/40 text-green-500 rounded-2xl px-3 py-2 font-black">

                    <BadgeCheck
                      size={16}
                    />

                    ID:{" "}
                    {
                      treino.aluno_id
                    }

                  </div>

                  <p className="text-green-500 font-black mt-4">
                    {
                      treino.nome_treino
                    }
                  </p>

                  <p className="text-gray-400 mt-2">
                    {
                      treino.dia_semana
                    }{" "}
                    •{" "}
                    {
                      treino.data_treino
                    }
                  </p>

                </div>

                <button
                  onClick={() =>
                    excluirTreino(
                      treino.id
                    )
                  }
                  className="bg-red-500/10 hover:bg-red-500/20 transition p-3 rounded-2xl h-fit"
                >

                  <Trash2 className="text-red-500" />

                </button>

              </div>

              <pre className="mt-5 whitespace-pre-wrap text-gray-300 font-sans bg-black border border-zinc-800 rounded-2xl p-4">

                {
                  treino.exercicios
                }

              </pre>

              <Link
                href={`/admin/ver-treinos/editar/${treino.id}`}
                className="block mt-4 bg-zinc-800 hover:border-green-500 border border-zinc-700 transition text-white text-center font-black rounded-2xl p-4"
              >

                <div className="flex items-center justify-center gap-2">

                  <Pencil size={18} />

                  Editar treino

                </div>

              </Link>

            </div>
          );
        })}

      </section>

    </main>
  );
}