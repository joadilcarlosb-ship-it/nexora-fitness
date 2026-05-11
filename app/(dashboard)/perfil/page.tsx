"use client";

import BottomNav from "@/components/BottomNav";
import { useEffect, useState } from "react";
import {
  User,
  Crown,
  LogOut,
  AlertTriangle,
  CreditCard,
  BadgeCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const planosDisponiveis = [
  { nome: "Mensal Livre", valor: 145 },
  { nome: "3x por semana", valor: 90 },
  { nome: "Trimestral", valor: 400 },
  { nome: "Anual", valor: 1600 },
];

type Plano = {
  id: number;
  aluno: string;
  aluno_id: string;
  plano: string;
  valor: number;
  vencimento: string;
  status: string;
};

export default function PerfilPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [alunoId, setAlunoId] = useState("");
  const [plano, setPlano] = useState<Plano | null>(null);

  const vencido = plano && new Date(plano.vencimento) < new Date();

  async function carregarPerfil() {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user?.email) return;

    setEmail(user.email);

    const { data: alunoData, error } = await supabase
      .from("alunos")
      .select("*")
      .eq("email", user.email)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setNome(alunoData.nome);
    setAlunoId(alunoData.aluno_id);

    const { data: planoData } = await supabase
      .from("planos")
      .select("*")
      .eq("aluno_id", alunoData.aluno_id)
      .order("id", { ascending: false })
      .limit(1);

    setPlano(planoData?.[0] || null);
  }

  async function pagarPlano(nomePlano: string, valor: number) {
    if (!alunoId || !nome) {
      alert("Perfil ainda não carregou.");
      return;
    }

    const hoje = new Date();
    const vencimento = new Date();

    if (nomePlano === "Trimestral") {
      vencimento.setMonth(hoje.getMonth() + 3);
    } else if (nomePlano === "Anual") {
      vencimento.setFullYear(hoje.getFullYear() + 1);
    } else {
      vencimento.setMonth(hoje.getMonth() + 1);
    }

    const vencimentoFormatado = vencimento.toISOString().split("T")[0];

    const { error: pagamentoError } = await supabase.from("pagamentos").insert({
      aluno: nome,
      aluno_id: alunoId,
      plano: nomePlano,
      valor,
      status: "Pago",
      metodo: "Online",
    });

    if (pagamentoError) {
      alert(pagamentoError.message);
      return;
    }

    const { error: planoError } = await supabase.from("planos").insert({
      aluno: nome,
      aluno_id: alunoId,
      plano: nomePlano,
      valor,
      vencimento: vencimentoFormatado,
      status: "Ativo",
    });

    if (planoError) {
      alert(planoError.message);
      return;
    }

    alert("Pagamento aprovado! Plano ativado.");
    carregarPerfil();
  }

  async function sair() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  useEffect(() => {
    carregarPerfil();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-28">
      <h1 className="text-4xl font-black">Perfil</h1>
      <p className="text-gray-400 mt-2">Suas informações e mensalidade.</p>

      <section className="mt-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center">
        <div className="mx-auto w-24 h-24 rounded-full bg-green-500 flex items-center justify-center">
          <User size={46} className="text-black" />
        </div>

        <h2 className="text-2xl font-black mt-4">
          {nome || "Aluno"}
        </h2>

        <p className="text-gray-400 mt-1">{email}</p>

        <div className="mt-3 inline-flex items-center gap-2 bg-black border border-green-500/40 text-green-500 rounded-2xl px-4 py-2 font-black">
          <BadgeCheck size={18} />
          ID: {alunoId || "carregando..."}
        </div>

        <p className="text-gray-400 mt-3">Aluno Nexora Fitness</p>
      </section>

      <section className="mt-6 space-y-4">
        <div
          className={`border rounded-3xl p-5 flex items-center gap-3 ${
            vencido
              ? "bg-red-500/10 border-red-500/30"
              : "bg-zinc-900 border-zinc-800"
          }`}
        >
          {vencido ? (
            <AlertTriangle className="text-red-500" />
          ) : (
            <Crown className="text-green-500" />
          )}

          <div>
            <p className="font-bold">
              {plano ? plano.plano : "Sem plano cadastrado"}
            </p>

            {plano && (
              <p className="text-sm text-gray-500">
                R$ {plano.valor} • Vence em {plano.vencimento}
              </p>
            )}

            {vencido && (
              <p className="text-sm text-red-400 mt-1">
                Mensalidade vencida. Acesso limitado.
              </p>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <h2 className="text-2xl font-black mb-4">Pagar online</h2>

          <div className="space-y-3">
            {planosDisponiveis.map((item) => (
              <button
                key={item.nome}
                onClick={() => pagarPlano(item.nome, item.valor)}
                className="w-full bg-black border border-zinc-800 hover:border-green-500 rounded-2xl p-4 flex items-center justify-between transition"
              >
                <div className="text-left">
                  <p className="font-black">{item.nome}</p>
                  <p className="text-gray-400">R$ {item.valor}</p>
                </div>

                <CreditCard className="text-green-500" />
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={sair}
          className="w-full bg-red-500/10 border border-red-500/30 text-red-400 rounded-3xl p-5 flex items-center justify-center gap-3 font-bold"
        >
          <LogOut />
          Sair da conta
        </button>
      </section>

      <BottomNav />
    </main>
  );
}