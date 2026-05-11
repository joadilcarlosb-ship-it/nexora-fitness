"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  CircleDollarSign,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Plano = {
  id: number;
  aluno: string;
  aluno_id: string;
  plano: string;
  valor: number;
  status: string;
  vencimento: string;
  primeira_mensalidade: boolean;
};

type Pagamento = {
  id: number;
  aluno: string;
  aluno_id: string;
  plano: string;
  valor: number;
  status: string;
  metodo: string;
  pago_em: string;
};

export default function FinanceiroPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);

  async function buscarDados() {
    const { data: planosData } = await supabase
      .from("planos")
      .select("*")
      .order("id", { ascending: false });

    const { data: pagamentosData } = await supabase
      .from("pagamentos")
      .select("*")
      .order("id", { ascending: false });

    setPlanos(planosData || []);
    setPagamentos(pagamentosData || []);
  }

  useEffect(() => {
    buscarDados();
  }, []);

  const totalPresencial =
    planos
      .filter((item) => item.primeira_mensalidade)
      .reduce((acc, item) => acc + Number(item.valor), 0);

  const totalOnline =
    pagamentos.reduce(
      (acc, item) => acc + Number(item.valor),
      0
    );

  const totalGeral = totalPresencial + totalOnline;

  const vencidos =
    planos.filter(
      (item) => new Date(item.vencimento) < new Date()
    ).length;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center gap-3">
        <Wallet className="text-green-500" size={32} />

        <div>
          <h1 className="text-4xl font-black">
            Financeiro
          </h1>

          <p className="text-gray-400 mt-1">
            Controle de pagamentos da Nexora.
          </p>
        </div>
      </div>

      <section className="grid gap-4 mt-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <CircleDollarSign className="text-green-500" />
          <p className="text-gray-400 mt-4">Total recebido</p>
          <h2 className="text-3xl font-black">
            R$ {totalGeral}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <CircleDollarSign className="text-green-500" />
          <p className="text-gray-400 mt-4">Recebido online</p>
          <h2 className="text-3xl font-black">
            R$ {totalOnline}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <CircleDollarSign className="text-yellow-500" />
          <p className="text-gray-400 mt-4">Recebido presencial</p>
          <h2 className="text-3xl font-black">
            R$ {totalPresencial}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <AlertTriangle className="text-red-500" />
          <p className="text-gray-400 mt-4">Planos vencidos</p>
          <h2 className="text-3xl font-black">
            {vencidos}
          </h2>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-black mb-4">
          Pagamentos online
        </h2>

        <div className="space-y-4">
          {pagamentos.length === 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center text-gray-400">
              Nenhum pagamento online ainda.
            </div>
          )}

          {pagamentos.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
            >
              <h3 className="text-xl font-black">{item.aluno}</h3>

              <div className="mt-2 inline-flex items-center gap-2 bg-black border border-green-500/40 text-green-500 rounded-2xl px-3 py-2 font-black">
                <BadgeCheck size={16} />
                ID: {item.aluno_id}
              </div>

              <p className="text-gray-400 mt-3">{item.plano}</p>

              <p className="text-green-500 font-black mt-2">
                R$ {item.valor} • {item.metodo}
              </p>

              <p className="text-gray-500 text-sm mt-2">
                Pago em:{" "}
                {new Date(item.pago_em).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-black mb-4">
          Mensalidades presenciais
        </h2>

        <div className="space-y-4">
          {planos
            .filter((item) => item.primeira_mensalidade)
            .map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
              >
                <h3 className="text-xl font-black">{item.aluno}</h3>

                <div className="mt-2 inline-flex items-center gap-2 bg-black border border-yellow-500/40 text-yellow-500 rounded-2xl px-3 py-2 font-black">
                  <BadgeCheck size={16} />
                  ID: {item.aluno_id}
                </div>

                <p className="text-gray-400 mt-3">{item.plano}</p>

                <p className="text-yellow-500 font-black mt-2">
                  R$ {item.valor} • presencial
                </p>

                <p className="text-gray-500 text-sm mt-2">
                  Vence: {item.vencimento}
                </p>
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}