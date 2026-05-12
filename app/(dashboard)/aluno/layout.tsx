"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarAluno();
  }, []);

  async function verificarAluno() {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user?.email) {
      router.push("/login");
      return;
    }

    const { data: aluno } = await supabase
      .from("alunos")
      .select("*")
      .eq("email", user.email)
      .single();

    if (!aluno) {
      router.push("/login");
      return;
    }

    if (aluno.tipo === "admin") {
      router.push("/admin");
      return;
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-green-500 font-black text-2xl">
          Carregando...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}