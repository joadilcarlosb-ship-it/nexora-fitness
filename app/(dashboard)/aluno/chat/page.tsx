"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Send,
  MessageCircle,
} from "lucide-react";

import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type Mensagem = {
  id: number;
  remetente: string;
  mensagem: string;
  visualizada: boolean;
  created_at: string;
};

export default function ChatPage() {
  const [mensagens, setMensagens] =
    useState<Mensagem[]>([]);

  const [texto, setTexto] =
    useState("");

  const [alunoId, setAlunoId] =
    useState("");

  const [alunoNome, setAlunoNome] =
    useState("");

  const mensagensRef =
    useRef<HTMLDivElement>(null);

  async function carregarMensagens() {
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

    setAlunoId(alunoData.aluno_id);
    setAlunoNome(alunoData.nome);

    const { data } =
      await supabase
        .from("mensagens")
        .select("*")
        .eq(
          "aluno_id",
          alunoData.aluno_id
        )
        .order("id", {
          ascending: true,
        });

    setMensagens(data || []);

    await supabase
      .from("mensagens")
      .update({
        visualizada: true,
      })
      .eq(
        "aluno_id",
        alunoData.aluno_id
      )
      .eq(
        "remetente",
        "admin"
      );
  }

  async function enviarMensagem() {
    if (!texto.trim()) return;

    await supabase
      .from("mensagens")
      .insert({
        aluno: alunoNome,
        aluno_id: alunoId,

        remetente: "aluno",

        mensagem: texto,

        visualizada: false,
      });

    setTexto("");
  }

  function scrollFinal() {
    setTimeout(() => {
      mensagensRef.current?.scrollTo({
        top:
          mensagensRef.current
            ?.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }

  useEffect(() => {
    carregarMensagens();

    const canal =
      supabase
        .channel(
          "chat-aluno"
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
            carregarMensagens();
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        canal
      );
    };
  }, []);

  useEffect(() => {
    scrollFinal();
  }, [mensagens]);

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-32 flex flex-col">

      <div className="flex items-center gap-3">

        <MessageCircle
          className="text-green-500"
          size={32}
        />

        <div>

          <h1 className="text-4xl font-black">
            Chat
          </h1>

          <p className="text-gray-400 mt-1">
            Converse com a academia.
          </p>

        </div>

      </div>

      <section
        ref={mensagensRef}
        className="flex-1 mt-8 space-y-4 overflow-y-auto"
      >

        {mensagens.map((msg) => {
          const aluno =
            msg.remetente ===
            "aluno";

          return (
            <div
              key={msg.id}
              className={`max-w-[85%] rounded-3xl p-4 ${
                aluno
                  ? "bg-green-500 text-black ml-auto"
                  : "bg-zinc-900 border border-zinc-800"
              }`}
            >

              <p className="font-medium">
                {msg.mensagem}
              </p>

              <p
                className={`text-xs mt-2 ${
                  aluno
                    ? "text-black/60"
                    : "text-gray-500"
                }`}
              >
                {new Date(
                  msg.created_at
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
          );
        })}

      </section>

      <section className="fixed bottom-20 left-0 w-full px-4">

        <div className="max-w-2xl mx-auto flex gap-3 bg-zinc-950 border border-zinc-800 rounded-3xl p-3">

          <input
            value={texto}
            onChange={(e) =>
              setTexto(
                e.target.value
              )
            }
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-transparent outline-none px-2"
          />

          <button
            onClick={
              enviarMensagem
            }
            className="bg-green-500 hover:bg-green-400 transition text-black rounded-2xl p-3"
          >

            <Send size={20} />

          </button>

        </div>

      </section>

      <BottomNav />

    </main>
  );
}