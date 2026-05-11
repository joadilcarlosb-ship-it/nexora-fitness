"use client";

import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  ChartColumn,
  Weight,
  Ruler,
  Flame,
} from "lucide-react";

import BottomNav from "@/components/BottomNav";
import { supabase } from "@/lib/supabase";

type Evolucao = {
  id: number;
  peso: string;
  braco: string;
  peito: string;
  cintura: string;
  perna: string;
  gordura: string;
  created_at: string;
};

export default function EvolucaoPage() {
  const [historico, setHistorico] =
    useState<Evolucao[]>([]);

  async function buscarDados() {
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

    const { data, error } =
      await supabase
        .from("evolucao_fisica")
        .select("*")
        .eq(
          "aluno_id",
          alunoData.aluno_id
        )
        .order("created_at", {
          ascending: true,
        });

    if (error) {
      alert(error.message);
      return;
    }

    setHistorico(data || []);
  }

  useEffect(() => {
    buscarDados();
  }, []);

  const dadosGrafico =
    historico.map((item) => ({
      data: new Date(
        item.created_at
      ).toLocaleDateString(
        "pt-BR"
      ),

      peso: parseFloat(
        item.peso
          ?.replace("kg", "")
          ?.replace(",", ".") || "0"
      ),

      gordura: parseFloat(
        item.gordura
          ?.replace("%", "")
          ?.replace(",", ".") || "0"
      ),

      cintura: parseFloat(
        item.cintura
          ?.replace("cm", "")
          ?.replace(",", ".") || "0"
      ),
    }));

  const ultimo =
    historico[
      historico.length - 1
    ];

  return (
    <main className="min-h-screen bg-black text-white p-6 pb-28">

      <div className="flex items-center gap-3">

        <ChartColumn
          className="text-green-500"
          size={32}
        />

        <div>

          <h1 className="text-4xl font-black">
            Evolução
          </h1>

          <p className="text-gray-400 mt-1">
            Sua evolução física.
          </p>

        </div>

      </div>

      {ultimo && (
        <section className="grid grid-cols-2 gap-4 mt-8">

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">

            <Weight className="text-green-500" />

            <p className="text-gray-400 mt-4">
              Peso atual
            </p>

            <h2 className="text-3xl font-black mt-2">
              {ultimo.peso}
            </h2>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">

            <Flame className="text-green-500" />

            <p className="text-gray-400 mt-4">
              Gordura
            </p>

            <h2 className="text-3xl font-black mt-2">
              {ultimo.gordura}
            </h2>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 col-span-2">

            <Ruler className="text-green-500" />

            <p className="text-gray-400 mt-4">
              Medidas
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4">

              <div>
                <p className="text-gray-500 text-sm">
                  Braço
                </p>

                <p className="font-black">
                  {ultimo.braco}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Peito
                </p>

                <p className="font-black">
                  {ultimo.peito}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Cintura
                </p>

                <p className="font-black">
                  {ultimo.cintura}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Perna
                </p>

                <p className="font-black">
                  {ultimo.perna}
                </p>
              </div>

            </div>

          </div>

        </section>
      )}

      <section className="mt-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-5">

        <h2 className="text-2xl font-black">
          Peso corporal
        </h2>

        <div className="mt-6 h-[320px]">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={dadosGrafico}
            >

              <CartesianGrid stroke="#27272a" />

              <XAxis dataKey="data" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="peso"
                stroke="#22c55e"
                strokeWidth={4}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </section>

      <section className="mt-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-5">

        <h2 className="text-2xl font-black">
          Histórico
        </h2>

        <div className="mt-5 space-y-4">

          {historico
            .slice()
            .reverse()
            .map((item) => (
              <div
                key={item.id}
                className="bg-black border border-zinc-800 rounded-2xl p-4"
              >

                <p className="text-green-500 font-black">
                  {new Date(
                    item.created_at
                  ).toLocaleDateString(
                    "pt-BR"
                  )}
                </p>

                <div className="grid grid-cols-2 gap-3 mt-4">

                  <p>
                    Peso:{" "}
                    <span className="font-black">
                      {item.peso}
                    </span>
                  </p>

                  <p>
                    Gordura:{" "}
                    <span className="font-black">
                      {item.gordura}
                    </span>
                  </p>

                  <p>
                    Braço:{" "}
                    <span className="font-black">
                      {item.braco}
                    </span>
                  </p>

                  <p>
                    Peito:{" "}
                    <span className="font-black">
                      {item.peito}
                    </span>
                  </p>

                  <p>
                    Cintura:{" "}
                    <span className="font-black">
                      {item.cintura}
                    </span>
                  </p>

                  <p>
                    Perna:{" "}
                    <span className="font-black">
                      {item.perna}
                    </span>
                  </p>

                </div>

              </div>
            ))}

        </div>

      </section>

      <BottomNav />

    </main>
  );
}