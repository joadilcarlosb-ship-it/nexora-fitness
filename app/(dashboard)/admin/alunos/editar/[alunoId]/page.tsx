"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Save, User, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Aluno = {
  id: number;
  nome: string;
  email: string;
  aluno_id: string;
  objetivo: string;
  peso: string;
  medidas: string;
  foco: string;
  foto_url: string;
};

export default function EditarAlunoPage() {
  const params = useParams();
  const alunoId = params.alunoId as string;

  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [foto, setFoto] = useState<File | null>(null);

  async function buscarAluno() {
    const { data, error } = await supabase
      .from("alunos")
      .select("*")
      .eq("aluno_id", alunoId)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setAluno(data);
  }

  async function enviarFoto() {
    if (!foto || !aluno) return aluno?.foto_url || "";

    const extensao = foto.name.split(".").pop();
    const caminho = `${aluno.aluno_id}.${extensao}`;

    const { error } = await supabase.storage
      .from("alunos")
      .upload(caminho, foto, { upsert: true });

    if (error) {
      alert(error.message);
      return aluno.foto_url;
    }

    const { data } = supabase.storage
      .from("alunos")
      .getPublicUrl(caminho);

    return data.publicUrl;
  }

  async function salvarAluno() {
    if (!aluno) return;

    const fotoUrl = await enviarFoto();

    const { error } = await supabase
      .from("alunos")
      .update({
        nome: aluno.nome,
        email: aluno.email,
        objetivo: aluno.objetivo,
        peso: aluno.peso,
        medidas: aluno.medidas,
        foco: aluno.foco,
        foto_url: fotoUrl,
      })
      .eq("aluno_id", aluno.aluno_id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Aluno atualizado com sucesso!");
    buscarAluno();
  }

  useEffect(() => {
    buscarAluno();
  }, []);

  if (!aluno) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-green-500 font-black">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center gap-3">
        <User className="text-green-500" size={32} />

        <div>
          <h1 className="text-4xl font-black">Editar aluno</h1>
          <p className="text-gray-400 mt-1">ID: {aluno.aluno_id}</p>
        </div>
      </div>

      <section className="mt-8 space-y-5">
        <label className="block bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center cursor-pointer hover:border-green-500 transition">
          <div className="mx-auto w-28 h-28 rounded-3xl bg-green-500 overflow-hidden flex items-center justify-center">
            {aluno.foto_url ? (
              <img
                src={aluno.foto_url}
                alt={aluno.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="text-black" size={42} />
            )}
          </div>

          <p className="font-black mt-4">
            {foto ? foto.name : "Trocar foto do aluno"}
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>

        <input
          value={aluno.nome}
          onChange={(e) =>
            setAluno({
              ...aluno,
              nome: e.target.value,
            })
          }
          placeholder="Nome"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <input
          value={aluno.email}
          onChange={(e) =>
            setAluno({
              ...aluno,
              email: e.target.value,
            })
          }
          placeholder="E-mail"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <input
          value={aluno.peso || ""}
          onChange={(e) =>
            setAluno({
              ...aluno,
              peso: e.target.value,
            })
          }
          placeholder="Peso"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <textarea
          value={aluno.medidas || ""}
          onChange={(e) =>
            setAluno({
              ...aluno,
              medidas: e.target.value,
            })
          }
          placeholder="Medidas"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500 min-h-[120px]"
        />

        <select
          value={aluno.objetivo || ""}
          onChange={(e) =>
            setAluno({
              ...aluno,
              objetivo: e.target.value,
            })
          }
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        >
          <option value="">Objetivo</option>
          <option value="Hipertrofia">Hipertrofia</option>
          <option value="Emagrecimento">Emagrecimento</option>
          <option value="Condicionamento">Condicionamento</option>
          <option value="Força">Força</option>
          <option value="Saúde">Saúde</option>
        </select>

        <select
          value={aluno.foco || ""}
          onChange={(e) =>
            setAluno({
              ...aluno,
              foco: e.target.value,
            })
          }
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        >
          <option value="">Foco</option>
          <option value="Ganhar massa">Ganhar massa</option>
          <option value="Perder gordura">Perder gordura</option>
          <option value="Definir corpo">Definir corpo</option>
          <option value="Melhorar resistência">Melhorar resistência</option>
        </select>

        <button
          onClick={salvarAluno}
          className="w-full bg-green-500 hover:bg-green-400 transition text-black font-black rounded-2xl p-4 flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Salvar alterações
        </button>
      </section>
    </main>
  );
}