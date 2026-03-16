"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, Volume2 } from "lucide-react";
import Image from "next/image";
import { TrafficSignForm } from "./traffic-sign-form";

interface TrafficSign {
  id?: number;
  titleEn: string;
  titleKm: string;
  descriptionEn: string;
  descriptionKm: string;
  imageUrl: string;
  audioUrlEn?: string;
  audioUrlKm?: string;
  isActive: boolean;
  createdAt?: string;
}

// Mock data - replace with actual API calls
const mockSigns: TrafficSign[] = [
  {
    id: 1,
    titleEn: "Stop Sign",
    titleKm: "សញ្ញាឈប់",
    descriptionEn: "A red octagonal sign that requires drivers to come to a complete stop.",
    descriptionKm: "សញ្ញាពណ៌ក្រហមរាងប្រាំបីជ្រុង ដែលតម្រូវឱ្យអ្នកបើកបរឈប់ពេញលេញ។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/700_xjoehu",
    audioUrlEn: "",
    audioUrlKm: "",
    isActive: true,
    createdAt: "2024-03-15T10:00:00Z"
  }
];

export function TrafficSignsContent() {
  const [signs, setSigns] = useState<TrafficSign[]>(mockSigns);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSign, setEditingSign] = useState<TrafficSign | null>(null);

  const filteredSigns = signs.filter(sign => 
    sign.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sign.titleKm.includes(searchTerm)
  );

  const handleSaveSign = (signData: TrafficSign) => {
    if (editingSign && editingSign.id) {
      // Update existing sign
      setSigns(prev => prev.map(sign => 
        sign.id === editingSign.id ? { ...signData, id: editingSign.id, createdAt: editingSign.createdAt } : sign
      ));
    } else {
      // Add new sign
      const newSign = {
        ...signData,
        id: Math.max(...signs.map(s => s.id || 0), 0) + 1,
        createdAt: new Date().toISOString()
      };
      setSigns(prev => [...prev, newSign]);
    }
    
    setShowForm(false);
    setEditingSign(null);
  };

  const handleDeleteSign = (id: number | undefined) => {
    if (id && confirm("Are you sure you want to delete this traffic sign?")) {
      setSigns(prev => prev.filter(sign => sign.id !== id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-black">Traffic Signs Content</h1>
          <p className="text-sm text-zinc-600">Manage traffic signs images, descriptions, and audio</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-400 border-2 border-black font-bold text-sm hover:bg-green-300 hover:shadow-[2px_2px_0_#000] transition-all duration-100"
        >
          <Plus size={16} />
          Add New Sign
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search signs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium text-sm focus:outline-none focus:shadow-[2px_2px_0_#000]"
          />
        </div>
        <div className="text-sm text-zinc-600">
          {filteredSigns.length} of {signs.length} signs
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSigns.map((sign) => (
          <div
            key={sign.id}
            className="bg-white border-2 border-black shadow-[4px_4px_0_#000] overflow-hidden"
          >
            {/* Image */}
            <div className="h-48 bg-yellow-400 border-b-2 border-black relative">
              {sign.imageUrl ? (
                <Image
                  src={sign.imageUrl}
                  alt={sign.titleEn}
                  fill
                  className="object-contain p-4"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-black font-bold">
                  No Image
                </div>
              )}
              <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold border border-black ${
                sign.isActive ? 'bg-green-400' : 'bg-red-400'
              }`}>
                {sign.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-black text-lg text-black">{sign.titleEn}</h3>
                <p className="text-sm text-zinc-600" style={{ fontFamily: "Siemreap, sans-serif" }}>
                  {sign.titleKm}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-zinc-700 line-clamp-2">
                  {sign.descriptionEn}
                </p>
                <p className="text-sm text-zinc-600 line-clamp-2" style={{ fontFamily: "Siemreap, sans-serif" }}>
                  {sign.descriptionKm}
                </p>
              </div>

              {/* Audio indicators */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-1 text-xs border border-black ${
                  sign.audioUrlEn ? 'bg-blue-200' : 'bg-gray-200'
                }`}>
                  <Volume2 size={12} />
                  EN
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 text-xs border border-black ${
                  sign.audioUrlKm ? 'bg-blue-200' : 'bg-gray-200'
                }`}>
                  <Volume2 size={12} />
                  KM
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-black">
                <button className="flex items-center gap-1 px-2 py-1 bg-blue-400 border border-black text-xs font-bold hover:bg-blue-300">
                  <Eye size={12} />
                  View
                </button>
                <button 
                  onClick={() => setEditingSign(sign)}
                  className="flex items-center gap-1 px-2 py-1 bg-yellow-400 border border-black text-xs font-bold hover:bg-yellow-300"
                >
                  <Edit size={12} />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteSign(sign.id)}
                  className="flex items-center gap-1 px-2 py-1 bg-red-400 border border-black text-xs font-bold hover:bg-red-300"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSigns.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-400 border-2 border-black mx-auto mb-4 flex items-center justify-center">
            <Plus size={24} className="text-black" />
          </div>
          <h3 className="text-lg font-black text-black mb-2">No traffic signs found</h3>
          <p className="text-sm text-zinc-600 mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Start by adding your first traffic sign"}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-400 border-2 border-black font-bold text-sm hover:bg-green-300 hover:shadow-[2px_2px_0_#000] transition-all duration-100"
          >
            Add Traffic Sign
          </button>
        </div>
      )}

      {/* Form Modal */}
      {(showForm || editingSign) && (
        <TrafficSignForm
          sign={editingSign}
          onClose={() => {
            setShowForm(false);
            setEditingSign(null);
          }}
          onSave={handleSaveSign}
        />
      )}
    </div>
  );
}