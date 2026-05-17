"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, User } from "lucide-react";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";

type Conversa = {
  aluno: string;
  aluno_id: string;
  naoLidas: number;
};

type Mensagem = {
  id: number;
  aluno: string;
  aluno_id: string;
  remetente: "aluno" | "admin";
  mensagem: string;
  visualizada: boolean;
  created_at: string;
};

export default function AdminChatPage() {
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaAtual, setConversaAtual] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const mensagensRef = useRef<HTMLDivElement>(null);

  async function carregarConversas() {
    const { data, error } = await supabase
      .from("mensagens")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    const mapa = new Map<string, Conversa>();

    (data || []).forEach((msg: Mensagem) => {
      if (!mapa.has(msg.aluno_id)) {
        mapa.set(msg.aluno_id, {
          aluno: msg.aluno,
          aluno_id: msg.aluno_id,
          naoLidas: 0,
        });
      }

      const conversa = mapa.get(msg.aluno_id);

      if (conversa && msg.remetente === "aluno" && !msg.visualizada) {
        conversa.naoLidas += 1;
      }
    });

    setConversas(Array.from(mapa.values()));
  }

  async function carregarMensagens(alunoId: string) {
    const { data, error } = await supabase
      .from("mensagens")
      .select("*")
      .eq("aluno_id", alunoId)
      .order("id", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setMensagens(data || []);

    await supabase
      .from("mensagens")
      .update({ visualizada: true })
      .eq("aluno_id", alunoId)
      .eq("remetente", "aluno");

    carregarConversas();
  }

  async function enviar() {
    if (!texto.trim() || !conversaAtual) return;

    const { error } = await supabase.from("mensagens").insert({
      aluno: conversaAtual.aluno,
      aluno_id: conversaAtual.aluno_id,
      remetente: "admin",
      mensagem: texto.trim(),
      visualizada: false,
    });

    if (error) {
      alert(error.message);
      return;
    }

    await supabase.from("notificacoes").insert({
      aluno: conversaAtual.aluno,
      aluno_id: conversaAtual.aluno_id,
      titulo: "Nova mensagem 💬",
      mensagem: "A academia respondeu você no chat.",
      visualizada: false,
    });

    setTexto("");
    carregarMensagens(conversaAtual.aluno_id);
  }

  useEffect(() => {
    carregarConversas();

    const canal = supabase
      .channel("chat-admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mensagens" },
        () => {
          carregarConversas();

          if (conversaAtual) {
            carregarMensagens(conversaAtual.aluno_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [conversaAtual]);

  useEffect(() => {
    setTimeout(() => {
      mensagensRef.current?.scrollTo({
        top: mensagensRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }, [mensagens]);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <BackButton />

      <div className="flex items-center gap-3">
        <MessageCircle className="text-yellow-400" size={34} />

        <div>
          <h1 className="text-4xl font-black">Chat alunos</h1>
          <p className="text-gray-400 mt-1">Responda seus alunos.</p>
        </div>
      </div>

      <section className="mt-8 grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4 h-fit">
          <h2 className="text-xl font-black mb-4">Conversas</h2>

          <div className="space-y-3">
            {conversas.length === 0 && (
              <p className="text-gray-500 text-center py-6">
                Nenhuma conversa ainda.
              </p>
            )}

            {conversas.map((conversa) => (
              <button
                key={conversa.aluno_id}
                onClick={() => {
                  setConversaAtual(conversa);
                  carregarMensagens(conversa.aluno_id);
                }}
                className={`relative w-full rounded-2xl p-4 text-left border transition ${
                  conversaAtual?.aluno_id === conversa.aluno_id
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "bg-zinc-900 border-zinc-800 hover:border-yellow-400"
                }`}
              >
                <p className="font-black">{conversa.aluno}</p>
                <p className="text-sm opacity-70 mt-1">
                  ID: {conversa.aluno_id}
                </p>

                {conversa.naoLidas > 0 && (
                  <span className="absolute top-3 right-3 bg-yellow-400 text-black min-w-[24px] h-6 rounded-full flex items-center justify-center text-xs font-black px-2">
                    {conversa.naoLidas}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        <section className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden min-h-[600px] flex flex-col">
          {conversaAtual ? (
            <>
              <div className="border-b border-zinc-800 p-5 flex items-center gap-3">
                <User className="text-yellow-400" />

                <div>
                  <h2 className="text-2xl font-black">
                    {conversaAtual.aluno}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    ID: {conversaAtual.aluno_id}
                  </p>
                </div>
              </div>

              <div
                ref={mensagensRef}
                className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[520px]"
              >
                {mensagens.map((msg) => {
                  const souAdmin = msg.remetente === "admin";

                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[80%] rounded-3xl p-4 ${
                        souAdmin
                          ? "bg-yellow-400 text-black ml-auto"
                          : "bg-zinc-900 border border-zinc-800 text-white"
                      }`}
                    >
                      <p className="font-semibold">{msg.mensagem}</p>

                      <p
                        className={`text-xs mt-2 ${
                          souAdmin ? "text-black/60" : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-zinc-800 p-4 flex gap-3">
                <input
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") enviar();
                  }}
                  placeholder="Digite uma resposta..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 outline-none focus:border-yellow-400"
                />

                <button
                  onClick={enviar}
                  className="bg-yellow-400 hover:bg-yellow-300 transition text-black rounded-2xl p-4"
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 p-8 text-center">
              Selecione uma conversa para responder.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}