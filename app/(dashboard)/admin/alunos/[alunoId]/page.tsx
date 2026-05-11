"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  User,
  BadgeCheck,
  Weight,
  Ruler,
  Target,
  ChartColumn,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Aluno = {
  nome: string;
  email: string;
  aluno_id: string;
  objetivo: string;
  peso: string;
  medidas: string;
  foco: string;
};

type Evolucao = {
  id: number;
  peso: string;
  observacao: string;
  created_at: string;
};

export default function EvolucaoAlunoAdminPage() {
  const params = useParams();
  const alunoId = params.alunoId as string;

  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [historico, setHistorico] = useState<Evolucao[]>([]);

  async function buscarDados() {
    const { data: alunoData, error } = await supabase
      .from("alunos")
      .select("*")
      .eq("aluno_id", alunoId)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    const { data: evolucaoData } = await supabase
      .from("evolucao")
      .select("*")
      .eq("aluno_id", alunoId)
      .order("created_at", { ascending: false });

    setAluno(alunoData);
    setHistorico(evolucaoData || []);
  }

  useEffect(() => {
    buscarDados();
  }, []);

  if (!aluno) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-green-500 font-black">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center gap-3">
        <User className="text-green-500" size={32} />

        <div>
          <h1 className="text-4xl font-black">{aluno.nome}</h1>
          <p className="text-gray-400 mt-1">{aluno.email}</p>
        </div>
      </div>

      <div className="mt-5 inline-flex items-center gap-2 bg-zinc-900 border border-green-500/40 text-green-500 rounded-2xl px-4 py-3 font-black">
        <BadgeCheck size={18} />
        ID: {aluno.aluno_id}
      </div>

      <section className="grid gap-4 mt-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <Weight className="text-green-500" />
          <p className="text-gray-400 mt-3">Peso inicial</p>
          <h2 className="text-3xl font-black">
            {aluno.peso || "Não informado"}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <Ruler className="text-green-500" />
          <p className="text-gray-400 mt-3">Medidas iniciais</p>
          <p className="text-white mt-2 whitespace-pre-wrap">
            {aluno.medidas || "Não informado"}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <Target className="text-green-500" />
          <p className="text-gray-400 mt-3">Objetivo</p>
          <h2 className="text-2xl font-black">
            {aluno.objetivo || "Não informado"}
          </h2>
          <p className="text-gray-400 mt-2">
            Foco: {aluno.foco || "Não informado"}
          </p>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center gap-3 mb-4">
          <ChartColumn className="text-green-500" />
          <h2 className="text-2xl font-black">Histórico de evolução</h2>
        </div>

        <div className="space-y-4">
          {historico.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center text-gray-400">
              Nenhuma evolução registrada.
            </div>
          )}

          {historico.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
            >
              <div className="flex items-center gap-3">
                <Weight className="text-green-500" />

                <div>
                  <h3 className="text-2xl font-black">{item.peso}</h3>

                  <p className="text-gray-500 text-sm">
                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              {item.observacao && (
                <p className="text-gray-300 mt-4">{item.observacao}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}