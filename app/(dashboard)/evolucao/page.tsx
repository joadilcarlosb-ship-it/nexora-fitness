import BottomNav from "@/components/BottomNav";
import { ChartColumn, Weight, Ruler } from "lucide-react";

export default function EvolucaoPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 pb-28">
      <h1 className="text-4xl font-black">Evolução</h1>
      <p className="text-gray-400 mt-2">Acompanhe seu progresso.</p>

      <section className="grid gap-4 mt-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <Weight className="text-green-500" />
            <h2 className="font-bold text-xl">Peso atual</h2>
          </div>
          <p className="text-3xl font-black mt-3">72 kg</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <Ruler className="text-green-500" />
            <h2 className="font-bold text-xl">Medidas</h2>
          </div>
          <p className="text-gray-400 mt-3">Braço: 36cm • Peito: 98cm</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <ChartColumn className="text-green-500" />
            <h2 className="font-bold text-xl">Resultado</h2>
          </div>
          <p className="text-gray-400 mt-3">+4kg de massa muscular</p>
        </div>
      </section>

      <BottomNav />
    </main>
  );
}