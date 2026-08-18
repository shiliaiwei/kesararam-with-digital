"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useLang } from "@/context/lang-context";
import {
  SiNextdotjs, SiReact, SiTypescript, SiTailwindcss, SiDrizzle,
  SiVercel, SiCloudinary, SiGit, SiGithub, SiZod,
  SiPostgresql, SiShadcnui, SiLucide, SiFigma,
  SiAffinitydesigner, SiAnthropic, SiGooglegemini, SiOpenai,
  SiGithubcopilot, SiNotebooklm, SiKahoot, SiYoutube, SiGoogle,
  SiGoogleplay, SiVscodium, SiGraphql, SiMysql, SiMongodb,
  SiOpenjdk, SiPhp, SiRuby, SiPython, SiBootstrap, SiJquery,
  SiAngular, SiVuedotjs, SiHtml5, SiCssmodules, SiJavascript,
  SiNodedotjs
} from "react-icons/si";
import {
  BarChart2, ShieldCheck, PenTool, Layers, Cpu, Zap,
  BrainCircuit, Building2, Landmark, Globe, Type, Smartphone,
  BookOpen, ZoomIn, ZoomOut, RotateCcw, LayoutGrid, Network, Info,
  ExternalLink, ChevronRight, X, Expand, Shrink
} from "lucide-react";

// Structure definition for bilingual text
type Multilingual = { en: string; kh: string };

type TechNode = {
  id: string;
  name: Multilingual;
  description: Multilingual;
  icon?: any;
  status: "used" | "not_used";
  usedInKwd?: Multilingual;
  children?: TechNode[];
};

