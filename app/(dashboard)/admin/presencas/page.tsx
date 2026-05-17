"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, BadgeCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BackButton from "@/components/BackButton";
type Presenca = {
  id: number;
  aluno: string;
  aluno_id: string;
  treino: string;
  data: string;
  created_at: string;
};

export default function PresencasPage() {
  const [presencas, setPresencas] = useState<Presenca[]>([]);

  async function buscarPresencas() {
    const { data, error } = await supabase
      .from("presencas")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setPresencas(data || []);
  }

  useEffect(() => {
    buscarPresencas();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <BackButton />
      <div className="flex items-center gap-3">
        <CalendarCheck className="text-green-500" size={32} />

        <div>
          <h1 className="text-4xl font-black">Presenças</h1>
          <p className="text-gray-400 mt-1">
            Histórico de treinos finalizados.
          </p>
        </div>
      </div>

      <section className="mt-8 space-y-4">
        {presencas.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center text-gray-400">
            Nenhuma presença registrada.
          </div>
        )}

        {presencas.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
          >
            <h2 className="text-2xl font-black">{item.aluno}</h2>

            <div className="mt-2 inline-flex items-center gap-2 bg-black border border-green-500/40 text-green-500 rounded-2xl px-3 py-2 font-black">
              <BadgeCheck size={16} />
              ID: {item.aluno_id}
            </div>

            <p className="text-green-500 font-bold mt-4">
              {item.treino}
            </p>

            <p className="text-gray-400 mt-2">
              Data: {item.data}
            </p>

            <p className="text-gray-500 text-sm mt-1">
              Horário:{" "}
              {new Date(item.created_at).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}