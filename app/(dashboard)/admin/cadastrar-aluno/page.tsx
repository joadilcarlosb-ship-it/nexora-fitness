"use client";

import { useState } from "react";
import { UserPlus, Save, Mail, Lock, Target, Weight, Dumbbell } from "lucide-react";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";

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
    if (!nome || !email || !senha) {
      alert("Preencha nome, email e senha.");
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

      <section className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-[32px] p-6 text-black">
        <div className="flex items-center gap-3">
          <UserPlus size={34} />

          <div>
            <p className="font-black">ADMIN</p>
            <h1 className="text-4xl font-black mt-1">Cadastrar aluno</h1>
          </div>
        </div>

        <p className="font-semibold mt-4">
          Crie o acesso do aluno com email, senha e objetivo.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 focus-within:border-yellow-400">
          <UserPlus className="text-yellow-400" size={22} />

          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome completo"
            className="bg-transparent outline-none flex-1 text-white"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 focus-within:border-yellow-400">
          <Mail className="text-yellow-400" size={22} />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail do aluno"
            type="email"
            className="bg-transparent outline-none flex-1 text-white"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 focus-within:border-yellow-400">
          <Lock className="text-yellow-400" size={22} />

          <input
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha criada pelo admin"
            type="password"
            className="bg-transparent outline-none flex-1 text-white"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 focus-within:border-yellow-400">
          <Target className="text-yellow-400" size={22} />

          <input
            value={objetivo}
            onChange={(e) => setObjetivo(e.target.value)}
            placeholder="Objetivo. Ex: ganhar massa"
            className="bg-transparent outline-none flex-1 text-white"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 focus-within:border-yellow-400">
          <Weight className="text-yellow-400" size={22} />

          <input
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder="Peso. Ex: 75kg"
            className="bg-transparent outline-none flex-1 text-white"
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 focus-within:border-yellow-400">
          <Dumbbell className="text-yellow-400" size={22} />

          <input
            value={foco}
            onChange={(e) => setFoco(e.target.value)}
            placeholder="Foco. Ex: hipertrofia"
            className="bg-transparent outline-none flex-1 text-white"
          />
        </div>

        <button
          onClick={cadastrarAluno}
          disabled={carregando}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 transition text-black font-black rounded-2xl p-4 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {carregando ? "Cadastrando..." : "Cadastrar aluno"}
        </button>
      </section>
    </main>
  );
}