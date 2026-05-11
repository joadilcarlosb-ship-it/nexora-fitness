"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Users,
  Dumbbell,
  Wallet,
  AlertTriangle,
  ChartColumn,
  UserPlus,
  Crown,
  CheckCircle,
  CalendarCheck,
  Trophy,
  Camera,
  MessageCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Presenca = {
  id: number;
  aluno: string;
  aluno_id: string;
  treino: string;
  data: string;
  created_at: string;
};

export default function AdminPage() {
  const [alunosAtivos, setAlunosAtivos] =
    useState(0);

  const [
    treinosCadastrados,
    setTreinosCadastrados,
  ] = useState(0);

  const [receitaTotal, setReceitaTotal] =
    useState(0);

  const [
    receitaOnline,
    setReceitaOnline,
  ] = useState(0);

  const [
    pagamentosAtrasados,
    setPagamentosAtrasados,
  ] = useState(0);

  const [
    presencasHoje,
    setPresencasHoje,
  ] = useState<Presenca[]>([]);

  async function carregarDados() {
    const hoje =
      new Date()
        .toISOString()
        .split("T")[0];

    const {
      count: totalAlunos,
    } = await supabase
      .from("alunos")
      .select("*", {
        count: "exact",
        head: true,
      });

    const {
      count: totalTreinos,
    } = await supabase
      .from("treinos")
      .select("*", {
        count: "exact",
        head: true,
      });

    const { data: planos } =
      await supabase
        .from("planos")
        .select("*");

    const { data: pagamentos } =
      await supabase
        .from("pagamentos")
        .select("*");

    const {
      data: presencas,
    } = await supabase
      .from("presencas")
      .select("*")
      .eq("data", hoje)
      .order("id", {
        ascending: false,
      });

    const presencial =
      planos
        ?.filter(
          (item) =>
            item.primeira_mensalidade
        )
        .reduce(
          (acc, item) =>
            acc + Number(item.valor),
          0
        ) || 0;

    const online =
      pagamentos?.reduce(
        (acc, item) =>
          acc + Number(item.valor),
        0
      ) || 0;

    const atrasados =
      planos?.filter(
        (item) =>
          new Date(item.vencimento) <
          new Date()
      ).length || 0;

    setAlunosAtivos(
      totalAlunos || 0
    );

    setTreinosCadastrados(
      totalTreinos || 0
    );

    setReceitaTotal(
      presencial + online
    );

    setReceitaOnline(online);

    setPagamentosAtrasados(
      atrasados
    );

    setPresencasHoje(
      presencas || []
    );
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const cards = [
    {
      title: "Alunos ativos",
      value: alunosAtivos,
      icon: Users,
      color: "text-green-500",
    },

    {
      title: "Presenças hoje",
      value: presencasHoje.length,
      icon: CalendarCheck,
      color: "text-green-500",
    },

    {
      title: "Receita total",
      value: `R$ ${receitaTotal}`,
      icon: Wallet,
      color: "text-green-500",
    },

    {
      title: "Receita online",
      value: `R$ ${receitaOnline}`,
      icon: Wallet,
      color: "text-green-500",
    },

    {
      title: "Pagamentos atrasados",
      value: pagamentosAtrasados,
      icon: AlertTriangle,
      color: "text-yellow-500",
    },

    {
      title: "Treinos cadastrados",
      value: treinosCadastrados,
      icon: Dumbbell,
      color: "text-green-500",
    },
  ];

  const actions = [
    {
      title: "Cadastrar aluno",
      href: "/admin/cadastrar-aluno",
      icon: UserPlus,
      destaque: true,
    },

    {
      title: "Ver alunos",
      href: "/admin/alunos",
      icon: Users,
      destaque: false,
    },

    {
      title: "Criar treino",
      href: "/admin/criar-treino",
      icon: Dumbbell,
      destaque: false,
    },

    {
      title: "Ver treinos",
      href: "/admin/ver-treinos",
      icon: Dumbbell,
      destaque: false,
    },

    {
      title: "Treinos concluídos",
      href: "/admin/treinos-concluidos",
      icon: CheckCircle,
      destaque: false,
    },

    {
      title: "Presenças",
      href: "/admin/presencas",
      icon: CalendarCheck,
      destaque: false,
    },

    {
      title: "Ranking",
      href: "/admin/ranking",
      icon: Trophy,
      destaque: false,
    },

    {
      title: "Evolução física",
      href: "/admin/evolucao",
      icon: ChartColumn,
      destaque: false,
    },

    {
      title: "Antes e Depois",
      href: "/admin/evolucao/fotos",
      icon: Camera,
      destaque: false,
    },

    {
      title: "Chat alunos",
      href: "/admin/chat",
      icon: MessageCircle,
      destaque: false,
    },

    {
      title: "Planos",
      href: "/admin/planos",
      icon: Crown,
      destaque: false,
    },

    {
      title: "Financeiro",
      href: "/admin/financeiro",
      icon: Wallet,
      destaque: false,
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-6">

      <h1 className="text-4xl font-black">
        Painel Admin
      </h1>

      <p className="text-gray-400 mt-2">
        Controle geral da Nexora Fitness.
      </p>

      <section className="grid gap-4 mt-8">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
            >

              <Icon className={card.color} />

              <p className="text-gray-400 mt-4">
                {card.title}
              </p>

              <h2 className="text-3xl font-black">
                {card.value}
              </h2>

            </div>
          );
        })}

      </section>

      <section className="mt-8">

        <div className="flex items-center gap-3 mb-4">

          <CalendarCheck className="text-green-500" />

          <h2 className="text-2xl font-black">
            Quem treinou hoje
          </h2>

        </div>

        <div className="space-y-4">

          {presencasHoje.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center text-gray-400">
              Nenhuma presença registrada hoje.
            </div>
          )}

          {presencasHoje.map((presenca) => (
            <div
              key={presenca.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
            >

              <h3 className="text-xl font-black">
                {presenca.aluno}
              </h3>

              <p className="text-green-500 font-bold mt-2">
                {presenca.treino}
              </p>

              <p className="text-gray-500 text-sm mt-2">
                ID: {presenca.aluno_id}
              </p>

              <p className="text-gray-500 text-sm mt-1">
                Horário:{" "}
                {new Date(
                  presenca.created_at
                ).toLocaleTimeString(
                  "pt-BR",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>

            </div>
          ))}

        </div>

      </section>

      <section className="mt-8">

        <div className="flex items-center gap-3 mb-4">

          <ChartColumn className="text-green-500" />

          <h2 className="text-2xl font-black">
            Ações rápidas
          </h2>

        </div>

        <div className="grid gap-4">

          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.href}
                href={action.href}
                className={`rounded-3xl p-5 font-bold flex items-center gap-3 transition ${
                  action.destaque
                    ? "bg-green-500 text-black hover:bg-green-400"
                    : "bg-zinc-900 border border-zinc-800 hover:border-green-500"
                }`}
              >

                <Icon />

                {action.title}

              </Link>
            );
          })}

        </div>

      </section>

    </main>
  );
}