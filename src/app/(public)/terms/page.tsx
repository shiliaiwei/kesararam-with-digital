"use client";

import Link from "next/link";
import { useLang } from "@/context/lang-context";

const EN_SECTIONS = [
  { id:"01", title:"About KWD & Technovation", items:[
    { sub:"The Platform", text:"KWD (Kesararam With Digital) is a Cambodia driving theory learning platform built by a team of young girls from Kesararam Primary School, participating in Technovation Girls. It provides interactive quizzes, live game sessions, a leaderboard, and bilingual content (Khmer & English) to help students prepare for the official driving theory exam." },
    { sub:"Technovation Girls", text:"This project is submitted to Technovation Girls (technovation.org) — a global program empowering girls to become technology entrepreneurs and leaders. Our team follows Technovation's curriculum, submission guidelines (technovationchallenge.org/submission-guidelines/), and safety standards." },
    { sub:"Acceptance", text:"By creating an account or using KWD, you agree to these Terms of Service. If you do not agree, please do not use the platform." },
  ]},
  { id:"02", title:"Accounts & Registration", items:[
    { sub:"Who Can Register", text:"Students, teachers, and school administrators may register. Student accounts for users under 13 must be created by a teacher or school administrator, in line with Technovation's child safety guidelines (technovationchallenge.org/safety/)." },
    { sub:"Account Responsibility", text:"You are responsible for maintaining the confidentiality of your login credentials. Do not share your password. Notify us immediately if you suspect unauthorized access." },
    { sub:"Accurate Information", text:"You agree to provide accurate information when registering and to keep it up to date." },
  ]},
  { id:"03", title:"Acceptable Use", items:[
    { sub:"Permitted Use", text:"KWD is for educational use — studying Cambodia's driving theory, participating in quizzes, and competing on the leaderboard." },
    { sub:"Prohibited Conduct", text:"You may not: attempt to cheat or manipulate scores; share quiz answers during live sessions; reverse-engineer or scrape the platform; upload harmful, offensive, or illegal content; impersonate another user or school." },
    { sub:"Enforcement", text:"Violations may result in account suspension or permanent ban without notice." },
  ]},
  { id:"04", title:"Game Scores & Leaderboard", items:[
    { sub:"Score Tracking", text:"Live game scores are recorded and contribute to your lifetime points and leaderboard ranking. Solo practice scores are not tracked on the public leaderboard." },
    { sub:"Leaderboard", text:"The leaderboard is public. Your display name and score are visible to all visitors. You may update your display name in account settings." },
    { sub:"Score Integrity", text:"We reserve the right to remove scores that appear to result from cheating, bugs, or unauthorized manipulation." },
  ]},
  { id:"05", title:"Rewards Program", items:[
    { sub:"How It Works", text:"Students can redeem accumulated points for physical stationery rewards (notebooks, pens, etc.). Redemption is processed through your teacher, who arranges physical delivery. This is inspired by Technovation's celebration and recognition model." },
    { sub:"No Cash Value", text:"Points and rewards have no monetary value and cannot be transferred, sold, or exchanged for cash." },
    { sub:"Availability", text:"Reward availability depends on your school's participation. KWD does not guarantee delivery of physical items — this is managed by your teacher." },
  ]},
  { id:"06", title:"Mentor & Volunteer Standards", items:[
    { sub:"Technovation Code of Conduct", text:"All mentors and volunteers working with our team follow the Technovation Volunteer Code of Conduct (technovation.org/safety/volunteer-code-of-conduct/). This ensures a safe, respectful, and empowering environment for all students." },
    { sub:"Time Commitment", text:"Mentors commit to supporting the team through pre-season preparation, curriculum sessions (technovationchallenge.org/courses/), and submission review. Mentor checklists and working agreements are maintained per Technovation guidelines." },
    { sub:"Team Safety", text:"Our team follows Technovation's safety guidelines for working with young people, including appropriate communication channels and supervision standards." },
  ]},
  { id:"07", title:"Intellectual Property", items:[
    { sub:"Platform Content", text:"All quiz questions, content, design, and code on KWD are owned by Kesararam Primary School or licensed to it. You may not reproduce, distribute, or create derivative works without written permission." },
    { sub:"Technovation Curriculum", text:"Educational content aligned with Technovation's AI in Action curriculum (technovationchallenge.org/courses/ai-in-action-curriculum/) and Senior Division curriculum is used for educational purposes only." },
    { sub:"User Content", text:"By uploading a profile photo, you grant KWD a non-exclusive license to display it on the platform." },
  ]},
  { id:"08", title:"SDG Alignment", items:[
    { sub:"UN Sustainable Development Goals", text:"KWD directly supports SDG 4 (Quality Education) by providing free, accessible driving theory education, and SDG 5 (Gender Equality) by centering young Cambodian girls as technology creators. Our work aligns with the global framework at sdgs.un.org/goals." },
    { sub:"Community Impact", text:"Kesararam is a monastery and primary school — the oldest place of learning in our community. KWD carries that tradition of education into the digital age, ensuring young girls from communities like ours are not just consumers of technology, but creators." },
  ]},
  { id:"09", title:"Disclaimers & Governing Law", items:[
    { sub:"No Guarantee", text:"KWD is provided \"as is\". We do not guarantee that using KWD will result in passing the official driving theory exam." },
    { sub:"Service Availability", text:"We aim for high availability but do not guarantee uninterrupted access. Maintenance or updates may cause temporary downtime." },
    { sub:"Governing Law", text:"These terms are governed by the laws of the Kingdom of Cambodia. Any disputes shall be resolved through the appropriate Cambodian legal channels." },
    { sub:"Changes", text:"We may update these terms at any time. Continued use after changes constitutes acceptance." },
  ]},
];

