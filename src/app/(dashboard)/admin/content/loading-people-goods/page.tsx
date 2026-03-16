"use client";

import { useState } from "react";
import { GenericContentManagement } from "@/components/content/generic-content-management";

const CATEGORY_INFO = {
  slug: "loading-people-goods",
  titleEn: "Loading People & Goods",
  titleKm: "ការដឹកអ្នកដំណើរ",
  color: "#f59e0b",
  description: "Passenger and cargo transport regulations"
};

const mockItems = [
  {
    id: 1,
    titleEn: "Passenger Safety",
    titleKm: "សុវត្ថិភាពអ្នកដំណើរ",
    descriptionEn: "Safety regulations for transporting passengers.",
    descriptionKm: "បទប្បញ្ញត្តិសុវត្ថិភាពសម្រាប់ការដឹកជញ្ជូនអ្នកដំណើរ។",
    imageUrl: "https://res.cloudinary.com/dpgivqzrl/image/upload/f_auto,q_auto/700_xjoehu",
    isActive: true,
    createdAt: "2024-03-15T10:00:00Z"
  }
];

export default function LoadingPeopleGoodsPage() {
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