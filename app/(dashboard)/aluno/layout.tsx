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
    verificar();
  }, []);

  async function verificar() {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user?.email) {
      router.replace("/login");
      return;
    }

    const { data: aluno } = await supabase
      .from("alunos")
      .select("tipo")
      .eq("email", user.email)
      .maybeSingle();

    if (!aluno) {
      router.replace("/login");
      return;
    }

    if (aluno.tipo === "admin") {
      router.replace("/admin");
      return;
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-green-500 font-black text-2xl">
          Carregando aluno...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}