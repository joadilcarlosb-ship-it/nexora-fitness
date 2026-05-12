"use client";

import { useEffect, useState } from "react";

import {
  User,
  Mail,
  BadgeCheck,
  Crown,
  LogOut,
  Flame,
} from "lucide-react";

import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type Aluno = {
  id: number;
  nome: string;
  email: string;
  aluno_id: string;
  streak: number;
};

type Plano = {
  id: number;
  plano: string;
  valor: number;
  vencimento: string;
  status: string;
};

export default function PerfilAlunoPage() {
  const [aluno, setAluno] =
    useState<Aluno | null>(null);

  const [plano, setPlano] =
    useState<Plano | null>(null);

  async function carregarDados() {
    const { data: authData } =
      await supabase.auth.getUser();

    const user = authData.user;

    if (!user?.email) return;

    const { data: alunoData } =
      await supabase
        .from("alunos")
        .select("*")
        .eq("email", user.email)
        .single();

    if (!alunoData) return;

    const { data: planoData } =
      await supabase
        .from("planos")
        .select("*")
        .eq(
          "aluno_id",
          alunoData.aluno_id
        )
        .order("id", {
          ascending: false,
        })
        .limit(1);

    setAluno(alunoData);

    setPlano(
      planoData?.[0] || null
    );
  }

  async function sair() {
    await supabase.auth.signOut();

    localStorage.clear();

    sessionStorage.clear();

    window.location.href =
      "/login";
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-28">

      <section className="bg-gradient-to-br from-green-500 to-green-700 rounded-[32px] p-6 text-black">

        <div className="flex items-center gap-3">

          <User size={32} />

          <div>

            <p className="font-black">
              PERFIL
            </p>

            <h1 className="text-4xl font-black mt-1">
              {aluno?.nome ||
                "Aluno"}
            </h1>

          </div>

        </div>

      </section>

      <section className="mt-8 space-y-4">

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">

          <div className="flex items-center gap-3">

            <Mail className="text-green-500" />

            <div>

              <p className="text-gray-400 text-sm">
                E-mail
              </p>

              <h2 className="font-black text-lg mt-1">
                {aluno?.email}
              </h2>

            </div>

          </div>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">

          <div className="flex items-center gap-3">

            <BadgeCheck className="text-green-500" />

            <div>

              <p className="text-gray-400 text-sm">
                ID do aluno
              </p>

              <h2 className="font-black text-lg mt-1">
                {aluno?.aluno_id}
              </h2>

            </div>

          </div>

        </div>

        <div className="bg-zinc-900 border border-orange-500/30 rounded-3xl p-5">

          <div className="flex items-center gap-3">

            <Flame className="text-orange-500" />

            <div>

              <p className="text-gray-400 text-sm">
                Sequência atual
              </p>

              <h2 className="font-black text-3xl mt-1 text-orange-500">
                {aluno?.streak || 0}
              </h2>

              <p className="text-orange-400 text-sm font-bold mt-1">
                dias seguidos
              </p>

            </div>

          </div>

        </div>

        <div className="bg-zinc-900 border border-green-500/30 rounded-3xl p-5">

          <div className="flex items-center gap-3">

            <Crown className="text-green-500" />

            <div>

              <p className="text-gray-400 text-sm">
                Plano ativo
              </p>

              <h2 className="font-black text-2xl mt-1">
                {plano?.plano ||
                  "Sem plano"}
              </h2>

              <p className="text-green-500 font-bold mt-2">
                {plano
                  ? `R$ ${plano.valor}`
                  : ""}
              </p>

              <p className="text-gray-500 text-sm mt-1">
                {plano
                  ? `Vence em ${plano.vencimento}`
                  : ""}
              </p>

            </div>

          </div>

        </div>

        <button
          onClick={sair}
          className="w-full bg-red-500 hover:bg-red-400 transition text-white font-black rounded-3xl p-5 flex items-center justify-center gap-3 mt-8"
        >

          <LogOut />

          Sair da conta

        </button>

      </section>

      <BottomNav />

    </main>
  );
}