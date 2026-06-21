"use client";

/* ────────────────────────────────────────────────────────────────
   KWD Pitch Deck — "The Way of Safety"
   A full-screen, KEYBOARD-DRIVEN "night drive" pitch (no scroll/swipe).
   9 stops: cover → team → problem → market → solution → business →
   marketing flywheel → learning journey → appendix. No Suar AI by request.

   Navigation (keyboard only, plus on-screen arrows / dots):
     →  ↓  Space  PageDown  = next
     ←  ↑  PageUp           = previous
     Home / End             = first / last
   ──────────────────────────────────────────────────────────────── */

import { useEffect, useState, useCallback } from "react";
import {
  LibraryBig, Gamepad2, Radio, Trophy, GraduationCap, Languages,
  AlertTriangle, FileX2, UserX, BookOpenCheck, Wrench, MousePointerClick,
} from "lucide-react";

const SLIDE_COUNT = 9;

/* count-up that runs when its slide becomes active */
function useCountUp(target: number, run: boolean, duration = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration]);
  return v;
}

function Odo({ target, run, prefix = "", suffix = "" }: { target: number; run: boolean; prefix?: string; suffix?: string }) {
  const v = useCountUp(target, run);
  return <div className="odo">{prefix}{v.toLocaleString()}{suffix}</div>;
}

const d = (ms: number) => ({ ["--d" as string]: ms } as React.CSSProperties);

/* ── editable team data — replace names with your real team ── */
const TEAM = [
  { i: "យ", nm: "Yin Daneath", rl: "Lessons & content" },
  { i: "ល", nm: "Lin Mary", rl: "Research & sound" },
  { i: "ច", nm: "Member name", rl: "Statistics & data" },
  { i: "ស", nm: "Member name", rl: "UX & design" },
  { i: "ដ", nm: "Member name", rl: "Build & QA" },
];

/* ── appendix: framework crosswalk (proof of coverage for judges) ── */
const CROSSWALK: [string, string, string, string][] = [
  ["0 Cover + Hook", "—", "1 Title", "1 Title"],
  ["1 Team", "01", "8 Team", "(in title)"],
  ["2 Problem", "02", "2 Problem", "2 Problem"],
  ["3 Market", "03", "3 Value prop + 7 Competition", "6 Competitor"],
  ["4 Solution + Demo", "04", "4 Underlying magic", "3 Solution + 4 Technology"],
  ["5 Business model", "05", "5 Business model + 9 Financials", "8 Financials"],
  ["6 Marketing", "06", "6 Go-to-market", "5 Users & marketing"],
  ["7 Journey + Future", "07", "10 Status & milestones", "7 Impact + 9 Future + 10 Conclusion"],
];

