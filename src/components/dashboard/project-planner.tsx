"use client";

import { useState } from "react";
import { Calendar, Users, Clock, CheckCircle, AlertTriangle, Edit3, Save, X } from "lucide-react";

interface TeamMember {
  name: string;
  age: number;
  role: "student" | "mentor";
  specialty?: string;
}

interface Task {
  id: string;
  title: string;
  week: number;
  lane: string;
  status: "not-started" | "in-progress" | "completed" | "overdue";
  description: string;
  assignee?: string;
  dueDate?: string;
}

interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  status: "pending" | "completed";
  critical: boolean;
}

const TEAM_MEMBERS: TeamMember[] = [
  { name: "DANAI YIN", age: 12, role: "student" },
  { name: "CHANTHA KANIKA", age: 13, role: "student" },
  { name: "Roza Neun", age: 11, role: "student" },
  { name: "Lin Many", age: 13, role: "student" },
  { name: "SUN RUNAMARA", age: 11, role: "student" },
  { name: "Piseth Pheap", age: 0, role: "mentor", specialty: "Teacher" },
  { name: "Vi SRIE", age: 0, role: "mentor", specialty: "University Student - Java/PM" },
];

const WORK_LANES = [
  "Ideation & Problem Selection",
  "Web App Development", 
  "Mobile Browser Optimization",
  "Backend & Database Setup",
  "User Research & Testing",
  "Ethics & Privacy Framework",
  "Video Production & Documentation",
  "Submission & Final Assets"
];

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "Identify Community Problems", week: 1, lane: "Ideation & Problem Selection", status: "completed", description: "Research and identify community problems to solve" },
  { id: "2", title: "Problem Selection & Validation", week: 2, lane: "Ideation & Problem Selection", status: "completed", description: "Choose final problem and validate with target users" },
  { id: "3", title: "Web App Framework Setup", week: 2, lane: "Web App Development", status: "in-progress", description: "Set up React/Next.js or chosen web framework" },
  { id: "4", title: "Core Features Development", week: 3, lane: "Web App Development", status: "in-progress", description: "Build main application features and functionality" },
  { id: "5", title: "Responsive Design Implementation", week: 4, lane: "Mobile Browser Optimization", status: "not-started", description: "Ensure app works well on mobile browsers" },
  { id: "6", title: "Progressive Web App (PWA) Setup", week: 5, lane: "Mobile Browser Optimization", status: "not-started", description: "Add PWA capabilities for mobile experience" },
  { id: "7", title: "Database Design & Setup", week: 3, lane: "Backend & Database Setup", status: "not-started", description: "Design and implement database schema" },
  { id: "8", title: "API Development", week: 4, lane: "Backend & Database Setup", status: "not-started", description: "Build backend APIs and endpoints" },
  { id: "9", title: "User Interviews & Surveys", week: 5, lane: "User Research & Testing", status: "not-started", description: "Conduct user research and gather feedback" },
  { id: "10", title: "Usability Testing", week: 7, lane: "User Research & Testing", status: "not-started", description: "Test app usability with target users" },
  { id: "11", title: "Privacy Policy & Data Protection", week: 6, lane: "Ethics & Privacy Framework", status: "not-started", description: "Implement privacy measures and create policy" },
  { id: "12", title: "Accessibility Compliance", week: 7, lane: "Ethics & Privacy Framework", status: "not-started", description: "Ensure app meets accessibility standards" },
  { id: "13", title: "Pitch Video Recording", week: 9, lane: "Video Production & Documentation", status: "not-started", description: "Record 3-minute pitch video" },
  { id: "14", title: "Technical Demo Video", week: 10, lane: "Video Production & Documentation", status: "not-started", description: "Record 3-minute technical demonstration" },
  { id: "15", title: "User Adoption Plan", week: 11, lane: "Submission & Final Assets", status: "not-started", description: "Create comprehensive user adoption strategy" },
  { id: "16", title: "Learning Journey Documentation", week: 11, lane: "Submission & Final Assets", status: "not-started", description: "Document learning process with photos and bibliography" },
  { id: "17", title: "Source Code Preparation", week: 12, lane: "Submission & Final Assets", status: "not-started", description: "Prepare and package source code for submission" },
  { id: "18", title: "Final Submission", week: 12, lane: "Submission & Final Assets", status: "not-started", description: "Submit all deliverables by April 20, 2026 5:00 PM PDT" },
];

