"use client";

import { useState } from "react";
import { Dumbbell, Lock, Mail, Sparkles } from "lucide-react";
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

    const { data: usuario } = await supabase
      .from("alunos")
      .select("tipo")
      .eq("email", data.user.email)
      .maybeSingle();

    if (usuario?.tipo === "admin") {
      window.location.href = "/admin";
      return;
    }

    window.location.href = "/aluno";
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute top-[-120px] right-[-120px] w-[280px] h-[280px] bg-yellow-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-120px] left-[-120px] w-[280px] h-[280px] bg-yellow-400/10 rounded-full blur-3xl" />

      <section className="relative w-full max-w-md bg-zinc-950/95 border border-zinc-800 rounded-[36px] p-7 shadow-2xl">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-[32px] bg-yellow-400 flex items-center justify-center shadow-xl">
            <Dumbbell className="text-black" size={48} />
          </div>
        </div>

        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 rounded-full px-4 py-2 font-bold text-sm">
            <Sparkles size={16} />
            Bem-vindo
          </div>

          <h1 className="text-5xl font-black mt-5">
            Nexora
          </h1>

          <p className="text-gray-400 mt-2">
            Acesse sua academia inteligente.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-black border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 focus-within:border-yellow-400">
            <Mail className="text-yellow-400" size={22} />

            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none flex-1 text-white"
            />
          </div>

          <div className="bg-black border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 focus-within:border-yellow-400">
            <Lock className="text-yellow-400" size={22} />

            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="bg-transparent outline-none flex-1 text-white"
            />
          </div>

          <button
            onClick={entrar}
            className="w-full bg-yellow-400 hover:bg-yellow-300 transition text-black font-black rounded-2xl p-4 text-lg"
          >
            Entrar
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Login criado pela administração da academia.
        </p>
      </section>
    </main>
  );
}