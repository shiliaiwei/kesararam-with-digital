import Link from "next/link";
import { BookOpen, Brain, FileText, Image as ImageIcon } from "lucide-react";

const CATEGORIES = [
  {
    id: 1,
    slug: "road-sign",
    nameEn: "Traffic Signs",
    nameKm: "សញ្ញាចរាចរណ៍",
    description: "Learn all official road signs",
    color: "bg-amber-400",
    icon: "🚦",
  },
  {
    id: 2,
    slug: "road-traffic",
    nameEn: "Road Traffic Law",
    nameKm: "ច្បាប់ចរាចរណ៍ផ្លូវ",
    description: "Legal framework for road use",
    color: "bg-blue-400",
    icon: "⚖️",
  },
  {
    id: 3,
    slug: "priority",
    nameEn: "Right of Way",
    nameKm: "សិទ្ធិអាទិភាព",
    description: "Priority rules and intersections",
    color: "bg-red-400",
    icon: "🔀",
  },
  {
    id: 4,
    slug: "driving",
    nameEn: "Driving Skills",
    nameKm: "ជំនាញបើកបរ",
    description: "Practical driving techniques",
    color: "bg-green-400",
    icon: "🚗",
  },
  {
    id: 5,
    slug: "technical",
    nameEn: "Vehicle Technology",
    nameKm: "បច្ចេកវិទ្យាយានយន្ត",
    description: "Vehicle mechanics and safety",
    color: "bg-orange-400",
    icon: "🔧",
  },
  {
    id: 6,
    slug: "loading-people-goods",
    nameEn: "Loading People & Goods",
    nameKm: "ផ្ទុកមនុស្ស និងទំនិញ",
    description: "Transport regulations",
    color: "bg-cyan-400",
    icon: "📦",
  },
  {
    id: 7,
    slug: "general-knowledge",
    nameEn: "General Knowledge",
    nameKm: "ចំណេះដឹងទូទៅ",
    description: "Essential road safety topics",
    color: "bg-purple-400",
    icon: "📚",
  },
  {
    id: 8,
    slug: "emergency",
    nameEn: "Emergency",
    nameKm: "ពេលអាសន្ន",
    description: "Emergency procedures",
    color: "bg-pink-400",
    icon: "🚨",
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="bg-black text-white border-b-4 border-black"
        style={{ boxShadow: "0 4px 0 #000" }}
      >
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-4">LEARN</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Master Cambodia's driving theory across 8 comprehensive knowledge
            categories
          </p>
        </div>
      </div>

      {/* Mode Shortcuts */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div
          className="bg-white border-2 border-black p-6"
          style={{ boxShadow: "4px 4px 0 #000" }}
        >
          <h2 className="font-black text-lg mb-4">QUICK START</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-blue-400 border-2 border-black px-6 py-4 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2">
              <BookOpen size={20} />
              Flashcards
            </button>
            <button className="bg-green-400 border-2 border-black px-6 py-4 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2">
              <Brain size={20} />
              Quizzes
            </button>
            <button className="bg-purple-400 border-2 border-black px-6 py-4 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2">
              <FileText size={20} />
              Practice Test
            </button>
            <button className="bg-orange-400 border-2 border-black px-6 py-4 font-black hover:shadow-[4px_4px_0_#000] transition-all inline-flex items-center justify-center gap-2">
              <ImageIcon size={20} />
              Infographic
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-black mb-2">EIGHT CATEGORIES</h2>
          <p className="text-zinc-600">
            Choose a category to start learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/learn/${category.slug}`}
              className={`${category.color} border-2 border-black p-6 hover:shadow-[8px_8px_0_#000] transition-all group`}
            >
              <div className="text-6xl mb-4">{category.icon}</div>
              <h3 className="text-2xl font-black mb-1">{category.nameEn}</h3>
              <h4 className="text-lg font-bold mb-3 text-zinc-800">
                {category.nameKm}
              </h4>
              <p className="text-sm font-medium text-zinc-700 mb-4">
                {category.description}
              </p>
              <div className="bg-black text-white px-4 py-2 font-bold inline-block group-hover:shadow-[4px_4px_0_rgba(0,0,0,0.3)] transition-all">
                Study now →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