const KH_SECTIONS = [
  { id:"០១", title:"អំពី KWD និង Technovation", items:[
    { sub:"វេទិកា", text:"KWD (Kesararam With Digital) គឺជាវេទិកាសិក្សាទ្រឹស្ដីបើកបររបស់កម្ពុជា ដែលបង្កើតឡើងដោយក្រុមក្មេងស្រីពីសាលាបឋមសិក្សាកេសរារាម ក្នុងក្របខ័ណ្ឌ Technovation Girls។ វាផ្តល់ការប្រឡងអន្តរកម្ម វគ្គហ្គេមផ្ទាល់ ចំណាត់ថ្នាក់ និងខ្លឹមសារជាភាសាខ្មែរ-អង់គ្លេស ដើម្បីជួយសិស្សត្រៀមប្រឡងទ្រឹស្ដីបើកបរ។" },
    { sub:"Technovation Girls", text:"គម្រោងនេះត្រូវបានដាក់ស្នើទៅ Technovation Girls (technovation.org) — កម្មវិធីសកលដែលផ្តល់អំណាចដល់ក្មេងស្រីឱ្យក្លាយជាអ្នកបង្កើតបច្ចេកវិទ្យា និងអ្នកដឹកនាំ។ ក្រុមរបស់យើងអនុវត្តតាមកម្មវិធីសិក្សា ការណែនាំការដាក់ស្នើ និងស្តង់ដារសុវត្ថិភាពរបស់ Technovation។" },
    { sub:"ការទទួលយក", text:"ដោយបង្កើតគណនី ឬប្រើ KWD អ្នកយល់ព្រមនឹងលក្ខខណ្ឌប្រើប្រាស់ទាំងនេះ។ ប្រសិនបើអ្នកមិនយល់ព្រម សូមមិនប្រើវេទិកា។" },
  ]},
  { id:"០២", title:"គណនី និងការចុះឈ្មោះ", items:[
    { sub:"អ្នកណាអាចចុះឈ្មោះ", text:"សិស្ស គ្រូ និងអ្នកគ្រប់គ្រងសាលាអាចចុះឈ្មោះ។ គណនីសិស្សអាយុក្រោម ១៣ ឆ្នាំត្រូវបង្កើតដោយគ្រូ ឬអ្នកគ្រប់គ្រង ស្របតាមគោលការណ៍សុវត្ថិភាពកុមាររបស់ Technovation។" },
    { sub:"ការទទួលខុសត្រូវគណនី", text:"អ្នកទទួលខុសត្រូវក្នុងការរក្សាការសម្ងាត់នៃព័ត៌មានចូល។ កុំចែករំលែកពាក្យសម្ងាត់។ ជូនដំណឹងយើងភ្លាមៗប្រសិនបើអ្នកសង្ស័យថាមានការចូលប្រើដោយគ្មានការអនុញ្ញាត។" },
    { sub:"ព័ត៌មានត្រឹមត្រូវ", text:"អ្នកយល់ព្រមផ្តល់ព័ត៌មានត្រឹមត្រូវនៅពេលចុះឈ្មោះ និងរក្សាវាឱ្យទាន់សម័យ។" },
  ]},
  { id:"០៣", title:"ការប្រើប្រាស់ដែលអាចទទួលយកបាន", items:[
    { sub:"ការប្រើប្រាស់ដែលអនុញ្ញាត", text:"KWD គឺសម្រាប់ការប្រើប្រាស់ក្នុងការអប់រំ — ការសិក្សាទ្រឹស្ដីបើកបររបស់កម្ពុជា ការចូលរួមក្នុងការប្រឡង និងការប្រកួតនៅក្នុងចំណាត់ថ្នាក់។" },
    { sub:"ការប្រព្រឹត្តដែលហាមឃាត់", text:"អ្នកមិនអាច: ព្យាយាមបន្លំ ឬរៀបចំពិន្ទុ; ចែករំលែកចម្លើយប្រឡងក្នុងអំឡុងវគ្គផ្ទាល់; ផ្ទុករូបភាព ខ្លឹមសារ ឬខ្លឹមសារខុសច្បាប់; ក្លែងបន្លំអ្នកប្រើ ឬសាលាផ្សេង។" },
    { sub:"ការអនុវត្ត", text:"ការរំលោភអាចនាំឱ្យព្យួរ ឬហាមឃាត់គណនីដោយគ្មានការជូនដំណឹង។" },
  ]},
  { id:"០៤", title:"ពិន្ទុហ្គេម និងចំណាត់ថ្នាក់", items:[
    { sub:"ការតាមដានពិន្ទុ", text:"ពិន្ទុហ្គេមផ្ទាល់ត្រូវបានកត់ត្រា និងរួមចំណែកដល់ពិន្ទុអស់មួយជីវិត និងចំណាត់ថ្នាក់។ ពិន្ទុហ្វឹកហ្វឺនតែម្នាក់ឯងមិនត្រូវបានតាមដាននៅក្នុងចំណាត់ថ្នាក់សាធារណៈទេ។" },
    { sub:"ចំណាត់ថ្នាក់", text:"ចំណាត់ថ្នាក់គឺជាសាធារណៈ។ ឈ្មោះបង្ហាញ និងពិន្ទុរបស់អ្នកអាចមើលឃើញដោយអ្នកទស្សនាទាំងអស់។ អ្នកអាចធ្វើបច្ចុប្បន្នភាពឈ្មោះបង្ហាញក្នុងការកំណត់គណនី។" },
    { sub:"ភាពត្រឹមត្រូវនៃពិន្ទុ", text:"យើងរក្សាសិទ្ធិក្នុងការដកពិន្ទុដែលហាក់ដូចជាបណ្តាលមកពីការបន្លំ ឬការរៀបចំដោយគ្មានការអនុញ្ញាត។" },
  ]},
  { id:"០៥", title:"កម្មវិធីរង្វាន់", items:[
    { sub:"របៀបដំណើរការ", text:"សិស្សអាចប្តូរពិន្ទុដែលប្រមូលបានសម្រាប់រង្វាន់ប្រដាប់ប្រដាសិក្សា (សៀវភៅ ប៊ិច ។ល។)។ ការប្តូរត្រូវបានដំណើរការតាមរយៈគ្រូ ដែលរៀបចំការដឹកជញ្ជូនរូបវន្ត។" },
    { sub:"គ្មានតម្លៃជាប្រាក់", text:"ពិន្ទុ និងរង្វាន់គ្មានតម្លៃជាប្រាក់ ហើយមិនអាចផ្ទេរ លក់ ឬប្តូរជាប្រាក់ទេ។" },
    { sub:"ភាពអាចរកបាន", text:"ភាពអាចរកបាននៃរង្វាន់អាស្រ័យលើការចូលរួមរបស់សាលា។ KWD មិនធានាការដឹកជញ្ជូនវត្ថុរូបវន្ត — នេះត្រូវបានគ្រប់គ្រងដោយគ្រូ។" },
  ]},
  { id:"០៦", title:"ស្តង់ដារអ្នកណែនាំ និងអ្នកស្ម័គ្រចិត្ត", items:[
    { sub:"ក្រមប្រតិបត្តិ Technovation", text:"អ្នកណែនាំ និងអ្នកស្ម័គ្រចិត្តទាំងអស់ដែលធ្វើការជាមួយក្រុមរបស់យើងអនុវត្តតាម Technovation Volunteer Code of Conduct ដើម្បីធានាបរិយាកាសសិក្សាដែលមានសុវត្ថិភាព គោរព និងផ្តល់អំណាច។" },
    { sub:"ការប្តេជ្ញាពេលវេលា", text:"អ្នកណែនាំប្តេជ្ញាគាំទ្រក្រុមតាមរយៈការត្រៀមរៀបចំមុនរដូវ វគ្គកម្មវិធីសិក្សា និងការពិនិត្យការដាក់ស្នើ ស្របតាមការណែនាំ Technovation។" },
    { sub:"សុវត្ថិភាពក្រុម", text:"ក្រុមរបស់យើងអនុវត្តតាមការណែនាំសុវត្ថិភាពរបស់ Technovation សម្រាប់ការធ្វើការជាមួយយុវវ័យ រួមមានបណ្តាញទំនាក់ទំនងសមស្រប និងស្តង់ដារការត្រួតពិនិត្យ។" },
  ]},
  { id:"០៧", title:"ការតម្រឹមជាមួយ SDG", items:[
    { sub:"គោលដៅអភិវឌ្ឍន៍ប្រកបដោយចីរភាព", text:"KWD គាំទ្រ SDG 4 (ការអប់រំប្រកបដោយគុណភាព) ដោយផ្តល់ការអប់រំទ្រឹស្ដីបើកបរឥតគិតថ្លៃ និង SDG 5 (សមភាពយេនឌ័រ) ដោយដាក់ក្មេងស្រីខ្មែរជាអ្នកបង្កើតបច្ចេកវិទ្យា។ ស្វែងយល់បន្ថែមនៅ sdgs.un.org/goals។" },
    { sub:"ផលប៉ះពាល់សហគមន៍", text:"កេសរារាមគឺជាវត្ត និងសាលាបឋមសិក្សា — កន្លែងសិក្សាចំណាស់បំផុតក្នុងសហគមន៍យើង។ KWD នាំប្រពៃណីអប់រំនោះចូលក្នុងយុគសម័យឌីជីថល ដើម្បីធានាថាក្មេងស្រីពីសហគមន៍ដូចយើងមិនត្រឹមតែជាអ្នកប្រើប្រាស់បច្ចេកវិទ្យា ប៉ុន្តែជាអ្នកបង្កើតវា។" },
  ]},
  { id:"០៨", title:"ការបដិសេធ និងច្បាប់គ្រប់គ្រង", items:[
    { sub:"គ្មានការធានា", text:"KWD ត្រូវបានផ្តល់ \"ដូចដែលវាជា\"។ យើងមិនធានាថាការប្រើ KWD នឹងនាំឱ្យជាប់ការប្រឡងទ្រឹស្ដីបើកបរផ្លូវការទេ។" },
    { sub:"ភាពអាចរកបាននៃសេវា", text:"យើងខិតខំរក្សាភាពអាចរកបានខ្ពស់ ប៉ុន្តែមិនធានាការចូលប្រើដោយគ្មានការរំខានទេ។ ការថែទាំ ឬការធ្វើបច្ចុប្បន្នភាពអាចបណ្តាលឱ្យមានការដាច់ស្ទើរ។" },
    { sub:"ច្បាប់គ្រប់គ្រង", text:"លក្ខខណ្ឌទាំងនេះត្រូវបានគ្រប់គ្រងដោយច្បាប់នៃព្រះរាជាណាចក្រកម្ពុជា។ ជម្លោះណាមួយត្រូវដោះស្រាយតាមរយៈបណ្តាញច្បាប់ខ្មែរសមស្រប។" },
    { sub:"ការផ្លាស់ប្តូរ", text:"យើងអាចធ្វើបច្ចុប្បន្នភាពលក្ខខណ្ឌទាំងនេះ។ ការប្រើប្រាស់បន្តបន្ទាប់ពីការផ្លាស់ប្តូរ មានន័យថាការទទួលយក។" },
  ]},
];

