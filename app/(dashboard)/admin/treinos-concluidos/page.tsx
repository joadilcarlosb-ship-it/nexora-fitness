"use client";

import { useEffect, useState } from "react";
import { CheckCircle, BadgeCheck, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

type TreinoConcluido = {
  id: number;
  aluno: string;
  aluno_id: string;
  treino_id: number;
  nome_treino: string;
  data_treino: string;
  dia_semana: string;
  concluido_em: string;
};

type Aluno = {
  aluno_id: string;
  foto_url?: string;
};

export default function TreinosConcluidosPage() {
  const [treinos, setTreinos] = useState<TreinoConcluido[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  async function buscarDados() {
    const { data: treinosData, error } = await supabase
      .from("treinos_concluidos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    const { data: alunosData } = await supabase
      .from("alunos")
      .select("aluno_id, foto_url");

    setTreinos(treinosData || []);
    setAlunos(alunosData || []);
  }

  function fotoDoAluno(alunoId: string) {
    return alunos.find((aluno) => aluno.aluno_id === alunoId)?.foto_url;
  }

  useEffect(() => {
    buscarDados();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center gap-3">
        <CheckCircle className="text-green-500" size={32} />

        <div>
          <h1 className="text-4xl font-black">Treinos concluídos</h1>
          <p className="text-gray-400 mt-1">
            Veja quem finalizou os treinos.
          </p>
        </div>
      </div>

      <section className="mt-8 space-y-4">
        {treinos.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center text-gray-400">
            Nenhum treino concluído ainda.
          </div>
        )}

        {treinos.map((treino) => {
          const fotoUrl = fotoDoAluno(treino.aluno_id);

          return (
            <div
              key={treino.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-3xl bg-green-500 flex items-center justify-center overflow-hidden shrink-0">
                  {fotoUrl ? (
                    <img
                      src={fotoUrl}
                      alt={treino.aluno}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="text-black" size={38} />
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-black">{treino.aluno}</h2>

                  <div className="mt-2 inline-flex items-center gap-2 bg-black border border-green-500/40 text-green-500 rounded-2xl px-3 py-2 font-black">
                    <BadgeCheck size={16} />
                    ID: {treino.aluno_id}
                  </div>

                  <p className="text-green-500 font-bold mt-4">
                    {treino.nome_treino}
                  </p>

                  <p className="text-gray-400 mt-2">
                    {treino.dia_semana} • {treino.data_treino}
                  </p>

                  <p className="text-gray-500 text-sm mt-2">
                    Finalizado em:{" "}
                    {new Date(treino.concluido_em).toLocaleString("pt-BR")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}