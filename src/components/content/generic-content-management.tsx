"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, Volume2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ContentItem {
  id: number;
  titleEn: string;
  titleKm: string;
  descriptionEn: string;
  descriptionKm: string;
  imageUrl: string;
  audioUrlEn?: string;
  audioUrlKm?: string;
  isActive: boolean;
  createdAt: string;
}

interface CategoryInfo {
  slug: string;
  titleEn: string;
  titleKm: string;
  color: string;
  description: string;
}

interface GenericContentManagementProps {
  category: CategoryInfo;
  items: ContentItem[];
  onSave: (item: ContentItem) => void;
  onDelete: (id: number) => void;
}

export function GenericContentManagement({ 
  category, 
  items, 
  onSave, 
  onDelete 
}: GenericContentManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const filteredItems = items.filter(item => 
    item.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.titleKm.includes(searchTerm)
  );

  const handleSaveItem = (itemData: ContentItem) => {
    onSave(itemData);
    setShowForm(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: number) => {
    if (confirm(`Are you sure you want to delete this ${category.titleEn.toLowerCase()} item?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/content"
            className="flex items-center gap-2 px-3 py-2 bg-gray-400 border-2 border-black font-bold text-sm hover:bg-gray-300 hover:shadow-[2px_2px_0_#000] transition-all duration-100"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-black text-black">{category.titleEn} Content</h1>
            <p className="text-sm text-zinc-600" style={{ fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" }}>
              {category.titleKm} • {category.description}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-400 border-2 border-black font-bold text-sm hover:bg-green-300 hover:shadow-[2px_2px_0_#000] transition-all duration-100"
        >
          <Plus size={16} />
          Add New Item
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-black font-medium text-sm focus:outline-none focus:shadow-[2px_2px_0_#000]"
          />
        </div>
        <div className="text-sm text-zinc-600">
          {filteredItems.length} of {items.length} items
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border-2 border-black shadow-[4px_4px_0_#000] overflow-hidden"
          >
            {/* Image */}
            <div 
              className="h-48 border-b-2 border-black relative"
              style={{ backgroundColor: category.color }}
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.titleEn}
                  fill
                  className="object-contain p-4"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-black font-bold">
                  No Image
                </div>
              )}
              <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold border border-black ${
                item.isActive ? 'bg-green-400' : 'bg-red-400'
              }`}>
                {item.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-black text-lg text-black">{item.titleEn}</h3>
                <p className="text-sm text-zinc-600" style={{ fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" }}>
                  {item.titleKm}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-zinc-700 line-clamp-2">
                  {item.descriptionEn}
                </p>
                <p className="text-sm text-zinc-600 line-clamp-2" style={{ fontFamily: "var(--font-kh-body), var(--font-kh-header), 'Noto Sans Khmer', sans-serif" }}>
                  {item.descriptionKm}
                </p>
              </div>

              {/* Audio indicators */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-1 text-xs border border-black ${
                  item.audioUrlEn ? 'bg-blue-200' : 'bg-gray-200'
                }`}>
                  <Volume2 size={12} />
                  EN
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 text-xs border border-black ${
                  item.audioUrlKm ? 'bg-blue-200' : 'bg-gray-200'
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
                  onClick={() => setEditingItem(item)}
                  className="flex items-center gap-1 px-2 py-1 bg-yellow-400 border border-black text-xs font-bold hover:bg-yellow-300"
                >
                  <Edit size={12} />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteItem(item.id)}
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
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div 
            className="w-16 h-16 border-2 border-black mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: category.color }}
          >
            <Plus size={24} className="text-black" />
          </div>
          <h3 className="text-lg font-black text-black mb-2">No {category.titleEn.toLowerCase()} found</h3>
          <p className="text-sm text-zinc-600 mb-4">
            {searchTerm ? "Try adjusting your search terms" : `Start by adding your first ${category.titleEn.toLowerCase()} item`}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-green-400 border-2 border-black font-bold text-sm hover:bg-green-300 hover:shadow-[2px_2px_0_#000] transition-all duration-100"
          >
            Add {category.titleEn} Item
          </button>
        </div>
      )}

      {/* Form Modal - Placeholder for now */}
      {(showForm || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-black text-black mb-4">
                {editingItem ? `Edit ${category.titleEn}` : `Add New ${category.titleEn}`}
              </h2>
              <p className="text-sm text-zinc-600 mb-6">Form will be implemented for each category type</p>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 bg-gray-400 border-2 border-black font-bold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
