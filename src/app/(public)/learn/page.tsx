"use client";

import Link from "next/link";
import { BookOpen, Brain, FileText, Image as ImageIcon } from "lucide-react";
import {
  FaExclamationTriangle,
  FaBalanceScale,
  FaTrafficLight,
  FaCar,
  FaWrench,
  FaTruck,
  FaBook,
  FaFirstAid,
} from "react-icons/fa";
import { CATEGORY_COLORS, CATEGORY_SHADOW } from "@/lib/utils";

const CATEGORIES = [
  {
    id: 1,
    slug: "road-sign",
    nameEn: "Traffic Signs",
    nameKm: "សញ្ញាចរាចរណ៍",
    description: "Learn all official road signs",
    descEn: "Identify and understand all official road signs used in Cambodia.",
    Icon: FaExclamationTriangle,
  },
  {
    id: 2,
    slug: "road-traffic",
    nameEn: "Road Traffic Law",
    nameKm: "ច្បាប់ចរាចរណ៍ផ្លូវ",
    description: "Legal framework for road use",
    descEn: "Study the legal framework governing road use and user responsibilities.",
    Icon: FaBalanceScale,
  },
  {
    id: 3,
    slug: "priority",
    nameEn: "Right of Way",
    nameKm: "សិទ្ធិអាទិភាព",
    description: "Priority rules and intersections",
    descEn: "Understand priority rules and how to handle intersections correctly.",
    Icon: FaTrafficLight,
  },
  {
    id: 4,
    slug: "driving",
    nameEn: "Driving Skills",
    nameKm: "ជំនាញបើកបរ",
    description: "Practical driving techniques",
    descEn: "Learn proper driving techniques and best practices for road safety.",
    Icon: FaCar,
  },
  {
    id: 5,
    slug: "technical",
    nameEn: "Vehicle Technology",
    nameKm: "បច្ចេកវិទ្យាយានយន្ត",
    description: "Vehicle mechanics and safety",
    descEn: "How vehicles work, safety systems, and maintenance essentials.",
    Icon: FaWrench,
  },
  {
    id: 6,
    slug: "loading-people-goods",
    nameEn: "Loading People & Goods",
    nameKm: "ផ្ទុកមនុស្ស និងទំនិញ",
    description: "Transport regulations",
    descEn: "Rules for safe transport of passengers and cargo within legal limits.",
    Icon: FaTruck,
  },
  {
    id: 7,
    slug: "general-knowledge",
    nameEn: "General Knowledge",
    nameKm: "ចំណេះដឹងទូទៅ",
    description: "Essential road safety topics",
    descEn: "Essential road safety topics and broad driving knowledge.",
    Icon: FaBook,
  },
  {
    id: 8,
    slug: "emergency",
    nameEn: "Emergency",
    nameKm: "ពេលអាសន្ន",
    description: "Emergency procedures",
    descEn: "Emergency procedures, contacts, and protocols for road incidents.",
    Icon: FaFirstAid,
  },
];

const CATEGORY_IMAGES = [
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774380370/kwd/afe770139087986f_np4j2n.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774380369/kwd/6ec559a44b9bf87a_et8ygh.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774380300/kwd/1d2f48f1a2d4a64c_xrnmua.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774380370/kwd/afe770139087986f_np4j2n.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774380369/kwd/6ec559a44b9bf87a_et8ygh.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774380300/kwd/1d2f48f1a2d4a64c_xrnmua.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774380370/kwd/afe770139087986f_np4j2n.png",
  "https://res.cloudinary.com/dpgivqzrl/image/upload/v1774380369/kwd/6ec559a44b9bf87a_et8ygh.png",
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
          {CATEGORIES.map((category, index) => {
            const color = CATEGORY_COLORS[category.slug];
            const shadow = CATEGORY_SHADOW[category.slug];
            const randomImage = CATEGORY_IMAGES[index % CATEGORY_IMAGES.length];
            
            return (
              <Link
                key={category.id}
                href={`/learn/${category.slug}`}
                className="group flex flex-col bg-white border border-black overflow-hidden transition-all duration-150 hover:-translate-y-1 hover:-translate-x-1"
                style={{ 
                  boxShadow: "4px 4px 0 #000",
                  borderRadius: "3px"
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = shadow;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow =
                    "4px 4px 0 #000";
                }}
              >
                {/* Color header with image */}
                <div
                  className="relative flex items-end justify-center border-b-2 border-black overflow-hidden"
                  style={{ 
                    backgroundColor: color,
                    minHeight: "200px"
                  }}
                >
                  <img 
                    src={randomImage}
                    alt={category.nameEn}
                    className="w-full h-48 object-contain object-bottom transition-all duration-300 group-hover:scale-110 group-hover:animate-bounce"
                    style={{
                      marginBottom: "-2px"
                    }}
                  />
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-5 gap-2">
                  <h3 className="font-black text-lg text-black leading-tight">
                    {category.nameEn}
                  </h3>
                  <p
                    className="text-xs text-zinc-500"
                    style={{ fontFamily: "Siemreap, sans-serif" }}
                  >
                    {category.nameKm}
                  </p>
                  <p className="text-sm text-zinc-600 leading-relaxed mt-1 flex-1">
                    {category.descEn}
                  </p>

                  {/* Bottom indicator */}
                  <div className="mt-3 pt-3 border-t border-black flex items-center justify-between">
                    <span
                      className="text-xs font-black px-2 py-0.5 border border-black"
                      style={{ 
                        backgroundColor: color,
                        borderRadius: "3px"
                      }}
                    >
                      Study now
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
