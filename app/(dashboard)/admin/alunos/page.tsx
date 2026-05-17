"use client";

import { useEffect, useState } from "react";
import { Users, User, BadgeCheck, Trash2, KeyRound } from "lucide-react";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";

type Aluno = {
  id: number;
  nome: string;
  email: string;
  aluno_id: string;
  tipo: string;
  foto_url?: string;
};

export default function AdminAlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [senhaNova, setSenhaNova] = useState("");

  async function carregarAlunos() {
    const { data, error } = await supabase
      .from("alunos")
      .select("*")
      .eq("tipo", "aluno")
      .order("nome", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setAlunos(data || []);
  }

  async function excluirAluno(aluno: Aluno) {
    const confirmar = confirm(`Excluir ${aluno.nome}?`);

    if (!confirmar) return;

    const { error } = await supabase
      .from("alunos")
      .delete()
      .eq("aluno_id", aluno.aluno_id);

    if (error) {
      alert(error.message);
      return;
    }

    await supabase.from("treinos").delete().eq("aluno_id", aluno.aluno_id);
    await supabase.from("planos").delete().eq("aluno_id", aluno.aluno_id);
    await supabase.from("mensagens").delete().eq("aluno_id", aluno.aluno_id);
    await supabase.from("notificacoes").delete().eq("aluno_id", aluno.aluno_id);
    await supabase.from("presencas").delete().eq("aluno_id", aluno.aluno_id);
    await supabase
      .from("treinos_concluidos")
      .delete()
      .eq("aluno_id", aluno.aluno_id);

    alert("Aluno excluído.");
    carregarAlunos();
  }

  async function trocarSenha(aluno: Aluno) {
    if (!senhaNova || senhaNova.length < 6) {
      alert("Digite uma senha com pelo menos 6 caracteres.");
      return;
    }

    alert(
      `Para trocar a senha de ${aluno.nome}, vá no Supabase > Authentication > Users > ${aluno.email} > Update password.\n\nSenha nova desejada: ${senhaNova}`
    );

    setSenhaNova("");
  }

  useEffect(() => {
    carregarAlunos();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <BackButton />

      <div className="flex items-center gap-3">
        <Users className="text-yellow-400" size={40} />

        <div>
          <h1 className="text-5xl font-black">Alunos</h1>
          <p className="text-gray-400 mt-2 text-lg">
            Gerencie alunos cadastrados.
          </p>
        </div>
      </div>

      <section className="mt-8 space-y-5">
        {alunos.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center text-gray-400 text-xl">
            Nenhum aluno cadastrado.
          </div>
        )}

        {alunos.map((aluno) => (
          <div
            key={aluno.id}
            className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6"
          >
            <div className="flex gap-5">
              <div className="w-24 h-24 rounded-3xl bg-yellow-400 flex items-center justify-center overflow-hidden shrink-0">
                {aluno.foto_url ? (
                  <img
                    src={aluno.foto_url}
                    alt={aluno.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="text-black" size={44} />
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-3xl font-black">{aluno.nome}</h2>

                <p className="text-gray-400 mt-2 text-lg">{aluno.email}</p>

                <div className="inline-flex items-center gap-2 mt-4 bg-black border border-yellow-400/30 rounded-2xl px-4 py-3">
                  <BadgeCheck className="text-yellow-400" size={20} />

                  <span className="font-black text-yellow-400 text-lg">
                    ID: {aluno.aluno_id}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <input
                value={senhaNova}
                onChange={(e) => setSenhaNova(e.target.value)}
                placeholder="Nova senha para este aluno"
                type="password"
                className="w-full bg-black border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400 text-lg"
              />

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => trocarSenha(aluno)}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-2xl p-4 flex items-center justify-center gap-2"
                >
                  <KeyRound size={20} />
                  Trocar senha
                </button>

                <button
                  onClick={() => excluirAluno(aluno)}
                  className="bg-red-500 hover:bg-red-400 text-white font-black rounded-2xl p-4 flex items-center justify-center gap-2"
                >
                  <Trash2 size={20} />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}