"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  CheckCheck,
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

  async function carregarNotificacoes() {
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

    const { data } =
      await supabase
        .from(
          "notificacoes"
        )
        .select("*")
        .eq(
          "aluno_id",
          alunoData.aluno_id
        )
        .order("id", {
          ascending: false,
        });

    setNotificacoes(data || []);

    await supabase
      .from(
        "notificacoes"
      )
      .update({
        visualizada: true,
      })
      .eq(
        "aluno_id",
        alunoData.aluno_id
      );
  }

  useEffect(() => {
    carregarNotificacoes();

    const canal =
      supabase
        .channel(
          "notificacoes-realtime"
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
            carregarNotificacoes();
          }
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

        <Bell
          className="text-green-500"
          size={32}
        />

        <div>

          <h1 className="text-4xl font-black">
            Avisos
          </h1>

          <p className="text-gray-400 mt-1">
            Notificações da academia.
          </p>

        </div>

      </div>

      <section className="mt-8 space-y-4">

        {notificacoes.length ===
          0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center text-gray-400">
            Nenhuma notificação.
          </div>
        )}

        {notificacoes.map(
          (item) => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
            >

              <div className="flex items-start justify-between gap-3">

                <div>

                  <h2 className="text-xl font-black">
                    {
                      item.titulo
                    }
                  </h2>

                  <p className="text-gray-300 mt-3">
                    {
                      item.mensagem
                    }
                  </p>

                </div>

                <CheckCheck className="text-green-500 shrink-0" />

              </div>

              <p className="text-gray-500 text-sm mt-4">
                {new Date(
                  item.created_at
                ).toLocaleDateString(
                  "pt-BR"
                )}{" "}
                •{" "}
                {new Date(
                  item.created_at
                ).toLocaleTimeString(
                  "pt-BR",
                  {
                    hour:
                      "2-digit",
                    minute:
                      "2-digit",
                  }
                )}
              </p>

            </div>
          )
        )}

      </section>

      <BottomNav />

    </main>
  );
}