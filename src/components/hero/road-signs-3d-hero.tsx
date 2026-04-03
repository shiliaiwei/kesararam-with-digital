"use client";

import { useLang } from "@/context/lang-context";

// ── Blue signs (regulatory / informational)
const BLUE = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173153/PW03-R2-07KWD_x7pgky.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173156/PW03-R2-01KWD_anmelo.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173156/PW03-R2-03KWD_bupf9g.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173155/PW03-R2-05KWD_mvuvri.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173151/PW03-R2-12KWD_rharui.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173150/PW03-R2-13KWD_pmrcwz.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173147/PW03-R2-19KWD_cqhabi.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173149/PW03-R2-17KWD_tcvwdc.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173146/PW03-R2-21KWD_vyc3hx.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173107/PW03-G4-01KWD_eqrsua.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173106/PW03-G4-03KWD_lidtce.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173105/PW03-G4-06KWD_ldcl6b.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173105/PW03-G4-08KWD_dzn2mj.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173105/PW03-G4-07KWD_mu7xwz.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173103/PW03-G4-09KWD_ylweno.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173102/PW03-G4-13KWD_pa5avd.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173102/PW03-G4-11KWD_kcaq9q.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173102/PW03-G4-14KWD_rvl9kg.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173101/PW03-G4-15KWD_c4x3pr.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173099/PW03-G4-19KWD_b87iar.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173096/PW03-G4-23KWD_b0tuge.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173095/PW03-G4-26KWD_qzunw7.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173093/PW03-G4-30KWD_diswfo.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173092/PW03-G4-34KWD_glerod.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173089/PW03-G4-39KWD_gizeat.svg",
];

// ── Red signs (prohibitory / warning)
const RED = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173158/PW03-R1-44KWD_qyidtw.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173159/PW03-R1-41KWD_bhxu0a.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173162/PW03-R1-36KWD_h9cv1z.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173162/PW03-R1-35KWD_ovejxd.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173164/PW03-R1-31KWD_mjyetc.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173167/PW03-R1-25KWD_cnzq32.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173168/PW03-R1-23KWD_c6ybme.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173170/PW03-R1-20KWD_smst1z.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173177/PW03-R1-05KWD_hd0yrg.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173177/PW03-R1-04KWD_jowasr.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173161/PW03-R1-38KWD_m1blii.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173109/PW03-R3-07KWD_cyly8r.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173111/PW03-R3-02KWD_xty4we.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173111/PW03-R3-03KWD_yyjpsq.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173111/PW03-R3-01KWD_dvwtzg.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173116/PW03-P1-10KWD_vtrlyi.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173116/PW03-P1-09KWD_zro6cg.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173119/PW03-P1-02KWD_ns8moh.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173119/PW03-P1-01KWD_ry8dbh.svg",
];

// ── Yellow signs (warning / caution)
const YELLOW = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173074/PW03-W2-01KWD_pqsgka.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173111/PW03-R3-04KWD_rb9coq.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173145/PW03-W1-01KWD_ixzytx.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173143/PW03-W1-03KWD_tvwy7i.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173141/PW03-W1-09KWD_wicncp.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173140/PW03-W1-10KWD_zs0k3g.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173138/PW03-W1-15KWD_jxwep5.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173137/PW03-W1-17KWD_ne24sh.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173137/PW03-W1-16KWD_f6zb2j.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173129/PW03-W1-33KWD_gsyiso.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173128/PW03-W1-35KWD_wgbbmt.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173127/PW03-W1-38KWD_z656j0.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173125/PW03-W1-42KWD_soj7yw.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173127/PW03-W1-37KWD_xvt2xn.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173128/PW03-W1-34KWD_lq5jye.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173137/PW03-W1-18KWD_todz9o.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173073/PW03-W2-02KWD_m6vu3u.svg",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1775173070/PW03-W2-07KWD_pv8k7r.svg",
];

// Row: blue → red → yellow → blue → red → yellow (interleaved pattern)
function buildRow(a: string[], b: string[], c: string[]): string[] {
  const out: string[] = [];
  const len = Math.max(a.length, b.length, c.length);
  for (let i = 0; i < len; i++) {
    if (a[i % a.length]) out.push(a[i % a.length]);
    if (b[i % b.length]) out.push(b[i % b.length]);
    if (c[i % c.length]) out.push(c[i % c.length]);
  }
  return out;
}

const ROW1 = buildRow(BLUE.slice(0, 9), RED.slice(0, 7), YELLOW.slice(0, 6));
const ROW2 = buildRow(RED.slice(7, 14), YELLOW.slice(6, 12), BLUE.slice(9, 17));
const ROW3 = buildRow(YELLOW.slice(12), BLUE.slice(17), RED.slice(14));

function Row({ signs, reverse, duration, bg }: {
  signs: string[];
  reverse?: boolean;
  duration: number;
  bg: string;
}) {
  const items = [...signs, ...signs];
  return (
    <div className="overflow-hidden py-1">
      <div
        className="flex gap-2 w-max will-change-transform"
        style={{ animation: `${reverse ? "kwd-rev" : "kwd-fwd"} ${duration}s linear infinite` }}
      >
        {items.map((src, i) => (
          <div
            key={i}
            className="shrink-0 w-14 h-14 flex items-center justify-center"
            style={{ background: bg, border: "2px solid #000", boxShadow: "2px 2px 0 #000" }}
          >
            <img
              src={src}
              alt=""
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              className="w-10 h-10 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoadSigns3DHero() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <section className="relative w-full overflow-hidden bg-white py-10">
      <style>{`
        @keyframes kwd-fwd { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes kwd-rev { from { transform: translateX(-50%) } to { transform: translateX(0) } }
      `}</style>

      <div className="absolute inset-y-0 left-0 w-12 md:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 md:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div className="relative z-10 text-center mb-6 px-4">
        <div className="inline-flex items-center gap-2 border-2 border-black bg-yellow-400 text-black text-[11px] font-black px-3 py-1 uppercase tracking-widest shadow-[2px_2px_0_#000] mb-3">
          <span className="w-1.5 h-1.5 bg-black" />
          {kh ? "ស្គាល់សញ្ញាចរាចរ" : "Know Every Sign"}
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-black" style={kf}>
          {kh ? "វីថីសុវត្ថិភាព" : "The Way of Safety"}
        </h2>
      </div>

      <div className="relative z-10 flex flex-col gap-2">
        {/* Row 1 — blue bg, forward */}
        <Row signs={ROW1} duration={60} bg="#dbeafe" />
        {/* Row 2 — red bg, reverse */}
        <Row signs={ROW2} reverse duration={75} bg="#fee2e2" />
        {/* Row 3 — yellow bg, forward */}
        <Row signs={ROW3} duration={50} bg="#fef9c3" />
      </div>
    </section>
  );
}
