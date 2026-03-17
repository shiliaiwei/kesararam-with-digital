"use client";

import { useState, useEffect } from "react";
import { Calendar, Users, Clock, CheckCircle, AlertTriangle, Edit3, Save, X, Globe, Info, Settings } from "lucide-react";

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

const INITIAL_TASKS: Task[] = [
  { 
    id: "1", 
    title: "IDENTIFY COMMUNITY PROBLEMS", 
    titleKh: "កំណត់បញ្ហាសហគមន៍",
    startDate: getWeekStartDate(1),
    endDate: getWeekStartDate(1),
    week: 1, 
    lane: "IDEATION & PROBLEM SELECTION", 
    laneKh: "គំនិតនិងការជ្រើសរើសបញ្ហា",
    status: "completed", 
    description: "Research and identify community problems to solve",
    descriptionKh: "ស្រាវជ្រាវនិងកំណត់បញ្ហាសហគមន៍ដែលត្រូវដោះស្រាយ",
    detailedDescription: "WEEK 1 DELIVERABLE: Conduct community research using surveys, interviews, and observation. Document 3-5 potential problems that affect your local community. Focus on issues that technology can help solve. Create problem statements for each identified issue.",
    detailedDescriptionKh: "លទ្ធផលសប្តាហ៍ទី១: ធ្វើការស្រាវជ្រាវសហគមន៍ដោយប្រើការស្ទង់មតិ, ការសម្ភាសន៍, និងការសង្កេត។ ចងក្រងបញ្ហាសក្តានុពល ៣-៥ ដែលប៉ះពាល់ដល់សហគមន៍មូលដ្ឋានរបស់អ្នក។ ផ្តោតលើបញ្ហាដែលបច្ចេកវិទ្យាអាចជួយដោះស្រាយ។ បង្កើតសេចក្តីថ្លែងការណ៍បញ្ហាសម្រាប់បញ្ហានីមួយៗដែលបានកំណត់។",
    priority: "high",
    dependencies: []
  },
  { 
    id: "2", 
    title: "PROBLEM SELECTION & VALIDATION", 
    titleKh: "ការជ្រើសរើសនិងការបញ្ជាក់បញ្ហា",
    startDate: getWeekStartDate(2),
    endDate: getWeekStartDate(2),
    week: 2, 
    lane: "IDEATION & PROBLEM SELECTION", 
    laneKh: "គំនិតនិងការជ្រើសរើសបញ្ហា",
    status: "completed", 
    description: "Choose final problem and validate with target users",
    descriptionKh: "ជ្រើសរើសបញ្ហាចុងក្រោយនិងបញ្ជាក់ជាមួយអ្នកប្រើប្រាស់គោលដៅ",
    detailedDescription: "WEEK 2 DELIVERABLE: Select ONE problem from your research. Validate the problem by interviewing 5-10 potential users. Create user personas and problem impact assessment. Document why this problem is worth solving and how technology can address it.",
    detailedDescriptionKh: "លទ្ធផលសប្តាហ៍ទី២: ជ្រើសរើសបញ្ហាមួយពីការស្រាវជ្រាវរបស់អ្នក។ បញ្ជាក់បញ្ហាដោយសម្ភាសន៍អ្នកប្រើប្រាស់សក្តានុពល ៥-១០ នាក់។ បង្កើតបុគ្គលិកលក្ខណៈអ្នកប្រើប្រាស់និងការវាយតម្លៃផលប៉ះពាល់បញ្ហា។ ចងក្រងមូលហេតុដែលបញ្ហានេះសមនឹងដោះស្រាយនិងរបៀបដែលបច្ចេកវិទ្យាអាចដោះស្រាយវា។",
    priority: "high",
    dependencies: ["1"]
  },
  { 
    id: "3", 
    title: "WEB APP FRAMEWORK SETUP", 
    titleKh: "ការរៀបចំក្របខ័ណ្ឌកម្មវិធីបណ្តាញ",
    startDate: getWeekStartDate(2),
    endDate: getWeekStartDate(3),
    week: 2, 
    lane: "WEB APP DEVELOPMENT", 
    laneKh: "ការអភិវឌ្ឍន៍កម្មវិធីបណ្តាញ",
    status: "in-progress", 
    description: "Set up React/Next.js or chosen web framework",
    descriptionKh: "រៀបចំ React/Next.js ឬក្របខ័ណ្ឌបណ្តាញដែលបានជ្រើសរើស",
    detailedDescription: "WEEK 2-3 DELIVERABLE: Choose and set up your web development framework (React, Next.js, or App Inventor). Create project structure, set up development environment, and establish version control with Git. Create basic app shell with navigation.",
    detailedDescriptionKh: "លទ្ធផលសប្តាហ៍ទី២-៣: ជ្រើសរើសនិងរៀបចំក្របខ័ណ្ឌការអភិវឌ្ឍន៍បណ្តាញរបស់អ្នក (React, Next.js, ឬ App Inventor)។ បង្កើតរចនាសម្ព័ន្ធគម្រោង, រៀបចំបរិយាកាសការអភិវឌ្ឍន៍, និងបង្កើតការគ្រប់គ្រងកំណែជាមួយ Git។ បង្កើតសំបកកម្មវិធីមូលដ្ឋានជាមួយការរុករក។",
    priority: "critical",
    dependencies: ["2"]
  },
  { 
    id: "4", 
    title: "CORE FEATURES DEVELOPMENT", 
    titleKh: "ការអភិវឌ្ឍន៍លក្ខណៈពិសេសសំខាន់",
    startDate: getWeekStartDate(3),
    endDate: getWeekStartDate(5),
    week: 3, 
    lane: "WEB APP DEVELOPMENT", 
    laneKh: "ការអភិវឌ្ឍន៍កម្មវិធីបណ្តាញ",
    status: "in-progress", 
    description: "Build main application features and functionality",
    descriptionKh: "បង្កើតលក្ខណៈពិសេសនិងមុខងារសំខាន់របស់កម្មវិធី",
    detailedDescription: "WEEK 3-5 DELIVERABLE: Develop core app functionality that addresses your chosen problem. Implement user authentication, main features, and basic UI/UX. Focus on MVP (Minimum Viable Product) approach. Test features as you build.",
    detailedDescriptionKh: "លទ្ធផលសប្តាហ៍ទី៣-៥: អភិវឌ្ឍមុខងារកម្មវិធីសំខាន់ដែលដោះស្រាយបញ្ហាដែលអ្នកបានជ្រើសរើស។ អនុវត្តការផ្ទៀងផ្ទាត់អ្នកប្រើប្រាស់, លក្ខណៈពិសេសសំខាន់, និង UI/UX មូលដ្ឋាន។ ផ្តោតលើវិធីសាស្ត្រ MVP (ផលិតផលអប្បបរមាដែលអាចប្រើបាន)។ ធ្វើតេស្តលក្ខណៈពិសេសនៅពេលអ្នកបង្កើត។",
    priority: "critical",
    dependencies: ["3"]
  },
  { 
    id: "5", 
    title: "RESPONSIVE DESIGN IMPLEMENTATION", 
    titleKh: "ការអនុវត្តការរចនាឆ្លើយតប",
    startDate: getWeekStartDate(4),
    endDate: getWeekStartDate(5),
    week: 4, 
    lane: "MOBILE BROWSER OPTIMIZATION", 
    laneKh: "ការបង្កើនប្រសិទ្ធភាពកម្មវិធីរុករកទូរស័ព្ទ",
    status: "not-started", 
    description: "Ensure app works well on mobile browsers",
    descriptionKh: "ធានាថាកម្មវិធីដំណើរការល្អនៅលើកម្មវិធីរុករកទូរស័ព្ទ",
    detailedDescription: "WEEK 4-5 DELIVERABLE: Implement responsive design using CSS Grid/Flexbox or framework components. Test on multiple mobile devices and browsers. Optimize touch interactions, font sizes, and button spacing for mobile use.",
    detailedDescriptionKh: "លទ្ធផលសប្តាហ៍ទី៤-៥: អនុវត្តការរចនាឆ្លើយតបដោយប្រើ CSS Grid/Flexbox ឬសមាសធាតុក្របខ័ណ្ឌ។ ធ្វើតេស្តលើឧបករណ៍ទូរស័ព្ទនិងកម្មវិធីរុករកច្រើន។ បង្កើនប្រសិទ្ធភាពអន្តរកម្មប៉ះ, ទំហំអក្សរ, និងចន្លោះប៊ូតុងសម្រាប់ការប្រើប្រាស់ទូរស័ព្ទ។",
    priority: "high",
    dependencies: ["4"]
  }
  // ... Continue with more tasks following the same pattern
];

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
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Task[]>([]);
  const [isKhmer, setIsKhmer] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedFramework, setSelectedFramework] = useState<string>("agile");
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [showDeliverables, setShowDeliverables] = useState(false);

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

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
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

      <div className="grid grid-cols-3 gap-8">
        {/* Goals Section */}
        <div>
          <h2 className="text-xl font-bold text-black mb-4 border-b border-gray-300 pb-2">
            {isKhmer ? "គោលដៅ" : "GOALS"}
          </h2>
          <div className="space-y-3">
            {[
              {
                en: "Develop web app with mobile browser support",
                kh: "អភិវឌ្ឍកម្មវិធីបណ្តាញដែលគាំទ្រកម្មវិធីរុករកទូរស័ព្ទ"
              },
              {
                en: "Address community problem through technology",
                kh: "ដោះស្រាយបញ្ហាសហគមន៍តាមរយៈបច្ចេកវិទ្យា"
              },
              {
                en: "Implement privacy and accessibility standards",
                kh: "អនុវត្តស្តង់ដារឯកជនភាពនិងលក្ខណៈងាយស្រួលប្រើប្រាស់"
              },
              {
                en: "Complete user research and testing",
                kh: "បញ្ចប់ការស្រាវជ្រាវអ្នកប្រើប្រាស់និងការធ្វើតេស្ត"
              },
              {
                en: "Submit by April 20, 2026 5:00 PM PDT",
                kh: "ដាក់ស្នើមុនថ្ងៃទី២០ ខែមេសា ឆ្នាំ២០២៦ ម៉ោង៥:០០ល្ងាច PDT"
              },
              {
                en: "Advance through judging rounds to World Summit",
                kh: "ឆ្លងកាត់ជុំវិនិច្ឆ័យទៅកាន់កិច្ចប្រជុំកំពូលពិភពលោក"
              }
            ].map((goal, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-black rounded-full flex-shrink-0"></div>
                <span className="text-sm">{isKhmer ? goal.kh : goal.en}</span>
              </div>
            ))}
          </div>
        </div>

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

        {/* Tasks */}
        <div>
          <h2 className="text-xl font-bold text-black mb-4 border-b border-gray-300 pb-2">
            {isKhmer ? "កិច្ចការ / សកម្មភាព" : "TASKS / ACTIVITIES"} 
            <span className="text-sm font-normal ml-2" style={{ color: currentFramework?.color }}>
              ({isKhmer ? currentFramework?.nameKh : currentFramework?.name})
            </span>
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {tasks.map((task) => {
              const hasPendingChange = pendingChanges.some(t => t.id === task.id);
              const pendingTask = pendingChanges.find(t => t.id === task.id);
              
              return (
                <TaskTooltip key={task.id} task={task}>
                  <div className={`border p-3 cursor-help transition-all hover:shadow-md ${
                    hasPendingChange ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'
                  } ${task.priority === 'critical' ? 'border-l-4 border-l-red-500' : 
                       task.priority === 'high' ? 'border-l-4 border-l-orange-500' :
                       task.priority === 'medium' ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-green-500'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 border-2 border-black rounded-full ${
                            task.status === "completed" ? "bg-green-500" : ""
                          }`}></div>
                          <span className="font-medium text-sm">
                            {isKhmer ? task.titleKh : task.title}
                          </span>
                          <span className={`px-2 py-1 text-xs border rounded ${getStatusColor(task.status)}`}>
                            {isKhmer 
                              ? (task.status === "completed" ? "បានបញ្ចប់" : 
                                 task.status === "in-progress" ? "កំពុងដំណើរការ" :
                                 task.status === "overdue" ? "ហួសកំណត់" : "មិនទាន់ចាប់ផ្តើម")
                              : task.status.replace("-", " ").toUpperCase()
                            }
                          </span>
                          <Info className="w-3 h-3 text-gray-400" />
                        </div>
                        <div className="text-xs text-gray-600 mt-1 flex items-center gap-4">
                          <span>{isKhmer ? `សប្តាហ៍ទី ${task.week}` : `WEEK ${task.week}`}</span>
                          <span>{isKhmer ? task.laneKh : task.lane}</span>
                          <span className="text-blue-600">
                            {task.startDate.toLocaleDateString()} - {task.endDate.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {isKhmer ? task.descriptionKh : task.description}
                        </div>
                        
                        {hasPendingChange && role === "admin" && (
                          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                            <div className="text-xs font-medium text-yellow-800 mb-1">
                              {isKhmer ? "ការផ្លាស់ប្តូររបស់គ្រូដែលកំពុងរង់ចាំ:" : "PENDING TEACHER CHANGE:"}
                            </div>
                            <div className="text-xs text-yellow-700">
                              {isKhmer ? "ស្ថានភាព:" : "STATUS:"} {
                                isKhmer 
                                  ? (pendingTask?.status === "completed" ? "បានបញ្ចប់" : 
                                     pendingTask?.status === "in-progress" ? "កំពុងដំណើរការ" :
                                     pendingTask?.status === "overdue" ? "ហួសកំណត់" : "មិនទាន់ចាប់ផ្តើម")
                                  : pendingTask?.status?.replace("-", " ").toUpperCase()
                              }
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => approveChange(task.id)}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                              >
                                {isKhmer ? "យល់ព្រម" : "APPROVE"}
                              </button>
                              <button
                                onClick={() => rejectChange(task.id)}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                              >
                                {isKhmer ? "បដិសេធ" : "REJECT"}
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
                            <option value="not-started">{isKhmer ? "មិនទាន់ចាប់ផ្តើម" : "NOT STARTED"}</option>
                            <option value="in-progress">{isKhmer ? "កំពុងដំណើរការ" : "IN PROGRESS"}</option>
                            <option value="completed">{isKhmer ? "បានបញ្ចប់" : "COMPLETED"}</option>
                            <option value="overdue">{isKhmer ? "ហួសកំណត់" : "OVERDUE"}</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </TaskTooltip>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline/Gantt Chart */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-black mb-4 border-b border-gray-300 pb-2">
          {isKhmer ? "កាលវិភាគ / តារាង Gantt" : "TIMELINE / GANTT"}
        </h2>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Week Headers */}
            <div className="grid grid-cols-13 gap-1 mb-2">
              <div className="text-xs font-medium text-gray-600 p-2">
                {isKhmer ? "កិច្ចការ" : "TASK"}
              </div>
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="text-xs font-medium text-center p-2 border-l border-gray-300">
                  {isKhmer ? `សប្តាហ៍ ${i + 1}` : `Week ${i + 1}`}
                </div>
              ))}
            </div>
            
            {/* Task Rows */}
            {WORK_LANES.map((lane, laneIndex) => {
              const laneTasks = tasks.filter(task => task.lane === lane.en);
              
              return (
                <div key={laneIndex} className="grid grid-cols-13 gap-1 mb-1 border-b border-gray-100">
                  <div className="text-xs p-2 font-medium bg-gray-50">
                    {isKhmer ? lane.kh : lane.en}
                  </div>
                  {Array.from({ length: 12 }, (_, weekIndex) => {
                    const weekTasks = laneTasks.filter(task => task.week === weekIndex + 1);
                    
                    return (
                      <div key={weekIndex} className="border-l border-gray-200 p-1 min-h-[40px] relative">
                        {weekTasks.map((task, taskIndex) => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded mb-1 ${getStatusColor(task.status)}`}
                            title={isKhmer ? task.descriptionKh : task.description}
                          >
                            {isKhmer ? task.titleKh : task.title}
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
          <span className="font-bold text-red-800">
            {isKhmer ? "ថ្ងៃផុតកំណត់សំខាន់" : "CRITICAL DEADLINE"}
          </span>
        </div>
        <div className="text-red-700 mt-1">
          {isKhmer 
            ? "ថ្ងៃផុតកំណត់ដាក់ស្នើចុងក្រោយ: ថ្ងៃទី២០ ខែមេសា ឆ្នាំ២០២៦ ម៉ោង៥:០០ល្ងាច PDT"
            : "Final Submission Due: April 20, 2026 at 5:00 PM PDT"
          }
        </div>
        <div className="text-sm text-red-600 mt-1">
          {isKhmer 
            ? "លទ្ធផលទាំងអស់ត្រូវតែដាក់ស្នើ: ការពិពណ៌នា ១០០ ពាក្យ, វីដេអូបង្ហាញគម្រោង (៣ នាទី), វីដេអូបច្ចេកទេស (៣ នាទី), ផែនការទទួលយកអ្នកប្រើប្រាស់, ដំណើរការសិក្សា, កូដប្រភព (ឯកសារកម្មវិធីបណ្តាញ)"
            : "All deliverables must be submitted: 100-word description, pitch video (3 min), technical video (3 min), User Adoption Plan, Learning Journey, Source Code (web app files)"
          }
        </div>
        <div className="text-sm text-red-600 mt-2">
          <strong>{isKhmer ? "កាលវិភាគការវិនិច្ឆ័យ:" : "Judging Timeline:"}</strong> 
          {isKhmer 
            ? " ជុំទី១ (២៣ មេសា - ២៦ ឧសភា) → ជុំពាក់កណ្តាល (១-១៥ មិថុនា) → កិច្ចប្រជុំកំពូលពិភពលោក (កញ្ញា ២០២៦)"
            : " Quarterfinals (Apr 23 - May 26) → Semifinals (Jun 1-15) → World Summit (Sep 2026)"
          }
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-300 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <div>
            <strong>{isKhmer ? "ទីតាំងក្រុម:" : "Team Location:"}</strong> 
            {isKhmer ? " សៀមរាប, កម្ពុជា • " : " Siem Reap, Cambodia • "}
            <strong>{isKhmer ? "ផ្នែក:" : "Division:"}</strong> 
            {isKhmer ? " កម្រិតកូនក្មេង" : " Junior"}
          </div>
          <div>
            <strong>{isKhmer ? "អ្នកណែនាំ:" : "Mentors:"}</strong> 
            {isKhmer 
              ? " ពិសិដ្ឋ ភាព (គ្រូបង្រៀន), វី ស្រុី (និស្សិតសាកលវិទ្យាល័យ)"
              : " Piseth Pheap (Teacher), Vi SRIE (University Student)"
            }
          </div>
        </div>
      </div>
    </div>
  );
}