"use client";

import { useState } from "react";
import { UserPlus, Save } from "lucide-react";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";

export default function CadastrarAlunoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [peso, setPeso] = useState("");
  const [foco, setFoco] = useState("");

  function gerarIdAluno() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async function cadastrarAluno() {
    if (!nome || !email || !senha) {
      alert("Preencha nome, email e senha.");
      return;
    }

    const alunoId = gerarIdAluno();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (authError) {
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

    if (error) {
      alert(error.message);
      return;
    }

    alert(`Aluno cadastrado! ID: ${alunoId}`);

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

      <div className="flex items-center gap-3">
        <UserPlus className="text-yellow-400" size={34} />

        <div>
          <h1 className="text-4xl font-black">Cadastrar aluno</h1>
          <p className="text-gray-400 mt-1">
            Crie o acesso do aluno com email e senha.
          </p>
        </div>
      </div>

      <section className="mt-8 space-y-4">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome completo"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail do aluno"
          type="email"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        />

        <input
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha criada pelo admin"
          type="password"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        />

        <input
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          placeholder="Objetivo. Ex: ganhar massa"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        />

        <input
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          placeholder="Peso. Ex: 75kg"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        />

        <input
          value={foco}
          onChange={(e) => setFoco(e.target.value)}
          placeholder="Foco. Ex: hipertrofia"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        />

        <button
          onClick={cadastrarAluno}
          className="w-full bg-yellow-400 hover:bg-yellow-300 transition text-black font-black rounded-2xl p-4 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Cadastrar aluno
        </button>
      </section>
    </main>
  );
}"use client";

import { useState } from "react";
import { UserPlus, Save } from "lucide-react";
import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";

export default function CadastrarAlunoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [peso, setPeso] = useState("");
  const [foco, setFoco] = useState("");

  function gerarIdAluno() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async function cadastrarAluno() {
    if (!nome || !email || !senha) {
      alert("Preencha nome, email e senha.");
      return;
    }

    const alunoId = gerarIdAluno();

    const { error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (authError) {
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

    if (error) {
      alert(error.message);
      return;
    }

    alert(`Aluno cadastrado! ID: ${alunoId}`);

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

      <div className="flex items-center gap-3">
        <UserPlus className="text-yellow-400" size={34} />

        <div>
          <h1 className="text-4xl font-black">Cadastrar aluno</h1>
          <p className="text-gray-400 mt-1">
            Crie o acesso do aluno com email e senha.
          </p>
        </div>
      </div>

      <section className="mt-8 space-y-4">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome completo"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail do aluno"
          type="email"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        />

        <input
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha criada pelo admin"
          type="password"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        />

        <input
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          placeholder="Objetivo. Ex: ganhar massa"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        />

        <input
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          placeholder="Peso. Ex: 75kg"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        />

        <input
          value={foco}
          onChange={(e) => setFoco(e.target.value)}
          placeholder="Foco. Ex: hipertrofia"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        />

        <button
          onClick={cadastrarAluno}
          className="w-full bg-yellow-400 hover:bg-yellow-300 transition text-black font-black rounded-2xl p-4 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Cadastrar aluno
        </button>
      </section>
    </main>
  );
}