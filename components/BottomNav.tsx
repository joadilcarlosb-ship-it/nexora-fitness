"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  House,
  Dumbbell,
  User,
  ChartColumn,
  Bell,
  Camera,
  MessageCircle,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

export default function BottomNav() {
  const pathname = usePathname();

  const [
    mensagensNaoLidas,
    setMensagensNaoLidas,
  ] = useState(0);

  const [
    notificacoesNaoLidas,
    setNotificacoesNaoLidas,
  ] = useState(0);

  async function carregarBadges() {
    const { data: authData } =
      await supabase.auth.getUser();

    const user = authData.user;

    if (!user?.email) return;

    const { data: alunoData } =
      await supabase
        .from("alunos")
        .select("*")
        .eq("email", user.email)
        .single();

    if (!alunoData) return;

    const { data: mensagens } =
      await supabase
        .from("mensagens")
        .select("id")
        .eq(
          "aluno_id",
          alunoData.aluno_id
        )
        .eq(
          "remetente",
          "admin"
        )
        .eq(
          "visualizada",
          false
        );

    const {
      data: notificacoes,
    } = await supabase
      .from("notificacoes")
      .select("id")
      .eq(
        "aluno_id",
        alunoData.aluno_id
      )
      .eq(
        "visualizada",
        false
      );

    setMensagensNaoLidas(
      mensagens?.length || 0
    );

    setNotificacoesNaoLidas(
      notificacoes?.length || 0
    );
  }

  useEffect(() => {
    carregarBadges();

    const canal =
      supabase
        .channel("bottomnav")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "mensagens",
          },
          () => carregarBadges()
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table:
              "notificacoes",
          },
          () => carregarBadges()
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        canal
      );
    };
  }, []);

  const navItems = [
    {
      href: "/aluno",
      icon: House,
      label: "Home",
    },

    {
      href: "/aluno/treinos",
      icon: Dumbbell,
      label: "Treinos",
    },

    {
      href: "/aluno/evolucao",
      icon: ChartColumn,
      label: "Evolução",
    },

    {
      href: "/aluno/chat",
      icon: MessageCircle,
      label: "Chat",
      badge:
        mensagensNaoLidas,
    },

    {
      href: "/aluno/notificacoes",
      icon: Bell,
      label: "Avisos",
      badge:
        notificacoesNaoLidas,
    },

    {
      href: "/aluno/perfil",
      icon: User,
      label: "Perfil",
    },
  ];

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-3xl z-50 shadow-2xl">

      <div className="flex items-center justify-between px-2 py-2">

        {navItems.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center rounded-2xl px-2 py-2 min-w-[52px] transition ${
                active
                  ? "bg-green-500 text-black"
                  : "text-gray-500 hover:text-white"
              }`}
            >

              <div className="relative">

                <Icon size={18} />

                {"badge" in item &&
                  item.badge &&
                  item.badge >
                    0 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-black min-w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] font-black px-1">
                      {item.badge}
                    </div>
                  )}

              </div>

              <span className="text-[9px] mt-1 font-bold">
                {item.label}
              </span>

            </Link>
          );
        })}

      </div>

    </nav>
  );
}