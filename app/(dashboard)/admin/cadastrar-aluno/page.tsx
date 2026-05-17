"use client";

import { useState } from "react";
import { UserPlus, Save } from "lucide-react";

import BackButton from "@/components/BackButton";
import { supabase } from "@/lib/supabase";

export default function CadastrarAlunoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function gerarIdAluno() {
    return Math.floor(
      100000 + Math.random() * 900000
    ).toString();
  }

  async function cadastrarAluno() {
    if (!nome || !email || !senha) {
      alert("Preencha todos os campos.");
      return;
    }

    const alunoId = gerarIdAluno();

    const { error: authError } =
      await supabase.auth.signUp({
        email,
        password: senha,
      });

    if (authError) {
      alert(authError.message);
      return;
    }

    const { error } =
      await supabase
        .from("alunos")
        .insert({
          nome,
          email,
          aluno_id: alunoId,
          tipo: "aluno",
          streak: 0,
        });

    if (error) {
      alert(error.message);
      return;
    }

    alert(
      `Aluno criado! ID: ${alunoId}`
    );

    setNome("");
    setEmail("");
    setSenha("");
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">

      <BackButton />

      <div className="flex items-center gap-3">

        <UserPlus
          className="text-yellow-400"
          size={34}
        />

        <div>

          <h1 className="text-4xl font-black">
            Cadastrar aluno
          </h1>

          <p className="text-gray-400 mt-1">
            Criar acesso do aluno
          </p>

        </div>

      </div>

      <section className="mt-8 space-y-4">

        <input
          value={nome}
          onChange={(e) =>
            setNome(e.target.value)
          }
          placeholder="Nome"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        />

        <input
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="Email"
          type="email"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-yellow-400"
        />

        <input
          value={senha}
          onChange={(e) =>
            setSenha(e.target.value)
          }
          placeholder="Senha"
          type="password"
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