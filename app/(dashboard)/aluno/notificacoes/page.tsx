"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  CheckCircle,
} from "lucide-react";

import BottomNav from "@/components/BottomNav";

import { supabase } from "@/lib/supabase";

type Notificacao = {
  id: number;
  titulo: string;
  mensagem: string;
  visualizada: boolean;
  created_at: string;
};

export default function NotificacoesPage() {
  const [
    notificacoes,
    setNotificacoes,
  ] = useState<
    Notificacao[]
  >([]);

  async function carregar() {
    const {
      data: authData,
    } =
      await supabase.auth.getUser();

    const user =
      authData.user;

    if (!user?.email) return;

    const {
      data: aluno,
    } = await supabase
      .from("alunos")
      .select("*")
      .eq(
        "email",
        user.email
      )
      .single();

    if (!aluno) return;

    const {
      data,
    } = await supabase
      .from("notificacoes")
      .select("*")
      .eq(
        "aluno_id",
        aluno.aluno_id
      )
      .order("id", {
        ascending: false,
      });

    setNotificacoes(
      data || []
    );

    await supabase
      .from("notificacoes")
      .update({
        visualizada: true,
      })
      .eq(
        "aluno_id",
        aluno.aluno_id
      );
  }

  useEffect(() => {
    carregar();

    const canal =
      supabase
        .channel(
          "notificacoes"
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema:
              "public",
            table:
              "notificacoes",
          },
          () => carregar()
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        canal
      );
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-28">

      <div className="flex items-center gap-3">

        <Bell className="text-green-500" />

        <div>

          <h1 className="text-4xl font-black">
            Notificações
          </h1>

          <p className="text-gray-400 mt-1">
            Atualizações da academia
          </p>

        </div>

      </div>

      <section className="mt-8 space-y-4">

        {notificacoes.length ===
          0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">

            <Bell className="mx-auto text-green-500" size={40} />

            <p className="mt-4 text-gray-400">
              Nenhuma notificação.
            </p>

          </div>
        )}

        {notificacoes.map(
          (
            notificacao
          ) => (
            <div
              key={
                notificacao.id
              }
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
            >

              <div className="flex items-start gap-3">

                <CheckCircle className="text-green-500 shrink-0 mt-1" />

                <div>

                  <h2 className="text-xl font-black">
                    {
                      notificacao.titulo
                    }
                  </h2>

                  <p className="text-gray-400 mt-2">
                    {
                      notificacao.mensagem
                    }
                  </p>

                  <p className="text-gray-500 text-sm mt-3">
                    {new Date(
                      notificacao.created_at
                    ).toLocaleString(
                      "pt-BR"
                    )}
                  </p>

                </div>

              </div>

            </div>
          )
        )}

      </section>

      <BottomNav />

    </main>
  );
}