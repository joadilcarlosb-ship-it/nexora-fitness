"use client";

import { useEffect, useState } from "react";
import { ChartColumn, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import BackButton from "@/components/BackButton";

type Aluno = {
  nome: string;
  aluno_id: string;
};

export default function EvolucaoAdminPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  const [alunoId, setAlunoId] = useState("");

  const [peso, setPeso] = useState("");
  const [braco, setBraco] = useState("");
  const [peito, setPeito] = useState("");
  const [cintura, setCintura] = useState("");
  const [perna, setPerna] = useState("");
  const [gordura, setGordura] = useState("");

  async function buscarAlunos() {
    const { data } = await supabase
      .from("alunos")
      .select("nome, aluno_id")
      .order("nome");

    setAlunos(data || []);
  }

  async function salvarEvolucao() {
    const aluno = alunos.find(
      (item) => item.aluno_id === alunoId
    );

    if (!aluno) {
      alert("Selecione um aluno.");
      return;
    }

    const { error } = await supabase
      .from("evolucao_fisica")
      .insert({
        aluno: aluno.nome,
        aluno_id: aluno.aluno_id,

        peso,
        braco,
        peito,
        cintura,
        perna,
        gordura,
      });

    if (error) {
      alert(error.message);
      return;
    }

    await supabase.from("notificacoes").insert({
      aluno: aluno.nome,
      aluno_id: aluno.aluno_id,
      titulo: "Nova evolução registrada 📈",
      mensagem:
        "Suas medidas e evolução corporal foram atualizadas.",
    });

    alert("Evolução salva!");

    setAlunoId("");
    setPeso("");
    setBraco("");
    setPeito("");
    setCintura("");
    setPerna("");
    setGordura("");
  }

  useEffect(() => {
    buscarAlunos();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <BackButton />
      <div className="flex items-center gap-3">
        <ChartColumn className="text-green-500" size={32} />

        <div>
          <h1 className="text-4xl font-black">
            Evolução física
          </h1>

          <p className="text-gray-400 mt-1">
            Atualize as medidas do aluno.
          </p>
        </div>
      </div>

      <section className="mt-8 space-y-5">
        <select
          value={alunoId}
          onChange={(e) => setAlunoId(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        >
          <option value="">Selecione o aluno</option>

          {alunos.map((aluno) => (
            <option
              key={aluno.aluno_id}
              value={aluno.aluno_id}
            >
              {aluno.nome} • ID {aluno.aluno_id}
            </option>
          ))}
        </select>

        <input
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          placeholder="Peso. Ex: 82kg"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <input
          value={braco}
          onChange={(e) => setBraco(e.target.value)}
          placeholder="Braço. Ex: 38cm"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <input
          value={peito}
          onChange={(e) => setPeito(e.target.value)}
          placeholder="Peito. Ex: 102cm"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <input
          value={cintura}
          onChange={(e) => setCintura(e.target.value)}
          placeholder="Cintura. Ex: 84cm"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <input
          value={perna}
          onChange={(e) => setPerna(e.target.value)}
          placeholder="Perna. Ex: 62cm"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <input
          value={gordura}
          onChange={(e) => setGordura(e.target.value)}
          placeholder="% gordura corporal"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <button
          onClick={salvarEvolucao}
          className="w-full bg-green-500 hover:bg-green-400 transition text-black font-black rounded-2xl p-4 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Salvar evolução
        </button>
      </section>
    </main>
  );
}