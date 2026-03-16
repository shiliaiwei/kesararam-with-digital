"use client";

import { useState } from "react";
import { GenericContentManagement } from "@/components/content/generic-content-management";

const CATEGORY_INFO = {
  slug: "technical",
  titleEn: "Vehicle Technology",
  titleKm: "បច្ចេកវិទ្យាយានយន្ត",
  color: "#8b5cf6",
  description: "Vehicle systems, maintenance, and technology"
};

const mockItems = [
  {
    id: 1,
    titleEn: "Brake System",
    titleKm: "ប្រព័ន្ធហ្វ្រាំង",
    descriptionEn: "Understanding vehicle brake systems and maintenance.",
    descriptionKm: "ការយល់ដឹងអំពីប្រព័ន្ធហ្វ្រាំងរថយន្ត និងការថែទាំ។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/700_xjoehu",
    isActive: true,
    createdAt: "2024-03-15T10:00:00Z"
  }
];

export default function TechnicalPage() {
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