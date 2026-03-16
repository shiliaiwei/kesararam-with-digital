"use client";

import { CalendarDays, Users, GraduationCap, CheckCircle2, ChevronRight, Rocket, Trophy, Globe } from "lucide-react";

interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
}

const TIMELINE_DATA: TimelineItem[] = [
  {
    id: "reg-opens",
    date: "August 13, 2025",
    title: "Registration Opens",
    description: "Start of the new season! Mentors and team members can formally register.",
    status: "completed",
    icon: Rocket,
    color: "#a855f7", // Purple
  },
  {
    id: "onboarding",
    date: "August - November 2025",
    title: "Onboarding & Formation",
    description: "Receive training, sign agreements, and join global platforms. Build partnerships to involve girls and mentors.",
    status: "completed",
    icon: Users,
    color: "#3b82f6", // Blue
  },
  {
    id: "ideation",
    date: "September - December 2025",
    title: "Planning & Engagement",
    description: "Create a plan to run the program. Use the online curriculum to start brainstorming ideas.",
    status: "current",
    icon: GraduationCap,
    color: "#facc15", // Yellow
  },
  {
    id: "official-start",
    date: "January 26, 2026",
    title: "12-Week Sprint Begins",
    description: "The latest recommended date to start the continuous 12-week program leading up to submission.",
    status: "upcoming",
    icon: CalendarDays,
    color: "#22c55e", // Green
  },
  {
    id: "reg-deadline",
    date: "March 18, 2026",
    title: "Registration Deadline",
    description: "Last day to formally register the team on the platform.",
    status: "upcoming",
    icon: CheckCircle2,
    color: "#ef4444", // Red
  },
  {
    id: "submission",
    date: "April 20, 2026",
    title: "Final Submission Due",
    description: "Teams submit projects (pitch, code, etc.) to the global competition platform.",
    status: "upcoming",
    icon: CalendarDays,
    color: "#f97316", // Orange
  },
  {
    id: "judging",
    date: "May - June 2026",
    title: "Judging & Semifinals",
    description: "Judges evaluate projects and provide scores. Semifinalists announced May 26.",
    status: "upcoming",
    icon: Trophy,
    color: "#6366f1", // Indigo
  },
  {
    id: "celebration",
    date: "July - September 2026",
    title: "Celebration & World Summit",
    description: "Regional winners announced in July. Finalists pitch at the World Summit in September.",
    status: "upcoming",
    icon: Globe,
    color: "#ec4899", // Pink
  },
];

export function PlanSchedule({ role }: { role: "admin" | "teacher" }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Team Summary Card */}
      <div className="bg-[#facc15] border-4 border-black p-6 shadow-[8px_8px_0_0_#000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <span className="inline-block px-2 py-1 bg-black text-white text-xs font-black uppercase tracking-widest border-2 border-white shadow-[2px_2px_0_0_#fff]">
              Technovation Girls 2025-2026
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black break-words">
              Kesararam With Digital
            </h2>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white border-4 border-black p-4 flex items-center gap-4 shadow-[4px_4px_0_0_#000] flex-1 md:flex-none transform hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-[#22c55e] border-2 border-black flex items-center justify-center">
                <GraduationCap className="text-black" size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Mentors</p>
                <p className="text-2xl font-black text-black">2</p>
              </div>
            </div>

            <div className="bg-white border-4 border-black p-4 flex items-center gap-4 shadow-[4px_4px_0_0_#000] flex-1 md:flex-none transform hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-[#3b82f6] border-2 border-black flex items-center justify-center">
                <Users className="text-black" size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Team Members</p>
                <p className="text-2xl font-black text-black">5</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Timeline Tracking */}
      <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[8px_8px_0_0_#000]">
        <h3 className="text-2xl font-black uppercase tracking-tighter text-black mb-8 pb-4 border-b-4 border-black">
          Project Timeline
        </h3>

        <div className="relative border-l-4 border-black ml-6 space-y-8 pb-4">
          {TIMELINE_DATA.map((item, index) => {
            const isCompleted = item.status === "completed";
            const isCurrent = item.status === "current";
            
            return (
              <div key={item.id} className="relative pl-8 group">
                {/* Timeline Node Indicator */}
                <div 
                  className={`absolute -left-[14px] top-0 w-6 h-6 border-4 border-black rounded-full flex items-center justify-center bg-white z-10 transition-transform duration-300 group-hover:scale-125
                    ${isCompleted ? 'bg-black' : isCurrent ? 'bg-[#facc15] animate-pulse' : 'bg-white'}`}
                >
                  {isCompleted && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                {/* Content Card */}
                <div 
                  className={`border-4 border-black p-4 relative transition-all duration-200 transform group-hover:-translate-y-1 group-hover:-translate-x-1
                    ${isCurrent ? 'bg-black text-white shadow-[6px_6px_0_0_#facc15]' : 'bg-white text-black shadow-[4px_4px_0_0_#000]'}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    
                    {/* Date / Icon Block */}
                    <div className="flex-shrink-0 flex flex-col gap-2 min-w-[150px]">
                      <div 
                        className={`w-12 h-12 border-2 ${isCurrent ? 'border-white bg-[#facc15]' : 'border-black'} flex items-center justify-center shadow-[2px_2px_0_0_#000]`}
                        style={!isCurrent ? { backgroundColor: item.color } : {}}
                      >
                        <item.icon className={isCurrent ? "text-black" : "text-black"} size={24} />
                      </div>
                      <span className={`text-sm font-black uppercase tracking-widest ${isCurrent ? 'text-[#facc15]' : 'text-zinc-500'}`}>
                        {item.date}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 border-l-2 md:border-l-4 border-dashed border-zinc-300 md:pl-6 pl-2 py-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-black uppercase tracking-tight">
                          {item.title}
                        </h4>
                        {isCompleted && (
                          <span className="bg-black text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border border-black shadow-[1px_1px_0_0_#fff]">
                            Done
                          </span>
                        )}
                        {isCurrent && (
                          <span className="bg-[#facc15] text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border border-black">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className={`text-sm font-bold leading-relaxed ${isCurrent ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {item.description}
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