export default function TermsPage() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const sections = kh ? KH_SECTIONS : EN_SECTIONS;
  const khFont = kh ? { fontFamily: "Siemreap, sans-serif" } : {};
  const l = {
    en: { badge:"Legal", title:"Terms of Service", subtitle:"Last updated: March 2026 · KWD — Kesararam With Digital · Technovation Girls Cambodia", intro:"Please read these terms carefully before using KWD. By accessing or using the platform, you agree to be bound by these terms. These terms apply to all users — students, teachers, and administrators — and reflect our commitment to Technovation Girls' standards and the UN Sustainable Development Goals.", privBtn:"Privacy Policy →", aboutBtn:"About KWD", footer:"© 2026 KWD — Kesararam With Digital · Kesararam Primary School · Technovation Girls Cambodia" },
    kh: { badge:"ច្បាប់", title:"លក្ខខណ្ឌប្រើប្រាស់", subtitle:"ធ្វើបច្ចុប្បន្នភាព: មីនា ២០២៦ · KWD — Kesararam With Digital · Technovation Girls Cambodia", intro:"សូមអានលក្ខខណ្ឌទាំងនេះដោយប្រុងប្រយ័ត្នមុនពេលប្រើ KWD។ ដោយចូលប្រើ ឬប្រើវេទិកា អ្នកយល់ព្រមនឹងលក្ខខណ្ឌទាំងនេះ។ លក្ខខណ្ឌទាំងនេះអនុវត្តចំពោះអ្នកប្រើទាំងអស់ — សិស្ស គ្រូ និងអ្នកគ្រប់គ្រង — ហើយឆ្លុះបញ្ចាំងពីការប្តេជ្ញារបស់យើងចំពោះស្តង់ដាររបស់ Technovation Girls និងគោលដៅ SDG របស់អង្គការសហប្រជាជាតិ។", privBtn:"គោលការណ៍ភាពឯកជន →", aboutBtn:"អំពី KWD", footer:"© ២០២៦ KWD — Kesararam With Digital · សាលាបឋមសិក្សាកេសរារាម · Technovation Girls Cambodia" },
  }[lang === "kh" ? "kh" : "en"];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-black border-b-4 border-yellow-400">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <div className="mb-5">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-black text-[10px] font-black tracking-widest uppercase px-3 py-1 border-2 border-yellow-400">
              <span className="w-1.5 h-1.5 bg-black rounded-full" />
              {l.badge}
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-none mb-3" style={khFont}>{l.title}</h1>
          <p className="text-white/40 text-xs" style={khFont}>{l.subtitle}</p>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-4xl mx-auto px-6 py-8 border-b-2 border-zinc-100">
        <p className="text-zinc-600 text-sm md:text-base leading-relaxed max-w-2xl" style={khFont}>{l.intro}</p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link href="/privacy" className="text-xs font-black px-4 py-2 bg-black text-yellow-400 border-2 border-black hover:-translate-y-0.5 transition-all" style={{ boxShadow:"3px 3px 0 #ca8a04", ...khFont }}>{l.privBtn}</Link>
          <Link href="/about" className="text-xs font-black px-4 py-2 bg-white text-black border-2 border-black hover:-translate-y-0.5 transition-all" style={{ boxShadow:"3px 3px 0 #000", ...khFont }}>{l.aboutBtn}</Link>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
        {sections.map((section) => (
          <div key={section.id} className="flex gap-5 md:gap-8">
            <div className="flex-shrink-0 w-11 h-11 bg-yellow-400 border-2 border-black flex items-center justify-center font-black text-xs" style={{ boxShadow:"3px 3px 0 #000" }}>{section.id}</div>
            <div className="flex-1 pt-0.5">
              <h2 className="text-lg md:text-xl font-black text-black mb-3 border-b-2 border-black pb-2" style={khFont}>{section.title}</h2>
              <div className="flex flex-col gap-3">
                {section.items.map((item, i) => (
                  <div key={i}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-0.5" style={khFont}>{item.sub}</span>
                    <p className="text-sm text-zinc-600 leading-relaxed" style={khFont}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t-4 border-black bg-zinc-950 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-400 text-xs text-center md:text-left" style={khFont}>{l.footer}</p>
          <div className="flex gap-4 text-xs font-black">
            <Link href="/privacy" className="text-yellow-400 hover:underline">Privacy Policy</Link>
            <Link href="/about" className="text-zinc-400 hover:text-white">About</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
