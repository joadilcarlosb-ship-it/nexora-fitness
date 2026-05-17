"use client";

import { useState } from "react";
import { Dumbbell, Lock, Mail, Sparkles, ArrowRight } from "lucide-react";
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
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute -top-32 -right-24 w-80 h-80 bg-yellow-400/20 blur-3xl rounded-full" />
      <div className="absolute -bottom-32 -left-24 w-80 h-80 bg-yellow-400/10 blur-3xl rounded-full" />

      <section className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-[36px] p-7 shadow-2xl">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-[30px] bg-yellow-400 flex items-center justify-center shadow-xl shadow-yellow-400/20">
            <Dumbbell className="text-black" size={48} />
          </div>
        </div>

        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 rounded-full px-4 py-2 font-black text-sm">
            <Sparkles size={16} />
            Academia inteligente
          </div>

          <h1 className="text-5xl font-black mt-5">Nexora</h1>

          <p className="text-gray-400 mt-2">
            Entre com o acesso criado pela academia.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="bg-black border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 focus-within:border-yellow-400 transition">
            <Mail className="text-yellow-400" size={22} />

            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none flex-1 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="bg-black border border-zinc-800 rounded-2xl p-4 flex items-center gap-3 focus-within:border-yellow-400 transition">
            <Lock className="text-yellow-400" size={22} />

            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") entrar();
              }}
              className="bg-transparent outline-none flex-1 text-white placeholder:text-gray-500"
            />
          </div>

          <button
            onClick={entrar}
            disabled={carregando}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-60 transition text-black font-black rounded-2xl p-4 text-lg flex items-center justify-center gap-2"
          >
            {carregando ? "Entrando..." : "Entrar"}
            {!carregando && <ArrowRight size={22} />}
          </button>
        </div>

        <div className="mt-6 bg-black border border-zinc-800 rounded-2xl p-4 text-center">
          <p className="text-gray-500 text-sm">
            Aluno não cria conta. O administrador cadastra o acesso.
          </p>
        </div>
      </section>
    </main>
  );
}