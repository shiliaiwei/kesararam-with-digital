# KWD — Theories & concepts in use

The product is a **free, bilingual (EN + ខ្មែរ), gamified road-safety learning
platform** built by students (Technovation Girls 2026, Team #50777). Its design
and mechanics lean on the theories below. When you build or change UI, design
*toward* these — they explain WHY the brand looks and behaves as it does.

Grounded in real features found in the codebase (points, tiers, leaderboards,
streaks, badges, timers, rewards store, avatars, student ID, bilingual copy).

---

## A · Learning & pedagogy

| Concept | What it is | Where in KWD |
|---|---|---|
| **Flash Learning** (brand's own thesis) | Knowledge delivered fast, in micro-bursts — "at the speed of light" (the logo lightning bolt) | Whole quiz/play loop; brand page "Logo & Meaning" |
| **Mother-tongue / L1 instruction** | People learn faster in their native language | Every screen is EN + Khmer; Battambang for lesson content |
| **Retrieval practice (testing effect)** | Recalling answers strengthens memory more than re-reading | Quizzes, category quiz, multiplayer code games |
| **Immediate feedback** | Correct/incorrect signalled instantly → faster correction | Quiz answer states, sounds, confetti |
| **Multimedia & dual-coding (Mayer / Paivio)** | Words + images, and color + label, encode better than text alone | Icons beside labels, road-sign imagery, mockups |
| **Situated learning / real-world transfer** | Skills learned in context that mirrors reality transfer better | UI uses actual road-sign shapes & traffic colors |
| **Scaffolding & mastery progression** | Difficulty/identity grows in stages as competence grows | Tier ladder Rookie → Debut → Gold → Platinum → Diamond → Mythic |

## B · Behavioral & motivational psychology (gamification)

| Concept | What it is | Where in KWD |
|---|---|---|
| **PBL gamification framework** | Points, Badges, Leaderboards — the core engagement triad | Lifetime points, badges, leaderboard |
| **Operant conditioning / positive reinforcement** | Reward a behavior → it repeats | Points & confetti for correct answers |
| **Token economy** | Earned points exchanged for tangible goods | Rewards store (notebook, pencil, ruler…) → claimed rewards |
| **Variable / intermittent reward** | Unpredictable payoff is more motivating than fixed | Score swings, celebratory animations |
| **Goal-gradient effect** | Effort rises as a goal nears | "X PTS to next tier", progress bars |
| **Streaks & loss aversion (commitment)** | Fear of breaking a run drives return visits | Streak counters |
| **Self-Determination Theory** (autonomy · competence · relatedness) | The 3 drivers of intrinsic motivation | Avatar customization (autonomy), tiers/scores (competence), class/team & leaderboard (relatedness) |
| **Yerkes–Dodson (arousal/performance)** | Moderate time pressure improves focus | Quiz timers / countdowns |
| **Endowment effect & identity** | We value what feels "ours" | Personal Student ID card (KWD-0245), profile, avatar |

## C · Social psychology

| Concept | What it is | Where in KWD |
|---|---|---|
| **Social comparison theory (Festinger)** | We gauge ourselves against peers | Leaderboard rank `#13`, tier badges |
| **Social proof / competition** | Others' participation legitimises and motivates | Leaderboard, shareable profile, OG share images |
| **Belonging / group identity** | Membership boosts engagement | School/class/section, team tokens, "Active Student" |

## D · Cognitive & perceptual UX

| Concept | What it is | Where in KWD |
|---|---|---|
| **Affordances & signifiers (Norman)** | Form should announce function | Sign-shaped buttons; hard offset shadow signals "pressable" |
| **Color coding / color psychology** | Consistent hue → consistent meaning | Traffic palette: red=stop/danger, green=go/success, yellow=warn/CTA, blue=info |
| **Recognition over recall (Nielsen)** | Showing options beats memorising them | Icon + label everywhere, persistent nav |
| **Gestalt principles** | Proximity/similarity group related items | Card grids, stat clusters, sectioned profile |
| **Visual hierarchy & contrast** | Size/weight/color guide the eye | font-black headlines, black-on-white, one yellow CTA |
| **Von Restorff (isolation) effect** | The odd-one-out is remembered | Single yellow CTA amid black/white |
| **Hick's law** | Fewer choices → faster decisions | Lean top nav, focused screens |
| **Fitts's law** | Bigger/closer targets are easier to hit | Large brutalist buttons, generous tap areas |
| **Signal detection / legibility** | High contrast = readable at a glance, like real signage | Heavy black borders, bold type |
| **Aesthetic–usability effect** | Polished design is perceived as more usable | Consistent design system |
| **Cognitive-load reduction** | Strip noise so the task stays central | Flat brutalism — no gradients/neon clutter |

## E · Visual design theory

| Concept | What it is | Where in KWD |
|---|---|---|
| **Neo-brutalism** | Raw, honest, high-contrast, sharp, undecorated | Borders, hard shadows, flat fills — the whole UI |
| **Road-signage system design** | Shape + color + symbol encode meaning redundantly | SignShape (diamond/octagon/circle…), caution tape |
| **Semiotics (signifier → signified)** | Shapes/colors carry learned meaning | Octagon = stop, diamond = warning, red = danger |
| **Grid systems & spacing scale** | Rhythm via a fixed step scale | 4·8·12·16·20·24 spacing |
| **Brand consistency** | Repeated signals build recognition & trust | Tokens, kit components, this skill |

---

**Designing with these:** prefer the choice that *reinforces* a concept — e.g. a
new "delete" should be red + octagon (danger/stop), a "next tier" UI should make
the goal feel near (goal-gradient), and any new metric should be glanceable
(visual hierarchy + color coding). Don't add mechanics that fight them (e.g. a
punishing surprise that breaks positive reinforcement).
