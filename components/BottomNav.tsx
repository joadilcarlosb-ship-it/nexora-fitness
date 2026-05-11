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
        .select("*")
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
      .select("*")
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
        .channel(
          "bottomnav-realtime"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table:
              "mensagens",
          },
          () => {
            carregarBadges();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table:
              "notificacoes",
          },
          () => {
            carregarBadges();
          }
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
      href: "/aluno/antes-depois",
      icon: Camera,
      label: "Fotos",
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
    <nav className="fixed bottom-0 left-0 w-full border-t border-zinc-800 bg-zinc-950/95 backdrop-blur z-50">

      <div className="max-w-4xl mx-auto flex items-center justify-between px-3 py-4 overflow-x-auto gap-4">

        {navItems.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center min-w-[60px] transition relative ${
                active
                  ? "text-green-500"
                  : "text-gray-500 hover:text-white"
              }`}
            >

              <div className="relative">

                <Icon size={21} />

                {"badge" in item &&
                  item.badge &&
                  item.badge >
                    0 && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-black px-1">
                      {item.badge}
                    </div>
                  )}

              </div>

              <span className="text-[11px] mt-1 font-medium text-center">
                {item.label}
              </span>

            </Link>
          );
        })}

      </div>

    </nav>
  );
}