// Hierarchical tree matching the user-requested structure & all original tools
const TECH_TREE: TechNode = {
  id: "root",
  name: { en: "Web Development", kh: "ការអភិវឌ្ឍន៍វិបសាយ" },
  description: {
    en: "The entire digital technology ecosystem and tools used to build Kesararam With Digital.",
    kh: "ប្រព័ន្ធអេកូឡូស៊ីបច្ចេកវិទ្យាឌីជីថលទាំងមូល និងឧបករណ៍ដែលប្រើដើម្បីសាងសង់ Kesararam With Digital។"
  },
  icon: SiNextdotjs,
  status: "used",
  children: [
    {
      id: "backend",
      name: { en: "Back End", kh: "ផ្នែកខាងក្រោយ" },
      description: {
        en: "Server-side logic, databases, application programming interfaces (APIs), and secure authentication.",
        kh: "តក្កវិជ្ជាចំហៀងម៉ាស៊ីនបម្រើ (Server-side) មូលដ្ឋានទិន្នន័យ API និងការផ្ទៀងផ្ាត់គណនីប្រកបដោយសុវត្ថិភាព។"
      },
      icon: Cpu,
      status: "used",
      children: [
        {
          id: "be_api",
          name: { en: "API", kh: "ប្រព័ន្ធតភ្ជាប់ (API)" },
          description: {
            en: "Protocols allowing client applications to communicate securely with back-end servers.",
            kh: "ពិធីការដែលអនុញ្ញាតឱ្យកម្មវិធីចំហៀងអ្នកប្រើប្រាស់ ទាក់ទងគ្នាដោយសុវត្ថិភាពជាមួយម៉ាស៊ីនបម្រើខាងក្រោយ។"
          },
          icon: Network,
          status: "used",
          children: [
            {
              id: "graphql",
              name: { en: "GraphQL", kh: "GraphQL" },
              description: {
                en: "A query language for APIs and runtime for fulfilling queries with existing data.",
                kh: "ភាសាសាកសួរទិន្នន័យសម្រាប់ API និងប្រព័ន្ធដំណើរការសម្រាប់ការឆ្លើយតបសំណួរជាមួយទិន្នន័យដែលមានស្រាប់។"
              },
              icon: SiGraphql,
              status: "not_used",
              usedInKwd: {
                en: "Not used in KWD. We prefer standard RESTful endpoint architecture for speed and simplicity.",
                kh: "មិនត្រូវបានប្រើប្រាស់ក្នុង KWD ទេ។ យើងចូលចិត្តស្ថាបត្យកម្ម REST API ស្តង់ដារដើម្បីល្បឿន និងភាពសាមញ្ញ។"
              }
            },
            {
              id: "rest",
              name: { en: "REST API", kh: "REST API" },
              description: {
                en: "An architectural style for web services using HTTP protocols and endpoints.",
                kh: "រចនាប័ទ្មស្ថាបត្យកម្មសម្រាប់សេវាកម្មគេហទំព័រ ដោយប្រើពិធីការ និងចំណុចតភ្ជាប់ HTTP។"
              },
              icon: Zap,
              status: "used",
              usedInKwd: {
                en: "Used in KWD via Next.js Route Handlers for authentication, game sessions, and score synchronization.",
                kh: "ប្រើប្រាស់ក្នុង KWD តាមរយៈ Next.js Route Handlers សម្រាប់ការផ្ទៀងផ្ាត់គណនី វគ្គលេងហ្គេម និងការធ្វើសមកាលកម្មពិន្ទុ។"
              }
            }
          ]
        },
        {
          id: "be_db",
          name: { en: "Data Base", kh: "មូលដ្ឋានទិន្នន័យ" },
          description: {
            en: "Persistent storage systems hosting student profiles, class rosters, and educational records.",
            kh: "ប្រព័ន្ធរក្សាទុកទិន្នន័យអចិន្ត្រៃយ៍ដែលផ្ទុកប្រវត្តិរូបសិស្ស បញ្ជីឈ្មោះថ្នាក់ និងកំណត់ត្រាអប់រំ។"
          },
          icon: Layers,
          status: "used",
          children: [
            {
              id: "postgresql",
              name: { en: "PostgreSQL", kh: "PostgreSQL" },
              description: {
                en: "A powerful, open-source object-relational database system.",
                kh: "ប្រព័ន្ធមូលដ្ឋានទិន្នន័យទំនាក់ទំនងវត្ថុប្រភពកូដចំហើរកម្រិតសហគ្រាសដ៏មានឥទ្ធិពល។"
              },
              icon: SiPostgresql,
              status: "used",
              usedInKwd: {
                en: "Used in KWD via Neon Serverless Postgres to ensure clean transactions and relational constraints.",
                kh: "ប្រើប្រាស់ក្នុង KWD តាមរយៈ Neon Serverless Postgres ដើម្បីធានានូវប្រតិបត្តិការស្អាត និងដែនកំណត់ទំនាក់ទំនង។"
              }
            },
            {
              id: "mysql",
              name: { en: "MySQL", kh: "MySQL" },
              description: {
                en: "An open-source relational database management system based on SQL.",
                kh: "ប្រព័ន្ធគ្រប់គ្រងមូលដ្ឋានទិន្នន័យទំនាក់ទំនងប្រភពកូដចំហួរស្តង់ដារផ្អែកលើ SQL។"
              },
              icon: SiMysql,
              status: "not_used",
              usedInKwd: {
                en: "Not used in KWD. We choose PostgreSQL for better JSON query capabilities and serverless scalability.",
                kh: "មិនត្រូវបានប្រើប្រាស់ក្នុង KWD ទេ។ យើងជ្រើសរើស PostgreSQL សម្រាប់សមត្ថភាពសំណួរ JSON ល្អជាង និងលទ្ធភាពធ្វើមាត្រដ្ឋានបែប serverless។"
              }
            },
            {
              id: "mongodb",
              name: { en: "mongoDB", kh: "mongoDB" },
              description: {
                en: "A popular NoSQL document database designed for ease of development and scaling.",
                kh: "មូលដ្ឋានទិន្នន័យ NoSQL បែបឯកសារដែលពេញនិយម រចនាឡើងសម្រាប់ភាពងាយស្រួលក្នុងការអភិវឌ្ឍន៍ និងពង្រីកទំហំ។"
              },
              icon: SiMongodb,
              status: "not_used",
              usedInKwd: {
                en: "Not used in KWD. Relational integrity is vital for scoring and school reports, making SQL databases a better fit.",
                kh: "មិនត្រូវបានប្រើប្រាស់ក្នុង KWD ទេ។ ភាពត្រឹមត្រូវនៃទំនាក់ទំនងមានសារៈសំខាន់ណាស់សម្រាប់ពិន្ទុ និងរបាយការណ៍សាលារៀន ដែលធ្វើឱ្យ SQL ក្លាយជាជម្រើសល្អជាង។"
              }
            }
          ]
        },
        {
          id: "be_lang",
          name: { en: "language", kh: "ភាសាសរសេរកូដ" },
          description: {
            en: "Server programming environments processing request logic, database queries, and APIs.",
            kh: "បរិស្ថានកម្មវិធីម៉ាស៊ីនបម្រើដែលដំណើរការតក្កវិជ្ជាសំណើ សំណួរមូលដ្ឋានទិន្នន័យ និង API។"
          },
          icon: Type,
          status: "used",
          children: [
            {
              id: "java",
              name: { en: "Java", kh: "Java" },
              description: {
                en: "A class-based, object-oriented programming language designed for minimal dependencies.",
                kh: "ភាសាសរសេរកម្មវិធីតម្រង់ទិសវត្ថុផ្អែកលើថ្នាក់ ដែលរចនាឡើងសម្រាប់ការពឹងផ្អែកអប្បបរមា។"
              },
              icon: SiOpenjdk,
              status: "not_used",
              usedInKwd: {
                en: "Not used in KWD. React/Next.js and TypeScript provide a faster, unified developer experience.",
                kh: "មិនត្រូវបានប្រើប្រាស់ក្នុង KWD ទេ។ React/Next.js និង TypeScript ផ្តល់នូវបទពិសោធន៍អ្នកអភិវឌ្ឍន៍រួមគ្នាលឿនជាងមុន។"
              }
            },
            {
              id: "ruby",
              name: { en: "Ruby", kh: "Ruby" },
              description: {
                en: "A dynamic, open-source programming language with a focus on simplicity and productivity.",
                kh: "ភាសាសរសេរកម្មវិធីប្រភពកូដចំហើរបែបឌីណាមិក ដែលផ្តោតលើភាពសាមញ្ញ និងផលិតភាព។"
              },
              icon: SiRuby,
              status: "not_used",
              usedInKwd: {
                en: "Not used in KWD. We unify our codebase on TypeScript for both front-end and back-end logic.",
                kh: "មិនត្រូវបានប្រើប្រាស់ក្នុង KWD ទេ។ យើងបង្រួបបង្រួមប្រភពកូដរបស់យើងលើ TypeScript សម្រាប់តក្កវិជ្ជាទាំងផ្នែកខាងមុខ និងខាងក្រោយ។"
              }
            },
            {
              id: "php",
              name: { en: "PHP", kh: "PHP" },
              description: {
                en: "A popular general-purpose scripting language especially suited to web development.",
                kh: "ភាសាសរសេរស្គ្រីបគោលបំណងទូទៅដ៏ពេញនិយមមួយ ដែលស័ក្តិសមជាពិសេសសម្រាប់ការអភិវឌ្ឍន៍គេហទំព័រ។"
              },
              icon: SiPhp,
              status: "not_used",
              usedInKwd: {
                en: "Not used in KWD. Although running locally on XAMPP, KWD's production engine runs fully on TypeScript/Node.",
                kh: "មិនត្រូវបានប្រើប្រាស់ក្នុង KWD ទេ។ ទោះបីជាដំណើរការក្នុងតំបន់លើ XAMPP ក៏ដោយ ម៉ាស៊ីនផលិតកម្មរបស់ KWD ដំណើរការទាំងស្រុងលើ TypeScript/Node។"
              }
            },
            {
              id: "python",
              name: { en: "Python", kh: "Python" },
              description: {
                en: "An interpreted high-level general-purpose programming language famous for readability.",
                kh: "ភាសាសរសេរកម្មវិធីកម្រិតខ្ពស់ដែលពន្យល់ន័យ ពេញនិយមសម្រាប់ភាពងាយស្រួលអាន និងការសរសេរស្គ្រីប។"
              },
              icon: SiPython,
              status: "not_used",
              usedInKwd: {
                en: "Used in KWD for background data processing and AI training preparation scripts.",
                kh: "ប្រើប្រាស់ក្នុង KWD សម្រាប់ដំណើរការទិន្នន័យផ្ទៃខាងក្រោយ និងស្គ្រីបរៀបចំការបណ្តុះបណ្តាល AI។"
              }
            },
            {
              id: "nodejs",
              name: { en: "JavaScript (Node.JS)", kh: "JavaScript (Node.JS)" },
              description: {
                en: "A JavaScript runtime environment executing code outside web browsers.",
                kh: "បរិស្ថានដំណើរការ JavaScript ដែលដំណើរការកូដនៅខាងក្រៅកម្មវិធីរុករកគេហទំព័រ។"
              },
              icon: SiNodedotjs,
              status: "used",
              usedInKwd: {
                en: "Used in KWD as our server runtime engine for hosting code and handling package management via Node.",
                kh: "ប្រើប្រាស់ក្នុង KWD ជាម៉ាស៊ីនដំណើរការម៉ាស៊ីនបម្រើរបស់យើង សម្រាប់ផ្ទុកកូដ និងគ្រប់គ្រងកញ្ចប់កម្មវិធីតាមរយៈ Node។"
              }
            }
          ]
        },
        {
          id: "be_orm",
          name: { en: "ORM & Auth", kh: "ORM និងការផ្ទៀងផ្ទាត់" },
          description: {
            en: "Libraries linking database schemas to application models and ensuring user authentication.",
            kh: "បណ្ណាល័យដែលភ្ជាប់គ្រោងការណ៍ទិន្នន័យទៅនឹងគំរូកម្មវិធី និងធានាការផ្ទៀងផ្ទាត់អ្នកប្រើប្រាស់។"
          },
          icon: ShieldCheck,
          status: "used",
          children: [
            {
              id: "drizzle",
              name: { en: "Drizzle ORM", kh: "Drizzle ORM" },
              description: {
                en: "A lightweight, type-safe Object Relational Mapper for SQL databases.",
                kh: "កម្មវិធីផ្គូផ្គងវត្ថុទំនាក់ទំនង (Object Relational Mapper) ទម្ងន់ស្រាល និងមានសុវត្ថិភាពប្រភេទសម្រាប់ SQL។"
              },
              icon: Layers,
              status: "used",
              usedInKwd: {
                en: "Used in KWD as our primary SQL interface, giving SQL autocomplete and automatic type generation.",
                kh: "ប្រើប្រាស់ក្នុង KWD ជាចំណុចប្រទាក់ SQL ចម្បងរបស់យើង ផ្តល់នូវការបំពេញកូដ SQL ដោយស្វ័យប្រវត្ត និងការបង្កើតប្រភេទស្វ័យប្រវត្តិ។"
              }
            },
            {
              id: "zod",
              name: { en: "Zod", kh: "Zod" },
              description: {
                en: "TypeScript-first schema declaration and validation library.",
                kh: "បណ្ណាល័យប្រកាសគ្រោងការណ៍ និងផ្ទៀងផ្ទាត់ទិន្នន័យដំបូងសម្រាប់ TypeScript។"
              },
              icon: ShieldCheck,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to validate user registration formats, quiz attempts, and API input parameters.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីផ្ទៀងផ្ទាត់ទម្រង់ចុះឈ្មោះអ្នកប្រើប្រាស់ ការព្យាយាមឆ្លើយសំណួរ និងប៉ារ៉ាម៉ែត្របញ្ចូល API។"
              }
            },
            {
              id: "jose",
              name: { en: "jose", kh: "jose" },
              description: {
                en: "JSON Web Signature and Encryption library for JWT auth.",
                kh: "បណ្ណាល័យហត្ថលេខា និងកូដនីយកម្មគេហទំព័រ JSON សម្រាប់ការផ្ទៀងផ្ទាត់ JWT។"
              },
              icon: ShieldCheck,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to issue and verify secure student session cookies and tokens.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីចេញ និងផ្ទៀងផ្ទាត់ session cookies និងថូខឹនសិស្សដែលមានសុវត្ថិភាព។"
              }
            }
          ]
        }
      ]
    },
    {
      id: "frontend",
      name: { en: "Front End", kh: "ផ្នែកខាងមុខ" },
      description: {
        en: "Client interfaces, styling, rendering layers, graphic assets, and interactive learning screens.",
        kh: "ចំណុចប្រទាក់អ្នកប្រើប្រាស់ ការរចនាម៉ូដ ស្រទាប់បង្ហាញ ធនធានក្រាហ្វិក និងអេក្រង់សិក្សាអន្តរកម្ម។"
      },
      icon: Smartphone,
      status: "used",
      children: [
        {
          id: "fe_lib",
          name: { en: "Library", kh: "បណ្ណាល័យ" },
          description: {
            en: "Visual toolkits, layout generators, charts, and icons providing visual components.",
            kh: "កញ្ចប់ឧបករណ៍ចក្ខុ កម្មវិធីបង្កើតប្លង់ គំនូសតាង និងរូបតំណាងដែលផ្តល់នូវសមាសភាគចក្ខុ។"
          },
          icon: Layers,
          status: "used",
          children: [
            {
              id: "bootstrap",
              name: { en: "Bootstrap", kh: "Bootstrap" },
              description: {
                en: "Standard web layout front-end toolkit.",
                kh: "កញ្ចប់ឧបករណ៍ផ្នែកខាងមុខសម្រាប់ការរៀបចំប្លង់គេហទំព័រស្តង់ដារ។"
              },
              icon: SiBootstrap,
              status: "not_used",
              usedInKwd: {
                en: "Not used in KWD. We choose Tailwind CSS for custom branding flexibility and modern features.",
                kh: "មិនត្រូវបានប្រើប្រាស់ក្នុង KWD ទេ។ យើងជ្រើសរើស Tailwind CSS សម្រាប់ភាពបត់បែននៃម៉ាកសញ្ញាផ្ទាល់ខ្លួន និងលក្ខណៈពិសេសទំនើបៗ។"
              }
            },
            {
              id: "tailwind",
              name: { en: "Tailwind CSS", kh: "Tailwind CSS" },
              description: {
                en: "A utility-first CSS framework for rapid style design directly in markup.",
                kh: "ក្របខ័ណ្ឌ CSS ដំបូងគេបង្អស់សម្រាប់រចនាម៉ូដរហ័សដោយផ្ទាល់នៅក្នុងកូដសម្គាល់។"
              },
              icon: SiTailwindcss,
              status: "used",
              usedInKwd: {
                en: "Used in KWD as our core layout and style tool, giving fast response styling and spacing rules.",
                kh: "ប្រើប្រាស់ក្នុង KWD ជាប្លង់ស្នូល និងឧបករណ៍រចនាម៉ូដរបស់យើង ផ្តល់នូវការរចនាម៉ូដឆ្លើយតបរហ័ស និងច្បាប់ចន្លោះ។"
              }
            },
            {
              id: "jquery",
              name: { en: "jQuery", kh: "jQuery" },
              description: {
                en: "A fast, small, and feature-rich JavaScript library designed to simplify HTML DOM tree traversal.",
                kh: "បណ្ណាល័យ JavaScript លឿន តូច និងសម្បូរបែបដែលរចនាឡើងដើម្បីសម្រួលដល់ការរុករក DOM។"
              },
              icon: SiJquery,
              status: "not_used",
              usedInKwd: {
                en: "Not used in KWD. React provides declarative state rendering, replacing jQuery entirely.",
                kh: "មិនត្រូវបានប្រើប្រាស់ក្នុង KWD ទេ។ React ផ្តល់នូវការបង្ហាញស្ថានភាពបែបប្រកាស ដោយជំនួស jQuery ទាំងស្រុង។"
              }
            },
            {
              id: "lucide",
              name: { en: "lucide-react", kh: "lucide-react" },
              description: {
                en: "Beautiful, clean vector icons built for modern React frameworks.",
                kh: "រូបតំណាងវ៉ិចទ័រស្អាតៗ និងស្រស់ស្អាតដែលបង្កើតឡើងសម្រាប់ក្របខ័ណ្ឌ React ទំនើប។"
              },
              icon: SiLucide,
              status: "used",
              usedInKwd: {
                en: "Used in KWD as our primary icon set for road safety UI, alerts, and navigation.",
                kh: "ប្រើប្រាស់ក្នុង KWD ជាបណ្តុំរូបតំណាងចម្បងរបស់យើងសម្រាប់ UI សុវត្ថិភាពចរាចរណ៍ ការព្រមាន និងការរុករក។"
              }
            },
            {
              id: "recharts",
              name: { en: "Recharts", kh: "Recharts" },
              description: {
                en: "A Redefined chart library built with React and D3.",
                kh: "បណ្ណាល័យគំនូសតាងដែលបានកំណត់ឡើងវិញ បង្កើតឡើងដោយប្រើប្រាស់ React និង D3។"
              },
              icon: BarChart2,
              status: "used",
              usedInKwd: {
                en: "Used in KWD dashboard to render student progress graphs and correct answer statistics.",
                kh: "ប្រើប្រាស់ក្នុងផ្ទាំងគ្រប់គ្រង KWD ដើម្បីបង្ហាញក្រាហ្វិកវឌ្ឍនភាពសិស្ស និងស្ថិតិចម្លើយត្រឹមត្រូវ។"
              }
            }
          ]
        },
        {
          id: "fe_fw",
          name: { en: "Framework", kh: "ក្របខ័ណ្ឌ (Framework)" },
          description: {
            en: "Comprehensive structural platforms managing rendering engine and page routes.",
            kh: "វេទិការចនាសម្ព័ន្ធទូលំទូលាយដែលគ្រប់គ្រងម៉ាស៊ីនបង្ហាញ និងផ្លូវទំព័រគេហទំព័រ។"
          },
          icon: Layers,
          status: "used",
          children: [
            {
              id: "angular",
              name: { en: "Angular", kh: "Angular" },
              description: {
                en: "A development platform and TypeScript-based framework built by Google.",
                kh: "វេទិកាអភិវឌ្ឍន៍ និងក្របខ័ណ្ឌផ្អែកលើ TypeScript បង្កើតឡើងដោយ Google។"
              },
              icon: SiAngular,
              status: "not_used",
              usedInKwd: {
                en: "Not used in KWD. React provides a more flexible model that integrates better with our design tokens.",
                kh: "មិនត្រូវបានប្រើប្រាស់ក្នុង KWD ទេ។ React ផ្តល់នូវគំរូដែលអាចបត់បែនបានជាង ដែលរួមបញ្ចូលគ្នាកាន់តែល្អជាមួយនិមិត្តសញ្ញារចនារបស់យើង។"
              }
            },
            {
              id: "vue",
              name: { en: "Vue.js", kh: "Vue.js" },
              description: {
                en: "A progressive model-view-viewmodel JavaScript framework for building user interfaces.",
                kh: "ក្របខ័ណ្ឌ JavaScript គំរូ-ទិដ្ឋភាព-ទិដ្ឋភាពគំរូរីកចម្រើនសម្រាប់បង្កើតចំណុចប្រទាក់អ្នកប្រើប្រាស់។"
              },
              icon: SiVuedotjs,
              status: "not_used",
              usedInKwd: {
                en: "Not used in KWD. Next.js was selected for official SEO rendering and corporate scaling requirements.",
                kh: "មិនត្រូវបានប្រើប្រាស់ក្នុង KWD ទេ។ Next.js ត្រូវបានជ្រើសរើសសម្រាប់តម្រូវការបង្ហាញ SEO ផ្លូវការ និងការធ្វើមាត្រដ្ឋានក្រុមហ៊ុន។"
              }
            },
            {
              id: "react",
              name: { en: "React", kh: "React" },
              description: {
                en: "A popular front-end JavaScript library built by Meta for creating interactive user interfaces.",
                kh: "បណ្ណាល័យ JavaScript ផ្នែកខាងមុខដ៏ពេញនិយមដែលបង្កើតឡើងដោយ Meta សម្រាប់បង្កើតចំណុចប្រទាក់អ្នកប្រើប្រាស់អន្តរកម្ម។"
              },
              icon: SiReact,
              status: "used",
              usedInKwd: {
                en: "Used in KWD as the building block for all user interaction, quizzes, and animations.",
                kh: "ប្រើប្រាស់ក្នុង KWD ជាប្លុកសំណង់សម្រាប់រាល់អន្តរកម្មអ្នកប្រើប្រាស់ កម្រងសំណួរ និងចលនា។"
              }
            },
            {
              id: "nextjs",
              name: { en: "Next.js", kh: "Next.js" },
              description: {
                en: "React framework enabling server-side rendering, routing, and high performance.",
                kh: "ក្របខ័ណ្ឌ React ដែលអនុញ្ញាតឱ្យបង្ហាញចំហៀងម៉ាស៊ីនបម្រើ ការរុករក និងដំណើរការខ្ពស់។"
              },
              icon: SiNextdotjs,
              status: "used",
              usedInKwd: {
                en: "Used in KWD as our core web engine. It hosts all pages, manages APIs, and performs fast server builds.",
                kh: "ប្រើប្រាស់ក្នុង KWD ជាម៉ាស៊ីនគេហទំព័រស្នូលរបស់យើង។ វាផ្ទុកទំព័រទាំងអស់ គ្រប់គ្រង API និងបង្កើតការសាងសង់ម៉ាស៊ីនបម្រើរហ័ស។"
              }
            }
          ]
        },
        {
          id: "fe_lang",
          name: { en: "language", kh: "ភាសាសរសេរកូដ" },
          description: {
            en: "Native languages executed inside the browser for page layouts and interactive events.",
            kh: "ភាសាកំណើតដែលដំណើរការនៅក្នុងកម្មវិធីរុករកសម្រាប់ប្លង់ទំព័រ និងព្រឹត្តិការណ៍អន្តរកម្ម។"
          },
          icon: Type,
          status: "used",
          children: [
            {
              id: "html",
              name: { en: "HTML", kh: "HTML" },
              description: {
                en: "The standard markup language for documents designed to be displayed in a web browser.",
                kh: "ភាសាសម្គាល់ស្តង់ដារសម្រាប់ឯកសារដែលត្រូវបានរចនាឡើងដើម្បីបង្ហាញនៅក្នុងកម្មវិធីរុករកគេហទំព័រ។"
              },
              icon: SiHtml5,
              status: "used",
              usedInKwd: {
                en: "Used in KWD through React JSX to define semantic HTML landmarks, headers, and accessible buttons.",
                kh: "ប្រើប្រាស់ក្នុង KWD តាមរយៈ React JSX ដើម្បីកំណត់សម្គាល់ HTML ន័យធៀប ក្បាលទំព័រ និងប៊ូតុងដែលអាចចូលប្រើបាន។"
              }
            },
            {
              id: "css",
              name: { en: "CSS", kh: "CSS" },
              description: {
                en: "A stylesheet language used for describing the presentation of a document written in HTML.",
                kh: "ភាសាសន្លឹករចនាប័ទ្មដែលប្រើសម្រាប់ពណ៌នាអំពីការបង្ហាញឯកសារដែលបានសរសេរជា HTML។"
              },
              icon: SiCssmodules,
              status: "used",
              usedInKwd: {
                en: "Used in KWD via CSS variables, avatar rank transitions, and caution-tape gradients in globals.css.",
                kh: "ប្រើប្រាស់ក្នុង KWD តាមរយៈអថេរ CSS ការផ្លាស់ប្តូរចំណាត់ថ្នាក់រូបតំណាង និងជម្រាលខ្សែអាត់ប្រុងប្រយ័ត្ននៅក្នុង globals.css។"
              }
            },
            {
              id: "javascript",
              name: { en: "JavaScript", kh: "JavaScript" },
              description: {
                en: "A lightweight, interpreted, or JIT-compiled programming language with first-class functions.",
                kh: "ភាសាសរសេរកម្មវិធីទម្ងន់ស្រាល ដែលពន្យល់ន័យ ឬ مرتبបកប្រែ JIT ជាមួយមុខងារលំដាប់ទីមួយ។"
              },
              icon: SiJavascript,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to power client state management, sound effects, and session verification.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីគាំទ្រដល់ការគ្រប់គ្រងស្ថានភាពអ្នកប្រើប្រាស់ ផលប៉ះពាល់សំឡេង និងការផ្ទៀង verification។"
              }
            }
          ]
        },
        {
          id: "fe_design",
          name: { en: "Design", kh: "ការរចនា" },
          description: {
            en: "Graphic and structural tools defining the brutalist road-safety visual experience.",
            kh: "ឧបករណ៍ក្រាហ្វិក និងរចនាសម្ព័ន្ធដែលកំណត់បទពិសោធន៍ចក្ខុសុវត្ថិភាពចរាចរណ៍បែប brutalist។"
          },
          icon: PenTool,
          status: "used",
          children: [
            {
              id: "figma",
              name: { en: "Figma", kh: "Figma" },
              description: {
                en: "A collaborative web application for interface design.",
                kh: "កម្មវិធីគេហទំព័រសហការគ្នាសម្រាប់ការរចនាចំណុចប្រទាក់អ្នកប្រើប្រាស់។"
              },
              icon: SiFigma,
              status: "used",
              usedInKwd: {
                en: "Used in KWD for UI wireframes, initial layout brainstorming, and mockups.",
                kh: "ប្រើប្រាស់ក្នុង KWD សម្រាប់ប្លង់សេចក្តីព្រាង UI ការបំផុសគំនិតប្លង់ដំបូង និង mockups។"
              }
            },
            {
              id: "affinity",
              name: { en: "Affinity Designer", kh: "Affinity Designer" },
              description: {
                en: "A proprietary vector graphics editor.",
                kh: "កម្មវិធីកែសម្រួលក្រាហ្វិកវ៉ិចទ័រកម្មសិទ្ធិផ្ទាល់ខ្លួនដ៏ពេញនិយម។"
              },
              icon: SiAffinitydesigner,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to refine vector road signs and SVG assets to render cleanly at 4K.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីកែលម្អផ្លាកសញ្ញាចរាចរណ៍វ៉ិចទ័រ និងធនធាន SVG ដើម្បីបង្ហាញបានច្បាស់នៅកម្រិត 4K។"
              }
            },
            {
              id: "adobe",
              name: { en: "Adobe Creative Suite", kh: "Adobe Creative Suite" },
              description: {
                en: "Graphic assets, layout adjustments, and image editing suite.",
                kh: "កញ្ចប់កែសម្រួលរូបភាព កែសម្រួលប្លង់ និងធនធានក្រាហ្វិក។"
              },
              icon: Layers,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to compress visual layers and export raster illustrations.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីបង្រួមស្រទាប់ចក្ខុ និងនាំចេញរូបភាពគំនូរ raster។"
              }
            },
            {
              id: "bananapro",
              name: { en: "Banana Pro / PenTool", kh: "Banana Pro / PenTool" },
              description: {
                en: "Custom vector editing tools for character modeling.",
                kh: "ឧបករណ៍កែសម្រួលវ៉ិចទ័រផ្ទាល់ខ្លួនសម្រាប់ការបង្កើតគំរូតួអង្គ។"
              },
              icon: PenTool,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to illustrate road-safety mascot templates and cartoon components.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីគូរគំរូតួអង្គម៉ាស្កូតសុវត្ថិភាពចរាចរណ៍ និងសមាសភាគតុក្កតា។"
              }
            }
          ]
        }
      ]
    },
    {
      id: "ai_dev",
      name: { en: "AI & Dev Tools", kh: "ជំនួយការ AI និងឧបករណ៍សរសេរកូដ" },
      description: {
        en: "Generative artificial intelligence and code development assistants helping KWD creators.",
        kh: "បញ្ញាសិប្បនិម្មិតបង្កើតផល និងជំនួយការសរសេរកូដដែលជួយដល់អ្នកបង្កើត KWD។"
      },
      icon: BrainCircuit,
      status: "used",
      children: [
        {
          id: "ai_agents",
          name: { en: "Coding Agents", kh: "ភ្នាក់ងារសរសេរកូដ" },
          description: {
            en: "Autonomous code writing assistants assisting in codebase modifications.",
            kh: "ជំនួយការសរសេរកូដស្វ័យប្រវត្តដែលជួយក្នុងការកែប្រែប្រភពកូដ។"
          },
          icon: Cpu,
          status: "used",
          children: [
            {
              id: "antigravity",
              name: { en: "Antigravity AI", kh: "Antigravity AI" },
              description: {
                en: "Google DeepMind's autonomous coding assistant performing repository engineering.",
                kh: "ជំនួយការសរសេរកូដស្វ័យប្រវត្តរបស់ Google DeepMind ដែលអនុវត្តវិស្វកម្មលើកូដ។"
              },
              icon: BrainCircuit,
              status: "used",
              usedInKwd: {
                en: "Used in KWD as our primary developer pair-programmer to implement complex views and styling checks.",
                kh: "ប្រើប្រាស់ក្នុង KWD ជាអ្នកសរសេរកូដដៃគូចម្បងរបស់យើង ដើម្បីអនុវត្តការបង្ហាញស្មុគស្មាញ និងការត្រួតពិនិត្យរចនាប័ទ្ម។"
              }
            },
            {
              id: "kiro",
              name: { en: "Kiro AI", kh: "Kiro AI" },
              description: {
                en: "Autonomous programming partner for refactoring and test writing.",
                kh: "ដៃគូសរសេរកម្មវិធីស្វ័យប្រវត្តសម្រាប់ការកែសម្រួលកូដឡើងវិញ និងការសរសេរតេស្ត។"
              },
              icon: BrainCircuit,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to write unit tests and audit database schemas.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីសរសេរតេស្តឯកតា និងសវនកម្មគ្រោងការណ៍មូលដ្ឋានទិន្នន័យ។"
              }
            },
            {
              id: "copilot",
              name: { en: "GitHub Copilot", kh: "GitHub Copilot" },
              description: {
                en: "Inline code autocomplete helper in local text editors.",
                kh: "ជំនួយការបំពេញកូដដោយស្វ័យប្រវត្តតាមបន្ទាត់នៅក្នុងកម្មវិធីកែសម្រួលអត្ថបទក្នុងស្រុក។"
              },
              icon: SiGithubcopilot,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to speed up typing of standard loops, imports, and variables.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីពន្លឿនការវាយកូដរង្វិលជុំស្តង់ដារ ការនាំចូល និងអថេរ។"
              }
            }
          ]
        },
        {
          id: "ai_llms",
          name: { en: "LLMs & APIs", kh: "ម៉ូដែលភាសាធំៗ" },
          description: {
            en: "Large Language Models powering text refinement, research, and technical brainstorming.",
            kh: "ម៉ូដែលភាសាធំៗដែលជួយដល់ការកែលម្អអត្ថបទ ការស្រាវជ្រាវ និងការបំផុសគំនិតបច្ចេកទេស។"
          },
          icon: Zap,
          status: "used",
          children: [
            {
              id: "claude",
              name: { en: "Claude (Anthropic)", kh: "Claude (Anthropic)" },
              description: {
                en: "High-capability reasoning and code editing model.",
                kh: "ម៉ូដែលវែកញែក និងកែសម្រួលកូដដែលមានសមត្ថភាពខ្ពស់។"
              },
              icon: SiAnthropic,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to write detailed Khmer translations and check responsive HTML styles.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីសរសេរបកប្រែភាសាខ្មែរលម្អិត និងត្រួតពិនិត្យរចនាប័ទ្ម HTML ឆ្លើយតប។"
              }
            },
            {
              id: "gemini",
              name: { en: "Google Gemini", kh: "Google Gemini" },
              description: {
                en: "Multimodal AI engine backing text synthesis and concept creation.",
                kh: "ម៉ាស៊ីន AI ពហុទម្រង់ដែលគាំទ្រការសំយោគអត្ថបទ និងការបង្កើតគំនិត។"
              },
              icon: SiGooglegemini,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to brainstorm local Cambodian scenarios and verify safety law references.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីបំផុសគំនិតអំពីស្ថានភាពក្នុងស្រុករបស់កម្ពុជា និងផ្ទៀងផ្ទាត់ឯកសារយោងច្បាប់សុវត្ថិភាព។"
              }
            },
            {
              id: "openai",
              name: { en: "OpenAI ChatGPT", kh: "OpenAI ChatGPT" },
              description: {
                en: "Interactive productivity and documentation research model.",
                kh: "ម៉ូដែលអន្តរកម្មសម្រាប់ផលិតភាព និងការស្រាវជ្រាវឯកសារ។"
              },
              icon: SiOpenai,
              status: "used",
              usedInKwd: {
                en: "Used in KWD for formatting markdown files and planning database migrations.",
                kh: "ប្រើប្រាស់ក្នុង KWD សម្រាប់កំណត់ទម្រង់ឯកសារ markdown និងរៀបចំផែនការផ្ទេរទិន្នន័យ។"
              }
            },
            {
              id: "notebooklm",
              name: { en: "Google NotebookLM", kh: "Google NotebookLM" },
              description: {
                en: "Personalized research notebook utilizing user documents as source authority.",
                kh: "សៀវភៅកត់ត្រាស្រាវជ្រាវផ្ទាល់ខ្លួនដែលប្រើប្រាស់ឯកសារអ្នកប្រើប្រាស់ជាប្រភពផ្លូវការ។"
              },
              icon: SiNotebooklm,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to structure traffic regulations and textbook sources into a clean learning flow.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីរៀបចំបទប្បញ្ញត្តិចរាចរណ៍ និងប្រភពសៀវភៅសិក្សាទៅជាលំហូរសិក្សាស្អាត។"
              }
            },
            {
              id: "kimi",
              name: { en: "Kimi AI", kh: "Kimi AI" },
              description: {
                en: "Long-context document analysis engine.",
                kh: "ម៉ាស៊ីនវិភាគឯកសារដែលមានបរិបទវែង។"
              },
              icon: Cpu,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to read long Ministry PDF documents and extract signage tables.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីអានឯកសារ PDF វែងៗរបស់ក្រសួង និងទាញយកតារាងផ្លាកសញ្ញា។"
              }
            },
            {
              id: "grok",
              name: { en: "Grok (xAI)", kh: "Grok (xAI)" },
              description: {
                en: "Real-time search and technical idea verification assistant.",
                kh: "ជំនួយការស្វែងរកពេលវេលាជាក់ស្តែង និងផ្ទៀងផ្ទាត់គំនិតបច្ចេកទេស។"
              },
              icon: Zap,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to search for recent official traffic law updates.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីស្វែងរកការធ្វើបច្ចុប្បន្នភាពច្បាប់ចរាចរណ៍ផ្លូវការថ្មីៗបំផុត។"
              }
            },
            {
              id: "aistudio",
              name: { en: "Google AI Studio", kh: "Google AI Studio" },
              description: {
                en: "Prototype portal for experimenting with large multimodal models.",
                kh: "គេហទំព័រគំរូសម្រាប់សាកល្បងជាមួយម៉ូដែលពហុទម្រង់ធំៗ។"
              },
              icon: SiGoogle,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to prototype content filtering and test localized translation prompts.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីសាកល្បងការច្រោះមាតិកា និងសាកល្បងប្រអប់បញ្ចូលបកប្រែក្នុងស្រុក។"
              }
            },
            {
              id: "qwen",
              name: { en: "Qwen", kh: "Qwen" },
              description: {
                en: "Multilingual logic and auxiliary translation helper.",
                kh: "តក្កវិជ្ជាពហុភាសា និងជំនួយការបកប្រែបន្ថែម។"
              },
              icon: BrainCircuit,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to crosscheck technical terminology.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីត្រួតពិនិត្យវាក្យសព្ទបច្ចេកទេស។"
              }
            },
            {
              id: "deepseek",
              name: { en: "DeepSeek", kh: "DeepSeek" },
              description: {
                en: "Deep-reasoning algorithm verification and code auditing assistant.",
                kh: "ជំនួយការផ្ទៀងផ្ទាត់ក្បួនដោះស្រាយការវែកញែកស៊ីជម្រៅ និងសវនកម្មកូដ។"
              },
              icon: BrainCircuit,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to optimize database indexing and complex join queries.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីបង្កើនប្រសិទ្ធភាពលិបិក្រមមូលដ្ឋានទិន្នន័យ និងសំណួររួមគ្នាស្មុគស្មាញ។"
              }
            }
          ]
        },
        {
          id: "ai_env",
          name: { en: "Environments", kh: "ប្រព័ន្ធគ្រប់គ្រង និងបរិស្ថាន" },
          description: {
            en: "Hosting and version control platforms keeping KWD server builds running.",
            kh: "វេទិកាផ្ទុក និងគ្រប់គ្រងកំណែដែលរក្សាដំណើរការសាងសង់ម៉ាស៊ីនបម្រើ KWD។"
          },
          icon: Globe,
          status: "used",
          children: [
            {
              id: "git_github",
              name: { en: "Git & GitHub", kh: "Git & GitHub" },
              description: {
                en: "Distributed version control system and repository host.",
                kh: "ប្រព័ន្ធគ្រប់គ្រងកំណែចែកចាយ និងម៉ាស៊ីនផ្ទុកប្រភពកូដ។"
              },
              icon: SiGithub,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to track all design changes, review branch pull requests, and deploy code changes.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីតាមដានរាល់ការផ្លាស់ប្តូរការរចនា ពិនិត្យការស្នើសុំទាញយកសាខា និងដាក់ឱ្យប្រើប្រាស់កូដ។"
              }
            },
            {
              id: "vscode",
              name: { en: "VS Code / VSCodium", kh: "VS Code / VSCodium" },
              description: {
                en: "Modern lightweight code editor backing our daily coding workspace.",
                kh: "កម្មវិធីកែសម្រួលកូដទម្ងន់ស្រាលទំនើប ដែលគាំទ្រដល់កន្លែងធ្វើការសរសេរកូដប្រចាំថ្ងៃរបស់យើង។"
              },
              icon: SiVscodium,
              status: "used",
              usedInKwd: {
                en: "Used in KWD as our primary editor environment for writing React files and stylesheet assets.",
                kh: "ប្រើប្រាស់ក្នុង KWD ជាបរិស្ថានកម្មវិធីនិពន្ធចម្បងរបស់យើងសម្រាប់សរសេរឯកសារ React និងធនធានសន្លឹករចនាប័ទ្ម។"
              }
            },
            {
              id: "vercel",
              name: { en: "Vercel", kh: "Vercel" },
              description: {
                en: "Hosting platform for Next.js web application deployment.",
                kh: "វេទិកាផ្ទុកសម្រាប់ការដាក់ឱ្យប្រើប្រាស់កម្មវិធីគេហទំព័រ Next.js។"
              },
              icon: SiVercel,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to serve pages, deliver asset bundles via CDN, and handle domain redirection.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីផ្តល់ទំព័រ ផ្តល់កញ្ចប់ធនធានតាមរយៈ CDN និងគ្រប់គ្រងការបញ្ជូនបន្តដែន។"
              }
            }
          ]
        }
      ]
    },
    {
      id: "res_med",
      name: { en: "Research & Media", kh: "ការស្រាវជ្រាវ និងប្រព័ន្ធផ្សព្វផ្សាយ" },
      description: {
        en: "Official educational syllabus sources, road safety regulations, and typography styles.",
        kh: "ប្រភពកម្មវិធីសិក្សាផ្លូវការ បទប្បញ្ញត្តិសុវត្ថិភាពចរាចរណ៍ និងរចនាប័ទ្មអក្សរ។"
      },
      icon: BookOpen,
      status: "used",
      children: [
        {
          id: "res_gov",
          name: { en: "Cambodian Ministries", kh: "ក្រសួងស្ថាប័នកម្ពុជា" },
          description: {
            en: "Official government portals supplying educational curriculum guidelines and national traffic laws.",
            kh: "គេហទំព័រផ្លូវការរបស់រដ្ឋាភិបាលដែលផ្តល់គោលការណ៍ណែនាំកម្មវិធីសិក្សាអប់រំ និងច្បាប់ចរាចរណ៍ជាតិ។"
          },
          icon: Landmark,
          status: "used",
          children: [
            {
              id: "moeys",
              name: { en: "MoEYS Cambodia", kh: "ក្រសួងអប់រំ យុវជន និងកីឡា" },
              description: {
                en: "Cambodian Ministry of Education, Youth and Sport setting syllabus frameworks.",
                kh: "ក្រសួងអប់រំ យុវជន និងកីឡានៃព្រះរាជាណាចក្រកម្ពុជា កំណត់ក្របខ័ណ្ឌកម្មវិធីសិក្សា។"
              },
              icon: Landmark,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to align game modules with curriculum guidelines for Cambodian schools.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីតម្រឹមម៉ូឌុលហ្គេមជាមួយនឹងគោលការណ៍ណែនាំកម្មវិធីសិក្សាសម្រាប់សាលារៀនកម្ពុជា។"
              }
            },
            {
              id: "mpwt",
              name: { en: "MPWT Cambodia", kh: "ក្រសួងសាធារណការ និងដឹកជញ្ជូន" },
              description: {
                en: "Ministry of Public Works and Transport establishing road traffic laws and signage dimensions.",
                kh: "ក្រសួងសាធារណការ និងដឹកជញ្ជូន បង្កើតច្បាប់ចរាចរណ៍ផ្លូវគោក និងទំហំផ្លាកសញ្ញា។"
              },
              icon: Landmark,
              status: "used",
              usedInKwd: {
                en: "Used in KWD as our primary authority source for road sign designs, definitions, and licensing logic.",
                kh: "ប្រើប្រាស់ក្នុង KWD ជាប្រភពផ្លូវការចម្បងរបស់យើងសម្រាប់ការរចនាផ្លាកសញ្ញា និយមន័យ និងតក្កវិជ្ជានៃការបើកបរ។"
              }
            },
            {
              id: "rgc",
              name: { en: "Royal Govt of Cambodia", kh: "រាជរដ្ឋាភិបាលកម្ពុជា" },
              description: {
                en: "Official central administration establishing national safety acts.",
                kh: "រដ្ឋបាលកណ្តាលផ្លូវការបង្កើតច្បាប់សុវត្ថិភាពជាតិ។"
              },
              icon: Landmark,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to verify legal articles and references in intermediate road test challenges.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីផ្ទៀងផ្ទាត់មាត្រាច្បាប់ និងឯកសារយោងក្នុងការប្រកួតតេស្តផ្លូវកម្រិតមធ្យម។"
              }
            },
            {
              id: "drivingapp",
              name: { en: "Official Theory App", kh: "កម្មវិធីទ្រឹស្តីផ្លូវការ" },
              description: {
                en: "National mobile examination application developed by MPWT Cambodia.",
                kh: "កម្មវិធីប្រឡងចល័តជាតិដែលបង្កើតឡើងដោយក្រសួងសាធារណការ និងដឹកជញ្ជូនកម្ពុជា។"
              },
              icon: SiGoogleplay,
              status: "used",
              usedInKwd: {
                en: "Used in KWD as a standard visual and logic reference for structuring study guides.",
                kh: "ប្រើប្រាស់ក្នុង KWD ជាឯកសារយោងចក្ខុ និងតក្កវិជ្ជាស្តង់ដារសម្រាប់រៀបចំមគ្គុទ្ទេសក៍សិក្សា។"
              }
            },
            {
              id: "motet",
              name: { en: "MOTET Cambodia", kh: "MOTET Cambodia" },
              description: {
                en: "Ministry of Tourism official platform providing tourism regulations and signage conventions.",
                kh: "គេហទំព័រផ្លូវការរបស់ក្រសួងទេសចរណ៍ដែលផ្តល់បទប្បញ្ញត្តិទេសចរណ៍ និងអនុសញ្ញាសញ្ញាសម្គាល់។"
              },
              icon: Globe,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to reference Cambodian road signs in tourist regions.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីយោងផ្លាកសញ្ញាចរាចរណ៍កម្ពុជានៅក្នុងតំបន់ទេសចរណ៍។"
              }
            }
          ]
        },
        {
          id: "res_sources",
          name: { en: "Educational Sources", kh: "ប្រភពអប់រំ និងជំនួយ" },
          description: {
            en: "Search engines and digital networks containing instructional assets.",
            kh: "ម៉ាស៊ីនស្វែងរក និងបណ្តាញឌីជីថលដែលមានធនធានណែនាំ។"
          },
          icon: BookOpen,
          status: "used",
          children: [
            {
              id: "google_search",
              name: { en: "Google Search", kh: "Google Search" },
              description: {
                en: "Universal information retrieval portal used to reference developer documentation.",
                kh: "គេហទំពរក្បាលម៉ាស៊ីនស្វែងរកព័ត៌មានជាសកលដែលប្រើដើម្បីយោងឯកសារអ្នកអភិវឌ្ឍន៍។"
              },
              icon: SiGoogle,
              status: "used",
              usedInKwd: {
                en: "Used in KWD during dev setup to locate library instructions and fix errors.",
                kh: "ប្រើប្រាស់ក្នុង KWD អំឡុងពេលដំឡើង ដើម្បីស្វែងរកការណែនាំអំពីបណ្ណាល័យ និងដោះស្រាយកំហុស។"
              }
            },
            {
              id: "youtube",
              name: { en: "YouTube Education", kh: "YouTube Education" },
              description: {
                en: "Video library hosting road safety animations and driving instruction.",
                kh: "បណ្ណាល័យវីដេអូដែលផ្ទុកគំនូរជីវចលសុវត្ថិភាពចរាចរណ៍ និងការណែនាំអំពីការចរាចរណ៍។"
              },
              icon: SiYoutube,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to embed educational animations in student guidance cards.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីបង្កប់គំនូរជីវចលអប់រំនៅក្នុងកាតណែនាំសិស្ស។"
              }
            },
            {
              id: "kahoot",
              name: { en: "Kahoot", kh: "Kahoot" },
              description: {
                en: "Gamified educational application for quiz design.",
                kh: "កម្មវិធីអប់រំបែបហ្គេមសម្រាប់ការរចនាកម្រងសំណួរ។"
              },
              icon: SiKahoot,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to model scoring systems and reward multipliers.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីបង្កើតប្រព័ន្ធពិន្ទុ និងមេគុណរង្វាន់។"
              }
            },
            {
              id: "unsignage",
              name: { en: "UN Signage Standards", kh: "ស្តង់ដារសញ្ញា UN" },
              description: {
                en: "International conventions regulating universal symbols for danger, warning, and guide signs.",
                kh: "អនុសញ្ញាអន្តរជាតិដែលគ្រប់គ្រងនិមិត្តសញ្ញាសកលសម្រាប់សញ្ញាគ្រោះថ្នាក់ ព្រមាន និងណែនាំ។"
              },
              icon: Globe,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to review international standards, keeping our signs accessible to all cultures.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីពិនិត្យមើលស្តង់ដារអន្តរជាតិ រក្សាផ្លាកសញ្ញារបស់យើងឱ្យអាចចូលប្រើបានសម្រាប់គ្រប់វប្បធម៌។"
              }
            }
          ]
        },
        {
          id: "res_media",
          name: { en: "Media & Fonts", kh: "ធនធានរូបភាព និងហ្វុនត៍" },
          description: {
            en: "Digital assets, font systems, and illustration servers styling KWD's responsive front-end.",
            kh: "ធនធានឌីជីថល ប្រព័ន្ធហ្វុនត៍ និងម៉ាស៊ីនបម្រើរូបភាពដែលរចនាម៉ូដផ្នែកខាងមុខរបស់ KWD។"
          },
          icon: Layers,
          status: "used",
          children: [
            {
              id: "cloudinary_assets",
              name: { en: "Cloudinary", kh: "Cloudinary" },
              description: {
                en: "Dynamic cloud server hosting school badges, rank frames, and heavy images.",
                kh: "ម៉ាស៊ីនបម្រើពពកបែបឌីណាមិកដែលផ្ទុកផ្លាកសញ្ញាសាលា ស៊ុមចំណាត់ថ្នាក់ និងរូបភាពធំៗ។"
              },
              icon: SiCloudinary,
              status: "used",
              usedInKwd: {
                en: "Used in KWD to host high-quality road safety diagrams, optimizing loading speed.",
                kh: "ប្រើប្រាស់ក្នុង KWD ដើម្បីផ្ទុករូបភាពសុវត្ថិភាពចរាចរណ៍ដែលមានគុណភាពខ្ពស់ ជួយបង្កើនល្បឿនផ្ទុក។"
              }
            },
            {
              id: "roboto",
              name: { en: "Roboto Font", kh: "Roboto Font" },
              description: {
                en: "Modern clean typeface optimized for numbers and English UI text labels.",
                kh: "ហ្វុនត៍ស្អាតទំនើបដែលត្រូវបានបង្កើនប្រសិទ្ធភាពសម្រាប់លេខ និងស្លាកអត្ថបទ UI ភាសាអង់គ្លេស។"
              },
              icon: Type,
              status: "used",
              usedInKwd: {
                en: "Used in KWD via globals.css for technical chips, scoring panels, and English paragraphs.",
                kh: "ប្រើប្រាស់ក្នុង KWD តាមរយៈ globals.css សម្រាប់បន្ទះពិន្ទុ និងកថាខណ្ឌភាសាអង់គ្លេស។"
              }
            },
            {
              id: "sans_khmer",
              name: { en: "Google Sans Khmer", kh: "Google Sans Khmer" },
              description: {
                en: "Official typeface for Khmer subtitles, learning text, and local button labels.",
                kh: "ហ្វុនត៍ផ្លូវការសម្រាប់អក្សររត់ក្រោមជាភាសាខ្មែរ អត្ថបទសិក្សា និងស្លាកប៊ូតុងក្នុងស្រុក។"
              },
              icon: Type,
              status: "used",
              usedInKwd: {
                en: "Used in KWD as our primary Khmer script, preventing font layout shifting.",
                kh: "ប្រើប្រាស់ក្នុង KWD ជាអក្សរខ្មែរចម្បងរបស់យើង ការពារការផ្លាស់ប្តូរប្លង់ហ្វុនត៍។"
              }
            },
            {
              id: "illustrations",
              name: { en: "Reward Illustrations", kh: "រូបភាពរង្វាន់ និងរូបតំណាង" },
              description: {
                en: "Avatar illustrations and road-safety badge assets displayed inside dashboard profiles.",
                kh: "រូបភាពគំនូររូបតំណាង និងធនធានផ្លាកសញ្ញាសុវត្ថិភាពចរាចរណ៍ដែលបង្ហាញក្នុងទម្រង់ផ្ទាល់ខ្លួន។"
              },
              icon: PenTool,
              status: "used",
              usedInKwd: {
                en: "Used in KWD student store to award badges when safety levels are unlocked.",
                kh: "ប្រើប្រាស់ក្នុងហាង KWD សិស្ស ដើម្បីផ្តល់ផ្លាកសញ្ញានៅពេលកម្រិតសុវត្ថិភាពត្រូវបានដោះសោ។"
              }
            }
          ]
        }
      ]
    }
  ]
};

