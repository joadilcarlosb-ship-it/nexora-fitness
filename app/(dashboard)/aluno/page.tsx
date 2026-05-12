"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Dumbbell,
  Flame,
  Bell,
  Trophy,
  ArrowRight,
  CalendarCheck,
  MessageCircle,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type Treino = {
  id: number;
  nome_treino: string;
  dia_semana: string;
  exercicios: string;
};

export default function HomeAlunoPage() {
  const [nome, setNome] = useState("");
  const [treinoHoje, setTreinoHoje] = useState<Treino | null>(null);
  const [notificacoes, setNotificacoes] = useState(0);
  const [presencas, setPresencas] = useState(0);
  const [mensagens, setMensagens] = useState(0);
  const [streak, setStreak] = useState(0);

  const frases = [
    "Domingo também é dia de cuidar de você.",
    "Segunda começa forte: disciplina hoje, resultado amanhã.",
    "Terça é dia de não inventar desculpa.",
    "Quarta é metade da semana, mas seu foco tem que ser inteiro.",
    "Quinta é pra provar que você não depende de motivação.",
    "Sexta também conta. O resultado vem da constância.",
    "Sábado é treino de quem quer estar acima da média.",
  ];

  const fraseDoDia = frases[new Date().getDay()];

  async function carregarDados() {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user?.email) return;

    const { data: alunoData } = await supabase
      .from("alunos")
      .select("*")
      .eq("email", user.email)
      .single();

    if (!alunoData) return;

    setNome(alunoData.nome);
    setStreak(alunoData.streak || 0);

    const dias = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];

    const hoje = dias[new Date().getDay()];

    const { data: treinoData } = await supabase
      .from("treinos")
      .select("*")
      .eq("aluno_id", alunoData.aluno_id)
      .eq("dia_semana", hoje)
      .limit(1);

    const { data: notificacoesData } = await supabase
      .from("notificacoes")
      .select("id")
      .eq("aluno_id", alunoData.aluno_id)
      .eq("visualizada", false);

    const { data: presencasData } = await supabase
      .from("presencas")
      .select("id")
      .eq("aluno_id", alunoData.aluno_id);

    const { data: mensagensData } = await supabase
      .from("mensagens")
      .select("id")
      .eq("aluno_id", alunoData.aluno_id)
      .eq("remetente", "admin")
      .eq("visualizada", false);

    setTreinoHoje(treinoData?.[0] || null);
    setNotificacoes(notificacoesData?.length || 0);
    setPresencas(presencasData?.length || 0);
    setMensagens(mensagensData?.length || 0);
  }

  useEffect(() => {
    carregarDados();

    const canal = supabase
      .channel("home-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notificacoes" },
        () => carregarDados()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mensagens" },
        () => carregarDados()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alunos" },
        () => carregarDados()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-28">
      <section className="bg-gradient-to-br from-green-500 to-green-700 rounded-[32px] p-6 text-black">
        <div className="flex items-center gap-3">
          <Flame size={28} />
          <p className="font-black">Nexora Fitness</p>
        </div>

        <h1 className="text-4xl font-black mt-6 leading-tight">
          Bora evoluir,
          <br />
          {nome ? nome.split(" ")[0] : "Aluno"} 🔥
        </h1>

        <p className="mt-4 font-semibold max-w-[320px]">“{fraseDoDia}”</p>
      </section>

      <section className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <CalendarCheck className="text-green-500" />
          <p className="text-gray-400 mt-4">Presenças</p>
          <h2 className="text-3xl font-black mt-2">{presencas}</h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <Bell className="text-green-500" />
          <p className="text-gray-400 mt-4">Avisos</p>
          <h2 className="text-3xl font-black mt-2">{notificacoes}</h2>
        </div>

        <div className="bg-zinc-900 border border-orange-500/30 rounded-3xl p-5">
          <Flame className="text-orange-500" />
          <p className="text-gray-400 mt-4">Sequência</p>
          <h2 className="text-3xl font-black mt-2 text-orange-500">
            {streak}
          </h2>
          <p className="text-orange-400 text-sm font-bold mt-1">
            dia(s) seguido(s)
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <MessageCircle className="text-green-500" />
          <p className="text-gray-400 mt-4">Mensagens</p>
          <h2 className="text-3xl font-black mt-2">{mensagens}</h2>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <Dumbbell className="text-green-500" />
          <h2 className="text-2xl font-black">Treino do dia</h2>
        </div>

        {treinoHoje ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-green-500 font-black">Hoje</p>

                <h3 className="text-2xl font-black mt-2">
                  {treinoHoje.nome_treino}
                </h3>

                <p className="text-gray-400 mt-2">{treinoHoje.dia_semana}</p>
              </div>

              <Trophy className="text-green-500" size={34} />
            </div>

            <Link
              href="/aluno/treinos"
              className="mt-6 bg-green-500 hover:bg-green-400 transition text-black font-black rounded-2xl p-4 flex items-center justify-center gap-2"
            >
              Começar treino
              <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6 text-center text-gray-400">
            Nenhum treino para hoje.
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="text-green-500" />
          <h2 className="text-2xl font-black">Atalhos rápidos</h2>
        </div>

        <div className="grid gap-4">
          <Link
            href="/aluno/treinos"
            className="bg-zinc-900 border border-zinc-800 hover:border-green-500 transition rounded-3xl p-5 flex items-center justify-between"
          >
            <div>
              <h3 className="font-black text-xl">Meus treinos</h3>
              <p className="text-gray-400 mt-1">Ver ficha completa</p>
            </div>

            <ArrowRight className="text-green-500" />
          </Link>

          <Link
            href="/aluno/evolucao"
            className="bg-zinc-900 border border-zinc-800 hover:border-green-500 transition rounded-3xl p-5 flex items-center justify-between"
          >
            <div>
              <h3 className="font-black text-xl">Evolução</h3>
              <p className="text-gray-400 mt-1">Ver progresso físico</p>
            </div>

            <ArrowRight className="text-green-500" />
          </Link>

          <Link
            href="/aluno/chat"
            className="bg-zinc-900 border border-zinc-800 hover:border-green-500 transition rounded-3xl p-5 flex items-center justify-between"
          >
            <div>
              <h3 className="font-black text-xl">Chat</h3>
              <p className="text-gray-400 mt-1">Conversar com a academia</p>
            </div>

            <ArrowRight className="text-green-500" />
          </Link>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}