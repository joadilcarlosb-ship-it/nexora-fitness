"use client";

import { useEffect, useState } from "react";

import {
  Camera,
  Upload,
  ImageIcon,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Aluno = {
  nome: string;
  aluno_id: string;
};

export default function EvolucaoFotosPage() {
  const [alunos, setAlunos] =
    useState<Aluno[]>([]);

  const [alunoId, setAlunoId] =
    useState("");

  const [fotoAntes, setFotoAntes] =
    useState<File | null>(null);

  const [
    fotoDepois,
    setFotoDepois,
  ] = useState<File | null>(null);

  async function buscarAlunos() {
    const { data } =
      await supabase
        .from("alunos")
        .select(
          "nome, aluno_id"
        )
        .order("nome");

    setAlunos(data || []);
  }

  async function uploadImagem(
    file: File,
    pasta: string
  ) {
    const nomeArquivo = `${Date.now()}-${file.name}`;

    const caminho = `${pasta}/${nomeArquivo}`;

    const { error } =
      await supabase.storage
        .from("evolucao")
        .upload(
          caminho,
          file
        );

    if (error) {
      alert(error.message);
      return "";
    }

    const { data } =
      supabase.storage
        .from("evolucao")
        .getPublicUrl(
          caminho
        );

    return data.publicUrl;
  }

  async function salvarFotos() {
    const aluno =
      alunos.find(
        (item) =>
          item.aluno_id ===
          alunoId
      );

    if (
      !aluno ||
      !fotoAntes ||
      !fotoDepois
    ) {
      alert(
        "Preencha tudo."
      );

      return;
    }

    const antesUrl =
      await uploadImagem(
        fotoAntes,
        "antes"
      );

    const depoisUrl =
      await uploadImagem(
        fotoDepois,
        "depois"
      );

    const { error } =
      await supabase
        .from(
          "evolucao_fotos"
        )
        .insert({
          aluno: aluno.nome,
          aluno_id:
            aluno.aluno_id,

          foto_antes:
            antesUrl,

          foto_depois:
            depoisUrl,
        });

    if (error) {
      alert(error.message);
      return;
    }

    await supabase
      .from(
        "notificacoes"
      )
      .insert({
        aluno: aluno.nome,
        aluno_id:
          aluno.aluno_id,

        titulo:
          "Novas fotos adicionadas 📸",

        mensagem:
          "Seu antes e depois foi atualizado.",
      });

    alert(
      "Fotos salvas!"
    );

    setAlunoId("");
    setFotoAntes(null);
    setFotoDepois(null);
  }

  useEffect(() => {
    buscarAlunos();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-6">

      <div className="flex items-center gap-3">

        <Camera
          className="text-green-500"
          size={32}
        />

        <div>

          <h1 className="text-4xl font-black">
            Antes e Depois
          </h1>

          <p className="text-gray-400 mt-1">
            Adicione evolução
            visual dos alunos.
          </p>

        </div>

      </div>

      <section className="mt-8 space-y-5">

        <select
          value={alunoId}
          onChange={(e) =>
            setAlunoId(
              e.target.value
            )
          }
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        >

          <option value="">
            Selecione o aluno
          </option>

          {alunos.map(
            (aluno) => (
              <option
                key={
                  aluno.aluno_id
                }
                value={
                  aluno.aluno_id
                }
              >
                {aluno.nome} • ID{" "}
                {
                  aluno.aluno_id
                }
              </option>
            )
          )}

        </select>

        <label className="block bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center cursor-pointer hover:border-green-500 transition">

          <ImageIcon
            className="text-green-500 mx-auto"
            size={42}
          />

          <h2 className="font-black mt-4">
            Foto ANTES
          </h2>

          <p className="text-gray-400 mt-2">
            {fotoAntes
              ? fotoAntes.name
              : "Clique para selecionar"}
          </p>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              setFotoAntes(
                e.target
                  .files?.[0] ||
                  null
              )
            }
          />

        </label>

        <label className="block bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center cursor-pointer hover:border-green-500 transition">

          <ImageIcon
            className="text-green-500 mx-auto"
            size={42}
          />

          <h2 className="font-black mt-4">
            Foto DEPOIS
          </h2>

          <p className="text-gray-400 mt-2">
            {fotoDepois
              ? fotoDepois.name
              : "Clique para selecionar"}
          </p>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              setFotoDepois(
                e.target
                  .files?.[0] ||
                  null
              )
            }
          />

        </label>

        <button
          onClick={salvarFotos}
          className="w-full bg-green-500 hover:bg-green-400 transition text-black font-black rounded-2xl p-4 flex items-center justify-center gap-2"
        >

          <Upload size={20} />

          Salvar fotos

        </button>

      </section>

    </main>
  );
}