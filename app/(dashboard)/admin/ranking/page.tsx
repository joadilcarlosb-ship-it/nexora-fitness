"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, BadgeCheck, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BackButton from "@/components/BackButton";
type Presenca = {
  aluno: string;
  aluno_id: string;
};

type Aluno = {
  aluno_id: string;
  foto_url?: string;
};

type Ranking = {
  aluno: string;
  aluno_id: string;
  total: number;
  foto_url?: string;
};

export default function RankingPage() {
  const [ranking, setRanking] = useState<Ranking[]>([]);

  async function buscarRanking() {
    const { data: presencasData, error } = await supabase
      .from("presencas")
      .select("aluno, aluno_id");

    if (error) {
      alert(error.message);
      return;
    }

    const { data: alunosData } = await supabase
      .from("alunos")
      .select("aluno_id, foto_url");

    const alunos = (alunosData || []) as Aluno[];
    const presencas = (presencasData || []) as Presenca[];

    const mapa = new Map<string, Ranking>();

    presencas.forEach((item) => {
      if (!mapa.has(item.aluno_id)) {
        const aluno = alunos.find(
          (a) => a.aluno_id === item.aluno_id
        );

        mapa.set(item.aluno_id, {
          aluno: item.aluno,
          aluno_id: item.aluno_id,
          total: 0,
          foto_url: aluno?.foto_url,
        });
      }

      const atual = mapa.get(item.aluno_id);

      if (atual) {
        atual.total += 1;
      }
    });

    const rankingFinal = Array.from(mapa.values()).sort(
      (a, b) => b.total - a.total
    );

    setRanking(rankingFinal);
  }

  useEffect(() => {
    buscarRanking();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <BackButton />
      <div className="flex items-center gap-3">
        <Trophy className="text-yellow-500" size={36} />

        <div>
          <h1 className="text-4xl font-black">Ranking</h1>
          <p className="text-gray-400 mt-1">
            Alunos com mais presenças.
          </p>
        </div>
      </div>

      <section className="mt-8 space-y-4">
        {ranking.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center text-gray-400">
            Nenhuma presença registrada ainda.
          </div>
        )}

        {ranking.map((item, index) => (
          <div
            key={item.aluno_id}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex items-center gap-4"
          >
            <div className="text-3xl font-black text-yellow-500 w-10">
              #{index + 1}
            </div>

            <div className="w-20 h-20 rounded-3xl bg-green-500 flex items-center justify-center overflow-hidden shrink-0">
              {item.foto_url ? (
                <img
                  src={item.foto_url}
                  alt={item.aluno}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="text-black" size={38} />
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-black">{item.aluno}</h2>

              <div className="mt-2 inline-flex items-center gap-2 bg-black border border-green-500/40 text-green-500 rounded-2xl px-3 py-2 font-black">
                <BadgeCheck size={16} />
                ID: {item.aluno_id}
              </div>

              <p className="text-gray-400 mt-3">
                {item.total} presença(s)
              </p>
            </div>

            <Medal className="text-yellow-500" />
          </div>
        ))}
      </section>
    </main>
  );
}