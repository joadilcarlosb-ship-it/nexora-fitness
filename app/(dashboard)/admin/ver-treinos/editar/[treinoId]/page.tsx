"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Save, Dumbbell } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Treino = {
  id: number;
  aluno: string;
  aluno_id: string;
  nome_treino: string;
  exercicios: string;
  dia_semana: string;
  data_treino: string;
};

export default function EditarTreinoPage() {
  const params = useParams();
  const treinoId = params.treinoId as string;

  const [treino, setTreino] = useState<Treino | null>(null);

  async function buscarTreino() {
    const { data, error } = await supabase
      .from("treinos")
      .select("*")
      .eq("id", treinoId)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setTreino(data);
  }

  async function salvarTreino() {
    if (!treino) return;

    const { error } = await supabase
      .from("treinos")
      .update({
        nome_treino: treino.nome_treino,
        exercicios: treino.exercicios,
        dia_semana: treino.dia_semana,
        data_treino: treino.data_treino,
      })
      .eq("id", treino.id);

    if (error) {
      alert(error.message);
      return;
    }

    await supabase.from("notificacoes").insert({
      aluno: treino.aluno,
      aluno_id: treino.aluno_id,
      titulo: "Treino atualizado 🔄",
      mensagem: `Seu treino "${treino.nome_treino}" foi atualizado pelo admin.`,
    });

    alert("Treino atualizado com sucesso!");
    buscarTreino();
  }

  useEffect(() => {
    buscarTreino();
  }, []);

  if (!treino) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-green-500 font-black">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center gap-3">
        <Dumbbell className="text-green-500" size={32} />

        <div>
          <h1 className="text-4xl font-black">Editar treino</h1>
          <p className="text-gray-400 mt-1">
            {treino.aluno} • ID {treino.aluno_id}
          </p>
        </div>
      </div>

      <section className="mt-8 space-y-5">
        <input
          value={treino.nome_treino || ""}
          onChange={(e) =>
            setTreino({
              ...treino,
              nome_treino: e.target.value,
            })
          }
          placeholder="Nome do treino"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <select
          value={treino.dia_semana || ""}
          onChange={(e) =>
            setTreino({
              ...treino,
              dia_semana: e.target.value,
            })
          }
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        >
          <option value="">Dia da semana</option>
          <option value="Segunda-feira">Segunda-feira</option>
          <option value="Terça-feira">Terça-feira</option>
          <option value="Quarta-feira">Quarta-feira</option>
          <option value="Quinta-feira">Quinta-feira</option>
          <option value="Sexta-feira">Sexta-feira</option>
          <option value="Sábado">Sábado</option>
        </select>

        <input
          type="date"
          value={treino.data_treino || ""}
          onChange={(e) =>
            setTreino({
              ...treino,
              data_treino: e.target.value,
            })
          }
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <textarea
          value={treino.exercicios || ""}
          onChange={(e) =>
            setTreino({
              ...treino,
              exercicios: e.target.value,
            })
          }
          placeholder="Exercícios"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500 min-h-[240px]"
        />

        <button
          onClick={salvarTreino}
          className="w-full bg-green-500 hover:bg-green-400 transition text-black font-black rounded-2xl p-4 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Salvar treino
        </button>
      </section>
    </main>
  );
}