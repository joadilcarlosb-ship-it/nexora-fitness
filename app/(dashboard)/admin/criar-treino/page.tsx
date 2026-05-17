"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Dumbbell } from "lucide-react";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";

const diasDisponiveis = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

const treinosProntos = [
  {
    nome: "Peito + Tríceps",
    exercicios: `Supino reto - 4x10
Supino inclinado - 3x12
Crucifixo - 3x12
Tríceps corda - 4x10
Tríceps testa - 3x12`,
  },
  {
    nome: "Costas + Bíceps",
    exercicios: `Puxada frente - 4x10
Remada baixa - 4x10
Remada unilateral - 3x12
Rosca direta - 4x10
Rosca alternada - 3x12`,
  },
  {
    nome: "Pernas Completo",
    exercicios: `Agachamento livre - 4x10
Leg press - 4x12
Cadeira extensora - 3x12
Mesa flexora - 3x12
Panturrilha em pé - 4x15`,
  },
  {
    nome: "Ombro + Abdômen",
    exercicios: `Desenvolvimento - 4x10
Elevação lateral - 3x12
Elevação frontal - 3x12
Abdominal supra - 4x20
Prancha - 3x40s`,
  },
];

const fichaCompleta = [
  "Peito",
  "Costas",
  "Pernas",
  "Ombro",
  "Bíceps",
  "Tríceps",
  "Abdômen",
  "Cardio",
];

const exerciciosPorGrupo: Record<string, string[]> = {
  Peito: ["Supino reto - 4x10", "Supino inclinado - 3x12", "Crucifixo - 3x12"],
  Costas: ["Puxada frente - 4x10", "Remada baixa - 4x10", "Remada unilateral - 3x12"],
  Pernas: ["Agachamento livre - 4x10", "Leg press - 4x12", "Cadeira extensora - 3x12", "Mesa flexora - 3x12", "Panturrilha - 4x15"],
  Ombro: ["Desenvolvimento - 4x10", "Elevação lateral - 3x12", "Elevação frontal - 3x12"],
  Bíceps: ["Rosca direta - 4x10", "Rosca alternada - 3x12"],
  Tríceps: ["Tríceps corda - 4x10", "Tríceps testa - 3x12"],
  Abdômen: ["Abdominal supra - 4x20", "Prancha - 3x40s"],
  Cardio: ["Esteira - 20min", "Bike - 15min"],
};

type Aluno = {
  id: number;
  nome: string;
  aluno_id: string;
};

