"use client";

import { ExternalLink, Trophy, FileText, Target, Award, Lightbulb } from "lucide-react";

const JUDGING_LINKS = [
  {
    label: "SUBMISSION GUIDELINES",
    labelKh: "គោលការណ៍ណែនាំការដាក់ស្នើ",
    url: "https://technovationchallenge.org/submission-guidelines/",
    icon: FileText,
    color: "bg-blue-100 text-blue-700 border-blue-300",
    desc: "Updated each season — review before submitting",
    descKh: "ធ្វើបច្ចុប្បន្នភាពរៀងរាល់រដូវ — ពិនិត្យមុនការដាក់ស្នើ",
  },
  {
    label: "JUDGING RUBRICS",
    labelKh: "លក្ខណៈវិនិច្ឆ័យការវិនិច្ឆ័យ",
    url: "https://technovationchallenge.org/junior-rubric/",
    icon: Target,
    color: "bg-green-100 text-green-700 border-green-300",
    desc: "Junior Division rubric — know how you'll be scored",
    descKh: "លក្ខណៈវិនិច្ឆ័យផ្នែកកូនក្មេង — ដឹងពីរបៀបដែលអ្នកនឹងត្រូវបានវាយតម្លៃ",
  },
  {
    label: "SUGGESTED MILESTONES",
    labelKh: "ចំណុចសំខាន់ដែលបានណែនាំ",
    url: "https://technovationchallenge.org/mentor-resources/",
    icon: Trophy,
    color: "bg-purple-100 text-purple-700 border-purple-300",
    desc: "Week-by-week milestones to keep your team on track",
    descKh: "ចំណុចសំខាន់ប្រចាំសប្តាហ៍ ដើម្បីរក្សាក្រុមរបស់អ្នកឱ្យទាន់ពេល",
  },
  {
    label: "AWARDS PAGE",
    labelKh: "ទំព័រពានរង្វាន់",
    url: "https://technovationchallenge.org/competition/",
    icon: Award,
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    desc: "See what awards are available this season",
    descKh: "មើលពានរង្វាន់ដែលមានក្នុងរដូវនេះ",
  },
  {
    label: "PAST TEAMS & AI INVENTIONS",
    labelKh: "ក្រុមកន្លងមកនិងការបង្កើត AI",
    url: "https://www.technovation.org/app-gallery/",
    icon: Lightbulb,
    color: "bg-orange-100 text-orange-700 border-orange-300",
    desc: "Get inspired by apps from previous Technovation teams",
    descKh: "ទទួលការបំផុសគំនិតពីកម្មវិធីរបស់ក្រុម Technovation មុន",
  },
];

const JUDGING_ROUNDS = [
  {
    round: "QUARTERFINALS",
    roundKh: "ជុំទី១",
    window: "Apr 23 – May 26, 2026",
    status: "upcoming",
    desc: "All submitting teams are quarterfinalists. Judges select teams for semifinals.",
    descKh: "ក្រុមដែលដាក់ស្នើទាំងអស់ជាអ្នកចូលជុំទី១។ ចៅក្រមជ្រើសរើសក្រុមសម្រាប់ជុំពាក់កណ្តាល។",
  },
  {
    round: "SEMIFINALS",
    roundKh: "ជុំពាក់កណ្តាល",
    window: "Jun 1 – Jun 15, 2026",
    status: "upcoming",
    desc: "15 Regional Honorees + 15 Finalists selected. Takes place entirely online.",
    descKh: "ជ្រើសរើស ១៥ អ្នកទទួលកិត្តិយសសាកល + ១៥ អ្នកចូលជុំចុងក្រោយ។ ធ្វើតាមអ៊ីនធឺណិតទាំងស្រុង។",
  },
  {
    round: "WORLD SUMMIT FINALS",
    roundKh: "ជុំចុងក្រោយ — កិច្ចប្រជុំកំពូលពិភពលោក",
    window: "September 2026",
    status: "upcoming",
    desc: "Finalists pitch at the Technovation World Summit.",
    descKh: "អ្នកចូលជុំចុងក្រោយបង្ហាញនៅ Technovation World Summit។",
  },
];

export function JudgingStatus({ isKhmer }: { isKhmer: boolean }) {
  return (
    <div className="space-y-6">
      {/* Judging rounds */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
          {isKhmer ? "ជុំការវិនិច្ឆ័យ" : "JUDGING ROUNDS"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {JUDGING_ROUNDS.map((r) => (
            <div key={r.round} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-gray-900">
                  {isKhmer ? r.roundKh : r.round}
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium uppercase">
                  {isKhmer ? "ខាងមុខ" : r.status}
                </span>
              </div>
              <p className="text-xs text-blue-600 font-medium mb-2">{r.window}</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isKhmer ? r.descKh : r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Helpful links */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
          {isKhmer ? "ធនធានការវិនិច្ឆ័យ" : "JUDGING RESOURCES"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {JUDGING_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-start gap-3 p-4 border rounded-lg hover:shadow-md transition-all ${link.color}`}
            >
              <link.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{isKhmer ? link.labelKh : link.label}</p>
                <p className="text-xs mt-1 opacity-80 leading-relaxed">
                  {isKhmer ? link.descKh : link.desc}
                </p>
              </div>
              <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-60" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
