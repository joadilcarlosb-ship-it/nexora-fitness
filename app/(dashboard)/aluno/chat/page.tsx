"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";

type Mensagem = {
  id: number;
  aluno: string;
  aluno_id: string;
  remetente: "aluno" | "admin";
  mensagem: string;
  visualizada: boolean;
  created_at: string;
};

export default function ChatAlunoPage() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [alunoNome, setAlunoNome] = useState("");
  const [alunoId, setAlunoId] = useState("");
  const mensagensRef = useRef<HTMLDivElement>(null);

  async function carregar() {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user?.email) return;

    const { data: aluno } = await supabase
      .from("alunos")
      .select("nome, aluno_id")
      .eq("email", user.email)
      .single();

    if (!aluno) return;

    setAlunoNome(aluno.nome);
    setAlunoId(aluno.aluno_id);

    const { data, error } = await supabase
      .from("mensagens")
      .select("*")
      .eq("aluno_id", aluno.aluno_id)
      .order("id", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setMensagens(data || []);

    await supabase
      .from("mensagens")
      .update({ visualizada: true })
      .eq("aluno_id", aluno.aluno_id)
      .eq("remetente", "admin");
  }

  async function enviar() {
    if (!texto.trim()) return;

    if (!alunoId || !alunoNome) {
      alert("Dados do aluno ainda não carregaram.");
      return;
    }

    const { error } = await supabase.from("mensagens").insert({
      aluno: alunoNome,
      aluno_id: alunoId,
      remetente: "aluno",
      mensagem: texto.trim(),
      visualizada: false,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setTexto("");
    carregar();
  }

  useEffect(() => {
    carregar();

    const canal = supabase
      .channel("chat-aluno-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mensagens" },
        () => carregar()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      mensagensRef.current?.scrollTo({
        top: mensagensRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }, [mensagens]);

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-36 flex flex-col">
      <BackButton />

      <div className="flex items-center gap-3">
        <MessageCircle className="text-yellow-400" size={34} />

        <div>
          <h1 className="text-4xl font-black">Chat</h1>
          <p className="text-gray-400 mt-1">Fale com a academia.</p>
        </div>
      </div>

      <section
        ref={mensagensRef}
        className="flex-1 mt-8 space-y-4 overflow-y-auto pb-28"
      >
        {mensagens.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center text-gray-400">
            Nenhuma mensagem ainda. Envie a primeira.
          </div>
        )}

        {mensagens.map((msg) => {
          const souAluno = msg.remetente === "aluno";

          return (
            <div
              key={msg.id}
              className={`max-w-[85%] rounded-3xl p-4 ${
                souAluno
                  ? "bg-yellow-400 text-black ml-auto"
                  : "bg-zinc-900 border border-zinc-800 text-white"
              }`}
            >
              <p className="font-semibold">{msg.mensagem}</p>

              <p
                className={`text-xs mt-2 ${
                  souAluno ? "text-black/60" : "text-gray-500"
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
      </section>

      <section className="fixed bottom-24 left-0 w-full px-4 z-40">
        <div className="max-w-2xl mx-auto flex gap-3 bg-zinc-950 border border-zinc-800 rounded-3xl p-3">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") enviar();
            }}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-transparent outline-none px-2 text-white"
          />

          <button
            onClick={enviar}
            className="bg-yellow-400 hover:bg-yellow-300 transition text-black rounded-2xl p-3"
          >
            <Send size={20} />
          </button>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}