export default function CriarTreinoPage() {
  const [modo, setModo] = useState<"dia" | "semana">("semana");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoId, setAlunoId] = useState("");
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [diaSemana, setDiaSemana] = useState("");
  const [dataTreino, setDataTreino] = useState("");
  const [treinoEscolhido, setTreinoEscolhido] = useState("");

  async function buscarAlunos() {
    const { data } = await supabase
      .from("alunos")
      .select("id, nome, aluno_id")
      .eq("tipo", "aluno")
      .order("nome", { ascending: true });

    setAlunos(data || []);
  }

  useEffect(() => {
    buscarAlunos();
  }, []);

  function pegarAlunoSelecionado() {
    return alunos.find((aluno) => aluno.aluno_id === alunoId);
  }

  function alternarDia(dia: string) {
    if (diasSelecionados.includes(dia)) {
      setDiasSelecionados(diasSelecionados.filter((item) => item !== dia));
      return;
    }

    setDiasSelecionados([...diasSelecionados, dia]);
  }

  function dividirFichaPorDias() {
    const quantidadeDias = diasSelecionados.length;

    const treinosPorDia: string[][] = Array.from(
      { length: quantidadeDias },
      () => []
    );

    fichaCompleta.forEach((grupo, index) => {
      const diaIndex = index % quantidadeDias;
      treinosPorDia[diaIndex].push(grupo);
    });

    return treinosPorDia;
  }

  function calcularData(index: number) {
    if (!dataInicio) return "";

    const data = new Date(dataInicio);
    data.setDate(data.getDate() + index);

    return data.toISOString().split("T")[0];
  }

  async function notificarAluno(
    alunoNome: string,
    alunoCodigo: string,
    titulo: string,
    mensagem: string
  ) {
    await supabase.from("notificacoes").insert({
      aluno: alunoNome,
      aluno_id: alunoCodigo,
      titulo,
      mensagem,
      visualizada: false,
    });
  }

  async function enviarTreinoSemana() {
    const aluno = pegarAlunoSelecionado();

    if (!aluno || !dataInicio || diasSelecionados.length === 0) {
      alert("Selecione o aluno, data inicial e dias disponíveis.");
      return;
    }

    const divisao = dividirFichaPorDias();

    const treinosSemana = divisao.map((grupos, index) => {
      const exercicios = grupos
        .map((grupo) => `${grupo}\n${exerciciosPorGrupo[grupo].join("\n")}`)
        .join("\n\n");

      return {
        aluno: aluno.nome,
        aluno_id: aluno.aluno_id,
        nome_treino: `Treino ${index + 1} - ${grupos.join(" + ")}`,
        exercicios,
        dia_semana: diasSelecionados[index],
        data_treino: calcularData(index),
      };
    });

    const { error } = await supabase.from("treinos").insert(treinosSemana);

    if (error) {
      alert(error.message);
      return;
    }

    await notificarAluno(
      aluno.nome,
      aluno.aluno_id,
      "Semana de treino liberada 🔥",
      "Sua programação semanal já está disponível."
    );

    alert("Treino da semana enviado e notificação criada!");

    setAlunoId("");
    setDiasSelecionados([]);
    setDataInicio("");
  }

  async function enviarTreinoDia() {
    const aluno = pegarAlunoSelecionado();
    const treino = treinosProntos.find((item) => item.nome === treinoEscolhido);

    if (!aluno || !diaSemana || !dataTreino || !treino) {
      alert("Selecione aluno, dia, data e treino.");
      return;
    }

    const { error } = await supabase.from("treinos").insert({
      aluno: aluno.nome,
      aluno_id: aluno.aluno_id,
      nome_treino: treino.nome,
      exercicios: treino.exercicios,
      dia_semana: diaSemana,
      data_treino: dataTreino,
    });

    if (error) {
      alert(error.message);
      return;
    }

    await notificarAluno(
      aluno.nome,
      aluno.aluno_id,
      "Novo treino disponível 💪",
      `Seu treino "${treino.nome}" foi liberado pela academia.`
    );

    alert("Treino enviado e notificação criada!");

    setAlunoId("");
    setDiaSemana("");
    setDataTreino("");
    setTreinoEscolhido("");
  }

  const previewSemana =
    modo === "semana" && diasSelecionados.length > 0
      ? dividirFichaPorDias()
      : [];

  const treinoPreview = treinosProntos.find(
    (item) => item.nome === treinoEscolhido
  );

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <BackButton />

      <div className="flex items-center gap-3">
        {modo === "semana" ? (
          <CalendarDays className="text-yellow-400" size={32} />
        ) : (
          <Dumbbell className="text-yellow-400" size={32} />
        )}

        <div>
          <h1 className="text-4xl font-black">Criar treino</h1>
          <p className="text-gray-400 mt-1">
            Envie treino por dia ou organize a semana completa.
          </p>
        </div>
      </div>

      <section className="mt-8 grid grid-cols-2 gap-3">
        <button
          onClick={() => setModo("semana")}
          className={`rounded-2xl p-4 font-black border ${
            modo === "semana"
              ? "bg-yellow-400 text-black border-yellow-400"
              : "bg-zinc-900 border-zinc-800"
          }`}
        >
          Semana
        </button>

        <button
          onClick={() => setModo("dia")}
          className={`rounded-2xl p-4 font-black border ${
            modo === "dia"
              ? "bg-yellow-400 text-black border-yellow-400"
              : "bg-zinc-900 border-zinc-800"
          }`}
        >
          Dia
        </button>
      </section>

      <section className="mt-8 space-y-5">
        <select
          value={alunoId}
          onChange={(e) => setAlunoId(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        >
          <option value="">Selecione o aluno</option>

          {alunos.map((aluno) => (
            <option key={aluno.id} value={aluno.aluno_id}>
              {aluno.nome} • ID {aluno.aluno_id}
            </option>
          ))}
        </select>

        {modo === "semana" && (
          <>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
            />

            <div className="grid gap-3">
              {diasDisponiveis.map((dia) => {
                const ativo = diasSelecionados.includes(dia);

                return (
                  <button
                    key={dia}
                    onClick={() => alternarDia(dia)}
                    className={`rounded-2xl p-4 font-bold border transition ${
                      ativo
                        ? "bg-yellow-400 text-black border-yellow-400"
                        : "bg-zinc-900 text-white border-zinc-800 hover:border-yellow-400"
                    }`}
                  >
                    {dia}
                  </button>
                );
              })}
            </div>

            {previewSemana.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
                <h2 className="text-xl font-black text-yellow-400">
                  Prévia da semana
                </h2>

                <div className="mt-4 space-y-3">
                  {previewSemana.map((grupos, index) => (
                    <div
                      key={index}
                      className="bg-black border border-zinc-800 rounded-2xl p-4"
                    >
                      <p className="font-black">{diasSelecionados[index]}</p>
                      <p className="text-gray-400 mt-1">
                        {grupos.join(" + ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={enviarTreinoSemana}
              className="w-full bg-yellow-400 hover:bg-yellow-300 transition text-black font-black rounded-2xl p-4"
            >
              Enviar semana completa
            </button>
          </>
        )}

        {modo === "dia" && (
          <>
            <select
              value={diaSemana}
              onChange={(e) => setDiaSemana(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
            >
              <option value="">Selecione o dia</option>

              {diasDisponiveis.map((dia) => (
                <option key={dia} value={dia}>
                  {dia}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dataTreino}
              onChange={(e) => setDataTreino(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
            />

            <select
              value={treinoEscolhido}
              onChange={(e) => setTreinoEscolhido(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
            >
              <option value="">Selecione um treino</option>

              {treinosProntos.map((treino) => (
                <option key={treino.nome} value={treino.nome}>
                  {treino.nome}
                </option>
              ))}
            </select>

            {treinoPreview && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
                <h2 className="text-xl font-black text-yellow-400">
                  {treinoPreview.nome}
                </h2>

                <pre className="mt-4 whitespace-pre-wrap text-gray-300 font-sans">
                  {treinoPreview.exercicios}
                </pre>
              </div>
            )}

            <button
              onClick={enviarTreinoDia}
              className="w-full bg-yellow-400 hover:bg-yellow-300 transition text-black font-black rounded-2xl p-4"
            >
              Enviar treino do dia
            </button>
          </>
        )}
      </section>
    </main>
  );
}