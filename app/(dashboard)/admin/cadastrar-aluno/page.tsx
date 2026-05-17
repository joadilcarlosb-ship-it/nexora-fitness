"use client";

import { useState } from "react";
import {
  UserPlus,
  Save,
  Mail,
  Lock,
  Target,
  Weight,
  Dumbbell,
} from "lucide-react";

import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";

const objetivos = [
  "Ganhar massa muscular",
  "Emagrecer",
  "Definir corpo",
  "Melhorar condicionamento",
  "Força",
  "Saúde e bem-estar",
];

const pesos = [
  "40kg - 50kg",
  "51kg - 60kg",
  "61kg - 70kg",
  "71kg - 80kg",
  "81kg - 90kg",
  "91kg - 100kg",
  "100kg+",
];

const focos = [
  "Hipertrofia",
  "Emagrecimento",
  "Resistência",
  "Força",
  "Cardio",
  "Reabilitação",
  "Geral",
];

export default function CadastrarAlunoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [peso, setPeso] = useState("");
  const [foco, setFoco] = useState("");
  const [carregando, setCarregando] = useState(false);

  function gerarIdAluno() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async function cadastrarAluno() {
    if (!nome || !email || !senha || !objetivo || !peso || !foco) {
      alert("Preencha todos os campos.");
      return;
    }

    setCarregando(true);

    const alunoId = gerarIdAluno();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (authError) {
      setCarregando(false);
      alert(authError.message);
      return;
    }

    const { error } = await supabase.from("alunos").insert({
      nome,
      email,
      aluno_id: alunoId,
      tipo: "aluno",
      objetivo,
      peso,
      foco,
      streak: 0,
    });

    setCarregando(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`Aluno cadastrado com sucesso! ID: ${alunoId}`);

    setNome("");
    setEmail("");
    setSenha("");
    setObjetivo("");
    setPeso("");
    setFoco("");
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <BackButton />

      <section className="bg-zinc-950 border border-zinc-800 rounded-[36px] p-6">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-400 rounded-3xl p-4">
            <UserPlus className="text-black" size={34} />
          </div>

          <div>
            <h1 className="text-5xl font-black">Cadastrar aluno</h1>
            <p className="text-gray-400 mt-2 text-lg">
              Preencha os dados do aluno.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex items-center gap-3">
          <UserPlus className="text-yellow-400" />
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome completo"
            className="bg-transparent outline-none flex-1 text-xl"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex items-center gap-3">
          <Mail className="text-yellow-400" />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            type="email"
            className="bg-transparent outline-none flex-1 text-xl"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex items-center gap-3">
          <Lock className="text-yellow-400" />
          <input
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            type="password"
            className="bg-transparent outline-none flex-1 text-xl"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex items-center gap-3">
          <Target className="text-yellow-400" />
          <select
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            className="bg-transparent outline-none flex-1 text-xl"
          >
            <option value="">Selecione o objetivo</option>
            {objetivos.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex items-center gap-3">
          <Weight className="text-yellow-400" />
          <select
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            className="bg-transparent outline-none flex-1 text-xl"
          >
            <option value="">Selecione o peso</option>
            {pesos.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex items-center gap-3">
          <Dumbbell className="text-yellow-400" />
          <select
            value={foco}
            onChange={(e) => setFoco(e.target.value)}
            className="bg-transparent outline-none flex-1 text-xl"
          >
            <option value="">Selecione o foco</option>
            {focos.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={cadastrarAluno}
          disabled={carregando}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black rounded-3xl p-5 text-xl flex items-center justify-center gap-3"
        >
          <Save />
          {carregando ? "Cadastrando..." : "Cadastrar aluno"}
        </button>
      </section>
    </main>
  );
}