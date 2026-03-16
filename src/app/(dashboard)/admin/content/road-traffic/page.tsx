"use client";

import { useState } from "react";
import { GenericContentManagement } from "@/components/content/generic-content-management";

const CATEGORY_INFO = {
  slug: "road-traffic",
  titleEn: "Road Traffic Law",
  titleKm: "ច្បាប់ចរាចរ",
  color: "#3b82f6",
  description: "Traffic laws, regulations, and legal requirements"
};

// Mock data
const mockItems = [
  {
    id: 1,
    titleEn: "Speed Limits",
    titleKm: "កំណត់ល្បឿន",
    descriptionEn: "Legal speed limits for different road types and conditions.",
    descriptionKm: "កំណត់ល្បឿនស្របច្បាប់សម្រាប់ប្រភេទផ្លូវ និងស្ថានភាពផ្សេងៗ។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/700_xjoehu",
    audioUrlEn: "",
    audioUrlKm: "",
    isActive: true,
    createdAt: "2024-03-15T10:00:00Z"
  }
];

export default function RoadTrafficPage() {
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