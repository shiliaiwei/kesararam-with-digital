"use client";

import { useState } from "react";
import { GenericContentManagement } from "@/components/content/generic-content-management";

const CATEGORY_INFO = {
  slug: "emergency",
  titleEn: "Emergency",
  titleKm: "ជំនួយបន្ទាន់",
  color: "#dc2626",
  description: "Emergency procedures and first aid"
};

const mockItems = [
  {
    id: 1,
    titleEn: "Accident Response",
    titleKm: "ការឆ្លើយតបគ្រោះថ្នាក់",
    descriptionEn: "Proper procedures when involved in a traffic accident.",
    descriptionKm: "នីតិវិធីត្រឹមត្រូវនៅពេលជាប់ពាក់ព័ន្ធនឹងគ្រោះថ្នាក់ចរាចរ។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/700_xjoehu",
    isActive: true,
    createdAt: "2024-03-15T10:00:00Z"
  }
];

export default function EmergencyPage() {
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