"use client";

import { useState } from "react";
import { GenericContentManagement } from "@/components/content/generic-content-management";

const CATEGORY_INFO = {
  slug: "general-knowledge",
  titleEn: "General Knowledge",
  titleKm: "ចំណេះដឹងទូទៅ",
  color: "#ef4444",
  description: "General driving knowledge and road safety"
};

const mockItems = [
  {
    id: 1,
    titleEn: "Road Safety Tips",
    titleKm: "គន្លឹះសុវត្ថិភាពផ្លូវ",
    descriptionEn: "Essential road safety tips for all drivers.",
    descriptionKm: "គន្លឹះសុវត្ថិភាពផ្លូវសំខាន់ៗសម្រាប់អ្នកបើកបរទាំងអស់។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/700_xjoehu",
    isActive: true,
    createdAt: "2024-03-15T10:00:00Z"
  }
];

export default function GeneralKnowledgePage() {
  const [items, setItems] = useState(mockItems);

  const handleSave = (itemData: any) => {
    if (itemData.id) {
      setItems(prev => prev.map(item => item.id === itemData.id ? { ...itemData } : item));
    } else {
      const newItem = { ...itemData, id: Math.max(...items.map(s => s.id), 0) + 1, createdAt: new Date().toISOString() };
      setItems(prev => [...prev, newItem]);
    }
  };

  const handleDelete = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return <GenericContentManagement category={CATEGORY_INFO} items={items} onSave={handleSave} onDelete={handleDelete} />;
}