"use client";

import { useState } from "react";
import { GenericContentManagement } from "@/components/content/generic-content-management";

const CATEGORY_INFO = {
  slug: "driving",
  titleEn: "Driving Skills",
  titleKm: "ជំនាញបើកបរ",
  color: "#06b6d4",
  description: "Practical driving techniques and best practices"
};

const mockItems = [
  {
    id: 1,
    titleEn: "Parking Techniques",
    titleKm: "បច្ចេកទេសចតរថយន្ត",
    descriptionEn: "Proper parking methods for different situations.",
    descriptionKm: "វិធីសាស្រ្តចតរថយន្តត្រឹមត្រូវសម្រាប់ស្ថានភាពផ្សេងៗ។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/700_xjoehu",
    isActive: true,
    createdAt: "2024-03-15T10:00:00Z"
  }
];

export default function DrivingPage() {
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