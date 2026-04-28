"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, BookOpen } from "lucide-react";
import { QuestionForm } from "./question-form";

interface Question {
  id: number;
  topicId: number;
  questionType: string;
  questionEn: string;
  questionKm: string;
  difficulty: string;
  status: string;
  createdAt: string;
  topic?: {
    id: number;
    nameEn: string;
    topicCode: string;
  };
  creator?: {
    id: number;
    username: string;
  };
}

import { useSearchParams } from "next/navigation";

export default function AdminQuestionsPage() {
  const searchParams = useSearchParams();
  const initialTopicId = searchParams.get("topicId");

  const [data, setData] = useState<{ question: Question; topic: any; creator: any }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState(initialTopicId || "");
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch("/api/admin/questions");
      const result = await response.json();
      setData(result.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = data.filter(({ question, topic }) => {
    const matchesSearch =
      question.questionEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.questionKm.includes(searchTerm) ||
      (topic && topic.nameEn.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === "all" || question.questionType === typeFilter;
    const matchesTopic = !topicFilter || question.topicId.toString() === topicFilter;
    
    return matchesSearch && matchesType && matchesTopic;
  });

  const handleSaveQuestion = async (questionData: any) => {
    try {
      if (editingQuestion?.id) {
        await fetch(`/api/admin/questions/${editingQuestion.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(questionData),
        });
      } else {
        await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(questionData),
        });
      }
      
      fetchQuestions();
      setShowForm(false);
      setEditingQuestion(null);
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    
    try {
      await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-black">Topic Questions</h1>
          <p className="text-sm text-zinc-600">Manage questions for game modes linked to public content</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-400 border-2 border-black font-bold text-sm hover:bg-green-300 transition-all shadow-[2px_2px_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 border-2 border-black shadow-[4px_4px_0_#000]">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search questions or topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium text-sm focus:outline-none focus:bg-yellow-50"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border-2 border-black font-medium text-sm focus:outline-none focus:bg-yellow-50"
        >
          <option value="all">All Types</option>
          <option value="mcq">Multiple Choice</option>
          <option value="true_false">True / False</option>
          <option value="guess_pic">Guess Picture</option>
          <option value="multi_select">Multi-Select</option>
        </select>
        <div className="text-sm text-zinc-600 font-bold whitespace-nowrap">
          {filteredQuestions.length} questions
        </div>
      </div>

      <div className="bg-white border-2 border-black shadow-[8px_8px_0_#000] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-amber-400 border-b-2 border-black">
              <th className="p-3 border-r-2 border-black font-black uppercase tracking-wider text-xs">Topic</th>
              <th className="p-3 border-r-2 border-black font-black uppercase tracking-wider text-xs">Question</th>
              <th className="p-3 border-r-2 border-black font-black uppercase tracking-wider text-xs">Type</th>
              <th className="p-3 border-r-2 border-black font-black uppercase tracking-wider text-xs">Difficulty</th>
              <th className="p-3 font-black uppercase tracking-wider text-xs w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuestions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500 font-bold">
                  No questions found. Add your first question!
                </td>
              </tr>
            ) : (
              filteredQuestions.map(({ question, topic }) => (
                <tr key={question.id} className="border-b-2 border-black hover:bg-yellow-50 transition-colors">
                  <td className="p-3 border-r-2 border-black">
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-blue-500" />
                      <span className="font-bold text-sm">{topic?.nameEn || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="p-3 border-r-2 border-black">
                    <div className="font-medium text-sm">{question.questionEn}</div>
                    {question.questionKm && (
                      <div className="text-xs text-zinc-500 mt-1" style={{ fontFamily: "Siemreap, sans-serif" }}>
                        {question.questionKm}
                      </div>
                    )}
                  </td>
                  <td className="p-3 border-r-2 border-black">
                    <span className="inline-block px-2 py-1 bg-purple-100 border border-black text-xs font-bold capitalize">
                      {question.questionType}
                    </span>
                  </td>
                  <td className="p-3 border-r-2 border-black">
                    <span className={`inline-block px-2 py-1 border border-black text-xs font-bold capitalize ${
                      question.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                      question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingQuestion(question)}
                        className="p-1.5 bg-yellow-400 border border-black hover:bg-yellow-300 transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-1.5 bg-red-400 border border-black hover:bg-red-300 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {(showForm || editingQuestion) && (
        <QuestionForm
          question={editingQuestion || (topicFilter ? { topicId: topicFilter } : undefined)}
          onClose={() => {
            setShowForm(false);
            setEditingQuestion(null);
          }}
          onSave={handleSaveQuestion}
        />
      )}
    </div>
  );
}
