import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About the KWD platform, our team, mission, and vision.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="border-b-4 border-black py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-black tracking-widest uppercase bg-black text-white px-3 py-1.5 rounded-lg">
              About
            </span>
            <h1 className="text-5xl font-black text-black mt-3 leading-tight">
              Kesararam.
              <br />
              with. digital.
            </h1>
            <p className="text-zinc-600 mt-4 text-base leading-relaxed max-w-sm">
              A Cambodian driving knowledge platform built to help students
              understand traffic signage and pass the mandatory driving theory
              exam. We believe road safety education should be accessible,
              engaging, and available in Khmer.
            </p>
          </div>
          {/* Paper grid style panel */}
          <div className="border-2 border-black rounded-3xl shadow-[6px_6px_0_#000] overflow-hidden">
            <div
              className="h-48 border-b-2 border-black"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                backgroundColor: "#f9fafb",
              }}
            />
            <div className="p-5 bg-white">
              <p className="font-black text-sm">Team KWD</p>
              <p className="text-xs text-zinc-500 mt-1">
                Building road safety education for Cambodia
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Mission",
              text: "Make Cambodian driving theory education accessible to every student through modern, bilingual digital tools.",
              color: "#eab308",
            },
            {
              title: "Vision",
              text: "A Cambodia where every driver understands road safety deeply — reducing accidents and saving lives.",
              color: "#22c55e",
            },
            {
              title: "Values",
              text: "Accessibility. Accuracy. Student-first design. Bilingual by default. Open for all skill levels.",
              color: "#3b82f6",
            },
          ].map(({ title, text, color }) => (
            <div
              key={title}
              className="bg-white border-2 border-black rounded-3xl p-7 shadow-[4px_4px_0_#000] flex flex-col gap-3"
            >
              <div
                className="w-10 h-3 border-2 border-black rounded-full"
                style={{ backgroundColor: color }}
              />
              <h3 className="text-xl font-black">{title}</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
