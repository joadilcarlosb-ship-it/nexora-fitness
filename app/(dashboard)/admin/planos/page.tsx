"use client";

import { useEffect, useState } from "react";
import { Crown, Trash2, BadgeCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

const opcoesPlanos = [
  { nome: "Mensal Livre", valor: 145, meses: 1 },
  { nome: "3x por semana", valor: 90, meses: 1 },
  { nome: "Trimestral", valor: 400, meses: 3 },
  { nome: "Anual", valor: 1600, meses: 12 },
];

type Aluno = {
  id: number;
  aluno_id: string;
  nome: string;
};

type Plano = {
  id: number;
  aluno: string;
  aluno_id: string;
  plano: string;
  valor: number;
  status: string;
  vencimento: string;
  primeira_mensalidade: boolean;
};

export default function PlanosAdminPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [alunoId, setAlunoId] = useState("");
  const [plano, setPlano] = useState("");

  function calcularVencimento(nomePlano: string) {
    const planoSelecionado = opcoesPlanos.find((item) => item.nome === nomePlano);
    if (!planoSelecionado) return "";

    const data = new Date();
    data.setMonth(data.getMonth() + planoSelecionado.meses);

    return data.toISOString().split("T")[0];
  }

  async function buscarDados() {
    const { data: alunosData } = await supabase
      .from("alunos")
      .select("id, nome, aluno_id")
      .order("nome");

    const { data: planosData } = await supabase
      .from("planos")
      .select("*")
      .order("id", { ascending: false });

    setAlunos(alunosData || []);
    setPlanos(planosData || []);
  }

  async function ativarMensalidadeFisica() {
    const aluno = alunos.find((item) => item.aluno_id === alunoId);
    const planoSelecionado = opcoesPlanos.find((item) => item.nome === plano);

    if (!aluno || !planoSelecionado) {
      alert("Selecione o aluno e o plano.");
      return;
    }

    const vencimento = calcularVencimento(planoSelecionado.nome);

    const { error } = await supabase.from("planos").insert({
      aluno: aluno.nome,
      aluno_id: aluno.aluno_id,
      plano: planoSelecionado.nome,
      valor: planoSelecionado.valor,
      vencimento,
      status: "Ativo",
      primeira_mensalidade: true,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert(`Mensalidade física ativada para ${aluno.nome}.`);

    setAlunoId("");
    setPlano("");
    buscarDados();
  }

  async function excluirPlano(id: number) {
    if (!confirm("Deseja excluir este plano?")) return;

    const { error } = await supabase.from("planos").delete().eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    buscarDados();
  }

  useEffect(() => {
    buscarDados();
  }, []);

  const vencimentoPreview = calcularVencimento(plano);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center gap-3">
        <Crown className="text-green-500" size={32} />

        <div>
          <h1 className="text-4xl font-black">Planos</h1>
          <p className="text-gray-400 mt-1">
            Ative mensalidade física pelo nome e ID do aluno.
          </p>
        </div>
      </div>

      <section className="mt-10 space-y-5 bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
        <select
          value={alunoId}
          onChange={(e) => setAlunoId(e.target.value)}
          className="w-full bg-black border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        >
          <option value="">Selecione o aluno</option>

          {alunos.map((aluno) => (
            <option key={aluno.id} value={aluno.aluno_id}>
              {aluno.nome} • ID {aluno.aluno_id}
            </option>
          ))}
        </select>

        <select
          value={plano}
          onChange={(e) => setPlano(e.target.value)}
          className="w-full bg-black border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        >
          <option value="">Selecione o plano</option>

          {opcoesPlanos.map((item) => (
            <option key={item.nome} value={item.nome}>
              {item.nome} - R$ {item.valor}
            </option>
          ))}
        </select>

        {vencimentoPreview && (
          <div className="bg-black border border-green-500/40 rounded-2xl p-4">
            <p className="text-gray-400 text-sm">Vencimento automático</p>
            <p className="text-green-500 font-black text-xl">
              {vencimentoPreview}
            </p>
          </div>
        )}

        <button
          onClick={ativarMensalidadeFisica}
          className="w-full bg-green-500 hover:bg-green-400 transition text-black font-black rounded-2xl p-4"
        >
          Ativar mensalidade física
        </button>
      </section>

      <section className="mt-8 space-y-4">
        {planos.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex items-center justify-between"
          >
            <div>
              <h2 className="text-xl font-black">{item.aluno}</h2>

              <div className="mt-2 inline-flex items-center gap-2 bg-black border border-green-500/40 text-green-500 rounded-2xl px-3 py-2 font-black">
                <BadgeCheck size={16} />
                ID: {item.aluno_id}
              </div>

              <p className="text-gray-400 mt-3">{item.plano}</p>
              <p className="text-green-500 font-bold mt-2">R$ {item.valor}</p>
              <p className="text-gray-500 mt-2">Vence: {item.vencimento}</p>

              {item.primeira_mensalidade && (
                <p className="text-yellow-500 font-bold mt-2">
                  Pagamento físico/presencial
                </p>
              )}
            </div>

            <button
              onClick={() => excluirPlano(item.id)}
              className="bg-red-500/10 hover:bg-red-500/20 transition p-3 rounded-2xl"
            >
              <Trash2 className="text-red-500" />
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}