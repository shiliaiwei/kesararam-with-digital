"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Users, Clock, CheckCircle, AlertTriangle, Edit3, Save, X, Globe, Info, Settings, Trophy } from "lucide-react";
import { TeamProfiles } from "@/components/dashboard/team-profiles";
import { JudgingStatus } from "@/components/dashboard/judging-status";

interface TeamMember {
  name: string;
  age: number;
  role: "student" | "mentor";
  specialty?: string;
}

interface Milestone {
  id: string;
  title: string;
  titleKh: string;
  dueDate: string;
  status: "pending" | "completed";
  critical: boolean;
}

interface Task {
  id: string;
  title: string;
  titleKh: string;
  startDate: Date;
  endDate: Date;
  week: number;
  lane: string;
  laneKh: string;
  status: "not-started" | "in-progress" | "completed" | "overdue";
  description: string;
  descriptionKh: string;
  detailedDescription: string;
  detailedDescriptionKh: string;
  deliverable?: string;
  deliverableKh?: string;
  assignee?: string;
  priority: "low" | "medium" | "high" | "critical";
  dependencies?: string[];
  dailyTodos?: DailyTodo[];
}

interface ProjectFramework {
  id: string;
  name: string;
  nameKh: string;
  description: string;
  descriptionKh: string;
  color: string;
}

const PROJECT_FRAMEWORKS: ProjectFramework[] = [
  {
    id: "agile",
    name: "AGILE SCRUM",
    nameKh: "អាជីល ស្គ្រាម",
    description: "Iterative development with 2-week sprints and daily standups",
    descriptionKh: "ការអភិវឌ្ឍន៍ដដែលៗជាមួយ sprint ២ សប្តាហ៍និងការប្រជុំប្រចាំថ្ងៃ",
    color: "#3b82f6"
  },
  {
    id: "waterfall",
    name: "WATERFALL",
    nameKh: "ទឹកធ្លាក់",
    description: "Sequential phases: Requirements → Design → Implementation → Testing → Deployment",
    descriptionKh: "ដំណាក់កាលតាមលំដាប់: តម្រូវការ → ការរចនា → ការអនុវត្ត → ការធ្វើតេស្ត → ការដាក់ឱ្យប្រើ",
    color: "#10b981"
  },
  {
    id: "lean",
    name: "LEAN STARTUP",
    nameKh: "លីន ស្តាតអាប់",
    description: "Build-Measure-Learn cycles with MVP focus and rapid iteration",
    descriptionKh: "វដ្តបង្កើត-វាស់-រៀនជាមួយការផ្តោតលើ MVP និងការធ្វើម្តងទៀតយ៉ាងលឿន",
    color: "#f59e0b"
  },
  {
    id: "swot",
    name: "SWOT ANALYSIS",
    nameKh: "ការវិភាគ SWOT",
    description: "Strengths, Weaknesses, Opportunities, Threats strategic planning",
    descriptionKh: "ការរៀបចំយុទ្ធសាស្ត្រ: ចំណុចខ្លាំង, ចំណុចខ្សោយ, ឱកាស, ការគំរាមកំហែង",
    color: "#8b5cf6"
  },
  {
    id: "okr",
    name: "OKR FRAMEWORK",
    nameKh: "ក្របខ័ណ្ឌ OKR",
    description: "Objectives and Key Results goal-setting methodology",
    descriptionKh: "វិធីសាស្ត្រកំណត់គោលដៅ: គោលបំណង និង លទ្ធផលសំខាន់",
    color: "#ef4444"
  },
  {
    id: "kpi",
    name: "KPI DASHBOARD",
    nameKh: "ផ្ទាំងគ្រប់គ្រង KPI",
    description: "Key Performance Indicators tracking and measurement",
    descriptionKh: "ការតាមដាននិងការវាស់វែងសូចនាករដំណើរការសំខាន់",
    color: "#06b6d4"
  }
];

// Calculate dates from today (March 17, 2026)
const TODAY = new Date('2026-03-17');
const getWeekStartDate = (weekNumber: number) => {
  const startDate = new Date(TODAY);
  startDate.setDate(TODAY.getDate() + (weekNumber - 1) * 7);
  return startDate;
};

const SUBMISSION_DELIVERABLES = [
  {
    id: "description",
    title: "100-WORD DESCRIPTION",
    titleKh: "ការពិពណ៌នា ១០០ ពាក្យ",
    requirement: "App summary, problem it solves, and who it helps. Plain text, no formatting.",
    requirementKh: "សង្ខេបកម្មវិធី, បញ្ហាដែលវាដោះស្រាយ, និងអ្នកដែលវាជួយ។ អត្ថបទធម្មតា, គ្មានការធ្វើទ្រង់ទ្រាយ។",
    format: "TEXT",
    week: 11
  },
  {
    id: "pitch-video",
    title: "PITCH VIDEO",
    titleKh: "វីដេអូបង្ហាញគម្រោង",
    requirement: "Max 3 minutes. Introduce team, describe problem, present app solution and impact.",
    requirementKh: "អតិបរមា ៣ នាទី។ ណែនាំក្រុម, ពិពណ៌នាបញ្ហា, បង្ហាញដំណោះស្រាយកម្មវិធីនិងផលប៉ះពាល់។",
    format: "3 MIN",
    week: 9
  },
  {
    id: "technical-video",
    title: "TECHNICAL VIDEO",
    titleKh: "វីដេអូបច្ចេកទេស",
    requirement: "Max 3 minutes. Live walkthrough of the app, show AI features and key functionality.",
    requirementKh: "អតិបរមា ៣ នាទី។ ការបង្ហាញផ្ទាល់កម្មវិធី, បង្ហាញលក្ខណៈពិសេស AI និងមុខងារសំខាន់។",
    format: "3 MIN",
    week: 10
  },
  {
    id: "user-adoption",
    title: "USER ADOPTION PLAN (JUNIOR)",
    titleKh: "ផែនការទទួលយកអ្នកប្រើប្រាស់ (កម្រិតកូនក្មេង)",
    requirement: "How will real users adopt your app? Include target audience, distribution strategy, and feedback mechanism.",
    requirementKh: "តើអ្នកប្រើប្រាស់ពិតប្រាកដនឹងទទួលយកកម្មវិធីរបស់អ្នកយ៉ាងដូចម្តេច? រួមបញ្ចូលទស្សនិកជនគោលដៅ, យុទ្ធសាស្ត្រចែកចាយ, និងយន្តការមតិយោបល់។",
    format: "JUNIOR",
    week: 8
  },
  {
    id: "learning-journey",
    title: "LEARNING JOURNEY",
    titleKh: "ដំណើរការសិក្សា",
    requirement: "Document your team's process. Must include a bibliography and 2–6 team photos showing work sessions.",
    requirementKh: "ចងក្រងដំណើរការរបស់ក្រុមអ្នក។ ត្រូវតែរួមបញ្ចូលគន្ថនិទ្ទេសនិងរូបថតក្រុម ២-៦ សន្លឹកដែលបង្ហាញសម័យប្រជុំការងារ។",
    format: "2–6 PHOTOS",
    week: 7
  },
  {
    id: "source-code",
    title: "APP SOURCE CODE",
    titleKh: "កូដប្រភពកម្មវិធី",
    requirement: "Export from App Inventor (.aia) or Thunkable (.zip). Upload working, final build only.",
    requirementKh: "នាំចេញពី App Inventor (.aia) ឬ Thunkable (.zip)។ ផ្ទុកឡើងតែការបង្កើតចុងក្រោយដែលដំណើរការប៉ុណ្ណោះ។",
    format: ".AIA / .ZIP",
    week: 12
  },
  {
    id: "team-photo",
    title: "TEAM PHOTO",
    titleKh: "រូបថតក្រុម",
    requirement: "Optional. Group photo of the full team. Recommended for judging profiles.",
    requirementKh: "ស្រេចចិត្ត។ រូបថតក្រុមរបស់ក្រុមពេញលេញ។ សូមផ្តល់អនុសាសន៍សម្រាប់ប្រវត្តិរូបការវិនិច្ឆ័យ។",
    format: "OPT",
    week: 12
  }
];

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
  { en: "Ideation & Problem Selection", kh: "គំនិតនិងការជ្រើសរើសបញ្ហា" },
  { en: "Web App Development", kh: "ការអភិវឌ្ឍន៍កម្មវិធីបណ្តាញ" }, 
  { en: "Mobile Browser Optimization", kh: "ការបង្កើនប្រសិទ្ធភាពកម្មវិធីរុករកទូរស័ព្ទ" },
  { en: "Backend & Database Setup", kh: "ការរៀបចំប្រព័ន្ធខាងក្រោយនិងមូលដ្ឋានទិន្នន័យ" },
  { en: "User Research & Testing", kh: "ការស្រាវជ្រាវអ្នកប្រើប្រាស់និងការធ្វើតេស្ត" },
  { en: "Ethics & Privacy Framework", kh: "គោលការណ៍សីលធម៌និងឯកជនភាព" },
  { en: "Video Production & Documentation", kh: "ការផលិតវីដេអូនិងឯកសារ" },
  { en: "Submission & Final Assets", kh: "ការដាក់ស្នើនិងទ្រព្យសម្បត្តិចុងក្រោយ" }
];

