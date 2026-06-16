"use client";

import { useLang } from "@/context/lang-context";
import { School, Users, Calendar, Plus } from "lucide-react";
import { ClassesTable } from "./classes-table";

interface ClassRow {
  id: number;
  name: string;
  code: string;
  createdAt: Date;
  teacherName: string | null;
  teacherEmail: string | null;
  schoolName: string | null;
  province: string | null;
  status: string | null;
}

export function ClassesClient({
  initialClasses,
  role,
}: {
  initialClasses: ClassRow[];
  role: string;
}) {
  const { lang } = useLang();
  const kh = lang === "kh";

  const totalClasses = initialClasses.length;
  const activeClasses = initialClasses.filter((c) => c.code).length;

  const stats = [
    {
      label: kh ? "ថ្នាក់សរុប" : "Total Classes",
      value: totalClasses.toString(),
      icon: School,
      color: "#3b82f6",
    },
    {
      label: kh ? "ថ្នាក់សកម្ម" : "Active Classes",
      value: activeClasses.toString(),
      icon: Calendar,
      color: "#22c55e",
    },
    {
      label: kh ? "លេខកូដចូលរួម" : "Join Codes",
      value: activeClasses.toString(),
      icon: Users,
      color: "#f97316",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b-4 border-black pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-2 border-black bg-green-400 flex items-center justify-center shadow-[2px_2px_0_#000]">
              <School size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-black font-google-sans">
                {kh ? "ថ្នាក់រៀន" : "Classes"}
              </h1>
              <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
                {kh
                  ? "គ្រប់គ្រងថ្នាក់រៀនរបស់អ្នក និងចែករំលែកលេខកូដចូលរួមជាមួយសិស្ស"
                  : "Manage your classes and share join codes with students"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_#000] flex flex-col gap-3"
            style={{ borderRadius: "0px" }}
          >
            <div className="flex items-center justify-between">
              <div
                className="w-10 h-10 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000]"
                style={{ backgroundColor: stat.color, borderRadius: "0px" }}
              >
                <stat.icon size={20} className="text-black" />
              </div>
              <span className="text-3xl font-black text-black">
                {stat.value}
              </span>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500 font-google-sans">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Classes Table Card */}
      <div
        className="border-2 border-black bg-white shadow-[4px_4px_0_#000]"
        style={{ borderRadius: "0px" }}
      >
        {/* Card Header */}
        <div className="border-b-2 border-black bg-green-400 p-4">
          <h2 className="text-xl font-black uppercase tracking-tighter text-black font-google-sans">
            {kh ? "ថ្នាក់រៀនរបស់ខ្ញុំ" : "My Classes"}
          </h2>
          <p className="text-sm font-bold text-black/70 uppercase tracking-wide">
            {kh
              ? "សិស្សប្រើលេខកូដចូលរួមដើម្បីចុះឈ្មោះចូលរៀន"
              : "Students use the join code to enroll in a class"}
          </p>
        </div>

        {/* Card Content */}
        <div className="p-6">
          <ClassesTable
            initialClasses={initialClasses}
            showTeacher={role === "admin"}
          />
        </div>
      </div>
    </div>
  );
}
