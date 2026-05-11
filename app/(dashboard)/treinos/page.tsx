"use client";

import BottomNav from "@/components/BottomNav";
import { useEffect, useState } from "react";
import {
  CheckCircle,
  Circle,
  Dumbbell,
  Lock,
  Timer,
  RotateCcw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Treino = {
  id: number;
  aluno_id: string;
  aluno: string;
  nome_treino: string;
  exercicios: string;
  dia_semana: string;
  data_treino: string;
};

type Plano = {
  id: number;
  aluno_id: string;
  plano: string;
  valor: number;
  vencimento: string;
  status: string;
};

type TreinoConcluido = {
  treino_id: number;
};

export default function TreinosPage() {
  const [alunoId, setAlunoId] = useState("");
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [plano, setPlano] = useState<Plano | null>(null);
  const [concluidos, setConcluidos] = useState<string[]>([]);
  const [treinosConcluidos, setTreinosConcluidos] = useState<number[]>([]);
  const [tempo, setTempo] = useState(60);
  const [rodando, setRodando] = useState(false);

  const planoVencido =
    plano && new Date(plano.vencimento) < new Date();

  async function buscarDados() {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user?.email) return;

    const { data: alunoData, error: alunoError } = await supabase
      .from("alunos")
      .select("*")
      .eq("email", user.email)
      .single();

    if (alunoError) {
      alert(alunoError.message);
      return;
    }

    setAlunoId(alunoData.aluno_id);

    const { data: treinosData } = await supabase
      .from("treinos")
      .select("*")
      .eq("aluno_id", alunoData.aluno_id)
      .order("data_treino", { ascending: true });

    const { data: planosData } = await supabase
      .from("planos")
      .select("*")
      .eq("aluno_id", alunoData.aluno_id)
      .order("id", { ascending: false })
      .limit(1);

    const { data: concluidosData } = await supabase
      .from("treinos_concluidos")
      .select("treino_id")
      .eq("aluno_id", alunoData.aluno_id);

    setTreinos(treinosData || []);
    setPlano(planosData?.[0] || null);

    setTreinosConcluidos(
      (concluidosData as TreinoConcluido[] | null)?.map(
        (item) => item.treino_id
      ) || []
    );
  }

  function alternarExercicio(id: string) {
    if (concluidos.includes(id)) {
      setConcluidos(concluidos.filter((item) => item !== id));
      return;
    }

    setConcluidos([...concluidos, id]);
    setTempo(60);
    setRodando(true);
  }

  function limparMarcacoesDoTreino(treinoId: number) {
    setConcluidos(
      concluidos.filter(
        (item) => !item.startsWith(`${treinoId}-`)
      )
    );
  }

  async function finalizarTreino(treino: Treino) {
    const exercicios = treino.exercicios
      .split("\n")
      .filter(Boolean);

    const todosFeitos = exercicios.every((_, index) =>
      concluidos.includes(`${treino.id}-${index}`)
    );

    if (!todosFeitos) {
      alert("Finalize todos os exercícios antes de concluir o treino.");
      return;
    }

    const { error } = await supabase
      .from("treinos_concluidos")
      .insert({
        aluno: treino.aluno,
        aluno_id: treino.aluno_id,
        treino_id: treino.id,
        nome_treino: treino.nome_treino,
        data_treino: treino.data_treino,
        dia_semana: treino.dia_semana,
      });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Treino finalizado! Parabéns.");
    setTreinosConcluidos([...treinosConcluidos, treino.id]);
  }

  useEffect(() => {
    buscarDados();
  }, []);

  useEffect(() => {
    if (!rodando) return;

    if (tempo <= 0) {
      setRodando(false);
      setTempo(60);
      return;
    }

    const interval = setInterval(() => {
      setTempo((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [rodando, tempo]);

  const treinosVisiveis = treinos.filter(
    (treino) => !treinosConcluidos.includes(treino.id)
  );

  if (planoVencido) {
    return (
      <main className="min-h-screen bg-black text-white p-6 pb-28 flex items-center justify-center">
        <section className="bg-zinc-900 border border-red-500/30 rounded-3xl p-6 text-center max-w-md">
          <Lock className="text-red-500 mx-auto" size={48} />

          <h1 className="text-3xl font-black mt-4">
            Acesso limitado
          </h1>

          <p className="text-gray-400 mt-3">
            Sua mensalidade venceu em {plano?.vencimento}. Regularize para liberar seus treinos.
          </p>

          <a
            href="/perfil"
            className="block mt-6 bg-green-500 text-black font-black rounded-2xl p-4"
          >
            Ver mensalidade
          </a>
        </section>

        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-28">
      <h1 className="text-4xl font-black">
        Meus treinos
      </h1>

      <p className="text-gray-400 mt-2">
        ID do aluno: {alunoId || "carregando..."}
      </p>

      {rodando && (
        <div className="mt-6 bg-green-500 text-black rounded-3xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer />
            <p className="font-black">Descanso</p>
          </div>

          <p className="text-3xl font-black">{tempo}s</p>
        </div>
      )}

      <section className="mt-8 space-y-5">
        {treinosVisiveis.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center">
            <p className="text-gray-400">
              Nenhum treino pendente.
            </p>
          </div>
        )}

        {treinosVisiveis.map((treino) => {
          const exercicios = treino.exercicios
            .split("\n")
            .filter(Boolean);

          const totalFeitos = exercicios.filter((_, index) =>
            concluidos.includes(`${treino.id}-${index}`)
          ).length;

          const todosFeitos = totalFeitos === exercicios.length;

          return (
            <div
              key={treino.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
            >
              <div className="flex items-center gap-3 mb-5">
                <Dumbbell className="text-green-500" />

                <div>
                  <h2 className="text-2xl font-black">
                    {treino.nome_treino}
                  </h2>

                  <p className="text-gray-400">
                    {treino.dia_semana} • {treino.data_treino}
                  </p>

                  <p className="text-green-500 font-bold mt-1">
                    {totalFeitos}/{exercicios.length} concluídos
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {exercicios.map((exercicio, index) => {
                  const id = `${treino.id}-${index}`;
                  const feito = concluidos.includes(id);

                  return (
                    <button
                      key={id}
                      onClick={() => alternarExercicio(id)}
                      className={`w-full text-left rounded-2xl p-4 border flex items-center gap-3 transition ${
                        feito
                          ? "bg-green-500/10 border-green-500 text-gray-500 line-through"
                          : "bg-black border-zinc-800 text-white hover:border-green-500"
                      }`}
                    >
                      {feito ? (
                        <CheckCircle className="text-green-500" />
                      ) : (
                        <Circle className="text-gray-500" />
                      )}

                      <span>{exercicio}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => limparMarcacoesDoTreino(treino.id)}
                  className="border border-zinc-700 text-gray-300 rounded-2xl p-4 font-bold flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  Limpar
                </button>

                <button
                  onClick={() => finalizarTreino(treino)}
                  className={`rounded-2xl p-4 font-black ${
                    todosFeitos
                      ? "bg-green-500 text-black"
                      : "bg-zinc-800 text-gray-500"
                  }`}
                >
                  Finalizar
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <BottomNav />
    </main>
  );
}