const REFERENCES = [
  {
    name: "Cambodia Road Traffic Signs (2007)",
    icon: BookOpen,
    note: { en: "Official source document for road sign definitions and categories", kh: "ឯកសារប្រភពផ្លូវការសម្រាប់និយមន័យ និងប្រភេទសញ្ញាចរាចរណ៍" }
  },
  {
    name: "Cambodian Traffic Law (English)",
    icon: BookOpen,
    note: { en: "English translation of the national road traffic law", kh: "ការបកប្រែជាភាសាអង់គ្លេសនៃច្បាប់ចរាចរណ៍ផ្លូវគោកជាតិ" }
  },
  {
    name: "Traffic Rules & Road Markings",
    icon: BookOpen,
    note: { en: "Reference for road rules and road-marking standards", kh: "ឯកសារយោងសម្រាប់ច្បាប់ផ្លូវ និងស្តង់ដារសញ្ញាសម្គាល់ផ្លូវ" }
  },
  {
    name: "Driving Theory Q&A Sheets",
    icon: BookOpen,
    note: { en: "Question-and-answer source sheets for driving theory content", kh: "សន្លឹកសំណួរ-ចម្លើយជាប្រភពសម្រាប់មាតិកាទ្រឹស្ដីបើកបរ" }
  },
  {
    name: "MoEYS Open Educational Resources (OER)",
    icon: Building2,
    url: "https://oer.moeys.gov.kh/",
    note: { en: "Free textbooks & open educational resources, Ministry of Education, Youth and Sport", kh: "សៀវភៅសិក្សាឥតគិតថ្លៃ និងធនធានអប់រំបើកចំហ ក្រសួងអប់រំ យុវជន និងកីឡា" }
  },
  {
    name: "MoEYS Curriculum Development Portal (CDP)",
    icon: Building2,
    url: "https://cdp.moeys.gov.kh",
    note: { en: "Official curriculum development portal, Ministry of Education, Youth and Sport", kh: "គេហទំព័រអភិវឌ្ឍន៍កម្មវិធីសិក្សាផ្លូវការ ក្រសួងអប់រំ យុវជន និងកីឡា" }
  },
  {
    name: "MPWT — Ministry of Public Works and Transport",
    icon: Building2,
    url: "https://www.mpwt.gov.kh",
    note: { en: "Official portal (news: news.mpwt.gov.kh) for road traffic regulations & guidelines", kh: "គេហទំព័រផ្លូវការ (ព័ត៌មាន៖ news.mpwt.gov.kh) សម្រាប់បទប្បញ្ញត្តិ និងគោលការណ៍ណែនាំចរាចរណ៍ផ្លូវ" }
  },
  {
    name: "Ministry of Education, Youth and Sport (MoEYS), Cambodia",
    icon: Building2,
    url: "https://cdp.moeys.gov.kh",
    note: { en: "Official Cambodia Education Portal & educational curriculum guidelines", kh: "គេហទំព័រអប់រំកម្ពុជា និងគោលការណ៍ណែនាំកម្មវិធីសិក្សាអប់រំផ្លូវការ" }
  },
  {
    name: "Cambodia Road Traffic Law & Signage Handbook",
    icon: BookOpen,
    url: "https://www.mpwt.gov.kh",
    note: { en: "Official road signs handbook, Ministry of Public Works and Transport", kh: "សៀវភៅណែនាំសញ្ញាចរាចរណ៍ផ្លូវការ ក្រសួងសាធារណការ និងដឹកជញ្ជូន" }
  },
  {
    name: "Ministry of Public Works and Transport (MPWT), Cambodia",
    icon: Building2,
    url: "https://www.mpwt.gov.kh",
    note: { en: "Official laws, infrastructure guidelines & road safety regulations", kh: "ច្បាប់ផ្លូវការ គោលការណ៍ណែនាំហេដ្ឋារចនាសម្ព័ន្ធ និងបទប្បញ្ញត្តិសុវត្ថិភាពផ្លូវគោក" }
  },
  {
    name: "Official Cambodian Driving Theory Examination App",
    icon: SiGoogleplay,
    url: "https://play.google.com/store/apps/details?id=kh.gov.mpwt.drivingtheorytest",
    note: { en: "Mobile App by Ministry of Public Works and Transport for driver education", kh: "កម្មវិធីទូរស័ព្ទប្រឡងទ្រឹស្ដីបើកបរសម្រាប់ការអប់រំអ្នកបើកបរដោយក្រសួងសាធារណការ និងដឹកជញ្ជូន" }
  },
  {
    name: "Technovation Girls — Curriculum, Safety Standards & Mentorship",
    icon: Globe,
    url: "https://technovationchallenge.org",
    note: { en: "Global tech program curriculum, safety standards, and global mentorship framework", kh: "កម្មវិធីសិក្សាបច្ចេកវិទ្យាសកល ស្តង់ដារសុវត្ថិភាព និងក្របខ័ណ្ឌណែនាំសកល" }
  },
  {
    name: "United Nations — Sustainable Development Goals (SDG 4 & SDG 11)",
    icon: Globe,
    url: "https://sdgs.un.org/goals",
    note: { en: "Global framework for Quality Education (SDG 4) and Sustainable Cities and Communities (SDG 11)", kh: "ក្របខ័ណ្ឌសកលសម្រាប់ការអប់រំមានគុណភាព (SDG 4) និងទីក្រុង និងសហគមន៍ប្រកបដោយចីរភាព (SDG 11)" }
  },
  {
    name: "Kesararam Primary School Community",
    icon: Building2,
    note: { en: "Siem Reap, Cambodia — implementation site, user feedback, and testing community", kh: "សាលាបឋមសិក្សាកេសរារាម ខេត្តសៀមរាប — ទីតាំងអនុវត្តផ្ទាល់ មតិកែលម្អ និងសហគមន៍ធ្វើតេស្ត" }
  },
  {
    name: "Mentors & Coaches (Team #50777)",
    icon: Globe,
    note: { en: "Technical advisors and mentors providing codebase feedback & program guidance", kh: "ទីប្រឹក្សាបច្ទេកទេស និងគ្រូណែនាំដែលផ្តល់មតិកែលម្អលើកូដ និងការណែនាំកម្មវិធីសិក្សា" }
  },
  {
    name: "KWD Privacy Policy (PDF Document)",
    icon: BookOpen,
    url: "/report-kwd/គោលការណ៍ភាពឯកជន_KWD.pdf",
    note: { en: "Official Privacy Policy document for KWD (Khmer)", kh: "ឯកសារគោលការណ៍ភាពឯកជនផ្លូវការសម្រាប់ KWD (ភាសាខ្មែរ)" }
  },
  {
    name: "KWD Terms of Use (PDF Document)",
    icon: BookOpen,
    url: "/report-kwd/លក្ខខណ្ឌប្រើប្រាស់_KWD.pdf",
    note: { en: "Official Terms of Service document for KWD (Khmer)", kh: "ឯកសារលក្ខខណ្ឌប្រើប្រាស់ផ្លូវការសម្រាប់ KWD (ភាសាខ្មែរ)" }
  },
  {
    name: "KWD Brand Guidelines (PDF Document)",
    icon: BookOpen,
    url: "/report-kwd/អំពីពួកយើង_Brand_KWD.pdf",
    note: { en: "Official brand visual identity & logo guidelines for KWD (Khmer)", kh: "ឯកសារគោលការណ៍ណែនាំអត្តសញ្ញាណម៉ាក KWD (ភាសាខ្មែរ)" }
  },
  {
    name: "KWD Digital Road Safety Education System Report (PDF Document)",
    icon: BookOpen,
    url: "/report-kwd/ប្រព័ន្ធអប់រំសុវត្ថិភាពចរាចរណ៍ឌីជីថល_KWD-SYS-RPT-2026.pdf",
    note: { en: "Official system architecture, implementation details & SDG alignment report (Khmer)", kh: "របាយការណ៍ផ្លូវការស្តីពីស្ថាបត្យកម្មប្រព័ន្ធ ការអនុវត្ត និងគោលដៅ SDG (ភាសាខ្មែរ)" }
  },
];

