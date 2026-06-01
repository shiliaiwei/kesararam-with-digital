"use client";

import { useState } from "react";
import { useLang } from "@/context/lang-context";
import { Loader2, Save, LogOut } from "lucide-react";

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

export function CompleteProfileForm() {
  const { lang } = useLang();
  const kh = lang === "kh";

  const [schoolName, setSchoolName] = useState("");
  const [province, setProvince] = useState("Siem Reap"); // Default to Siem Reap as requested
  const [gradeLevel, setGradeLevel] = useState("");
  const [section, setSection] = useState("");
  const [parentContact, setParentContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      setError(kh ? "សូមបញ្ចូលឈ្មោះសាលារៀន" : "Please enter your school name.");
      return;
    }
    if (!province) {
      setError(kh ? "សូមជ្រើសរើសខេត្ត" : "Please select a province.");
      return;
    }
    if (!gradeLevel) {
      setError(kh ? "សូមជ្រើសរើសថ្នាក់ទី" : "Please select your grade level.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName,
          province,
          gradeLevel,
          section,
          parentContact,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile settings");
      }

      // Success - reload the page to release the gate and show dashboard
      window.location.reload();
    } catch (err) {
      console.error("Error completing profile:", err);
      setError(kh ? "បានកើតកំហុសក្នុងការរក្សាទុកទិន្នន័យ" : "Failed to save profile details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { logoutAction } = await import("@/app/actions/auth");
      await logoutAction();
      window.location.href = "/login";
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  return (
    <div className="min-h-screen dot-bg flex items-center justify-center px-4 py-16 select-none">
      <div className="w-full max-w-xl animate-fade-in space-y-6">
        
        {/* Official Header Banner */}
        <div className="bg-[#0284c7] text-white border-4 border-black p-6 shadow-[6px_6px_0_#000]" style={{ borderRadius: "0px" }}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-rounded text-yellow-400 text-3xl font-black">lock_open</span>
            <div className="space-y-0.5">
              <h2 className="text-xl md:text-2xl font-black uppercase font-stack-notch">
                {kh ? "បំពេញព័ត៌មានគណនីសិស្ស" : "Complete Student Profile"}
              </h2>
              <p className="text-[10px] md:text-xs text-white/80 font-black uppercase tracking-wider font-mono">
                {kh ? "សូមបំពេញព័ត៌មានខាងក្រោមមុននឹងប្រើប្រាស់ប្រព័ន្ធ" : "Please complete details before using the platform"}
              </p>
            </div>
          </div>
        </div>

        {/* Content Form */}
        <div className="bg-white border-4 border-black p-6 md:p-8 shadow-[6px_6px_0_#000]" style={{ borderRadius: "0px" }}>
          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            
            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-rose-100 border-2 border-rose-500 font-bold text-sm text-black shadow-[3px_3px_0_#000]" style={{ borderRadius: "0px" }}>
                {error}
              </div>
            )}

            {/* School Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="schoolName" className="text-sm font-black text-black">
                {kh ? "ឈ្មោះសាលារៀន *" : "School Name *"}
              </label>
              <input
                type="text"
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                placeholder={kh ? "ឧ. សាលាបឋមសិក្សាកេសរារាម" : "e.g. Kesararam Primary School"}
                className="w-full px-4 py-2.5 border-2 border-black text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#0284c7] placeholder:text-zinc-350 font-bold"
                style={{ borderRadius: "0px" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Province */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="province" className="text-sm font-black text-black">
                  {kh ? "ខេត្ត-ក្រុង *" : "Province / City *"}
                </label>
                <select
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border-2 border-black text-sm font-bold bg-white focus:outline-none focus:shadow-[2px_2px_0_#0284c7]"
                  style={{ borderRadius: "0px" }}
                >
                  <option value="" disabled>{kh ? "ជ្រើសរើសខេត្ត" : "Select Province"}</option>
                  {CAMBODIA_PROVINCES.map((prov) => (
                    <option key={prov.en} value={prov.en}>
                      {prov.en} / {prov.kh}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gradeLevel" className="text-sm font-black text-black">
                  {kh ? "ថ្នាក់ទី *" : "Grade Level *"}
                </label>
                <select
                  id="gradeLevel"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border-2 border-black text-sm font-bold bg-white focus:outline-none focus:shadow-[2px_2px_0_#0284c7]"
                  style={{ borderRadius: "0px" }}
                >
                  <option value="" disabled>{kh ? "ជ្រើសរើសថ្នាក់" : "Select Grade"}</option>
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
                <label htmlFor="section" className="text-sm font-black text-black">
                  {kh ? "វេនសិក្សា / បន្ទប់ (ស្រេចចិត្ត)" : "Section / Room (Optional)"}
                </label>
                <input
                  type="text"
                  id="section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder={kh ? "ឧ. ព្រឹក A / ថ្នាក់ទី១០A" : "e.g. Morning A / Grade 10A"}
                  className="w-full px-4 py-2.5 border-2 border-black text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#0284c7] placeholder:text-zinc-350"
                  style={{ borderRadius: "0px" }}
                />
              </div>

              {/* Parent Phone */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="parentContact" className="text-sm font-black text-black">
                  {kh ? "លេខទូរស័ព្ទអាណាព្យាបាល (ស្រេចចិត្ត)" : "Parent Phone (Optional)"}
                </label>
                <input
                  type="text"
                  id="parentContact"
                  value={parentContact}
                  onChange={(e) => setParentContact(e.target.value)}
                  placeholder="e.g. 012 345 678"
                  className="w-full px-4 py-2.5 border-2 border-black text-sm font-medium focus:outline-none focus:shadow-[2px_2px_0_#0284c7] placeholder:text-zinc-350"
                  style={{ borderRadius: "0px" }}
                />
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-black bg-zinc-100 font-black text-sm hover:bg-zinc-200 active:translate-x-0.5 active:translate-y-0.5 transition-all text-zinc-800"
                style={{ borderRadius: "0px" }}
              >
                <LogOut size={16} />
                {kh ? "ចាកចេញ" : "Logout"}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-black bg-green-400 font-black text-sm hover:bg-green-300 shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all text-black"
                style={{ borderRadius: "0px" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {kh ? "កំពុងរក្សាទុក..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {kh ? "រក្សាទុកព័ត៌មានគណនី" : "Complete Profile Setup"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
