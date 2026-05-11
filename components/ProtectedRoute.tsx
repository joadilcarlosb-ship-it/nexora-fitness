"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ProtectedRouteProps = {
  children: React.ReactNode;
  tipoPermitido: "admin" | "aluno";
};

export default function ProtectedRoute({
  children,
  tipoPermitido,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarUsuario() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const tipo = user.user_metadata?.tipo;

      if (!tipo && tipoPermitido === "admin") {
        setCarregando(false);
        return;
      }

      if (tipo !== tipoPermitido) {
        if (tipo === "admin") {
          router.push("/admin");
        } else {
          router.push("/aluno");
        }

        return;
      }

      setCarregando(false);
    }

    verificarUsuario();
  }, [router, tipoPermitido]);

  if (carregando) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-green-500 font-black">Carregando...</p>
      </main>
    );
  }

  return <>{children}</>;
}