export function BuiltWithClient() {
  const { lang } = useLang();
  const kh = lang === "kh";
  const kf = kh ? { fontFamily: "var(--font-system)" } : {};
  const t = (en: string, k: string) => (kh ? k : en);

  // Layout View: "tree" or "list"
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");

  // Interaction State for Tree View
  const [scale, setScale] = useState(0.85);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set(["root"]));
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(["root"]));
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeDetail, setActiveDetail] = useState<TechNode | null>(null);

  // Fullscreen State
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const [isDiagramFullscreen, setIsDiagramFullscreen] = useState(false);

  const toggleDiagramFullscreen = () => {
    const el = workspaceRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsDiagramFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Click & Drag Panning State
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Timer reference for cleanup
  const timersRef = useRef<number[]>([]);

  // Slow Cascading Drop-down Animation Trigger
  const triggerCascadeAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    // Clear any active timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Reset tree states
    setRevealedIds(new Set(["root"]));
    setExpandedIds(new Set(["root"]));

    // Stage 1: Reveal Level 1 (Back End, Front End, AI, Research) after 700ms
    const t1 = window.setTimeout(() => {
      setRevealedIds((prev) => {
        const next = new Set(prev);
        TECH_TREE.children?.forEach((child) => {
          next.add(child.id);
        });
        return next;
      });
      setExpandedIds((prev) => {
        const next = new Set(prev);
        TECH_TREE.children?.forEach((child) => {
          next.add(child.id);
        });
        return next;
      });
    }, 700);

    // Stage 2: Reveal Level 2 (Sub-branches) after 1400ms
    const t2 = window.setTimeout(() => {
      setRevealedIds((prev) => {
        const next = new Set(prev);
        TECH_TREE.children?.forEach((child) => {
          child.children?.forEach((sub) => {
            next.add(sub.id);
          });
        });
        return next;
      });
      setExpandedIds((prev) => {
        const next = new Set(prev);
        TECH_TREE.children?.forEach((child) => {
          child.children?.forEach((sub) => {
            next.add(sub.id);
          });
        });
        return next;
      });
    }, 1400);

    // Stage 3: Reveal Level 3 (Leaves) after 2100ms
    const t3 = window.setTimeout(() => {
      setRevealedIds((prev) => {
        const next = new Set(prev);
        TECH_TREE.children?.forEach((child) => {
          child.children?.forEach((sub) => {
            sub.children?.forEach((leaf) => {
              next.add(leaf.id);
            });
          });
        });
        setIsAnimating(false);
        return next;
      });
    }, 2100);

    timersRef.current = [t1, t2, t3];
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Expand all nodes automatically on first view mode load
  useEffect(() => {
    if (viewMode === "tree" && revealedIds.size === 1) {
      // Prompt user or start default
    }
  }, [viewMode]);

  // Click & Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setStartY(e.pageY - scrollContainerRef.current.offsetTop);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setScrollTop(scrollContainerRef.current.scrollTop);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const y = e.pageY - scrollContainerRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walkX;
    scrollContainerRef.current.scrollTop = scrollTop - walkY;
  };

  // Dedicated expand toggle
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Recursive Tree Node Renderer
  const renderTreeNode = (node: TechNode) => {
    const isRevealed = revealedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id) && hasChildren;

    if (!isRevealed) return null;

    const IconComponent = node.icon;

    return (
      <div className="flex flex-col items-center select-none" key={node.id}>
        {/* Node Card wrapper */}
        <div className="relative flex flex-col items-center">
          {/* Card Button */}
          <button
            onClick={() => setActiveDetail(node)}
            className={`group relative z-10 flex flex-col items-center p-3 w-36 bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-100 rounded-none shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_#fff] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#000] dark:hover:shadow-[4px_4px_0_#fff] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_#000] transition-all duration-200 cursor-pointer ${
              node.status === "used"
                ? "bg-yellow-50/50 dark:bg-zinc-900"
                : "opacity-60 grayscale hover:grayscale-0 hover:opacity-90"
            }`}
          >
            {/* Semantic status indicator bar on left/top */}
            {node.status === "used" && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-yellow-500" />
            )}

            {/* Icon representation */}
            <div className="w-10 h-10 flex items-center justify-center mb-1 text-zinc-900 dark:text-zinc-100">
              {IconComponent ? (
                <IconComponent size={26} className="transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <Layers size={26} className="transition-transform duration-300 group-hover:scale-110" />
              )}
            </div>

            {/* Label name */}
            <span className="text-[10px] font-black uppercase tracking-wider text-center line-clamp-1 leading-tight w-full font-mono">
              {t(node.name.en, node.name.kh)}
            </span>
          </button>

          {/* Floating Branch Toggle Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-6 h-6 rounded-none bg-yellow-400 text-black border-2 border-black text-[14px] font-black hover:scale-105 active:scale-95 transition-transform shadow-[1px_1px_0_#000]"
            >
              {isExpanded ? "−" : "+"}
            </button>
          )}
        </div>

        {/* Connections and Child Rows */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col items-center w-full mt-3 animate-fade-in">
            {/* Vertical connector from parent to horizontal splitter bar */}
            <div className="w-[2.5px] h-6 bg-black dark:bg-zinc-300" />

            {/* Row of children connected by horizontal line */}
            <div className="flex gap-x-6 relative pt-6">
              {node.children?.map((child, index) => {
                const isFirst = index === 0;
                const isLast = index === (node.children?.length ?? 0) - 1;
                const isOnly = (node.children?.length ?? 0) === 1;

                return (
                  <div key={child.id} className="relative flex flex-col items-center">
                    {/* Horizontal Connector bar segments */}
                    {!isOnly && (
                      <div
                        className="absolute top-0 h-[2.5px] bg-black dark:bg-zinc-300"
                        style={{
                          left: isFirst ? "50%" : "0",
                          right: isLast ? "50%" : "0",
                        }}
                      />
                    )}

                    {/* Vertical Connector bar segment down to child */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2.5px] h-6 bg-black dark:bg-zinc-300" />

                    {/* Recursive render */}
                    {renderTreeNode(child)}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Recursive List View Renderer for Mobile / Accessibility
  const renderListNodes = (node: TechNode, depth = 0) => {
    const IconComponent = node.icon;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);

    return (
      <div
        key={node.id}
        className="border-l border-zinc-200 dark:border-zinc-800 ml-4 pl-4 my-2 transition-all"
        style={{ marginLeft: depth > 0 ? `${depth * 8}px` : "0px" }}
      >
        <div className="flex items-center justify-between gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-[2px_2px_0_#000] dark:shadow-[2px_2px_0_rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-950 dark:text-zinc-50">
              {IconComponent ? <IconComponent size={18} /> : <Layers size={18} />}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold uppercase tracking-wider">
                {t(node.name.en, node.name.kh)}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 max-w-xs md:max-w-md line-clamp-1">
                {t(node.description.en, node.description.kh)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {node.status === "used" ? (
              <span className="text-[9px] font-black bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 uppercase">
                {t("Used", "ប្រើប្រាស់")}
              </span>
            ) : (
              <span className="text-[9px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 uppercase">
                {t("General", "ចំណេះដឹង")}
              </span>
            )}

            <button
              onClick={() => setActiveDetail(node)}
              className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
              title={t("View Details", "មើលព័ត៌មានលម្អិត")}
            >
              <Info size={16} />
            </button>

            {hasChildren && (
              <button
                onClick={() => toggleExpand(node.id)}
                className="p-1 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <ChevronRight
                  size={16}
                  className={`transform transition-transform ${isExpanded ? "rotate-95" : ""}`}
                />
              </button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 transition-all pl-2">
            {node.children?.map((child) => renderListNodes(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-16" style={kf}>
      {/* Header Banner */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-2 font-mono text-xs font-black uppercase text-yellow-600 dark:text-yellow-400 tracking-wider">
            <span className="w-2.5 h-2.5 bg-yellow-500 animate-pulse inline-block" />
            {t("Interactive Bibliography", "ឯកសារយោង និងប្រព័ន្ធបច្ចេកវិទ្យា")}
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight leading-none text-zinc-950 dark:text-white">
            {t("Built With KWD", "គ្រឿងផ្គុំបច្ចេកវិទ្យា KWD")}
          </h1>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {t(
              "Explore KWD's technology tree ecosystem. Hover or click on the nodes to see full technical descriptions, references, and how we apply them to build this platform.",
              "ស្វែងយល់ពីប្រព័ន្ធមែកធាងបច្ចេកវិទ្យារបស់ KWD។ ចុចលើប្រអប់ដើម្បីមើលការពិពណ៌នាបច្ចេកទេស និងរបៀបដែលយើងប្រើប្រាស់វាដើម្បីបង្កើតគេហទំព័រនេះ។"
            )}
          </p>
        </div>
      </header>

      {/* Main Interactive Controls & Workspace */}
      <div
        ref={workspaceRef}
        className={isDiagramFullscreen
          ? "w-screen h-screen overflow-auto bg-white dark:bg-zinc-950 p-4 sm:p-6"
          : "max-w-5xl mx-auto px-6 mt-6"}
      >
        
        {/* Toggle Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-2 border-black dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_rgba(255,255,255,0.05)] mb-8">
          
          {/* Left Controls: View Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase rounded-none border-2 border-black transition-all cursor-pointer ${
                viewMode === "tree"
                  ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000]"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 shadow-none hover:bg-zinc-50 dark:hover:bg-zinc-850"
              }`}
            >
              <Network size={14} />
              {t("Tree View", "ប្លង់មែកធាង")}
            </button>
            <button
              onClick={() => {
                setViewMode("list");
                // Expand root to make visible
                setExpandedIds(new Set(["root", "backend", "frontend", "ai_dev", "res_med"]));
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase rounded-none border-2 border-black transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-yellow-400 text-black shadow-[2px_2px_0_#000]"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 shadow-none hover:bg-zinc-50 dark:hover:bg-zinc-850"
              }`}
            >
              <LayoutGrid size={14} />
              {t("List View", "ប្លង់បញ្ជី")}
            </button>
          </div>

          {/* Right Controls: Zoom & Cascade (only for tree mode) */}
          {viewMode === "tree" && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Drop Cascade Trigger */}
              <button
                onClick={triggerCascadeAnimation}
                disabled={isAnimating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase rounded-none border-2 border-black bg-black text-white hover:bg-yellow-500 hover:text-black transition-all disabled:opacity-50 cursor-pointer shadow-[2px_2px_0_rgba(255,255,255,0.15)]"
              >
                <Zap size={13} className={isAnimating ? "animate-bounce text-yellow-400" : ""} />
                {isAnimating ? t("Revealing...", "កំពុងបង្ហាញ...") : t("Drop Down Cascade", "ចលនាទម្លាក់ចុះ")}
              </button>

              <div className="h-6 w-[1.5px] bg-zinc-200 dark:bg-zinc-700 hidden md:block" />

              {/* Zoom Buttons */}
              <button
                onClick={() => setScale(Math.min(1.2, scale + 0.1))}
                className="p-1.5 border-2 border-black bg-white dark:bg-zinc-800 text-black dark:text-white rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                title={t("Zoom In", "ពង្រីក")}
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={() => setScale(Math.max(0.4, scale - 0.1))}
                className="p-1.5 border-2 border-black bg-white dark:bg-zinc-800 text-black dark:text-white rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                title={t("Zoom Out", "បង្រួញ")}
              >
                <ZoomOut size={14} />
              </button>
              <button
                onClick={() => setScale(0.85)}
                className="p-1.5 border-2 border-black bg-white dark:bg-zinc-800 text-black dark:text-white rounded-none hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                title={t("Reset Zoom", "កំណត់ដើម")}
              >
                <RotateCcw size={14} />
              </button>

              <div className="h-6 w-[1.5px] bg-zinc-200 dark:bg-zinc-700 hidden md:block" />

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleDiagramFullscreen}
                className="p-1.5 border-2 border-black bg-white dark:bg-zinc-800 text-black dark:text-white rounded-none hover:bg-yellow-400 dark:hover:bg-yellow-500 cursor-pointer"
                title={isDiagramFullscreen ? t("Exit Fullscreen", "ចេញពីពេញអេក្រង់") : t("Fullscreen", "ពេញអេក្រង់")}
              >
                {isDiagramFullscreen ? <Shrink size={14} /> : <Expand size={14} />}
              </button>
            </div>
          )}
        </div>

        {/* View Layout Area */}
        {viewMode === "tree" ? (
          <div className="relative border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_rgba(255,255,255,0.05)] bg-zinc-50 dark:bg-zinc-950">
            {/* Scroll/Pan Hint Banner */}
            <div className="bg-yellow-400 text-black text-center text-xs font-black uppercase py-2 px-4 border-b border-black select-none">
              💡 {t("Swipe or drag to pan · Click nodes to view information details", "អូសដើម្បីរុករក · ចុចលើប្រអប់ដើម្បីមើលព័ត៌មានលម្អិត")}
            </div>

            {/* Collapsed initial state hint overlay */}
            {revealedIds.size === 1 && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs text-white p-6 text-center select-none">
                <div className="max-w-sm flex flex-col items-center">
                  <div className="w-16 h-16 rounded-none bg-yellow-400 text-black border-2 border-black flex items-center justify-center mb-4 animate-bounce">
                    <Zap size={32} />
                  </div>
                  <h3 className="text-lg font-black uppercase mb-1">{t("Tap to Drop Down", "ចុចដើម្បីទម្លាក់ចុះ")}</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                    {t(
                      "Reveal the full technology branches stage-by-stage with a slow dropping animation.",
                      "បង្ហាញបណ្តាញមែកធាងបច្ចេកវិទ្យាទាំងស្រុងជាជំហានៗ ជាមួយនឹងចលនាទម្លាក់ចុះយ៉ាងរលូន។"
                    )}
                  </p>
                  <button
                    onClick={triggerCascadeAnimation}
                    className="px-6 py-2.5 bg-yellow-400 text-black border-2 border-black font-black uppercase text-xs shadow-[3px_3px_0_#fff] active:translate-x-0 active:translate-y-0 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_#fff] transition-all cursor-pointer"
                  >
                    {t("Start Drop Cascade", "ចាប់ផ្តើមទម្លាក់ចុះ")}
                  </button>
                </div>
              </div>
            )}

            {/* Tree Panning Area */}
            <div
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`w-full overflow-auto py-16 px-8 dot-bg no-scrollbar ${
                isDiagramFullscreen ? "max-h-[calc(100vh-180px)]" : "max-h-[640px]"
              } ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              {/* Zoom Origin Wrapper */}
              <div
                className="transition-transform duration-300 origin-top flex justify-center pb-24"
                style={{
                  transform: `scale(${scale})`,
                  minWidth: "2200px", // Ensures space for wide leaves
                }}
              >
                {renderTreeNode(TECH_TREE)}
              </div>
            </div>
          </div>
        ) : (
          /* Accessibility/List View Mode */
          <div className="border-2 border-black dark:border-zinc-800 p-6 bg-white dark:bg-zinc-950 shadow-[4px_4px_0_#000] dark:shadow-[4px_4px_0_rgba(255,255,255,0.05)]">
            <h3 className="text-base font-black uppercase border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-4">
              {t("Technology Hierarchy Directory", "បញ្ជីរាយនាមតាមលំដាប់ថ្នាក់បច្ចេកវិទ្យា")}
            </h3>
            <div className="pl-0">{renderListNodes(TECH_TREE)}</div>
          </div>
        )}
      </div>

      {/* Bibliography References Section at Bottom */}
      <div className="max-w-5xl mx-auto px-6 mt-16">
        <h2 className="text-xl font-black uppercase tracking-tight border-b-2 border-black dark:border-zinc-800 pb-3 mb-6 flex items-center gap-2">
          <BookOpen size={20} className="text-yellow-600 dark:text-yellow-400" />
          {t("Syllabus & Official Bibliography", "កម្មវិធីសិក្សា និងឯកសារយោងផ្លូវការ")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REFERENCES.map((ref, i) => {
            const Icon = ref.icon;
            const isPdf = ref.url?.endsWith(".pdf");
            return (
              <div
                key={i}
                className={`flex flex-col justify-between p-4 border-2 border-black dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-[3px_3px_0_#000] dark:shadow-[3px_3px_0_rgba(255,255,255,0.05)] transition-all ${
                  isPdf ? "bg-yellow-50/20 dark:bg-zinc-900/50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 shrink-0 text-zinc-500">
                    {Icon ? <Icon size={18} /> : <BookOpen size={18} />}
                  </span>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-black tracking-tight leading-tight">
                      {ref.name}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {t(ref.note.en, ref.note.kh)}
                    </span>
                  </div>
                </div>

                {ref.url && (
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[200px]">
                      {ref.url}
                    </span>
                    {isPdf ? (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400 text-black border-2 border-black font-black text-[10px] uppercase shadow-[1.5px_1.5px_0_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[2px_2px_0_#000] transition-all cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        {t("PDF", "ទាញយក")}
                      </a>
                    ) : (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500 hover:text-black dark:hover:text-white"
                      >
                        {t("Visit", "ចូលមើល")}
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 mt-24">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 dark:text-zinc-500">
          <span>© {new Date().getFullYear()} Kesararam With Digital · kesararamwithdigital.tech</span>
          <div className="flex gap-4">
            <Link href="/brand" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">{t("Brand Guidelines", "គោលការណ៍ម៉ាក")}</Link>
            <Link href="/terms" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">{t("Terms", "លក្ខខណ្ឌ")}</Link>
            <Link href="/privacy" className="hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">{t("Privacy", "ឯកជនភាព")}</Link>
          </div>
        </div>
      </footer>

      {/* Detail Modal Dialog */}
      {activeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border-3 border-black dark:border-zinc-100 shadow-[6px_6px_0_#000] dark:shadow-[6px_6px_0_rgba(255,255,255,0.15)] overflow-hidden">
            
            {/* Caution Stripes Header */}
            <div className="caution-tape h-8" />

            {/* Modal Body */}
            <div className="p-6">
              {/* Header Title with logo icon */}
              <div className="flex items-center gap-4 mb-4">
                <span className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 border-2 border-black dark:border-zinc-100 text-zinc-950 dark:text-zinc-50">
                  {activeDetail.icon ? (
                    <activeDetail.icon size={26} />
                  ) : (
                    <Layers size={26} />
                  )}
                </span>
                <div className="flex flex-col">
                  <h3 className="text-xl font-black uppercase leading-tight tracking-tight">
                    {t(activeDetail.name.en, activeDetail.name.kh)}
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    {activeDetail.id.startsWith("be") ? "Back End" : "Front End"}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                {activeDetail.status === "used" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {t("Used in KWD", "ប្រើប្រាស់ក្នុង KWD")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-850 px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {t("Standard Industry Stack", "បច្ចេកវិទ្យាទូទៅក្នុងវិស័យ")}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="space-y-4 text-sm leading-relaxed">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-1">
                    {t("What is it?", "តើវាជាអ្វី?")}
                  </h4>
                  <p className="text-zinc-700 dark:text-zinc-300">
                    {t(activeDetail.description.en, activeDetail.description.kh)}
                  </p>
                </div>

                {/* Used in KWD Detail */}
                {activeDetail.usedInKwd ? (
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800">
                    <h4 className="text-xs font-black uppercase tracking-wider text-yellow-600 dark:text-yellow-400 mb-1">
                      {t("KWD Integration", "ការប្រើប្រាស់ក្នុង KWD")}
                    </h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                      {t(activeDetail.usedInKwd.en, activeDetail.usedInKwd.kh)}
                    </p>
                  </div>
                ) : (
                  activeDetail.status === "used" && (
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800">
                      <h4 className="text-xs font-black uppercase tracking-wider text-yellow-600 dark:text-yellow-400 mb-1">
                        {t("KWD Integration", "ការប្រើប្រាស់ក្នុង KWD")}
                      </h4>
                      <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                        {t(
                          "Integrated as a core component of our responsive educational platform, driving student interactions, profile security, and quiz scoring.",
                          "រួមបញ្ចូលជាសមាសភាគស្នូលនៃប្រព័ន្ធអប់រំឆ្លើយតបរបស់យើង គាំទ្រដល់អន្តរកម្មសិស្ស សុវត្ថិភាពប្រវត្តិរូប និងការដាក់ពិន្ទុកម្រងសំណួរ។"
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setActiveDetail(null)}
                  className="px-4 py-2 bg-black text-white hover:bg-yellow-400 hover:text-black border-2 border-black font-black uppercase text-xs shadow-[2px_2px_0_#000] active:translate-x-0 active:translate-y-0 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_#000] transition-all cursor-pointer"
                >
                  {t("Close", "បិទ")}
                </button>
              </div>
            </div>

            {/* Circular Close Button on Top Right */}
            <button
              onClick={() => setActiveDetail(null)}
              className="absolute top-2 right-2 w-7 h-7 bg-white text-black border-2 border-black flex items-center justify-center hover:bg-yellow-400 transition-colors z-20 cursor-pointer"
              title={t("Close", "បិទ")}
            >
              <X size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
