"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";

const initialState = { error: "", success: false };

const CAMBODIA_PROVINCES = [
  { en: "Siem Reap", kh: "សៀមរាប" },
  { en: "Phnom Penh", kh: "ភ្នំពេញ" },
  { en: "Battambang", kh: "បាត់ដំបង" },
  { en: "Banteay Meanchey", kh: "បន្ទាយមានជ័យ" },
  { en: "Kampong Cham", kh: "កំពង់ចាម" },
  { en: "Kampong Chhnang", kh: "កំពង់ឆ្នាំង" },
  { en: "Kampong Speu", kh: "កំពង់ស្ពឺ" },
  { en: "Kampong Thom", kh: "កំពង់ធំ" },
  { en: "Kampot", kh: "កំពត" },
  { en: "Kandal", kh: "កណ្តាល" },
  { en: "Kep", kh: "កែប" },
  { en: "Koh Kong", kh: "កោះកុង" },
  { en: "Kratie", kh: "ក្រចេះ" },
  { en: "Mondulkiri", kh: "មណ្ឌលគីរី" },
  { en: "Oudar Meanchey", kh: "ឧត្តរមានជ័យ" },
  { en: "Pailin", kh: "ប៉ៃលិន" },
  { en: "Preah Sihanouk", kh: "ព្រះសីហនុ" },
  { en: "Preah Vihear", kh: "ព្រះវិហារ" },
  { en: "Prey Veng", kh: "ព្រៃវែង" },
  { en: "Pursat", kh: "ពោធិ៍សាត់" },
  { en: "Ratanakiri", kh: "រតនគីរី" },
  { en: "Stung Treng", kh: "ស្ទឹងត្រែង" },
  { en: "Svay Rieng", kh: "ស្វាយរៀង" },
  { en: "Takeo", kh: "តាកែវ" },
  { en: "Tboung Khmum", kh: "ត្បូងឃ្មុំ" },
];

const GRADES = [
  { en: "Grade 6", kh: "ថ្នាក់ទី ៦" },
  { en: "Grade 7", kh: "ថ្នាក់ទី ៧" },
  { en: "Grade 8", kh: "ថ្នាក់ទី ៨" },
  { en: "Grade 9", kh: "ថ្នាក់ទី ៩" },
  { en: "Grade 10", kh: "ថ្នាក់ទី ១០" },
  { en: "Grade 11", kh: "ថ្នាក់ទី ១១" },
  { en: "Grade 12", kh: "ថ្នាក់ទី ១២" },
];

