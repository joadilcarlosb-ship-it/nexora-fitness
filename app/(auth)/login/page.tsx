"use client";

import { useState } from "react";
import { Dumbbell, Lock, Mail, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar() {
    if (!email || !senha) {
      alert("Digite email e senha.");
      return;
    }

    setCarregando(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setCarregando(false);
      alert("Email ou senha incorretos.");
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
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -top-40 -right-32 w-[360px] h-[360px] bg-yellow-400/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-40 -left-32 w-[360px] h-[360px] bg-yellow-400/10 blur-3xl rounded-full" />

      <section className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[40px] p-8 shadow-2xl">
        <div className="flex justify-center">
          <div className="w-28 h-28 rounded-[34px] bg-yellow-400 flex items-center justify-center shadow-xl shadow-yellow-400/20">
            <Dumbbell className="text-black" size={56} />
          </div>
        </div>

        <div className="text-center mt-7">
          <h1 className="text-6xl font-black">Nexora</h1>

          <p className="text-gray-400 mt-3 text-lg">
            Acesse sua conta da academia.
          </p>
        </div>

        <div className="mt-10 space-y-5">
          <div className="bg-black border border-zinc-800 rounded-3xl p-5 flex items-center gap-3 focus-within:border-yellow-400 transition">
            <Mail className="text-yellow-400" size={24} />

            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none flex-1 text-white placeholder:text-gray-500 text-lg"
            />
          </div>

          <div className="bg-black border border-zinc-800 rounded-3xl p-5 flex items-center gap-3 focus-within:border-yellow-400 transition">
            <Lock className="text-yellow-400" size={24} />

            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") entrar();
              }}
              className="bg-transparent outline-none flex-1 text-white placeholder:text-gray-500 text-lg"
            />
          </div>

          <button
            onClick={entrar}
            disabled={carregando}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 transition text-black font-black rounded-3xl p-5 text-xl flex items-center justify-center gap-2"
          >
            {carregando ? "Entrando..." : "Entrar"}
            {!carregando && <ArrowRight size={24} />}
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-7">
          O acesso é criado pela administração.
        </p>
      </section>
    </main>
  );
}