const MILESTONES: Milestone[] = [
  { id: "1", title: "Registration Opens", dueDate: "August 13, 2025", status: "completed", critical: false },
  { id: "2", title: "Latest Program Start (12 weeks)", dueDate: "January 26, 2026", status: "completed", critical: true },
  { id: "3", title: "Registration Deadline", dueDate: "March 18, 2026 at 23:59 UTC", status: "pending", critical: true },
  { id: "4", title: "Final Submission Deadline", dueDate: "April 20, 2026 at 5:00 PM PDT", status: "pending", critical: true },
  { id: "5", title: "Quarterfinals Begin", dueDate: "April 23, 2026", status: "pending", critical: false },
  { id: "6", title: "Semifinalists Announced", dueDate: "May 26, 2026", status: "pending", critical: false },
  { id: "7", title: "Semifinals Judging", dueDate: "June 1-15, 2026", status: "pending", critical: false },
  { id: "8", title: "Virtual Celebration", dueDate: "July 2026", status: "pending", critical: false },
  { id: "9", title: "World Summit", dueDate: "September 2026", status: "pending", critical: false },
];

export function ProjectPlanner({ role }: { role: "admin" | "teacher" }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Task[]>([]);

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    if (role === "teacher") {
      // Teacher changes need admin approval
      const updatedTask = tasks.find(t => t.id === taskId);
      if (updatedTask) {
        const newTask = { ...updatedTask, ...updates };
        setPendingChanges(prev => [...prev.filter(t => t.id !== taskId), newTask]);
      }
    } else {
      // Admin can make changes directly
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
    }
  };

  const approveChange = (taskId: string) => {
    const pendingTask = pendingChanges.find(t => t.id === taskId);
    if (pendingTask) {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? pendingTask : task
      ));
      setPendingChanges(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const rejectChange = (taskId: string) => {
    setPendingChanges(prev => prev.filter(t => t.id !== taskId));
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-300";
      case "in-progress": return "bg-blue-100 text-blue-800 border-blue-300";
      case "overdue": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      {/* Header */}
      <div className="border-b-2 border-black pb-6 mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">The Project Planner</h1>
        <div className="grid grid-cols-2 gap-8 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">PROJECT</label>
            <div className="border-b border-black pb-1 mt-1">
              <span className="text-lg font-medium">Kesararam With Digital - Web & Mobile Browser App</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">DATE START / DATE END</label>
            <div className="border-b border-black pb-1 mt-1">
              <span className="text-lg font-medium">January 26, 2026 / April 20, 2026 5:00 PM PDT</span>
            </div>
          </div>
        </div>
        
        {/* Team Info */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Team ID:</span>
            <span className="font-bold">50777</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-600">Students:</span>
            <span className="font-bold">5</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-600">Mentors:</span>
            <span className="font-bold">2</span>
          </div>
        </div>
      </div>

      {/* Team Roster */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-black mb-4 border-b border-gray-300 pb-2">TEAM ROSTER</h2>
        <div className="grid grid-cols-4 gap-4">
          {TEAM_MEMBERS.map((member, index) => (
            <div key={index} className="border border-gray-300 p-3 bg-gray-50">
              <div className="font-medium text-sm">{member.name}</div>
              <div className="text-xs text-gray-600">
                {member.role === "student" ? `Age: ${member.age}` : member.specialty}
              </div>
              <div className="text-xs text-gray-500 capitalize">{member.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Competition Timeline Overview */}
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-bold text-black mb-4 border-b border-gray-300 pb-2">COMPETITION TIMELINE 2025-2026</h2>
        <div className="bg-gray-50 border border-gray-300 p-4">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="bg-yellow-100 border border-yellow-300 p-3 rounded">
              <div className="font-bold text-yellow-800">SIGN UP!</div>
              <div className="text-yellow-700 text-xs mt-1">Aug 13, 2025 - Mar 18, 2026</div>
              <div className="text-yellow-600 text-xs">Registration Period</div>
            </div>
            <div className="bg-orange-100 border border-orange-300 p-3 rounded">
              <div className="font-bold text-orange-800">OFFICIAL SEASON</div>
              <div className="text-orange-700 text-xs mt-1">Jan 26 - Apr 20, 2026</div>
              <div className="text-orange-600 text-xs">12-Week Development Sprint</div>
            </div>
            <div className="bg-blue-100 border border-blue-300 p-3 rounded">
              <div className="font-bold text-blue-800">JUDGING</div>
              <div className="text-blue-700 text-xs mt-1">Apr 23 - Jun 15, 2026</div>
              <div className="text-blue-600 text-xs">Quarterfinals & Semifinals</div>
            </div>
            <div className="bg-purple-100 border border-purple-300 p-3 rounded">
              <div className="font-bold text-purple-800">CELEBRATION</div>
              <div className="text-purple-700 text-xs mt-1">Jul - Sep 2026</div>
              <div className="text-purple-600 text-xs">Virtual Event & World Summit</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-600">
            <strong>Key Dates:</strong> Registration Deadline (Mar 18) • Submission Deadline (Apr 20, 5pm PDT) • 
            Semifinalists Announced (May 26) • World Summit (September 2026)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Goals Section */}
        <div>
          <h2 className="text-xl font-bold text-black mb-4 border-b border-gray-300 pb-2">GOALS</h2>
          <div className="space-y-3">
            {[
              "Develop web app with mobile browser support",
              "Address community problem through technology",
              "Implement privacy and accessibility standards",
              "Complete user research and testing",
              "Submit by April 20, 2026 5:00 PM PDT",
              "Advance through judging rounds to World Summit"
            ].map((goal, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-black rounded-full flex-shrink-0"></div>
                <span className="text-sm">{goal}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div>
          <h2 className="text-xl font-bold text-black mb-4 border-b border-gray-300 pb-2">MILESTONES</h2>
          <div className="space-y-3">
            {MILESTONES.map((milestone) => (
              <div key={milestone.id} className="flex items-center gap-3">
                <div className={`w-4 h-4 border-2 rounded-full flex-shrink-0 ${
                  milestone.status === "completed" ? "bg-green-500 border-green-500" : "border-black"
                }`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{milestone.title}</div>
                  <div className="text-xs text-gray-600">{milestone.dueDate}</div>
                  {milestone.critical && (
                    <div className="text-xs text-red-600 font-medium">CRITICAL</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div>
          <h2 className="text-xl font-bold text-black mb-4 border-b border-gray-300 pb-2">TASKS / ACTIVITIES</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tasks.map((task) => {
              const hasPendingChange = pendingChanges.some(t => t.id === task.id);
              const pendingTask = pendingChanges.find(t => t.id === task.id);
              
              return (
                <div key={task.id} className={`border p-3 ${hasPendingChange ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 border-2 border-black rounded-full ${
                          task.status === "completed" ? "bg-green-500" : ""
                        }`}></div>
                        <span className="font-medium text-sm">{task.title}</span>
                        <span className={`px-2 py-1 text-xs border rounded ${getStatusColor(task.status)}`}>
                          {task.status.replace("-", " ")}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Week {task.week} • {task.lane}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                      
                      {hasPendingChange && role === "admin" && (
                        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                          <div className="text-xs font-medium text-yellow-800 mb-1">Pending Teacher Change:</div>
                          <div className="text-xs text-yellow-700">
                            Status: {pendingTask?.status?.replace("-", " ")}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => approveChange(task.id)}
                              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectChange(task.id)}
                              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {(role === "admin" || role === "teacher") && (
                      <div className="flex gap-1">
                        <select
                          value={hasPendingChange ? pendingTask?.status : task.status}
                          onChange={(e) => updateTask(task.id, { status: e.target.value as Task["status"] })}
                          className="text-xs border border-gray-300 rounded px-1 py-1"
                          disabled={role === "teacher" && hasPendingChange}
                        >
                          <option value="not-started">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="overdue">Overdue</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline/Gantt Chart */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-black mb-4 border-b border-gray-300 pb-2">TIMELINE / GANTT</h2>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Week Headers */}
            <div className="grid grid-cols-13 gap-1 mb-2">
              <div className="text-xs font-medium text-gray-600 p-2">TASK</div>
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="text-xs font-medium text-center p-2 border-l border-gray-300">
                  Week {i + 1}
                </div>
              ))}
            </div>
            
            {/* Task Rows */}
            {WORK_LANES.map((lane, laneIndex) => {
              const laneTasks = tasks.filter(task => task.lane === lane);
              
              return (
                <div key={laneIndex} className="grid grid-cols-13 gap-1 mb-1 border-b border-gray-100">
                  <div className="text-xs p-2 font-medium bg-gray-50">{lane}</div>
                  {Array.from({ length: 12 }, (_, weekIndex) => {
                    const weekTasks = laneTasks.filter(task => task.week === weekIndex + 1);
                    
                    return (
                      <div key={weekIndex} className="border-l border-gray-200 p-1 min-h-[40px] relative">
                        {weekTasks.map((task, taskIndex) => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded mb-1 ${getStatusColor(task.status)}`}
                            title={task.description}
                          >
                            {task.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Critical Deadline Alert */}
      <div className="mt-8 border-2 border-red-500 bg-red-50 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="font-bold text-red-800">CRITICAL DEADLINE</span>
        </div>
        <div className="text-red-700 mt-1">
          Final Submission Due: <strong>April 20, 2026 at 5:00 PM PDT</strong>
        </div>
        <div className="text-sm text-red-600 mt-1">
          All deliverables must be submitted: 100-word description, pitch video (3 min), 
          technical video (3 min), User Adoption Plan, Learning Journey, Source Code (web app files)
        </div>
        <div className="text-sm text-red-600 mt-2">
          <strong>Judging Timeline:</strong> Quarterfinals (Apr 23 - May 26) → Semifinals (Jun 1-15) → World Summit (Sep 2026)
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <div>
            <strong>Team Location:</strong> Siem Reap, Cambodia • <strong>Division:</strong> Junior
          </div>
          <div>
            <strong>Mentors:</strong> Piseth Pheap (Teacher), Vi SRIE (University Student)
          </div>
        </div>
      </div>
    </div>
  );
}