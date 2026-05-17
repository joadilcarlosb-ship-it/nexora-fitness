"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  Users,
  Dumbbell,
  UserPlus,
  MessageCircle,
} from "lucide-react";

const menu = [
  {
    title: "Cadastrar aluno",
    href: "/admin/cadastrar-aluno",
    icon: UserPlus,
  },
  {
    title: "Ver alunos",
    href: "/admin/alunos",
    icon: Users,
  },
  {
    title: "Criar treino",
    href: "/admin/criar-treino",
    icon: Dumbbell,
  },
  {
    title: "Chat",
    href: "/admin/chat",
    icon: MessageCircle,
  },
];

export default function AdminPage() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 p-5 flex items-center justify-between">
        <div>
          <p className="text-yellow-400 font-black">Nexora Fitness</p>
          <h1 className="text-3xl font-black mt-1">Dashboard</h1>
        </div>

        <button
          onClick={() => setMenuAberto(true)}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3"
        >
          <Menu />
        </button>
      </header>

      {menuAberto && (
        <div className="fixed inset-0 z-50">
          <button
            onClick={() => setMenuAberto(false)}
            className="absolute inset-0 bg-black/70"
          />

          <aside className="relative h-full w-[300px] bg-zinc-950 border-r border-zinc-800 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 font-black">ADMIN</p>
                <h2 className="text-2xl font-black mt-1">Menu</h2>
              </div>

              <button
                onClick={() => setMenuAberto(false)}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-2"
              >
                <X />
              </button>
            </div>

            <div className="mt-8 space-y-3">
              {menu.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-yellow-400 rounded-3xl p-4 font-black"
                  >
                    <Icon className="text-yellow-400" />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      <section className="p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-6">
          <h2 className="text-3xl font-black">Painel administrativo</h2>
          <p className="text-gray-400 mt-3">
            Use o botão de 3 riscos no canto superior para acessar as funções.
          </p>
        </div>
      </section>
    </main>
  );
}