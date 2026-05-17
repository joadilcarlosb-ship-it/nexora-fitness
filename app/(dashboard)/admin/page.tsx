"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Menu,
  X,
  Users,
  Dumbbell,
  Wallet,
  AlertTriangle,
  CalendarCheck,
  Trophy,
  ChartColumn,
  UserPlus,
  Crown,
  CheckCircle,
  Camera,
  MessageCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Presenca = {
  id: number;
  aluno: string;
  aluno_id: string;
  treino: string;
  created_at: string;
};

export default function AdminPage() {
  const [menuAberto, setMenuAberto] =
    useState(false);

  const [alunosAtivos, setAlunosAtivos] =
    useState(0);

  const [treinosCadastrados, setTreinosCadastrados] =
    useState(0);

  const [receitaTotal, setReceitaTotal] =
    useState(0);

  const [receitaOnline, setReceitaOnline] =
    useState(0);

  const [pagamentosAtrasados, setPagamentosAtrasados] =
    useState(0);

  const [presencasHoje, setPresencasHoje] =
    useState<Presenca[]>([]);

  async function carregarDados() {
    const hoje = new Date()
      .toISOString()
      .split("T")[0];

    const { count: totalAlunos } =
      await supabase
        .from("alunos")
        .select("*", {
          count: "exact",
          head: true,
        })
        .neq("tipo", "admin");

    const { count: totalTreinos } =
      await supabase
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

    const { data: presencas } =
      await supabase
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
            acc +
            Number(item.valor),
          0
        ) || 0;

    const online =
      pagamentos?.reduce(
        (acc, item) =>
          acc +
          Number(item.valor),
        0
      ) || 0;

    const atrasados =
      planos?.filter(
        (item) =>
          new Date(
            item.vencimento
          ) < new Date()
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

    setReceitaOnline(
      online
    );

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

  const menu = [
    {
      title: "Cadastrar aluno",
      href:
        "/admin/cadastrar-aluno",
      icon: UserPlus,
      destaque: true,
    },
    {
      title: "Ver alunos",
      href:
        "/admin/alunos",
      icon: Users,
    },
    {
      title: "Criar treino",
      href:
        "/admin/criar-treino",
      icon: Dumbbell,
    },
    {
      title: "Ver treinos",
      href:
        "/admin/ver-treinos",
      icon: Dumbbell,
    },
    {
      title:
        "Treinos concluídos",
      href:
        "/admin/treinos-concluidos",
      icon: CheckCircle,
    },
    {
      title: "Presenças",
      href:
        "/admin/presencas",
      icon: CalendarCheck,
    },
    {
      title: "Ranking",
      href:
        "/admin/ranking",
      icon: Trophy,
    },
    {
      title:
        "Evolução física",
      href:
        "/admin/evolucao",
      icon: ChartColumn,
    },
    {
      title:
        "Antes e Depois",
      href:
        "/admin/evolucao/fotos",
      icon: Camera,
    },
    {
      title:
        "Chat alunos",
      href:
        "/admin/chat",
      icon: MessageCircle,
    },
    {
      title: "Planos",
      href:
        "/admin/planos",
      icon: Crown,
    },
    {
      title:
        "Financeiro",
      href:
        "/admin/financeiro",
      icon: Wallet,
    },
  ];

  const cards = [
    {
      title:
        "Alunos ativos",
      value:
        alunosAtivos,
      icon: Users,
    },
    {
      title:
        "Presenças hoje",
      value:
        presencasHoje.length,
      icon:
        CalendarCheck,
    },
    {
      title:
        "Receita total",
      value: `R$ ${receitaTotal}`,
      icon: Wallet,
    },
    {
      title:
        "Receita online",
      value: `R$ ${receitaOnline}`,
      icon: Wallet,
    },
    {
      title:
        "Pagamentos atrasados",
      value:
        pagamentosAtrasados,
      icon:
        AlertTriangle,
    },
    {
      title:
        "Treinos cadastrados",
      value:
        treinosCadastrados,
      icon:
        Dumbbell,
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">

      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur border-b border-zinc-800 p-5 flex items-center justify-between">

        <div>

          <p className="text-yellow-400 font-black">
            Nexora Fitness
          </p>

          <h1 className="text-3xl font-black mt-1">
            Dashboard
          </h1>

        </div>

        <button
          onClick={() =>
            setMenuAberto(true)
          }
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"
        >
          <Menu />
        </button>

      </header>

      {menuAberto && (
        <div className="fixed inset-0 z-50">

          <button
            onClick={() =>
              setMenuAberto(false)
            }
            className="absolute inset-0 bg-black/70"
          />

          <aside className="relative h-full w-[300px] bg-zinc-950 border-r border-zinc-800 p-5 overflow-y-auto">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-yellow-400 font-black">
                  ADMIN
                </p>

                <h2 className="text-2xl font-black mt-1">
                  Menu
                </h2>

              </div>

              <button
                onClick={() =>
                  setMenuAberto(false)
                }
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2"
              >
                <X />
              </button>

            </div>

            <div className="mt-8 space-y-3">

              {menu.map((item) => {
                const Icon =
                  item.icon;

                return (
                  <Link
                    key={item.href}
                    href={
                      item.href
                    }
                    onClick={() =>
                      setMenuAberto(
                        false
                      )
                    }
                    className={`flex items-center gap-4 rounded-3xl p-4 font-bold transition ${
                      item.destaque
                        ? "bg-yellow-400 text-black"
                        : "bg-zinc-900 border border-zinc-800 hover:border-yellow-400"
                    }`}
                  >

                    <Icon />

                    {item.title}

                  </Link>
                );
              })}

            </div>

          </aside>

        </div>
      )}

      <section className="p-6">

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {cards.map((card) => {
            const Icon =
              card.icon;

            return (
              <div
                key={
                  card.title
                }
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
              >

                <Icon className="text-yellow-400" />

                <p className="text-gray-400 mt-4">
                  {card.title}
                </p>

                <h2 className="text-3xl font-black">
                  {card.value}
                </h2>

              </div>
            );
          })}
 