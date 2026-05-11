"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2, Users, BadgeCheck, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Aluno = {
  id: number;
  aluno_id: string;
  nome: string;
  email: string;
  objetivo: string;
  peso?: string;
  foco?: string;
  foto_url?: string;
};

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  async function buscarAlunos() {
    const { data, error } = await supabase
      .from("alunos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setAlunos(data || []);
  }

  async function deletarAluno(id: number) {
    const confirmar = confirm("Deseja realmente excluir este aluno?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("alunos")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    buscarAlunos();
  }

  useEffect(() => {
    buscarAlunos();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center gap-3">
        <Users className="text-green-500" size={32} />

        <div>
          <h1 className="text-4xl font-black">Alunos</h1>
          <p className="text-gray-400 mt-1">
            Lista de alunos cadastrados.
          </p>
        </div>
      </div>

      <section className="mt-8 space-y-4">
        {alunos.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center text-gray-400">
            Nenhum aluno cadastrado.
          </div>
        )}

        {alunos.map((aluno) => (
          <div
            key={aluno.id}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
          >
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-3xl bg-green-500 flex items-center justify-center overflow-hidden shrink-0">
                {aluno.foto_url ? (
                  <img
                    src={aluno.foto_url}
                    alt={aluno.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="text-black" size={38} />
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-black">{aluno.nome}</h2>

                <div className="mt-2 inline-flex items-center gap-2 bg-black border border-green-500/40 text-green-500 rounded-2xl px-3 py-2 font-black">
                  <BadgeCheck size={16} />
                  ID: {aluno.aluno_id || "sem ID"}
                </div>

                <p className="text-gray-400 mt-3">{aluno.email}</p>

                <p className="text-green-500 font-bold mt-2">
                  {aluno.objetivo}
                </p>

                {aluno.peso && (
                  <p className="text-gray-400 mt-2">
                    Peso: {aluno.peso}
                  </p>
                )}

                {aluno.foco && (
                  <p className="text-gray-400 mt-1">
                    Foco: {aluno.foco}
                  </p>
                )}
              </div>

              <button
                onClick={() => deletarAluno(aluno.id)}
                className="bg-red-500/10 hover:bg-red-500/20 transition p-3 rounded-2xl h-fit"
              >
                <Trash2 className="text-red-500" />
              </button>
            </div>

            <Link
              href={`/admin/alunos/${aluno.aluno_id}`}
              className="block mt-5 bg-green-500 hover:bg-green-400 transition text-black text-center font-black rounded-2xl p-4"
            >
              Ver evolução
            </Link>

            <Link
              href={`/admin/alunos/editar/${aluno.aluno_id}`}
              className="block mt-3 bg-zinc-800 hover:border-green-500 border border-zinc-700 transition text-white text-center font-black rounded-2xl p-4"
            >
              Editar aluno
            </Link>
          </div>
        ))}
      </section>
    </main>
  );
}