export default function PitchDeck() {
  const [active, setActive] = useState(0);

  const goTo = useCallback((i: number) => {
    setActive(Math.max(0, Math.min(SLIDE_COUNT - 1, i)));
  }, []);

  /* keyboard navigation only — no scroll, no swipe */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowRight", " ", "PageDown"].includes(e.key)) { e.preventDefault(); goTo(active + 1); }
      else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); goTo(active - 1); }
      else if (e.key === "Home") { e.preventDefault(); goTo(0); }
      else if (e.key === "End") { e.preventDefault(); goTo(SLIDE_COUNT - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, goTo]);

  const cls = (i: number) => `slide${i === active ? " in-view" : ""}`;

  return (
    <div className="kwd-pitch">
      {/* progress + top bar */}
      <div className="progress" style={{ width: `${((active + 1) / SLIDE_COUNT) * 100}%` }} />
      <div className="topbar">
        <div className="brand">
          <img src="/brand/kwd-yellow.png" alt="KWD" />
          <span>THE WAY OF SAFETY</span>
        </div>
        <div className="count">{String(active + 1).padStart(2, "0")} / {String(SLIDE_COUNT).padStart(2, "0")}</div>
      </div>

      {/* dot nav */}
      <div className="dots">
        {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
          <button key={i} className={i === active ? "on" : ""} aria-label={`Go to slide ${i + 1}`} onClick={() => goTo(i)} />
        ))}
      </div>

      {/* prev / next */}
      <div className="nav">
        <button onClick={() => goTo(active - 1)} disabled={active === 0} aria-label="Previous">↑</button>
        <button onClick={() => goTo(active + 1)} disabled={active === SLIDE_COUNT - 1} aria-label="Next">↓</button>
      </div>

      {/* keyboard-driven stage: the track slides; nothing scrolls */}
      <div className="pitch-stage">
        <div className="pitch-track" style={{ transform: `translateY(${active * -100}dvh)` }}>

          {/* ───── 0 · COVER + HOOK ───── */}
          <section className={cls(0)}>
            <span className="reveal eyebrow" style={d(0)}>Technovation Girls Cambodia 2026 · Team #50777</span>
            <img className="reveal" style={{ ...d(120), height: "clamp(64px,12vw,120px)", marginTop: 22 }} src="/brand/kwd-yellow.png" alt="KWD logo" />
            <h1 className="reveal" style={d(220)}>The Way<br />of Safety</h1>
            <div className="reveal kh" style={{ ...d(320), fontSize: "clamp(18px,3vw,30px)" }}>វិថីសុវត្ថិភាព</div>
            <p className="reveal lead" style={d(420)}>Cambodia&apos;s first <span className="hl">bilingual</span> road-safety game — learn signs &amp; rules in ខ្មែរ &amp; English.</p>
            <div className="reveal" style={{ ...d(560), marginTop: 30 }}>
              <Odo target={3000} run={active === 0} suffix="+" />
              <div className="lead" style={{ marginTop: 4 }}>lives lost on Cambodia&apos;s roads <strong>every year</strong></div>
            </div>
            <div className="hint">press → arrow key to drive</div>
          </section>

          {/* ───── 1 · TEAM ───── */}
          <section className={cls(1)}>
            <span className="reveal eyebrow" style={d(0)}>01 · About the Team</span>
            <h2 className="reveal" style={d(100)}>Meet the crew <span className="kh">ក្រុមការងារ</span></h2>
            <p className="reveal lead" style={d(180)}>5 students from Siem Reap. We didn&apos;t just <em>design</em> an app — we <span className="hl">built and shipped</span> it.</p>
            <div className="crew">
              {TEAM.map((m, i) => (
                <div className="reveal member" key={i} style={d(280 + i * 90)}>
                  <div className="avatar">{m.i}</div>
                  <div className="nm">{m.nm}</div>
                  <div className="rl">{m.rl}</div>
                </div>
              ))}
            </div>
            <div className="chips reveal" style={d(760)}>
              <span className="chip ghost">Technical mentor</span>
              <span className="chip ghost">Business mentor</span>
            </div>
          </section>

          {/* ───── 2 · PROBLEM ───── */}
          <section className={cls(2)}>
            <span className="reveal eyebrow" style={d(0)}>02 · The Problem</span>
            <h2 className="reveal" style={d(100)}>Deadly roads. Broken learning.</h2>
            <div className="reveal" style={{ ...d(220), marginTop: 6 }}>
              <Odo target={3113} run={active === 2} />
              <div className="lead">road deaths in Cambodia, 2021 — a leading cause of death <span className="muted">(WHO, 2023)</span></div>
            </div>
            <div className="grid g3">
              {[
                { I: FileX2, t: "Foreign-language PDFs", s: "Most road-safety material is text-heavy and not in Khmer." },
                { I: AlertTriangle, t: "Boring → forgotten", s: "Nobody finishes a 200-page book. Retention is near zero." },
                { I: UserX, t: "No tool for teachers", s: "Teachers have no Khmer digital way to teach or track students." },
              ].map((c, i) => (
                <div className="reveal card" key={i} style={d(360 + i * 130)}>
                  <c.I className="ico" size={30} />
                  <div className="t">{c.t}</div>
                  <div className="s">{c.s}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ───── 3 · MARKET ───── */}
          <section className={cls(3)}>
            <span className="reveal eyebrow" style={d(0)}>03 · Market Research</span>
            <h2 className="reveal" style={d(100)}>A big market, reached bottom-up</h2>
            <div className="funnel">
              <div className="reveal row" style={d(200)}><b>6.5M</b><span>TAM · learners 13–18 in Cambodia</span></div>
              <div className="reveal row" style={d(320)}><b>120K</b><span>SAM · teachers &amp; families (~48K digital-ready)</span></div>
              <div className="reveal row" style={d(440)}><b>100 → 500</b><span>SOM · paying subscribers, 2027–2029</span></div>
            </div>
            <div className="grid g3" style={{ marginTop: 22 }}>
              {[
                { t: "Dara, 16", s: "Student — wants to pass the test fast, learns by playing." },
                { t: "Lok Kru Sophea, 38", s: "Teacher — needs Khmer materials & student tracking." },
                { t: "Aunt Pov, 50", s: "Parent — worried about road safety, lives on Facebook." },
              ].map((c, i) => (
                <div className="reveal card" key={i} style={d(560 + i * 120)}>
                  <div className="t">{c.t}</div>
                  <div className="s">{c.s}</div>
                </div>
              ))}
            </div>
            <p className="reveal lead" style={{ ...d(940), marginTop: 18 }}>Rivals are single-language with no games. <span className="hl">Only KWD</span> is bilingual + games + live + teacher tools.</p>
          </section>

          {/* ───── 4 · SOLUTION (LIVE — no Suar AI) ───── */}
          <section className={cls(4)}>
            <span className="reveal eyebrow" style={d(0)}>04 · Solution + Key Features</span>
            <h2 className="reveal" style={d(100)}>A road-safety simulator you learn from</h2>
            <div className="grid g3">
              {[
                { I: LibraryBig, t: "8 categories · 3,300+ Qs", s: "Full bilingual curriculum, signs to emergencies." },
                { I: Gamepad2, t: "9 games", s: "Catch the Sign, Sign Match, Light Hero, Priority Puzzle…" },
                { I: Radio, t: "Live multiplayer", s: "Teacher hosts a room, students join by code in real time." },
                { I: Trophy, t: "Leaderboards & streaks", s: "Daily Challenge keeps learners coming back." },
                { I: GraduationCap, t: "Teacher dashboard", s: "Classes, live sessions, per-student reports." },
                { I: Languages, t: "Khmer + English", s: "Everything works in both languages, on any device." },
              ].map((c, i) => (
                <div className="reveal card" key={i} style={d(220 + i * 110)}>
                  <c.I className="ico" size={30} />
                  <div className="t">{c.t}</div>
                  <div className="s">{c.s}</div>
                </div>
              ))}
            </div>
            <div className="reveal live" style={{ ...d(900), marginTop: 24 }}>
              <span className="dot" /> LIVE NOW · kesararamwithdigital.tech
            </div>
          </section>

          {/* ───── 5 · BUSINESS MODEL ───── */}
          <section className={cls(5)}>
            <span className="reveal eyebrow" style={d(0)}>05 · Business Model</span>
            <h2 className="reveal" style={d(100)}>Free for students. <span className="hl">Forever.</span></h2>
            <p className="reveal lead" style={d(180)}>Those who can pay fund those who can&apos;t — families, teachers &amp; schools subscribe.</p>
            <div className="chips reveal" style={d(300)}>
              <span className="chip">Family $5/mo</span>
              <span className="chip">Teacher Pro $10/mo</span>
              <span className="chip">School $20/mo</span>
              <span className="chip">Driving School $35/mo</span>
            </div>
            <div className="reveal" style={{ ...d(440), marginTop: 26, display: "flex", gap: "clamp(16px,5vw,60px)", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
              <div>
                <Odo target={500} run={active === 5} />
                <div className="lead">paying subscribers by 2029</div>
              </div>
              <div className="tl" aria-hidden><i className="r" /><i className="y" /><i className="g" /></div>
            </div>
            <p className="reveal lead" style={{ ...d(560), marginTop: 18 }}>Runs on <span className="hl">~$80/month</span> → <strong>break-even in Year 1 (2027)</strong>.</p>
          </section>

          {/* ───── 6 · MARKETING FLYWHEEL ───── */}
          <section className={cls(6)}>
            <span className="reveal eyebrow" style={d(0)}>06 · Marketing &amp; Adoption</span>
            <h2 className="reveal" style={d(100)}>Adoption is a flywheel</h2>
            <div className="reveal wheelwrap" style={d(220)}>
              <ul className="flywheel">
                {["Teacher invites class", "Students learn & compete", "They tell friends", "Family subscribes", "Funds new content"].map((s, i) => (
                  <li key={i} style={{ ["--i" as string]: i } as React.CSSProperties}><span>{s}</span></li>
                ))}
              </ul>
              <div className="hub">GROWTH<br />LOOP</div>
            </div>
            <div className="chips reveal" style={d(420)}>
              <span className="chip ghost">TikTok / FB Reels</span>
              <span className="chip ghost">Khmer SEO</span>
              <span className="chip ghost">School roadshows</span>
              <span className="chip ghost">MoUs &amp; NGOs</span>
            </div>
            <div className="bars">
              {[{ y: "2027", n: 100, h: 33 }, { y: "2028", n: 250, h: 60 }, { y: "2029", n: 500, h: 100 }].map((b, i) => (
                <div className="bar" key={b.y}>
                  <div className="fill reveal" style={{ ...d(500 + i * 160), height: `${b.h}%` }}>{b.n}</div>
                  <div className="yr">{b.y}<small>subscribers</small></div>
                </div>
              ))}
            </div>
            <p className="reveal lead" style={{ ...d(1000), marginTop: 14 }}><span className="hl">500+ testers</span> already, in 3 months.</p>
          </section>

          {/* ───── 7 · LEARNING JOURNEY + CLOSE ───── */}
          <section className={cls(7)}>
            <span className="reveal eyebrow" style={d(0)}>07 · Learning Journey</span>
            <h2 className="reveal" style={d(100)}>We built it twice — by listening</h2>
            <div className="grid g3">
              {[
                { I: Languages, t: "Added a Khmer keyboard", s: "Testers struggled to type — so we fixed input first." },
                { I: BookOpenCheck, t: "Built a Learning Journey", s: "Students wanted a clear path, not random quizzes." },
                { I: Wrench, t: "Removed speed-bonus scoring", s: "It rewarded guessing; learning matters more." },
              ].map((c, i) => (
                <div className="reveal card" key={i} style={d(200 + i * 130)}>
                  <c.I className="ico" size={28} />
                  <div className="t">{c.t}</div>
                  <div className="s">{c.s}</div>
                </div>
              ))}
            </div>
            <div className="road-map">
              {[
                { y: "2026", t: "Beta + launch" },
                { y: "2027", t: "100 subs · School tier" },
                { y: "2028", t: "250 subs · partnerships" },
                { y: "2029", t: "500 subs · mobile + B2G" },
              ].map((s, i) => (
                <div className="reveal stop" key={s.y} style={d(620 + i * 130)}>
                  <div className="pin" />
                  <div className="yr">{s.y}</div>
                  <div className="tx">{s.t}</div>
                </div>
              ))}
            </div>
            <h2 className="reveal" style={{ ...d(1180), marginTop: 26 }}>Join us on the way of safety.</h2>
            <a className="reveal cta" style={d(1300)} href="https://www.kesararamwithdigital.tech" target="_blank" rel="noreferrer">
              <MousePointerClick size={18} style={{ display: "inline", marginRight: 8, verticalAlign: "-3px" }} />
              kesararamwithdigital.tech
            </a>
          </section>

          {/* ───── 8 · APPENDIX · FRAMEWORK CROSSWALK ───── */}
          <section className={cls(8)}>
            <span className="reveal eyebrow" style={d(0)}>Appendix · Framework coverage</span>
            <h2 className="reveal" style={d(100)}>Every slide earns its place</h2>
            <p className="reveal lead" style={d(180)}>Backup slide — proof we cover the TOC, Guy Kawasaki&apos;s 10, and Technovation&apos;s rubric.</p>
            <table className="crosswalk reveal" style={d(300)}>
              <thead>
                <tr><th>Our slide</th><th>TOC</th><th>Kawasaki &ldquo;10 Slides&rdquo;</th><th>Technovation rec.</th></tr>
              </thead>
              <tbody>
                {CROSSWALK.map((r, i) => (
                  <tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>
                ))}
              </tbody>
            </table>
          </section>

        </div>
      </div>

      {/* persistent driving road + headlight glow (the lane-dash cycle) */}
      <div className="headlamp" aria-hidden />
      <div className="road" aria-hidden>
        <div className="edge top" /><div className="lane" /><div className="edge bot" />
      </div>
    </div>
  );
}