// Enhanced task structure with specific dates and daily to-dos
const ENHANCED_TASKS: Task[] = [
  { 
    id: "1", 
    title: "IDENTIFY COMMUNITY PROBLEMS", 
    titleKh: "កំណត់បញ្ហាសហគមន៍",
    startDate: new Date('2026-03-17'), // Week 1: Mar 17-23
    endDate: new Date('2026-03-23'),
    week: 1, 
    lane: "IDEATION & PROBLEM SELECTION", 
    laneKh: "គំនិតនិងការជ្រើសរើសបញ្ហា",
    status: "completed", 
    description: "Research and identify community problems to solve",
    descriptionKh: "ស្រាវជ្រាវនិងកំណត់បញ្ហាសហគមន៍ដែលត្រូវដោះស្រាយ",
    detailedDescription: "WEEK 1 DELIVERABLE: Conduct community research using surveys, interviews, and observation. Document 3-5 potential problems that affect your local community.",
    detailedDescriptionKh: "លទ្ធផលសប្តាហ៍ទី១: ធ្វើការស្រាវជ្រាវសហគមន៍ដោយប្រើការស្ទង់មតិ, ការសម្ភាសន៍, និងការសង្កេត។",
    priority: "high",
    dependencies: [],
    dailyTodos: [
      { date: '2026-03-17', task: 'Brainstorm community problems', taskKh: 'គិតអំពីបញ្ហាសហគមន៍' },
      { date: '2026-03-18', task: 'Create survey questions', taskKh: 'បង្កើតសំណួរស្ទង់មតិ' },
      { date: '2026-03-19', task: 'Interview 5 community members', taskKh: 'សម្ភាសន៍សមាជិកសហគមន៍ ៥ នាក់' },
      { date: '2026-03-20', task: 'Analyze survey results', taskKh: 'វិភាគលទ្ធផលស្ទង់មតិ' },
      { date: '2026-03-21', task: 'Document top 3 problems', taskKh: 'ចងក្រងបញ្ហាកំពូល ៣' },
      { date: '2026-03-22', task: 'Research existing solutions', taskKh: 'ស្រាវជ្រាវដំណោះស្រាយដែលមានស្រាប់' },
      { date: '2026-03-23', task: 'Prepare problem presentation', taskKh: 'រៀបចំការបង្ហាញបញ្ហា' }
    ]
  },
  { 
    id: "2", 
    title: "PROBLEM SELECTION & VALIDATION", 
    titleKh: "ការជ្រើសរើសនិងការបញ្ជាក់បញ្ហា",
    startDate: new Date('2026-03-24'), // Week 2: Mar 24-30
    endDate: new Date('2026-03-30'),
    week: 2, 
    lane: "IDEATION & PROBLEM SELECTION", 
    laneKh: "គំនិតនិងការជ្រើសរើសបញ្ហា",
    status: "in-progress", 
    description: "Choose final problem and validate with target users",
    descriptionKh: "ជ្រើសរើសបញ្ហាចុងក្រោយនិងបញ្ជាក់ជាមួយអ្នកប្រើប្រាស់គោលដៅ",
    detailedDescription: "WEEK 2 DELIVERABLE: Select ONE problem from research. Validate with 5-10 potential users. Create user personas.",
    detailedDescriptionKh: "លទ្ធផលសប្តាហ៍ទី២: ជ្រើសរើសបញ្ហាមួយពីការស្រាវជ្រាវ។ បញ្ជាក់ជាមួយអ្នកប្រើប្រាស់សក្តានុពល ៥-១០ នាក់។",
    priority: "critical",
    dependencies: ["1"],
    dailyTodos: [
      { date: '2026-03-24', task: 'Review all identified problems', taskKh: 'ពិនិត្យបញ្ហាដែលបានកំណត់ទាំងអស់' },
      { date: '2026-03-25', task: 'Score problems by impact/feasibility', taskKh: 'ដាក់ពិន្ទុបញ្ហាតាមផលប៉ះពាល់/លទ្ធភាព' },
      { date: '2026-03-26', task: 'Select final problem', taskKh: 'ជ្រើសរើសបញ្ហាចុងក្រោយ' },
      { date: '2026-03-27', task: 'Interview 5 potential users', taskKh: 'សម្ភាសន៍អ្នកប្រើប្រាស់សក្តានុពល ៥ នាក់' },
      { date: '2026-03-28', task: 'Create user personas', taskKh: 'បង្កើតបុគ្គលិកលក្ខណៈអ្នកប្រើប្រាស់' },
      { date: '2026-03-29', task: 'Define problem statement', taskKh: 'កំណត់សេចក្តីថ្លែងការណ៍បញ្ហា' },
      { date: '2026-03-30', task: 'Validate problem with team', taskKh: 'បញ្ជាក់បញ្ហាជាមួយក្រុម' }
    ]
  },
  { 
    id: "3", 
    title: "WEB APP FRAMEWORK SETUP", 
    titleKh: "ការរៀបចំក្របខ័ណ្ឌកម្មវិធីបណ្តាញ",
    startDate: new Date('2026-03-31'), // Week 3: Mar 31-Apr 6
    endDate: new Date('2026-04-06'),
    week: 3, 
    lane: "WEB APP DEVELOPMENT", 
    laneKh: "ការអភិវឌ្ឍន៍កម្មវិធីបណ្តាញ",
    status: "not-started", 
    description: "Set up development environment and framework",
    descriptionKh: "រៀបចំបរិយាកាសការអភិវឌ្ឍន៍និងក្របខ័ណ្ឌ",
    detailedDescription: "WEEK 3 DELIVERABLE: Choose framework, set up development environment, create project structure with Git.",
    detailedDescriptionKh: "លទ្ធផលសប្តាហ៍ទី៣: ជ្រើសរើសក្របខ័ណ្ឌ, រៀបចំបរិយាកាសការអភិវឌ្ឍន៍, បង្កើតរចនាសម្ព័ន្ធគម្រោងជាមួយ Git។",
    priority: "critical",
    dependencies: ["2"],
    dailyTodos: [
      { date: '2026-03-31', task: 'Research web frameworks (React/Next.js)', taskKh: 'ស្រាវជ្រាវក្របខ័ណ្ឌបណ្តាញ (React/Next.js)' },
      { date: '2026-04-01', task: 'Choose framework and tools', taskKh: 'ជ្រើសរើសក្របខ័ណ្ឌនិងឧបករណ៍' },
      { date: '2026-04-02', task: 'Set up development environment', taskKh: 'រៀបចំបរិយាកាសការអភិវឌ្ឍន៍' },
      { date: '2026-04-03', task: 'Initialize project with Git', taskKh: 'ចាប់ផ្តើមគម្រោងជាមួយ Git' },
      { date: '2026-04-04', task: 'Create basic project structure', taskKh: 'បង្កើតរចនាសម្ព័ន្ធគម្រោងមូលដ្ឋាន' },
      { date: '2026-04-05', task: 'Set up basic routing', taskKh: 'រៀបចំការបញ្ជូនមូលដ្ឋាន' },
      { date: '2026-04-06', task: 'Test development setup', taskKh: 'ធ្វើតេស្តការរៀបចំការអភិវឌ្ឍន៍' }
    ]
  }
  // Add more enhanced tasks following the same pattern...
];

