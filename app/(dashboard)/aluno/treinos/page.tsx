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
  Trophy,
  Play,
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
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [plano, setPlano] = useState<Plano | null>(null);
  const [concluidos, setConcluidos] = useState<string[]>([]);
  const [treinosConcluidos, setTreinosConcluidos] = useState<number[]>([]);
  const [tempo, setTempo] = useState(60);
  const [rodando, setRodando] = useState(false);
  const [treinoIniciado, setTreinoIniciado] = useState<number | null>(null);
  const [inicioTreino, setInicioTreino] = useState<Date | null>(null);

  const planoVencido = plano && new Date(plano.vencimento) < new Date();

  async function buscarDados() {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user?.email) return;

    const { data: alunoData } = await supabase
      .from("alunos")
      .select("*")
      .eq("email", user.email)
      .single();

    if (!alunoData) return;

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

  function comecarTreino(treinoId: number) {
    setTreinoIniciado(treinoId);
    setInicioTreino(new Date());
    alert("Treino iniciado!");
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
      concluidos.filter((item) => !item.startsWith(`${treinoId}-`))
    );
  }

  async function atualizarStreak(alunoId: string) {
    const hoje = new Date().toISOString().split("T")[0];

    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemFormatado = ontem.toISOString().split("T")[0];

    const { data: alunoData } = await supabase
      .from("alunos")
      .select("*")
      .eq("aluno_id", alunoId)
      .single();

    let novaStreak = 1;

    if (alunoData?.ultimo_treino === ontemFormatado) {
      novaStreak = (alunoData.streak || 0) + 1;
    }

    if (alunoData?.ultimo_treino === hoje) {
      novaStreak = alunoData.streak || 1;
    }

    await supabase
      .from("alunos")
      .update({
        streak: novaStreak,
        ultimo_treino: hoje,
      })
      .eq("aluno_id", alunoId);
  }

  async function finalizarTreino(treino: Treino) {
    if (treinoIniciado !== treino.id || !inicioTreino) {
      alert("Clique em Começar treino antes de finalizar.");
      return;
    }

    const exercicios = treino.exercicios.split("\n").filter(Boolean);

    const todosFeitos = exercicios.every((_, index) =>
      concluidos.includes(`${treino.id}-${index}`)
    );

    if (!todosFeitos) {
      alert("Finalize todos os exercícios antes de concluir o treino.");
      return;
    }

    const finalizadoEm = new Date();

    const duracaoMinutos = Math.max(
      1,
      Math.round((finalizadoEm.getTime() - inicioTreino.getTime()) / 60000)
    );

    const { error } = await supabase.from("treinos_concluidos").insert({
      aluno: treino.aluno,
      aluno_id: treino.aluno_id,
      treino_id: treino.id,
      nome_treino: treino.nome_treino,
      data_treino: treino.data_treino,
      dia_semana: treino.dia_semana,
      iniciado_em: inicioTreino.toISOString(),
      finalizado_em: finalizadoEm.toISOString(),
      duracao_minutos: duracaoMinutos,
    });

    if (error) {
      alert(error.message);
      return;
    }

    await supabase.from("presencas").insert({
      aluno: treino.aluno,
      aluno_id: treino.aluno_id,
      treino: treino.nome_treino,
    });

    await atualizarStreak(treino.aluno_id);

    await supabase.from("notificacoes").insert({
      aluno: treino.aluno,
      aluno_id: treino.aluno_id,
      titulo: "Treino concluído ✅",
      mensagem: `Parabéns! Você concluiu "${treino.nome_treino}" em ${duracaoMinutos} minuto(s).`,
    });

    alert(`Treino finalizado! Duração: ${duracaoMinutos} minuto(s).`);

    setTreinosConcluidos([...treinosConcluidos, treino.id]);
    setTreinoIniciado(null);
    setInicioTreino(null);
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
          <h1 className="text-3xl font-black mt-4">Acesso limitado</h1>

          <p className="text-gray-400 mt-3">
            Sua mensalidade venceu em {plano?.vencimento}. Regularize para
            liberar seus treinos.
          </p>

          <a
            href="/aluno/perfil"
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
      <section className="bg-gradient-to-br from-green-500 to-green-700 rounded-[32px] p-6 text-black">
        <div className="flex items-center gap-3">
          <Dumbbell />
          <p className="font-black">MEUS TREINOS</p>
        </div>

        <h1 className="text-4xl font-black mt-5">Hora de evoluir.</h1>

        <p className="mt-3 font-semibold">
          Comece o treino, marque os exercícios, descanse 60s e finalize.
        </p>
      </section>

      {rodando && (
        <div className="mt-6 bg-zinc-900 border border-green-500/40 rounded-3xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Timer className="text-green-500" />

            <div>
              <p className="font-black">Descanso ativo</p>
              <p className="text-gray-400 text-sm">Próxima série em breve</p>
            </div>
          </div>

          <p className="text-4xl font-black text-green-500">{tempo}s</p>
        </div>
      )}

      <section className="mt-8 space-y-5">
        {treinosVisiveis.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
            <Trophy className="text-green-500 mx-auto" size={48} />
            <h2 className="text-2xl font-black mt-4">Tudo concluído!</h2>
            <p className="text-gray-400 mt-2">
              Nenhum treino pendente no momento.
            </p>
          </div>
        )}

        {treinosVisiveis.map((treino) => {
          const exercicios = treino.exercicios.split("\n").filter(Boolean);

          const totalFeitos = exercicios.filter((_, index) =>
            concluidos.includes(`${treino.id}-${index}`)
          ).length;

          const todosFeitos = totalFeitos === exercicios.length;

          const progresso =
            exercicios.length > 0
              ? Math.round((totalFeitos / exercicios.length) * 100)
              : 0;

          const iniciado = treinoIniciado === treino.id;

          return (
            <div
              key={treino.id}
              className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-5"
            >
              <div className="flex items-start gap-3">
                <div className="bg-green-500/10 p-3 rounded-2xl">
                  <Dumbbell className="text-green-500" />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-black">
                    {treino.nome_treino}
                  </h2>

                  <p className="text-gray-400 mt-1">
                    {treino.dia_semana} • {treino.data_treino}
                  </p>

                  <p className="text-green-500 font-bold mt-2">
                    {totalFeitos}/{exercicios.length} exercícios • {progresso}%
                  </p>

                  {iniciado && (
                    <p className="text-yellow-500 font-bold mt-1">
                      Treino em andamento
                    </p>
                  )}

                  <div className="mt-3 h-3 bg-black rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                </div>
              </div>

              {!iniciado && (
                <button
                  onClick={() => comecarTreino(treino.id)}
                  className="mt-5 w-full bg-green-500 hover:bg-green-400 transition text-black font-black rounded-2xl p-4 flex items-center justify-center gap-2"
                >
                  <Play size={20} />
                  Começar treino
                </button>
              )}

              {iniciado && (
                <>
                  <div className="mt-6 space-y-3">
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
                            <CheckCircle className="text-green-500 shrink-0" />
                          ) : (
                            <Circle className="text-gray-500 shrink-0" />
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
                      className={`rounded-2xl p-4 font-black transition ${
                        todosFeitos
                          ? "bg-green-500 text-black hover:bg-green-400"
                          : "bg-zinc-800 text-gray-500"
                      }`}
                    >
                      Finalizar
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </section>

      <BottomNav />
    </main>
  );
}