export function RegisterForm() {
  const [role, setRole] = useState<"student" | "teacher" | string>("student");
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState
  );

  useEffect(() => {
    if (state?.success) {
      // Redirect to home dashboard
      window.location.href = role === "student" ? "/profile/student" : "/teacher/overview";
    }
  }, [state?.success, role]);

  return (
    <div className="min-h-screen dot-bg flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-xl">
        {/* Header card */}
        <div className="bg-yellow-400 text-black border-2 border-black rounded-none px-8 py-6">
          <Link
            href="/home"
            className="text-xs text-black/60 hover:text-black transition-colors"
          >
            ← Back to home / ត្រឡប់ទៅទំព័រដើម
          </Link>
          <h1 className="text-3xl font-black mt-3">Register / បង្កើតគណនី</h1>
          <p
            className="text-sm text-black/70 mt-1"
            style={{ fontFamily: "Siemreap, sans-serif" }}
          >
            Fill in your details below to join Kesararam Digital Classroom.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white border-2 border-t-0 border-black rounded-none shadow-[6px_6px_0_#000] px-8 py-8">
          <form action={formAction} className="flex flex-col gap-5" autoComplete="off">
            
            {/* Role Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-black">
                Select Role / ជ្រើសរើសតួនាទី *
              </label>
              <input type="hidden" name="role" value={role} />
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`py-3 px-4 font-black uppercase text-sm border-2 border-black transition-all ${
                    role === "student"
                      ? "bg-blue-400 shadow-[3px_3px_0_#000]"
                      : "bg-white hover:bg-zinc-50"
                  }`}
                >
                  Student / សិស្ស
                </button>
                <button
                  type="button"
                  onClick={() => setRole("teacher")}
                  className={`py-3 px-4 font-black uppercase text-sm border-2 border-black transition-all ${
                    role === "teacher"
                      ? "bg-green-400 shadow-[3px_3px_0_#000]"
                      : "bg-white hover:bg-zinc-50"
                  }`}
                >
                  Teacher / គ្រូ
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="text-sm font-bold text-black">
                  Username / ឈ្មោះគណនី *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  placeholder="sopheak01"
                  className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-bold text-black">
                  Email / អ៊ីមែល *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="sopheak@kwd.tech"
                  className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Display Name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="displayName" className="text-sm font-bold text-black">
                  Full Name / ឈ្មោះពេញ
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  placeholder="Sopheak Chan / ចាន់ សុភ័ក្ត្រ"
                  className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-bold text-black">
                  Password / លេខសម្ងាត់ *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                />
              </div>
            </div>

            {/* School Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="schoolName" className="text-sm font-bold text-black">
                School Name / ឈ្មោះសាលារៀន *
              </label>
              <input
                type="text"
                id="schoolName"
                name="schoolName"
                required
                placeholder="e.g. Wat Bo Primary School / សាលាបឋមសិក្សាវត្តបូ"
                className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Province Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="province" className="text-sm font-bold text-black">
                  Province / ខេត្ត-ក្រុង *
                </label>
                <select
                  id="province"
                  name="province"
                  required
                  defaultValue=""
                  className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-bold bg-white focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                >
                  <option value="" disabled>Select Province / ជ្រើសរើសខេត្ត</option>
                  {CAMBODIA_PROVINCES.map((prov) => (
                    <option key={prov.en} value={prov.en}>
                      {prov.en} / {prov.kh}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade Dropdown (Student only) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gradeLevel" className="text-sm font-bold text-black">
                  Grade / ថ្នាក់ទី {role === "student" ? "*" : "(Optional)"}
                </label>
                <select
                  id="gradeLevel"
                  name="gradeLevel"
                  required={role === "student"}
                  defaultValue=""
                  className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-bold bg-white focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                >
                  <option value="">Select Grade / ជ្រើសរើសថ្នាក់</option>
                  {GRADES.map((gr) => (
                    <option key={gr.en} value={gr.en}>
                      {gr.en} / {gr.kh}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Section */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="section" className="text-sm font-bold text-black">
                  Section / វេន (Optional)
                </label>
                <input
                  type="text"
                  id="section"
                  name="section"
                  placeholder="e.g. Morning A / ព្រឹក A"
                  className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all"
                />
              </div>

              {/* Parent Contact (Student only) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="parentContact" className="text-sm font-bold text-black">
                  Parent Phone / លេខទូរស័ព្ទអាណាព្យាបាល (Optional)
                </label>
                <input
                  type="text"
                  id="parentContact"
                  name="parentContact"
                  disabled={role !== "student"}
                  placeholder="e.g. 012 345 678"
                  className="w-full px-4 py-2.5 border-2 border-black rounded-none text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#3b82f6] transition-all disabled:bg-zinc-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Error message */}
            {state?.error && (
              <div className="px-4 py-3 bg-[#fda4af] border-2 border-red-500 rounded-none text-sm font-bold text-black shadow-[4px_4px_0_#000]">
                {state.error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={pending}
              className="w-full py-3.5 mt-2 bg-yellow-400 text-black font-black text-base border-2 border-black rounded-none shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? "Registering / កំពុងចុះឈ្មោះ…" : "Create Account / បង្កើតគណនី"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-4">
          Already have an account? / មានគណនីរួចហើយ?{" "}
          <Link href="/login" className="font-bold text-black hover:underline">
            Log In / ចូលគណនី
          </Link>
        </p>
      </div>
    </div>
  );
}