interface DailyTodo {
  date: string;
  task: string;
  taskKh: string;
  completed?: boolean;
}

const MILESTONES: Milestone[] = [
  { 
    id: "1", 
    title: "Registration Opens", 
    titleKh: "ការចុះឈ្មោះចាប់ផ្តើម",
    dueDate: "August 13, 2025", 
    status: "completed", 
    critical: false 
  },
  { 
    id: "2", 
    title: "Latest Program Start (12 weeks)", 
    titleKh: "ការចាប់ផ្តើមកម្មវិធីចុងក្រោយ (១២ សប្តាហ៍)",
    dueDate: "January 26, 2026", 
    status: "completed", 
    critical: true 
  },
  { 
    id: "3", 
    title: "Registration Deadline", 
    titleKh: "ថ្ងៃផុតកំណត់ចុះឈ្មោះ",
    dueDate: "March 18, 2026 at 23:59 UTC", 
    status: "pending", 
    critical: true 
  },
  { 
    id: "4", 
    title: "Final Submission Deadline", 
    titleKh: "ថ្ងៃផុតកំណត់ដាក់ស្នើចុងក្រោយ",
    dueDate: "April 20, 2026 at 5:00 PM PDT", 
    status: "pending", 
    critical: true 
  },
  { 
    id: "5", 
    title: "Quarterfinals Begin", 
    titleKh: "ការចាប់ផ្តើមជុំទី១",
    dueDate: "April 23, 2026", 
    status: "pending", 
    critical: false 
  },
  { 
    id: "6", 
    title: "Semifinalists Announced", 
    titleKh: "ការប្រកាសអ្នកចូលជុំពាក់កណ្តាល",
    dueDate: "May 26, 2026", 
    status: "pending", 
    critical: false 
  },
  { 
    id: "7", 
    title: "Semifinals Judging", 
    titleKh: "ការវិនិច្ឆ័យជុំពាក់កណ្តាល",
    dueDate: "June 1-15, 2026", 
    status: "pending", 
    critical: false 
  },
  { 
    id: "8", 
    title: "Virtual Celebration", 
    titleKh: "ពិធីបុណ្យនិម្មិត",
    dueDate: "July 2026", 
    status: "pending", 
    critical: false 
  },
  { 
    id: "9", 
    title: "World Summit", 
    titleKh: "កិច្ចប្រជុំកំពូលពិភពលោក",
    dueDate: "September 2026", 
    status: "pending", 
    critical: false 
  },
];

