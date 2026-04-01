"use client";

import { useLang } from "@/context/lang-context";

const B = "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto,w_72";
const SIGNS = [
  `${B}/v1774900736/uzdi1743_e6yr2i.png`,`${B}/v1774900713/uox8n3yy_wbyxhm.png`,
  `${B}/v1774900689/tsvklpgl_rvw3n6.png`,`${B}/v1774900664/tsizdw5e_p71udp.png`,
  `${B}/v1774900663/tqq1wsgr_jxrov3.png`,`${B}/v1774900638/tiddyeck_ldh6mu.png`,
  `${B}/v1774900613/sy5n2arp_neysxb.png`,`${B}/v1774900580/rb26r3kg_pmvqp4.png`,
  `${B}/v1774900544/quozkm6s_iast0a.png`,`${B}/v1774900520/qrxnk5w3_ewe8yd.png`,
  `${B}/v1774900522/qud044qv_wg7sen.png`,`${B}/v1774900465/q8h9n16b_fsfm6q.png`,
  `${B}/v1774900463/pp3qlqhy_olfbtk.png`,`${B}/v1774900433/poknw0mm_w6piqa.png`,
  `${B}/v1774900432/pfehknx1_obofvc.png`,`${B}/v1774900431/pdeo2650_l8leqx.png`,
  `${B}/v1774900392/okmik000_k1ybzc.png`,`${B}/v1774900391/ofgpkkhi_xelwgy.png`,
  `${B}/v1774900391/nfsmdsk7_xwvk6p.png`,`${B}/v1774900026/mvi9dddk_me4bzq.png`,
  `${B}/v1774900025/mro4vsor_tgjqk0.png`,`${B}/v1774899790/mln5rehr_zyyl52.png`,
  `${B}/v1774899789/m1uhn5nj_twiqmm.png`,`${B}/v1774899768/lwtdb1t1_ss9ngu.png`,
  `${B}/v1774899767/lw2trke1_s6wokz.png`,`${B}/v1774899767/lrp3wxth_kx5l8o.png`,
  `${B}/v1774899665/lqdgeqtk_tzgnd6.png`,`${B}/v1774899664/l9y6nym8_n0xcjz.png`,
  `${B}/v1774899651/l0y198kz_u30fqp.png`,`${B}/v1774899638/kvmzp9nn_hweuyw.png`,
  `${B}/v1774899630/khxmu8nm_ukibbv.png`,`${B}/v1774899609/jovknvis_wo2gv1.png`,
  `${B}/v1774899589/j561pt2r_jmkob1.png`,`${B}/v1774899571/ivn0govi_njq9b2.png`,
  `${B}/v1774899571/iq9tgyoy_fid13y.png`,`${B}/v1774899557/ifs8ftmf_ypthzd.png`,
  `${B}/v1774899548/i5ojkef3_sjeqwc.png`,`${B}/v1774899383/i1oqw5pb_qnv7x2.png`,
  `${B}/v1774899372/hst0phx9_ytjpcs.png`,`${B}/v1774899357/hrcfvhjh_nhdkum.png`,
  `${B}/v1774899355/h78xgdld_e6hrxk.png`,`${B}/v1774899334/gu91p1vw_v92kbu.png`,
  `${B}/v1774899319/gnpp3qcm_nl3x9o.png`,`${B}/v1774899318/gmnqcpl0_y3iojh.png`,
  `${B}/v1774899292/g83q8owa_glov3d.png`,`${B}/v1774899138/fqjuv17q_aqtfez.png`,
  `${B}/v1774898778/es2e1izh_dxvuvo.png`,`${B}/v1774898777/ejirvawo_w4pvut.png`,
  `${B}/v1774898551/e224d9f6_zhuoui.png`,`${B}/v1774898542/e7ek0x1s_hd4bru.png`,
  `${B}/v1774898506/dg3fn3cn_zanuvz.png`,`${B}/v1774898490/d5uaw6lo_agnfwm.png`,
  `${B}/v1774898476/clt1cr8k_mvcvas.png`,`${B}/v1774898464/b7r1oir5_s2si6g.png`,
  `${B}/v1774898455/aeir7vdk_a3a3sl.png`,`${B}/v1774898454/747d1g9d_ii5n8p.png`,
  `${B}/v1774898445/117pzjd5_vojbn2.png`,`${B}/v1774898439/85s0id53_yy1b4e.png`,
  `${B}/v1774898431/63zks93y_zys0ju.png`,`${B}/v1774898423/20q2fhbk_oqxmjs.png`,
  `${B}/v1774898404/9lkqyil3_hedded.png`,`${B}/v1774898404/8i7d24mq_i4lg1r.png`,
  `${B}/v1774898374/7t58zxvp_gqrkk7.png`,`${B}/v1774898359/7rhcfmn9_get4sk.png`,
  `${B}/v1774898319/5f19nk14_xdszle.png`,`${B}/v1774898301/4s99vxq9_tvbcqk.png`,
];

const R1 = SIGNS.slice(0, 22);
const R2 = SIGNS.slice(22, 44);
const R3 = SIGNS.slice(44);

function Row({ signs, reverse, duration }: { signs: string[]; reverse?: boolean; duration: number }) {
  const items = [...signs, ...signs];
  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-3 w-max will-change-transform"
        style={{ animation: `${reverse ? "slide-rev" : "slide-fwd"} ${duration}s linear infinite` }}
      >
        {items.map((src, i) => (
          <div
            key={i}
            className="shrink-0 w-16 h-16 flex items-center justify-center p-1"
          >
            <img src={src} alt="" width={60} height={60} loading="lazy" decoding="async" className="w-full h-full object-contain" />
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
    <section className="relative w-full overflow-hidden bg-white py-12">
      <style>{`
        @keyframes slide-fwd { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes slide-rev { from { transform: translateX(-50%) } to { transform: translateX(0) } }
      `}</style>

      <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div className="relative z-10 text-center mb-8 px-4">
        <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/30 text-amber-600 text-[11px] font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          {kh ? "ស្គាល់សញ្ញាចរាចរ" : "Know Every Sign"}
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-black mb-0" style={kf}>
          {kh ? "វីថីសុវត្ថិភាព" : "The Way of Safety"}
        </h2>
      </div>

      <div className="relative z-10 flex flex-col gap-2">
        <Row signs={R1} duration={55} />
        <Row signs={R2} reverse duration={70} />
        <Row signs={R3} duration={45} />
      </div>
    </section>
  );
}
