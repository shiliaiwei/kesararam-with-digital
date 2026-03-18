"use client";

import { Marquee } from "@/components/ui/marquee";
import { useLang } from "@/context/lang-context";

// Road signs from Cloudinary Assets256 folder
const roadSigns = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567766/1313_rgyqmp.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567763/1220_yniewl.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567761/1213_wfvtpb.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567758/1112_iboram.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567755/1018_azg5k4.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567700/783_cpt0hd.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567700/782_orf4um.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567700/781_mc5jir.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567700/780_fy3m2i.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567699/779_umhzho.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567699/778_rpllnw.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567698/776_jbg2lq.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567698/775_fug6ra.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567697/774_oiep4k.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567696/773_uk6rt9.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567696/771_qze6fq.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567695/770_w12d5f.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567695/769_ike5sq.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567695/768_une1lu.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567694/767_t5bcgd.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567693/763_abffsf.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567692/762_vzkkpx.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567692/761_jzqqxn.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567692/760_d7pv4e.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567692/759_wstotk.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567691/758_djdjiu.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567691/757_vgkiwb.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567688/752_otemq7.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567687/751_fmrkxb.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567687/750_yvzguu.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567687/748_cl0wwv.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567687/747_elxndx.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567686/746_g4pbeh.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567684/742_ipt48v.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567683/741_cljp7l.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567683/740_upuxar.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567682/738_mfwqw0.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567681/737_h9gskl.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567681/736_iuhbqx.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567679/732_amlsqq.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567678/728_tbu6ta.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567677/727_uxbemn.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567677/726_ahecgh.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567675/702_innihz.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567675/701_julsob.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567675/699_juu7lq.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567674/697_ihjdb8.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567673/695_bennjm.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567673/694_ljbnye.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567672/656_bgcfab.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567667/653_f6ybei.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567667/652_n2qkz9.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567657/609_rht9cd.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567657/606_vzkj6r.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567648/564_rbnapr.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567648/562_vyeuj5.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567647/560_mlzoqf.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567647/558_u6ryk5.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567642/475_tvvqyl.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567640/474_eojjoq.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567639/473_fw8ikf.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567634/469_eh9pyl.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567634/468_yvrcf6.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567630/429_egxole.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567630/426_oplsvb.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567608/379_tqmzmb.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567594/241_ssjrhy.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567594/239_jub4zp.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567542/68_eydmt0.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567542/65_o8giis.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567542/63_ico9dx.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567508/43_yasdle.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567507/28_lomkpx.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567507/21_eu1tae.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1773567506/5_abpqsn.png",
];

// Split into rows for 3D effect
const row1 = roadSigns.slice(0, 19);
const row2 = roadSigns.slice(19, 38);
const row3 = roadSigns.slice(38, 57);
const row4 = roadSigns.slice(57);

function SignCard({ src, index }: { src: string; index: number }) {
  return (
    <div
      className="relative shrink-0 cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10"
      style={{
        width: "clamp(100px, 12vw, 150px)",
        height: "clamp(100px, 12vw, 150px)",
      }}
    >
      <div className="relative w-full h-full">
        <img
          src={src}
          alt={`Road sign ${index + 1}`}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export function RoadSigns3DHero() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};

  return (
    <section className="relative w-full bg-transparent overflow-hidden pt-4 pb-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-zinc-800" style={khFont}>
          {kh ? "វីថីសុវត្ថិភាព" : "The Way of Safety"}
        </h2>
      </div>

      {/* 3D Perspective Container */}
      <div className="relative w-full">
        {/* Perspective wrapper */}
        <div
          className="relative w-full"
          style={{
            perspective: "1200px",
            perspectiveOrigin: "center center",
          }}
        >
          {/* Row 1 - Top (furthest) */}
          <div
            className="relative mb-3"
            style={{
              transform: "rotateX(8deg) translateZ(-200px) scale(0.85)",
              transformStyle: "preserve-3d",
            }}
          >
            <Marquee className="[--duration:60s]" pauseOnHover>
              {row1.map((src, i) => (
                <SignCard key={`r1-${i}`} src={src} index={i} />
              ))}
            </Marquee>
          </div>

          {/* Row 2 */}
          <div
            className="relative mb-3"
            style={{
              transform: "rotateX(6deg) translateZ(-100px) scale(0.92)",
              transformStyle: "preserve-3d",
            }}
          >
            <Marquee className="[--duration:55s]" reverse pauseOnHover>
              {row2.map((src, i) => (
                <SignCard key={`r2-${i}`} src={src} index={i + 19} />
              ))}
            </Marquee>
          </div>

          {/* Row 3 */}
          <div
            className="relative mb-3"
            style={{
              transform: "rotateX(4deg) translateZ(0px) scale(0.98)",
              transformStyle: "preserve-3d",
            }}
          >
            <Marquee className="[--duration:50s]" pauseOnHover>
              {row3.map((src, i) => (
                <SignCard key={`r3-${i}`} src={src} index={i + 38} />
              ))}
            </Marquee>
          </div>

          {/* Row 4 - Bottom (closest) */}
          <div
            className="relative"
            style={{
              transform: "rotateX(2deg) translateZ(100px) scale(1.05)",
              transformStyle: "preserve-3d",
            }}
          >
            <Marquee className="[--duration:45s]" reverse pauseOnHover>
              {row4.map((src, i) => (
                <SignCard key={`r4-${i}`} src={src} index={i + 57} />
              ))}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  );
}
