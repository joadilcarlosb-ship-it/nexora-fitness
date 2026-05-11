"use client";

import { useState } from "react";
import { UserPlus, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CadastrarAlunoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [peso, setPeso] = useState("");
  const [medidas, setMedidas] = useState("");
  const [foco, setFoco] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  async function enviarFoto(alunoId: string) {
    if (!foto) return "";

    const extensao = foto.name.split(".").pop();
    const caminho = `${alunoId}.${extensao}`;

    const { error } = await supabase.storage
      .from("alunos")
      .upload(caminho, foto, {
        upsert: true,
      });

    if (error) {
      alert(error.message);
      return "";
    }

    const { data } = supabase.storage
      .from("alunos")
      .getPublicUrl(caminho);

    return data.publicUrl;
  }

  async function cadastrarAluno() {
    if (
      !nome ||
      !email ||
      !senha ||
      !objetivo ||
      !peso ||
      !medidas ||
      !foco
    ) {
      alert("Preencha todos os campos.");
      return;
    }

    const alunoId = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const fotoUrl = await enviarFoto(alunoId);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome,
          tipo: "aluno",
          aluno_id: alunoId,
        },
      },
    });

    if (authError) {
      alert(authError.message);
      return;
    }

    const { error } = await supabase.from("alunos").insert({
      nome,
      email,
      objetivo,
      aluno_id: alunoId,
      peso,
      medidas,
      foco,
      foto_url: fotoUrl,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert(`Aluno criado com sucesso!\nID do aluno: ${alunoId}`);

    setNome("");
    setEmail("");
    setSenha("");
    setObjetivo("");
    setPeso("");
    setMedidas("");
    setFoco("");
    setFoto(null);
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex items-center gap-3">
        <UserPlus className="text-green-500" size={32} />

        <div>
          <h1 className="text-4xl font-black">Cadastrar aluno</h1>
          <p className="text-gray-400 mt-1">
            Crie o aluno, login e avaliação inicial.
          </p>
        </div>
      </div>

      <section className="mt-10 space-y-5">
        <label className="block bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center cursor-pointer hover:border-green-500 transition">
          <Camera className="text-green-500 mx-auto" size={36} />

          <p className="font-black mt-3">
            {foto ? foto.name : "Adicionar foto do rosto"}
          </p>

          <p className="text-gray-500 text-sm mt-1">
            Ajuda o admin a identificar o aluno.
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFoto(e.target.files?.[0] || null)
            }
            className="hidden"
          />
        </label>

        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <input
          type="email"
          placeholder="E-mail do aluno"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <input
          type="text"
          placeholder="Senha provisória"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <input
          type="text"
          placeholder="Peso atual. Ex: 72kg"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        />

        <textarea
          placeholder="Medidas. Ex: braço 36cm, peito 98cm, cintura 82cm"
          value={medidas}
          onChange={(e) => setMedidas(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500 min-h-[120px]"
        />

        <select
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        >
          <option value="">Objetivo principal</option>
          <option value="Hipertrofia">Hipertrofia</option>
          <option value="Emagrecimento">Emagrecimento</option>
          <option value="Condicionamento">Condicionamento</option>
          <option value="Força">Força</option>
          <option value="Saúde">Saúde</option>
        </select>

        <select
          value={foco}
          onChange={(e) => setFoco(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 outline-none focus:border-green-500"
        >
          <option value="">Foco do aluno</option>
          <option value="Ganhar massa">Ganhar massa</option>
          <option value="Perder gordura">Perder gordura</option>
          <option value="Definir corpo">Definir corpo</option>
          <option value="Melhorar resistência">
            Melhorar resistência
          </option>
        </select>

        <button
          onClick={cadastrarAluno}
          className="w-full bg-green-500 hover:bg-green-400 transition text-black font-black rounded-2xl p-4"
        >
          Criar aluno e login
        </button>
      </section>
    </main>
  );
}