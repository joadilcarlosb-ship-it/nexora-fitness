"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  MessageCircle,
  Send,
  User,
} from "lucide-react";

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
  remetente: string;
  mensagem: string;
  visualizada: boolean;
  created_at: string;
};

export default function AdminChatPage() {
  const [conversas, setConversas] =
    useState<Conversa[]>([]);

  const [
    conversaAtual,
    setConversaAtual,
  ] = useState<Conversa | null>(
    null
  );

  const [mensagens, setMensagens] =
    useState<Mensagem[]>([]);

  const [texto, setTexto] =
    useState("");

  const mensagensRef =
    useRef<HTMLDivElement>(null);

  async function carregarConversas() {
    const { data } =
      await supabase
        .from("mensagens")
        .select("*")
        .order("id", {
          ascending: false,
        });

    const mapa =
      new Map<
        string,
        Conversa
      >();

    (data || []).forEach(
      (msg: any) => {
        if (
          !mapa.has(
            msg.aluno_id
          )
        ) {
          mapa.set(
            msg.aluno_id,
            {
              aluno:
                msg.aluno,
              aluno_id:
                msg.aluno_id,
              naoLidas: 0,
            }
          );
        }

        const conversa =
          mapa.get(
            msg.aluno_id
          );

        if (
          conversa &&
          msg.remetente ===
            "aluno" &&
          !msg.visualizada
        ) {
          conversa.naoLidas += 1;
        }
      }
    );

    setConversas(
      Array.from(
        mapa.values()
      )
    );
  }

  async function carregarMensagens(
    alunoId: string
  ) {
    const { data } =
      await supabase
        .from("mensagens")
        .select("*")
        .eq(
          "aluno_id",
          alunoId
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
        alunoId
      )
      .eq(
        "remetente",
        "aluno"
      );
  }

  async function enviarMensagem() {
    if (
      !texto.trim() ||
      !conversaAtual
    )
      return;

    await supabase
      .from("mensagens")
      .insert({
        aluno:
          conversaAtual.aluno,

        aluno_id:
          conversaAtual.aluno_id,

        remetente: "admin",

        mensagem: texto,

        visualizada: false,
      });

    await supabase
      .from(
        "notificacoes"
      )
      .insert({
        aluno:
          conversaAtual.aluno,

        aluno_id:
          conversaAtual.aluno_id,

        titulo:
          "Nova mensagem 💬",

        mensagem:
          "O admin enviou uma nova mensagem no chat.",
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
    carregarConversas();

    const canal =
      supabase
        .channel(
          "chat-admin"
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
            carregarConversas();

            if (
              conversaAtual
            ) {
              carregarMensagens(
                conversaAtual.aluno_id
              );
            }
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        canal
      );
    };
  }, [conversaAtual]);

  useEffect(() => {
    scrollFinal();
  }, [mensagens]);

  return (
    <main className="min-h-screen bg-black text-white flex">

      <aside className="w-[320px] border-r border-zinc-800 p-5 overflow-y-auto">

        <div className="flex items-center gap-3">

          <MessageCircle className="text-green-500" />

          <h1 className="text-2xl font-black">
            Chats
          </h1>

        </div>

        <div className="mt-6 space-y-3">

          {conversas.map(
            (conversa) => (
              <button
                key={
                  conversa.aluno_id
                }
                onClick={() => {
                  setConversaAtual(
                    conversa
                  );

                  carregarMensagens(
                    conversa.aluno_id
                  );
                }}
                className={`w-full rounded-2xl p-4 text-left border transition relative ${
                  conversaAtual
                    ?.aluno_id ===
                  conversa.aluno_id
                    ? "bg-green-500 text-black border-green-500"
                    : "bg-zinc-900 border-zinc-800 hover:border-green-500"
                }`}
              >

                <p className="font-black">
                  {
                    conversa.aluno
                  }
                </p>

                <p className="text-sm opacity-70 mt-1">
                  ID:{" "}
                  {
                    conversa.aluno_id
                  }
                </p>

                {conversa.naoLidas >
                  0 && (
                  <div className="absolute top-4 right-4 bg-green-500 text-black min-w-[24px] h-6 rounded-full flex items-center justify-center text-xs font-black px-2">
                    {
                      conversa.naoLidas
                    }
                  </div>
                )}

              </button>
            )
          )}

        </div>

      </aside>

      <section className="flex-1 flex flex-col">

        {conversaAtual ? (
          <>
            <div className="border-b border-zinc-800 p-5 flex items-center gap-3">

              <User className="text-green-500" />

              <div>

                <h2 className="text-2xl font-black">
                  {
                    conversaAtual.aluno
                  }
                </h2>

                <p className="text-gray-400 text-sm">
                  ID:{" "}
                  {
                    conversaAtual.aluno_id
                  }
                </p>

              </div>

            </div>

            <div
              ref={mensagensRef}
              className="flex-1 p-6 space-y-4 overflow-y-auto"
            >

              {mensagens.map(
                (msg) => {
                  const admin =
                    msg.remetente ===
                    "admin";

                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[70%] rounded-3xl p-4 ${
                        admin
                          ? "bg-green-500 text-black ml-auto"
                          : "bg-zinc-900 border border-zinc-800"
                      }`}
                    >

                      <p>
                        {
                          msg.mensagem
                        }
                      </p>

                      <p
                        className={`text-xs mt-2 ${
                          admin
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
                }
              )}

            </div>

            <div className="border-t border-zinc-800 p-4 flex gap-3">

              <input
                value={texto}
                onChange={(e) =>
                  setTexto(
                    e.target.value
                  )
                }
                placeholder="Digite uma mensagem..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 outline-none"
              />

              <button
                onClick={
                  enviarMensagem
                }
                className="bg-green-500 hover:bg-green-400 transition text-black rounded-2xl p-4"
              >

                <Send size={20} />

              </button>

            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecione uma conversa
          </div>
        )}

      </section>

    </main>
  );
}