export function ProjectPlanner({ role }: { role: "admin" | "teacher" }) {
  const [tasks, setTasks] = useState<Task[]>(ENHANCED_TASKS);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Task[]>([]);
  const [isKhmer, setIsKhmer] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedFramework, setSelectedFramework] = useState<string>("agile");
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [showDeliverables, setShowDeliverables] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "timeline" | "gantt">("cards");
  const [activeTab, setActiveTab] = useState<"planner" | "tasks" | "team" | "judging">("planner");

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Calculate days until submission deadline
  const submissionDeadline = new Date('2026-04-20T17:00:00-07:00');
  const daysUntilDeadline = Math.ceil((submissionDeadline.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24));

  // Format current time for Cambodia timezone
  const cambodiaTime = currentTime.toLocaleString('en-US', {
    timeZone: 'Asia/Phnom_Penh',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const cambodiaTimeKh = currentTime.toLocaleString('km-KH', {
    timeZone: 'Asia/Phnom_Penh',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const currentFramework = PROJECT_FRAMEWORKS.find(f => f.id === selectedFramework);

  // Toggle daily todo completion
  const toggleTodo = (taskId: string, todoDate: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.dailyTodos) {
        return {
          ...task,
          dailyTodos: task.dailyTodos.map(todo => 
            todo.date === todoDate 
              ? { ...todo, completed: !todo.completed }
              : todo
          )
        };
      }
      return task;
    }));
  };

  // Get today's todos across all tasks
  const getTodaysTodos = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaysTodos: Array<{task: Task, todo: DailyTodo}> = [];
    
    tasks.forEach(task => {
      if (task.dailyTodos) {
        const todayTodo = task.dailyTodos.find(todo => todo.date === today);
        if (todayTodo) {
          todaysTodos.push({ task, todo: todayTodo });
        }
      }
    });
    
    return todaysTodos;
  };

  // Neo-Brutalist Task Card
  const TaskCard = ({ task }: { task: Task }) => {
    const isOpen = selectedTask === task.id;
    const priorityBg =
      task.priority === "critical" ? "#ff4444" :
      task.priority === "high"     ? "#ff8800" :
      task.priority === "medium"   ? "#FFEE00" : "#00cc66";
    const priorityColor = task.priority === "medium" ? "#000" : task.priority === "high" ? "#000" : "#fff";

    const statusBg =
      task.status === "completed"  ? "#00cc66" :
      task.status === "in-progress"? "#3b82f6" :
      task.status === "overdue"    ? "#ff4444" : "#e5e7eb";
    const statusColor = task.status === "not-started" ? "#000" : "#fff";

    return (
      <div
        className="bg-white cursor-pointer select-none"
        style={{ border: "3px solid #000", boxShadow: isOpen ? "6px 6px 0 #000" : "4px 4px 0 #000", fontFamily: "'Arial Black', Arial, sans-serif" }}
        onClick={() => setSelectedTask(isOpen ? null : task.id)}
      >
        {/* Priority stripe */}
        <div style={{ height: 6, background: priorityBg }} />

        {/* Header */}
        <div className="px-3 pt-2 pb-1 flex items-start justify-between gap-2">
          <p className="font-black text-sm uppercase leading-tight flex-1">
            {isKhmer ? task.titleKh : task.title}
          </p>
          <span
            className="text-[9px] font-black px-1.5 py-0.5 flex-shrink-0"
            style={{ background: statusBg, color: statusColor, border: "2px solid #000" }}
          >
            {task.status === "completed" ? (isKhmer ? "បានបញ្ចប់" : "DONE") :
             task.status === "in-progress" ? (isKhmer ? "កំពុងដំណើរការ" : "IN PROG") :
             task.status === "overdue" ? (isKhmer ? "ហួសកំណត់" : "OVERDUE") :
             (isKhmer ? "មិនទាន់" : "TODO")}
          </span>
        </div>

        {/* Week + dates */}
        <div className="px-3 pb-2 flex items-center gap-2">
          <span className="text-[10px] font-black px-1.5 py-0.5" style={{ background: "#000", color: "#FFEE00" }}>
            W{task.week}
          </span>
          <span className="text-[10px] font-bold text-gray-500">
            {task.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} →{" "}
            {task.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <span
            className="ml-auto text-[9px] font-black px-1.5 py-0.5"
            style={{ background: priorityBg, color: priorityColor, border: "2px solid #000" }}
          >
            {task.priority.toUpperCase()}
          </span>
        </div>

        {/* Description */}
        <div className="px-3 pb-2">
          <p className="text-[11px] font-bold text-gray-700 leading-snug">
            {isKhmer ? task.descriptionKh : task.description}
          </p>
        </div>

        {/* Lane tag */}
        <div className="px-3 pb-2">
          <span className="text-[9px] font-black uppercase px-1.5 py-0.5" style={{ background: "#FFEE00", border: "1.5px solid #000" }}>
            {isKhmer ? task.laneKh : task.lane}
          </span>
        </div>

        {/* Admin status selector */}
        {(role === "admin" || role === "teacher") && (
          <div className="px-3 pb-2" onClick={(e) => e.stopPropagation()}>
            <select
              value={task.status}
              onChange={(e) => updateTask(task.id, { status: e.target.value as Task["status"] })}
              className="w-full text-[10px] font-bold px-2 py-1"
              style={{ border: "2px solid #000", background: "#fff" }}
            >
              <option value="not-started">{isKhmer ? "មិនទាន់ចាប់ផ្តើម" : "NOT STARTED"}</option>
              <option value="in-progress">{isKhmer ? "កំពុងដំណើរការ" : "IN PROGRESS"}</option>
              <option value="completed">{isKhmer ? "បានបញ្ចប់" : "COMPLETED"}</option>
              <option value="overdue">{isKhmer ? "ហួសកំណត់" : "OVERDUE"}</option>
            </select>
          </div>
        )}

        {/* Expand toggle */}
        <div
          className="px-3 py-1.5 text-center text-[10px] font-black uppercase"
          style={{ background: isOpen ? "#000" : "#f5f5f5", color: isOpen ? "#FFEE00" : "#000", borderTop: "2px solid #000" }}
        >
          {isOpen ? (isKhmer ? "▲ បិទ" : "▲ CLOSE") : (isKhmer ? "▼ ថ្ងៃ TO-DO" : "▼ DAILY TO-DOS")}
        </div>

        {/* Daily todos expanded */}
        {isOpen && task.dailyTodos && (
          <div style={{ borderTop: "2px solid #000" }}>
            {task.dailyTodos.map((todo, i) => (
              <div
                key={i}
                className="flex items-start gap-2 px-3 py-2"
                style={{ borderBottom: i < task.dailyTodos!.length - 1 ? "1px solid #e5e7eb" : "none" }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={todo.completed || false}
                  onChange={() => toggleTodo(task.id, todo.date)}
                  className="mt-0.5 w-4 h-4 flex-shrink-0"
                  style={{ accentColor: "#000" }}
                />
                <div className="flex-1">
                  <p className="text-[10px] font-black text-gray-400">
                    {new Date(todo.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                  <p className={`text-[11px] font-bold ${todo.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                    {isKhmer ? todo.taskKh : todo.task}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Today's Todos Component — Neo-Brutalist
  const TodaysTodos = () => {
    const todaysTodos = getTodaysTodos();
    const remaining = todaysTodos.filter(({ todo }) => !todo.completed).length;

    return (
      <div style={{ border: "3px solid #000", boxShadow: "4px 4px 0 #000", fontFamily: "'Arial Black', Arial, sans-serif" }}>
        <div className="flex items-center justify-between px-3 py-2" style={{ background: "#000" }}>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FFEE00]" />
            <span className="font-black text-sm text-[#FFEE00] uppercase">
              {isKhmer ? "កិច្ចការថ្ងៃនេះ" : "TODAY'S TO-DOS"}
            </span>
          </div>
          <span
            className="text-[10px] font-black px-2 py-0.5"
            style={{ background: remaining > 0 ? "#FFEE00" : "#00cc66", color: "#000" }}
          >
            {remaining > 0 ? `${remaining} ${isKhmer ? "នៅសល់" : "LEFT"}` : (isKhmer ? "✓ រួចរាល់" : "✓ ALL DONE")}
          </span>
        </div>

        {todaysTodos.length === 0 ? (
          <div className="px-4 py-3">
            <p className="font-bold text-sm text-gray-600">
              {isKhmer ? "គ្មានកិច្ចការថ្ងៃនេះ" : "No tasks scheduled for today."}
            </p>
          </div>
        ) : (
          <div>
            {todaysTodos.map(({ task, todo }, index) => (
              <div
                key={index}
                className="flex items-start gap-3 px-3 py-2"
                style={{ borderBottom: index < todaysTodos.length - 1 ? "1px solid #e5e7eb" : "none" }}
              >
                <input
                  type="checkbox"
                  checked={todo.completed || false}
                  onChange={() => toggleTodo(task.id, todo.date)}
                  className="mt-0.5 w-4 h-4 flex-shrink-0"
                  style={{ accentColor: "#000" }}
                />
                <div className="flex-1">
                  <p className="text-[10px] font-black uppercase text-gray-400">
                    {isKhmer ? task.titleKh : task.title}
                  </p>
                  <p className={`text-sm font-bold ${todo.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                    {isKhmer ? todo.taskKh : todo.task}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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

  // Tooltip component for task details
  const TaskTooltip = ({ task, children }: { task: Task; children: React.ReactNode }) => (
    <div className="relative group">
      {children}
      <div className="absolute z-50 invisible group-hover:visible bg-black text-white p-4 rounded-lg shadow-lg max-w-md -top-2 left-full ml-2 transform -translate-y-1/2">
        <div className="text-sm font-bold mb-2">
          {isKhmer ? task.titleKh : task.title}
        </div>
        <div className="text-xs mb-2">
          <strong>{isKhmer ? "សប្តាហ៍:" : "Week:"}</strong> {task.week} | 
          <strong className="ml-2">{isKhmer ? "អាទិភាព:" : "Priority:"}</strong> 
          <span className={`ml-1 px-1 rounded text-xs ${
            task.priority === "critical" ? "bg-red-500" :
            task.priority === "high" ? "bg-orange-500" :
            task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
          }`}>
            {task.priority.toUpperCase()}
          </span>
        </div>
        <div className="text-xs mb-2">
          <strong>{isKhmer ? "ថ្ងៃចាប់ផ្តើម:" : "Start Date:"}</strong> {task.startDate.toLocaleDateString()}
        </div>
        <div className="text-xs mb-2">
          <strong>{isKhmer ? "ថ្ងៃបញ្ចប់:" : "End Date:"}</strong> {task.endDate.toLocaleDateString()}
        </div>
        <div className="text-xs leading-relaxed">
          {isKhmer ? task.detailedDescriptionKh : task.detailedDescription}
        </div>
        {task.deliverable && (
          <div className="text-xs mt-2 p-2 bg-gray-800 rounded">
            <strong>{isKhmer ? "លទ្ធផល:" : "Deliverable:"}</strong> {isKhmer ? task.deliverableKh : task.deliverable}
          </div>
        )}
        <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-black rotate-45"></div>
      </div>
    </div>
  );

  // ── Full-screen Tasks Tab ─────────────────────────────────────────────────
  const TasksTab = () => (
    <div className="p-6" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-black text-3xl uppercase" style={{ letterSpacing: "-1px" }}>
            {isKhmer ? "កិច្ចការ / សកម្មភាព" : "TASKS / ACTIVITIES"}
          </h1>
          <p className="text-xs font-bold text-gray-500 mt-1">
            {tasks.filter(t => t.status === "completed").length}/{tasks.length} {isKhmer ? "បានបញ្ចប់" : "COMPLETED"}
            {" · "}
            {tasks.filter(t => t.status === "in-progress").length} {isKhmer ? "កំពុងដំណើរការ" : "IN PROGRESS"}
            {" · "}
            {tasks.filter(t => t.status === "overdue").length} {isKhmer ? "ហួសកំណត់" : "OVERDUE"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Framework selector */}
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="text-[11px] font-black uppercase px-3 py-2"
            style={{ border: "2px solid #000", background: "#FFEE00", color: "#000" }}
          >
            {PROJECT_FRAMEWORKS.map(f => (
              <option key={f.id} value={f.id}>{isKhmer ? f.nameKh : f.name}</option>
            ))}
          </select>

          {/* View mode */}
          <div className="flex">
            {(["cards", "timeline", "gantt"] as const).map((mode, i) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="px-4 py-2 text-[11px] font-black uppercase"
                style={{
                  background: viewMode === mode ? "#000" : "#fff",
                  color: viewMode === mode ? "#FFEE00" : "#000",
                  border: "2px solid #000",
                  borderLeft: i > 0 ? "1px solid #000" : "2px solid #000",
                }}
              >
                {isKhmer
                  ? (mode === "cards" ? "កាត" : mode === "timeline" ? "បញ្ជី" : "GANTT")
                  : mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Framework badge */}
      {currentFramework && (
        <div
          className="mb-5 px-4 py-2 flex items-center gap-3"
          style={{ background: currentFramework.color, border: "2px solid #000", boxShadow: "3px 3px 0 #000" }}
        >
          <span className="font-black text-white text-sm uppercase">
            {isKhmer ? currentFramework.nameKh : currentFramework.name}
          </span>
          <span className="text-white text-xs font-bold opacity-90">
            — {isKhmer ? currentFramework.descriptionKh : currentFramework.description}
          </span>
        </div>
      )}

      {/* Today's todos */}
      <div className="mb-6">
        <TodaysTodos />
      </div>

      {/* CARDS view */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
        </div>
      )}

      {/* TIMELINE list view */}
      {viewMode === "timeline" && (
        <div style={{ border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}>
          {/* Header row */}
          <div
            className="grid text-[11px] font-black uppercase px-4 py-2"
            style={{ background: "#000", color: "#FFEE00", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}
          >
            <span>{isKhmer ? "ចំណងជើង" : "TASK"}</span>
            <span>{isKhmer ? "សប្តាហ៍" : "WEEK"}</span>
            <span>{isKhmer ? "ថ្ងៃ" : "DATES"}</span>
            <span>{isKhmer ? "អាទិភាព" : "PRIORITY"}</span>
            <span>{isKhmer ? "ស្ថានភាព" : "STATUS"}</span>
          </div>
          {tasks.map((task, i) => {
            const priorityBg = task.priority === "critical" ? "#ff4444" : task.priority === "high" ? "#ff8800" : task.priority === "medium" ? "#FFEE00" : "#00cc66";
            const statusBg = task.status === "completed" ? "#00cc66" : task.status === "in-progress" ? "#3b82f6" : task.status === "overdue" ? "#ff4444" : "#e5e7eb";
            const statusColor = task.status === "not-started" ? "#000" : "#fff";
            return (
              <div
                key={task.id}
                className="grid items-center px-4 py-3 cursor-pointer"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                  borderTop: i > 0 ? "2px solid #000" : "2px solid #000",
                  background: i % 2 === 0 ? "#fff" : "#fafafa",
                }}
                onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
              >
                <div>
                  <p className="font-black text-sm uppercase leading-tight">{isKhmer ? task.titleKh : task.title}</p>
                  <p className="text-[10px] font-bold text-gray-500 mt-0.5">{isKhmer ? task.laneKh : task.lane}</p>
                  {selectedTask === task.id && task.dailyTodos && (
                    <div className="mt-2 space-y-1" onClick={e => e.stopPropagation()}>
                      {task.dailyTodos.map((todo, ti) => (
                        <div key={ti} className="flex items-center gap-2">
                          <input type="checkbox" checked={todo.completed || false} onChange={() => toggleTodo(task.id, todo.date)} style={{ accentColor: "#000" }} />
                          <span className={`text-[10px] font-bold ${todo.completed ? "line-through text-gray-400" : ""}`}>{isKhmer ? todo.taskKh : todo.task}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="font-black text-sm px-2 py-0.5 inline-block" style={{ background: "#000", color: "#FFEE00" }}>W{task.week}</span>
                <span className="text-[10px] font-bold text-gray-600">
                  {task.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} →{" "}
                  {task.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 inline-block" style={{ background: priorityBg, color: task.priority === "medium" || task.priority === "high" ? "#000" : "#fff", border: "1.5px solid #000" }}>
                  {task.priority.toUpperCase()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5" style={{ background: statusBg, color: statusColor, border: "1.5px solid #000" }}>
                    {task.status === "completed" ? "DONE" : task.status === "in-progress" ? "IN PROG" : task.status === "overdue" ? "OVERDUE" : "TODO"}
                  </span>
                  {(role === "admin" || role === "teacher") && (
                    <select
                      value={task.status}
                      onChange={(e) => { e.stopPropagation(); updateTask(task.id, { status: e.target.value as Task["status"] }); }}
                      onClick={e => e.stopPropagation()}
                      className="text-[10px] font-bold px-1 py-0.5"
                      style={{ border: "1.5px solid #000" }}
                    >
                      <option value="not-started">TODO</option>
                      <option value="in-progress">IN PROGRESS</option>
                      <option value="completed">DONE</option>
                      <option value="overdue">OVERDUE</option>
                    </select>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GANTT view — full width */}
      {viewMode === "gantt" && (
        <div>
          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { label: "DONE", bg: "#00cc66", color: "#fff" },
              { label: "IN PROGRESS", bg: "#3b82f6", color: "#fff" },
              { label: "TODO", bg: "#e5e7eb", color: "#000" },
              { label: "OVERDUE", bg: "#ff4444", color: "#fff" },
              { label: "DEADLINE", bg: "#000", color: "#FFEE00" },
            ].map(({ label, bg, color }) => (
              <span key={label} className="text-[10px] font-black px-2 py-0.5" style={{ background: bg, color, border: "2px solid #000" }}>{label}</span>
            ))}
          </div>

          <div className="overflow-x-auto" style={{ border: "3px solid #000", boxShadow: "5px 5px 0 #000" }}>
            <table className="w-full text-xs border-collapse" style={{ minWidth: 1100, tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: 160 }} />
                {Array.from({ length: 12 }).map((_, i) => <col key={i} style={{ width: `${940 / 12}px` }} />)}
              </colgroup>
              <thead>
                <tr style={{ background: "#000" }}>
                  <th className="text-left px-3 py-2 font-black text-[#FFEE00] uppercase" style={{ borderRight: "2px solid #333" }}>
                    {isKhmer ? "ផ្នែក" : "LANE"}
                  </th>
                  {Array.from({ length: 12 }, (_, i) => {
                    const wStart = new Date("2026-03-17");
                    wStart.setDate(wStart.getDate() + i * 7);
                    const wEnd = new Date(wStart);
                    wEnd.setDate(wStart.getDate() + 6);
                    const isCurrent = currentTime >= wStart && currentTime <= wEnd;
                    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    return (
                      <th
                        key={i}
                        className="text-center px-1 py-2 font-black"
                        style={{
                          background: isCurrent ? "#FFEE00" : "#000",
                          color: isCurrent ? "#000" : "#FFEE00",
                          borderLeft: "1px solid #333",
                        }}
                      >
                        <div>W{i + 1}</div>
                        <div className="font-bold text-[9px] opacity-80">{fmt(wStart)}</div>
                        <div className="font-bold text-[9px] opacity-80">{fmt(wEnd)}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {WORK_LANES.map((lane, li) => {
                  const laneTasks = tasks.filter(t => t.lane === lane.en);
                  return (
                    <tr key={li} style={{ background: li % 2 === 0 ? "#fff" : "#f9f9f9", borderBottom: "2px solid #000" }}>
                      <td className="px-3 py-2 font-black text-[11px] uppercase align-top" style={{ borderRight: "2px solid #000" }}>
                        {isKhmer ? lane.kh : lane.en}
                      </td>
                      {Array.from({ length: 12 }, (_, wi) => {
                        const weekNum = wi + 1;
                        const cellTasks = laneTasks.filter(t => t.week === weekNum);
                        const isDeadline = lane.en === "Submission & Final Assets" && weekNum === 12;
                        return (
                          <td key={wi} className="px-1 py-1 align-top" style={{ borderLeft: "1px solid #ddd", minHeight: 48 }}>
                            {isDeadline && cellTasks.length === 0 && (
                              <div className="text-[9px] font-black text-center py-1" style={{ background: "#000", color: "#FFEE00" }}>
                                APR 20<br />DEADLINE
                              </div>
                            )}
                            {cellTasks.map(task => {
                              const bg = task.status === "completed" ? "#00cc66" : task.status === "in-progress" ? "#3b82f6" : task.status === "overdue" ? "#ff4444" : "#e5e7eb";
                              const tc = task.status === "not-started" ? "#000" : "#fff";
                              return (
                                <div
                                  key={task.id}
                                  className="group relative mb-1 px-1.5 py-1 cursor-pointer"
                                  style={{ background: bg, border: "2px solid #000", color: tc }}
                                >
                                  <p className="font-black text-[9px] leading-tight line-clamp-2 uppercase">
                                    {isKhmer ? task.titleKh : task.title}
                                  </p>
                                  <p className="text-[8px] leading-tight mt-0.5 opacity-80 line-clamp-1">
                                    {isKhmer ? task.descriptionKh : task.description}
                                  </p>
                                  {/* Hover popup */}
                                  <div className="absolute z-50 hidden group-hover:block left-full top-0 ml-2 w-56 pointer-events-none"
                                    style={{ background: "#000", color: "#fff", border: "2px solid #FFEE00", padding: "10px", boxShadow: "4px 4px 0 #FFEE00" }}>
                                    <p className="font-black text-[11px] uppercase mb-1">{isKhmer ? task.titleKh : task.title}</p>
                                    <p className="text-[10px] opacity-70 mb-1">
                                      {task.startDate.toLocaleDateString()} → {task.endDate.toLocaleDateString()}
                                    </p>
                                    <p className="text-[10px] leading-relaxed mb-2">{isKhmer ? task.detailedDescriptionKh : task.detailedDescription}</p>
                                    {task.dailyTodos && (
                                      <div style={{ borderTop: "1px solid #333", paddingTop: 6 }}>
                                        <p className="font-black text-[9px] text-[#FFEE00] mb-1">DAILY TODOS:</p>
                                        {task.dailyTodos.slice(0, 3).map((todo, ti) => (
                                          <p key={ti} className={`text-[9px] mb-0.5 ${todo.completed ? "line-through opacity-50" : ""}`}>
                                            ▸ {isKhmer ? todo.taskKh : todo.task}
                                          </p>
                                        ))}
                                        {task.dailyTodos.length > 3 && <p className="text-[9px] opacity-50">+{task.dailyTodos.length - 3} more</p>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Tab Navigation — Neo-Brutalist */}
      <div
        className="flex"
        style={{ borderBottom: "3px solid #000", fontFamily: "'Arial Black', Arial, sans-serif" }}
      >
        {([
          { id: "planner", label: isKhmer ? "ផែនការ" : "PROJECT PLANNER", icon: Calendar },
          { id: "tasks",   label: isKhmer ? "កិច្ចការ" : "TASKS / ACTIVITIES", icon: CheckCircle },
          { id: "team",    label: isKhmer ? "ក្រុម" : "TEAM PROFILES", icon: Users },
          { id: "judging", label: isKhmer ? "ការវិនិច្ឆ័យ" : "JUDGING", icon: Trophy },
        ] as const).map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-5 py-3 text-xs font-black uppercase transition-colors"
            style={{
              background: activeTab === tab.id ? "#000" : "#fff",
              color: activeTab === tab.id ? "#FFEE00" : "#000",
              borderRight: i < 3 ? "2px solid #000" : "none",
              borderBottom: activeTab === tab.id ? "3px solid #000" : "none",
              marginBottom: activeTab === tab.id ? -3 : 0,
            }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
        {/* Right side controls always visible */}
        <div className="ml-auto flex items-center gap-0 pr-4">
          <button
            onClick={() => setIsKhmer(!isKhmer)}
            className="flex items-center gap-1 px-3 py-1 text-[10px] font-black uppercase"
            style={{ border: "2px solid #000", background: "#FFEE00", color: "#000" }}
          >
            <Globe className="w-3 h-3" />
            {isKhmer ? "EN" : "KH"}
          </button>
        </div>
      </div>

      {activeTab === "team" && <div className="p-8"><TeamProfiles isKhmer={isKhmer} /></div>}
      {activeTab === "judging" && <div className="p-8"><JudgingStatus isKhmer={isKhmer} /></div>}
      {activeTab === "tasks" && <TasksTab />}
      {activeTab === "planner" && <div className="p-8">

      {/* Language Toggle, Framework Selector & Live Calendar */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-blue-50 border border-blue-300 p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {isKhmer ? "ពេលវេលាបច្ចុប្បន្ន" : "CURRENT TIME"}
            </span>
          </div>
          <div className="text-lg font-bold text-blue-900">
            {isKhmer ? cambodiaTimeKh : cambodiaTime}
          </div>
          <div className="text-sm text-blue-700 mt-1">
            {isKhmer ? "ភ្នំពេញ, កម្ពុជា" : "PHNOM PENH, CAMBODIA"}
          </div>
        </div>

        <div className="text-center">
          <div className={`text-2xl font-bold ${daysUntilDeadline <= 30 ? 'text-red-600' : 'text-gray-800'}`}>
            {daysUntilDeadline > 0 ? daysUntilDeadline : 0} {isKhmer ? "ថ្ងៃ" : "DAYS"}
          </div>
          <div className="text-sm text-gray-600">
            {isKhmer ? "រហូតដល់ថ្ងៃផុតកំណត់" : "UNTIL DEADLINE"}
          </div>
        </div>

        <div className="flex gap-2">
          {/* Framework Selector */}
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded bg-white text-sm font-medium"
            style={{ color: currentFramework?.color }}
          >
            {PROJECT_FRAMEWORKS.map(framework => (
              <option key={framework.id} value={framework.id}>
                {isKhmer ? framework.nameKh : framework.name}
              </option>
            ))}
          </select>

          {/* Language Toggle */}
          <button
            onClick={() => setIsKhmer(!isKhmer)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            style={{ display: "none" }}
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">
              {isKhmer ? "ENGLISH" : "ខ្មែរ"}
            </span>
          </button>

          {/* Deliverables Checklist Toggle */}
          <button
            onClick={() => setShowDeliverables(!showDeliverables)}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-300 rounded hover:bg-red-200 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium text-red-800">
              {isKhmer ? "បញ្ជីពិនិត្យ" : "CHECKLIST"}
            </span>
          </button>
        </div>
      </div>

      {/* Framework Description */}
      {currentFramework && (
        <div className="mb-6 p-4 rounded border-l-4" style={{ borderColor: currentFramework.color, backgroundColor: `${currentFramework.color}10` }}>
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-5 h-5" style={{ color: currentFramework.color }} />
            <span className="font-bold text-lg" style={{ color: currentFramework.color }}>
              {isKhmer ? currentFramework.nameKh : currentFramework.name}
            </span>
          </div>
          <p className="text-sm text-gray-700">
            {isKhmer ? currentFramework.descriptionKh : currentFramework.description}
          </p>
        </div>
      )}

      {/* Submission Deliverables Checklist */}
      {showDeliverables && (
        <div className="mb-8 border-2 border-red-500 bg-red-50 p-6 rounded">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-800">
              {isKhmer ? "ច្រកផុតកំណត់ — បញ្ជីពិនិត្យការដាក់ស្នើ" : "DEADLINE GATE — SUBMISSION CHECKLIST"}
            </h2>
          </div>
          <div className="text-sm text-red-700 mb-4">
            <strong>7 {isKhmer ? "លទ្ធផលចាំបាច់" : "REQUIRED DELIVERABLES"} • APR 20, 2026 • 5PM PDT</strong>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUBMISSION_DELIVERABLES.map((deliverable) => (
              <div key={deliverable.id} className="bg-white border border-red-300 p-4 rounded">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-sm text-red-800">
                    {isKhmer ? deliverable.titleKh : deliverable.title}
                  </h3>
                  <span className="bg-red-200 text-red-800 px-2 py-1 text-xs font-bold rounded">
                    {deliverable.format}
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {isKhmer ? deliverable.requirementKh : deliverable.requirement}
                </p>
                <div className="mt-2 text-xs text-red-600">
                  <strong>{isKhmer ? "សប្តាហ៍គោលដៅ:" : "TARGET WEEK:"}</strong> W{deliverable.week}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b-2 border-black pb-6 mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">
          {isKhmer ? "ផែនការគម្រោង" : "The Project Planner"}
        </h1>
        <div className="grid grid-cols-2 gap-8 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {isKhmer ? "គម្រោង" : "PROJECT"}
            </label>
            <div className="border-b border-black pb-1 mt-1">
              <span className="text-lg font-medium">
                {isKhmer 
                  ? "កេសរារ៉ាមជាមួយឌីជីថល - កម្មវិធីបណ្តាញ និង ទូរស័ព្ទ" 
                  : "Kesararam With Digital - Web & Mobile Browser App"
                }
              </span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              {isKhmer ? "ថ្ងៃចាប់ផ្តើម / ថ្ងៃបញ្ចប់" : "DATE START / DATE END"}
            </label>
            <div className="border-b border-black pb-1 mt-1">
              <span className="text-lg font-medium">
                {isKhmer 
                  ? "២៦ មករា ២០២៦ / ២០ មេសា ២០២៦ ម៉ោង៥:០០ល្ងាច PDT"
                  : "January 26, 2026 / April 20, 2026 5:00 PM PDT"
                }
              </span>
            </div>
          </div>
        </div>
        
        {/* Team Info */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {isKhmer ? "លេខសម្គាល់ក្រុម:" : "Team ID:"}
            </span>
            <span className="font-bold">50777</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-600">
              {isKhmer ? "សិស្ស:" : "Students:"}
            </span>
            <span className="font-bold">5</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-600">
              {isKhmer ? "អ្នកណែនាំ:" : "Mentors:"}
            </span>
            <span className="font-bold">2</span>
          </div>
        </div>
      </div>

      {/* Team Roster */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-black mb-4 border-b border-gray-300 pb-2">
          {isKhmer ? "បញ្ជីសមាជិកក្រុម" : "TEAM ROSTER"}
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {TEAM_MEMBERS.map((member, index) => (
            <div key={index} className="border border-gray-300 p-3 bg-gray-50">
              <div className="font-medium text-sm">{member.name}</div>
              <div className="text-xs text-gray-600">
                {member.role === "student" 
                  ? `${isKhmer ? "អាយុ:" : "Age:"} ${member.age}` 
                  : member.specialty
                }
              </div>
              <div className="text-xs text-gray-500 capitalize">
                {isKhmer 
                  ? (member.role === "student" ? "សិស្ស" : "អ្នកណែនាំ")
                  : member.role
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Competition Timeline Overview */}
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-bold text-black mb-4 border-b border-gray-300 pb-2">
          {isKhmer ? "កាលវិភាគការប្រកួត ២០២៥-២០២៦" : "COMPETITION TIMELINE 2025-2026"}
        </h2>
        <div className="bg-gray-50 border border-gray-300 p-4">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="bg-yellow-100 border border-yellow-300 p-3 rounded">
              <div className="font-bold text-yellow-800">
                {isKhmer ? "ចុះឈ្មោះ!" : "SIGN UP!"}
              </div>
              <div className="text-yellow-700 text-xs mt-1">
                {isKhmer ? "១៣ សីហា ២០២៥ - ១៨ មីនា ២០២៦" : "Aug 13, 2025 - Mar 18, 2026"}
              </div>
              <div className="text-yellow-600 text-xs">
                {isKhmer ? "រយៈពេលចុះឈ្មោះ" : "Registration Period"}
              </div>
            </div>
            <div className="bg-orange-100 border border-orange-300 p-3 rounded">
              <div className="font-bold text-orange-800">
                {isKhmer ? "រដូវកាលផ្លូវការ" : "OFFICIAL SEASON"}
              </div>
              <div className="text-orange-700 text-xs mt-1">
                {isKhmer ? "២៦ មករា - ២០ មេសា ២០២៦" : "Jan 26 - Apr 20, 2026"}
              </div>
              <div className="text-orange-600 text-xs">
                {isKhmer ? "ការអភិវឌ្ឍន៍ ១២ សប្តាហ៍" : "12-Week Development Sprint"}
              </div>
            </div>
            <div className="bg-blue-100 border border-blue-300 p-3 rounded">
              <div className="font-bold text-blue-800">
                {isKhmer ? "ការវិនិច្ឆ័យ" : "JUDGING"}
              </div>
              <div className="text-blue-700 text-xs mt-1">
                {isKhmer ? "២៣ មេសា - ១៥ មិថុនា ២០២៦" : "Apr 23 - Jun 15, 2026"}
              </div>
              <div className="text-blue-600 text-xs">
                {isKhmer ? "ជុំទី១ និង ជុំពាក់កណ្តាល" : "Quarterfinals & Semifinals"}
              </div>
            </div>
            <div className="bg-purple-100 border border-purple-300 p-3 rounded">
              <div className="font-bold text-purple-800">
                {isKhmer ? "ពិធីបុណ្យ" : "CELEBRATION"}
              </div>
              <div className="text-purple-700 text-xs mt-1">
                {isKhmer ? "កក្កដា - កញ្ញា ២០២៦" : "Jul - Sep 2026"}
              </div>
              <div className="text-purple-600 text-xs">
                {isKhmer ? "ពិធីនិម្មិត និង កិច្ចប្រជុំកំពូល" : "Virtual Event & World Summit"}
              </div>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-600">
            <strong>{isKhmer ? "កាលបរិច្ឆេទសំខាន់:" : "Key Dates:"}</strong> 
            {isKhmer 
              ? " ថ្ងៃផុតកំណត់ចុះឈ្មោះ (១ៈ មីនា) • ថ្ងៃផុតកំណត់ដាក់ស្នើ (២០ មេសា ម៉ោង៥ល្ងាច PDT) • ប្រកាសអ្នកចូលជុំពាក់កណ្តាល (២៦ ឧសភា) • កិច្ចប្រជុំកំពូលពិភពលោក (កញ្ញា ២០២៦)"
              : " Registration Deadline (Mar 18) • Submission Deadline (Apr 20, 5pm PDT) • Semifinalists Announced (May 26) • World Summit (September 2026)"
            }
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Milestones */}
        <div>
          <h2 className="text-xl font-bold text-black mb-4 border-b border-gray-300 pb-2">
            {isKhmer ? "ចំណុចសំខាន់" : "MILESTONES"}
          </h2>
          <div className="space-y-3">
            {MILESTONES.map((milestone) => (
              <div key={milestone.id} className="flex items-center gap-3">
                <div className={`w-4 h-4 border-2 rounded-full flex-shrink-0 ${
                  milestone.status === "completed" ? "bg-green-500 border-green-500" : "border-black"
                }`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {isKhmer ? milestone.titleKh : milestone.title}
                  </div>
                  <div className="text-xs text-gray-600">{milestone.dueDate}</div>
                  {milestone.critical && (
                    <div className="text-xs text-red-600 font-medium">
                      {isKhmer ? "សំខាន់បំផុត" : "CRITICAL"}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task summary — click to go to Tasks tab */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-gray-300 pb-2">
            <h2 className="text-xl font-bold text-black">
              {isKhmer ? "ស្ថានភាពកិច្ចការ" : "TASK STATUS"}
            </h2>
            <button
              onClick={() => setActiveTab("tasks")}
              className="text-xs font-black px-3 py-1.5 uppercase"
              style={{ background: "#000", color: "#FFEE00", border: "2px solid #000", fontFamily: "'Arial Black', Arial, sans-serif" }}
            >
              {isKhmer ? "មើលទាំងអស់ →" : "VIEW ALL →"}
            </button>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => {
              const statusBg = task.status === "completed" ? "#00cc66" : task.status === "in-progress" ? "#3b82f6" : task.status === "overdue" ? "#ff4444" : "#e5e7eb";
              const statusColor = task.status === "not-started" ? "#000" : "#fff";
              return (
                <div key={task.id} className="flex items-center gap-3 p-2" style={{ border: "2px solid #000" }}>
                  <span className="font-black text-[10px] px-1.5 py-0.5" style={{ background: "#000", color: "#FFEE00", flexShrink: 0 }}>W{task.week}</span>
                  <span className="font-bold text-xs flex-1 truncate uppercase">{isKhmer ? task.titleKh : task.title}</span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 flex-shrink-0" style={{ background: statusBg, color: statusColor, border: "1.5px solid #000" }}>
                    {task.status === "completed" ? "DONE" : task.status === "in-progress" ? "IN PROG" : task.status === "overdue" ? "OVERDUE" : "TODO"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Critical Deadline Alert */}
      <div className="mt-8 border-2 border-black p-4" style={{ background: "#fff0f0" }}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="font-black text-red-800 uppercase" style={{ fontFamily: "'Arial Black', Arial, sans-serif" }}>
            {isKhmer ? "ថ្ងៃផុតកំណត់សំខាន់" : "CRITICAL DEADLINE"}
          </span>
          <span className="font-black text-xs px-2 py-0.5 ml-2" style={{ background: "#ff4444", color: "#fff", border: "2px solid #000" }}>
            APR 20, 2026 · 5PM PDT
          </span>
        </div>
        <p className="text-sm text-red-700 mt-2 font-bold">
          {isKhmer
            ? "លទ្ធផលទាំងអស់ត្រូវតែដាក់ស្នើ: ការពិពណ៌នា ១០០ ពាក្យ, វីដេអូ (៣ នាទី), ផែនការអ្នកប្រើ, ដំណើរការសិក្សា, កូដប្រភព"
            : "All deliverables due: 100-word description · pitch video (3 min) · technical video (3 min) · User Adoption Plan · Learning Journey · Source Code"}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t-2 border-black text-xs text-gray-600 flex justify-between">
        <span><strong>{isKhmer ? "ទីតាំង:" : "Location:"}</strong> {isKhmer ? "សៀមរាប, កម្ពុជា" : "Siem Reap, Cambodia"} · <strong>{isKhmer ? "ផ្នែក:" : "Division:"}</strong> {isKhmer ? "កម្រិតកូនក្មេង" : "Junior"}</span>
        <span><strong>{isKhmer ? "អ្នកណែនាំ:" : "Mentors:"}</strong> {isKhmer ? "ពិសិដ្ឋ ភាព, វី ស្រុី" : "Piseth Pheap, Vi SRIE"}</span>
      </div>
      </div>}
    </div>
  );
}