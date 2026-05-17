"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, User, BadgeCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BackButton from "@/components/BackButton";
type Aluno = {
  id: number;
  nome: string;
  email: string;
  aluno_id: string;
  tipo: string;
};

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  async function carregar() {
    const { data, error } = await supabase
      .from("alunos")
      .select("*")
      .neq("tipo", "admin")
      .order("nome", {
        ascending: true,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setAlunos(data || []);
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6"> 
     <BackButton />
      
     <div className="flex items-center gap-3">

        <Users
          className="text-yellow-400"
          size={34}
        />

        <div>

          <h1 className="text-4xl font-black">
            Alunos
          </h1>

          <p className="text-gray-400 mt-1">
            Gerencie seus alunos
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
          <Link
            key={aluno.id}
            href={`/admin/alunos/${aluno.aluno_id}`}
            className="block bg-zinc-900 border border-zinc-800 hover:border-yellow-400 transition rounded-3xl p-5"
          >

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center">
                <User
                  className="text-black"
                  size={30}
                />
              </div>

              <div className="flex-1">

                <h2 className="text-2xl font-black">
                  {aluno.nome}
                </h2>

                <p className="text-gray-400 mt-1">
                  {aluno.email}
                </p>

                <div className="inline-flex items-center gap-2 mt-3 bg-black border border-yellow-400/30 rounded-2xl px-3 py-2">

                  <BadgeCheck
                    className="text-yellow-400"
                    size={18}
                  />

                  <span className="font-black text-yellow-400">
                    ID: {aluno.aluno_id}
                  </span>

                </div>

              </div>

            </div>

          </Link>
        ))}

      </section>

    </main>
  );
}