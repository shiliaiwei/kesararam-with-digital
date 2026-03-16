"use client";

import { useState } from "react";
import { GenericContentManagement } from "@/components/content/generic-content-management";

const CATEGORY_INFO = {
  slug: "priority",
  titleEn: "Right of Way",
  titleKm: "សិទ្ធិដំណើរ",
  color: "#22c55e",
  description: "Priority rules and intersection management"
};

// Mock data
const mockItems = [
  {
    id: 1,
    titleEn: "Intersection Priority",
    titleKm: "អាទិភាពបំពង់ផ្លូវ",
    descriptionEn: "Rules for determining right of way at intersections.",
    descriptionKm: "ច្បាប់សម្រាប់កំណត់សិទ្ធិដំណើរនៅបំពង់ផ្លូវ។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/700_xjoehu",
    audioUrlEn: "",
    audioUrlKm: "",
    isActive: true,
    createdAt: "2024-03-15T10:00:00Z"
  }
];

export default function PriorityPage() {
  const [items, setItems] = useState(mockItems);

  const handleSave = (itemData: any) => {
    if (itemData.id) {
      setItems(prev => prev.map(item => 
        item.id === itemData.id ? { ...itemData } : item
      ));
    } else {
      const newItem = {
        ...itemData,
        id: Math.max(...items.map(s => s.id), 0) + 1,
        createdAt: new Date().toISOString()
      };
      setItems(prev => [...prev, newItem]);
    }
  };

  const handleDelete = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <GenericContentManagement
      category={CATEGORY_INFO}
      items={items}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}