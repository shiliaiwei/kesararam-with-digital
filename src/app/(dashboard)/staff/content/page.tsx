import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "My Content | Staff Dashboard",
};

const CATEGORIES = [
  { id: 1, slug: "road-sign",            name: "Traffic Signs",          color: "bg-yellow-400",  desc: "Warning, Prohibitory, Mandatory, Informational" },
  { id: 2, slug: "road-traffic",         name: "Road Traffic Law",       color: "bg-blue-400",    desc: "Traffic Rules, Speed Limits, Parking, Overtaking" },
  { id: 3, slug: "priority",             name: "Right of Way",           color: "bg-green-400",   desc: "Intersections, Roundabouts, Pedestrian Crossings" },
  { id: 4, slug: "driving",              name: "Driving Skills",         color: "bg-cyan-400",    desc: "Basic Maneuvers, Advanced Techniques, Defensive Driving" },
  { id: 5, slug: "technical",            name: "Vehicle Technology",     color: "bg-purple-400",  desc: "Engine, Brakes, Lights, Safety Systems" },
  { id: 6, slug: "loading-people-goods", name: "Loading People & Goods", color: "bg-orange-400",  desc: "Weight Limits, Passenger Safety, Cargo Securing" },
  { id: 7, slug: "general-knowledge",    name: "General Knowledge",      color: "bg-red-400",     desc: "Road Safety, Environmental, Legal" },
  { id: 8, slug: "emergency",            name: "Emergency",              color: "bg-pink-400",    desc: "Accidents, Breakdowns, First Aid, Emergency Contacts" },
];

export default function StaffContentPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Content</h1>
          <p className="text-zinc-600">Select a category to create or manage content</p>
        </div>
        <Link
          href="/staff/submissions"
          className="bg-yellow-400 border-2 border-black px-5 py-2.5 font-black hover:shadow-[4px_4px_0_#000] transition-all text-sm"
        >
          My Submissions
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/staff/content/${cat.slug}`}
            className="bg-white border-2 border-black p-5 hover:shadow-[6px_6px_0_#000] transition-all flex items-center gap-4 group"
            style={{ boxShadow: "4px 4px 0 #000" }}
          >
            <div className={`w-3 h-14 ${cat.color} border-r-2 border-black shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className="font-black text-lg leading-tight">{cat.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5 truncate">{cat.desc}</p>
            </div>
            <ArrowRight size={20} className="shrink-0 text-zinc-400 group-hover:text-black transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
