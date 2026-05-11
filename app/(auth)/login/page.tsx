"use client";

import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function entrar() {
    if (!email || !senha) {
      alert("Digite email e senha.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const userEmail = data.user.email;

    const { data: aluno } = await supabase
      .from("alunos")
      .select("*")
      .eq("email", userEmail)
      .single();

    if (aluno?.tipo === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/aluno";
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <section className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[32px] p-6">
        <div className="flex items-center gap-3">
          <Dumbbell className="text-green-500" size={36} />

          <div>
            <h1 className="text-4xl font-black">Nexora</h1>
            <p className="text-gray-400">Fitness App</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
          />

          <button
            onClick={entrar}
            className="w-full bg-green-500 hover:bg-green-400 text-black font-black rounded-2xl p-4"
          >
            Entrar
          </button>
        </div>
      </section>
    </main>
  );
}